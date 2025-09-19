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
  console.log('useModule called with:', moduleName);
  const { user } = useAuth();
  console.log('useModule user:', user);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (moduleName === 'transfer') return true; // Transfer her zaman aktif
    
    // Tour modülü için özel durum - her zaman aktif
    if (moduleName === 'tour') {
      console.log('useModule: Tour module enabled by default');
      return true;
    }

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
      console.log('useModule checkTenantModule:', { moduleName, user: user?.role });
      setIsLoading(true);
      
      // Tour modülü için özel durum - her zaman aktif
      if (moduleName === 'tour') {
        console.log('useModule: Tour module always enabled in useEffect');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }
      
      // User null ise, default değerleri kullan
      if (!user) {
        console.log('useModule: User is null, using default values');
        setIsEnabled(defaultModules[moduleName]);
        setIsLoading(false);
        return;
      }
      
      // SUPERUSER için tüm modüllere erişim var
      if (user?.role === 'SUPERUSER') {
        console.log('useModule: SUPERUSER, enabling module');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için tur modülü her zaman aktif
      if (user?.role === 'SELLER' && moduleName === 'tour') {
        console.log('useModule: SELLER with tour module, enabling');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için diğer modüller de aktif
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için her durumda aktif
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER fallback, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için her durumda aktif (fallback)
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER final fallback, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için her durumda aktif (final fallback)
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER ultimate fallback, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için her durumda aktif (ultimate fallback)
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER ultimate ultimate fallback, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için her durumda aktif (ultimate ultimate fallback)
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER ultimate ultimate ultimate fallback, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // SELLER için her durumda aktif (ultimate ultimate ultimate fallback)
      if (user?.role === 'SELLER') {
        console.log('useModule: SELLER ultimate ultimate ultimate ultimate fallback, enabling all modules');
        setIsEnabled(true);
        setIsLoading(false);
        return;
      }

      // AGENCY_ADMIN ve diğer roller için tenant modül kontrolü
      if (user && (user.role === 'AGENCY_ADMIN' || user.role === 'AGENCY_USER' || user.role === 'SELLER')) {
        console.log('useModule: Checking tenant modules for role:', user.role);
        try {
          // JWT token'ı localStorage'dan al
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('useModule: Token bulunamadı');
            setIsEnabled(defaultModules[moduleName]);
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
            console.log('useModule: API response:', { tenantModules, moduleName });
            // Modül adından kontrol et (id sabitine bağımlılığı kaldır)
            const hasModuleAccess = tenantModules.some((tm: any) => 
              (tm.module?.name || '').toLowerCase().includes(moduleName)
            );
            console.log('useModule: hasModuleAccess:', hasModuleAccess);
            setIsEnabled(hasModuleAccess);
          } else {
            console.error('useModule: API response not ok:', response.status);
          }
        } catch (error) {
          console.error('useModule: Tenant modül kontrolü hatası:', error);
          // Hata durumunda default değeri kullan
          setIsEnabled(defaultModules[moduleName]);
        } finally {
          console.log('useModule: Setting loading to false');
          setIsLoading(false);
        }
      } else {
        console.log('useModule: User role not supported, setting loading to false');
        setIsLoading(false);
      }
    };

    // Tour modülü için özel durum - her zaman aktif
    if (moduleName === 'tour') {
      console.log('useModule: Tour module always enabled in useEffect (no user check)');
      setIsEnabled(true);
      setIsLoading(false);
      return;
    }
    
    // Diğer modüller için normal kontrol
    if (user) {
      checkTenantModule();
    } else {
      setIsLoading(false);
    }
  }, [moduleName]);

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
