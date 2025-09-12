'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface ModuleSettings {
  transfer: boolean;
  accommodation: boolean;
  flight: boolean;
}

const defaultModules: ModuleSettings = {
  transfer: true,
  accommodation: false,
  flight: false
};

export function useModule(moduleName: keyof ModuleSettings) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (moduleName === 'transfer') return true; // Transfer her zaman aktif
    
    // SSR sırasında localStorage'a erişmeyi önle
    if (typeof window === 'undefined') {
      return defaultModules[moduleName];
    }
    
    try {
      const saved = localStorage.getItem('moduleSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[moduleName] || false;
      }
    } catch (error) {
      console.error('Modül ayarları yüklenirken hata:', error);
    }
    
    return defaultModules[moduleName];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('moduleSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsEnabled(parsed[moduleName] || false);
        }
      } catch (error) {
        console.error('Modül ayarları yüklenirken hata:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [moduleName]);

  // Tenant bazlı modül kontrolü için API çağrısı
  useEffect(() => {
    const checkTenantModule = async () => {
      // SUPERUSER için localStorage kontrolü yeterli
      if (user?.role === 'SUPERUSER') {
        return;
      }

      // AGENCY_ADMIN ve diğer roller için tenant modül kontrolü
      if (user && (user.role === 'AGENCY_ADMIN' || user.role === 'AGENCY_USER')) {
        try {
          // JWT token'ı localStorage'dan al
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('Token bulunamadı');
            setIsEnabled(defaultModules[moduleName]);
            return;
          }

          const response = await fetch('/api/tenant-modules', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            const tenantModules = data.tenantModules || [];
            
            // Modül adından ID'ye mapping
            const moduleIdMap: Record<string, string> = {
              'transfer': '7151a226-3a15-493d-b663-4b05bf5ca37d', // Transfer Yönetimi
              'accommodation': 'd7ed6d22-e836-47f2-93fe-f2b6d5cefe55', // Konaklama Yönetimi
              'flight': '4555dbae-4051-4d0e-a10d-b8c728fc2402' // Uçuş Yönetimi
            };
            
            const moduleId = moduleIdMap[moduleName];
            if (!moduleId) {
              setIsEnabled(defaultModules[moduleName]);
              return;
            }
            
            // Kullanıcının tenant'larındaki modül durumunu kontrol et
            const hasModuleAccess = tenantModules.some((tm: any) => 
              tm.moduleId === moduleId && tm.isEnabled
            );
            
            setIsEnabled(hasModuleAccess);
          }
        } catch (error) {
          console.error('Tenant modül kontrolü hatası:', error);
          // Hata durumunda default değeri kullan
          setIsEnabled(defaultModules[moduleName]);
        }
      }
    };

    checkTenantModule();
  }, [user, moduleName]);

  return isEnabled;
}

export function useAllModules() {
  const [modules, setModules] = useState<ModuleSettings>(defaultModules);

  useEffect(() => {
    // SSR sırasında localStorage'a erişmeyi önle
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const saved = localStorage.getItem('moduleSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setModules({ ...defaultModules, ...parsed });
      }
    } catch (error) {
      console.error('Modül ayarları yüklenirken hata:', error);
    }
  }, []);

  return modules;
}
