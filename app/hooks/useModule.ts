'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface ModuleSettings {
  transfer: boolean;
  accommodation: boolean;
  flight: boolean;
  tour: boolean;
  website: boolean;
}

const defaultModules: ModuleSettings = {
  transfer: false,
  accommodation: false,
  flight: false,
  tour: false,
  website: false
};

export function useModule(moduleName: keyof ModuleSettings) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Giriş yapılmadıysa hiçbir modül varsayılan olarak görünmesin
    return false;
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
      
      // User null ise, modülleri gizle
      if (!user) {
        setIsEnabled(false);
        setIsLoading(false);
        return;
      }
      
      // SUPERUSER için tüm modüllere erişim var
      if (user?.role === 'SUPERUSER') {
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için modül kontrolü - promise ve yetkilere göre
      if (user?.role === 'SELLER') {
        
        // SELLER için tenant modül kontrolü yap
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('useModule: Token bulunamadı');
            setIsEnabled(false);
            setIsLoading(false);
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
            // Modül adından kontrol et
            const hasModuleAccess = tenantModules.some((tm: any) => 
              (tm.module?.name || '').toLowerCase().includes(moduleName)
            );
            setIsEnabled(hasModuleAccess);
          } else {
            console.error('useModule: API response not ok for SELLER:', response.status);
            setIsEnabled(false);
          }
        } catch (error) {
          console.error('useModule: SELLER tenant modül kontrolü hatası:', error);
          setIsEnabled(false);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // AGENCY_ADMIN ve diğer roller için tenant modül kontrolü
      if (user && (user.role === 'AGENCY_ADMIN' || user.role === 'AGENCY_USER')) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setIsEnabled(false);
            setIsLoading(false);
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
            const hasModuleAccess = tenantModules.some((tm: any) => 
              (tm.module?.name || '').toLowerCase().includes(moduleName)
            );
            setIsEnabled(hasModuleAccess);
          }
        } catch (error) {
          console.error('useModule: Tenant modül kontrolü hatası:', error);
          setIsEnabled(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    // Diğer modüller için normal kontrol
    if (user) {
      checkTenantModule();
    } else {
      setIsLoading(false);
    }
  }, [moduleName, user?.id, user?.role]); // Sadece gerekli değerleri dependency olarak kullan

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