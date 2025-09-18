'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface ModuleSettings {
  transfer: boolean;
  accommodation: boolean;
  flight: boolean;
  tour: boolean;
}

const defaultModules: ModuleSettings = {
  transfer: true,
  accommodation: false,
  flight: false,
  tour: true
};

export function useModule(moduleName: keyof ModuleSettings) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
      setIsLoading(true);
      
      // SUPERUSER için tüm modüllere erişim var
      if (user?.role === 'SUPERUSER') {
        setIsEnabled(true);
        setIsLoading(false);
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
            // Modül adından kontrol et (id sabitine bağımlılığı kaldır)
            const hasModuleAccess = tenantModules.some((tm: any) => 
              (tm.module?.name || '').toLowerCase().includes(moduleName)
            );
            setIsEnabled(hasModuleAccess);
          }
        } catch (error) {
          console.error('Tenant modül kontrolü hatası:', error);
          // Hata durumunda default değeri kullan
          setIsEnabled(defaultModules[moduleName]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (user) {
      checkTenantModule();
    } else {
      setIsLoading(false);
    }
  }, [user, moduleName]);

  return { isEnabled, isLoading };
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
