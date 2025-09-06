'use client';

import { useState, useEffect } from 'react';

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
