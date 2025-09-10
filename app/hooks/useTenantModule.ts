'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface ModuleStatus {
  transfer: boolean;
  accommodation: boolean;
  flight: boolean;
}

export function useTenantModule(moduleName: keyof ModuleStatus) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId) {
      setLoading(false);
      return;
    }

    const fetchModuleStatus = async () => {
      try {
        const response = await fetch(`/api/tenants/${user.tenantId}/modules`);
        if (response.ok) {
          const data = await response.json();
          const moduleStatus = data.modules.find((m: any) => m.moduleId === moduleName);
          setIsEnabled(moduleStatus?.isEnabled || false);
        }
      } catch (error) {
        console.error('Modül durumu yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleStatus();
  }, [user?.tenantId, moduleName]);

  return { isEnabled, loading };
}

export function useAllTenantModules() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleStatus>({
    transfer: false,
    accommodation: false,
    flight: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId) {
      setLoading(false);
      return;
    }

    const fetchModuleStatus = async () => {
      try {
        const response = await fetch(`/api/tenants/${user.tenantId}/modules`);
        if (response.ok) {
          const data = await response.json();
          const moduleStatus: ModuleStatus = {
            transfer: false,
            accommodation: false,
            flight: false
          };
          
          data.modules.forEach((m: any) => {
            if (m.moduleId === 'transfer') moduleStatus.transfer = m.isEnabled;
            if (m.moduleId === 'accommodation') moduleStatus.accommodation = m.isEnabled;
            if (m.moduleId === 'flight') moduleStatus.flight = m.isEnabled;
          });
          
          setModules(moduleStatus);
        }
      } catch (error) {
        console.error('Modül durumları yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleStatus();
  }, [user?.tenantId]);

  return { modules, loading };
}
