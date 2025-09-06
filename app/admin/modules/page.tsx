'use client';

import { useState, useEffect } from 'react';
import { TenantService, Tenant, Module } from '@/app/lib/tenant';
import { MODULES, MODULE_FEATURES } from '@/app/lib/modules';

export default function ModuleManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenantsData, modulesData] = await Promise.all([
        TenantService.getAllTenants(),
        TenantService.getAllModules()
      ]);
      
      setTenants(tenantsData);
      setModules(modulesData);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (tenantId: string, moduleId: string) => {
    try {
      const success = await TenantService.toggleModule(tenantId, moduleId);
      if (success) {
        await fetchData(); // Refresh data
      } else {
        setError('Modül durumu güncellenirken hata oluştu');
      }
    } catch (err) {
      setError('Modül durumu güncellenirken hata oluştu');
      console.error('Error toggling module:', err);
    }
  };

  const getModuleInfo = (moduleId: string) => {
    return Object.values(MODULES).find(m => m.id === moduleId);
  };

  const getFeatureLabel = (featureId: string) => {
    return MODULE_FEATURES[featureId as keyof typeof MODULE_FEATURES] || featureId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modül Yönetimi</h1>
        <p className="mt-2 text-gray-600">Firmaların modül erişimlerini yönetin</p>
      </div>

      <div className="space-y-6">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {tenant.companyName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {tenant.subdomain}.protransfer.com
                  </p>
                  <p className="text-sm text-gray-500">
                    Plan: {tenant.subscriptionPlan}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const moduleInfo = getModuleInfo(module.id);
                  const isEnabled = tenant.modules.some(tm => 
                    tm.moduleId === module.id && tm.isEnabled
                  );
                  
                  return (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {moduleInfo?.name || module.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {moduleInfo?.description || module.description}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleModule(tenant.id, module.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Aylık Ücret:</span>
                          <span className="font-medium">
                            €{moduleInfo?.priceMonthly || module.priceMonthly}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Yıllık Ücret:</span>
                          <span className="font-medium">
                            €{moduleInfo?.priceYearly || module.priceYearly}
                          </span>
                        </div>
                      </div>

                      {isEnabled && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Özellikler:</p>
                          <div className="space-y-1">
                            {moduleInfo?.features.map((feature) => (
                              <div key={feature} className="flex items-center text-xs">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-600">
                                  {getFeatureLabel(feature)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
