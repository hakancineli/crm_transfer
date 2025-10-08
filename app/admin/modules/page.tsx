'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { MODULES, MODULE_FEATURES } from '@/app/lib/modules';
import { useRouter } from 'next/navigation';

interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
  domain?: string;
  isActive: boolean;
  subscriptionPlan: string;
  modules: TenantModule[];
  users: TenantUser[];
}

interface TenantModule {
  id: string;
  tenantId: string;
  moduleId: string;
  isEnabled: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  features: string[];
  module: Module;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export default function ModuleManagement() {
  const { user } = useAuth();
  const { isEnabled: isModulesEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Yetki kontrolü
  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isModulesEnabled) {
      router.push('/admin');
      return;
    }

    // SUPERUSER veya AGENCY_ADMIN erişebilir
    if (user && !['SUPERUSER', 'AGENCY_ADMIN'].includes(user.role)) {
      router.push('/admin');
      return;
    }
  }, [user, moduleLoading, isModulesEnabled, router]);

  // Veri çekme
  useEffect(() => {
    if (user && ['SUPERUSER', 'AGENCY_ADMIN'].includes(user.role) && isModulesEnabled) {
      fetchData();
    }
  }, [user, isModulesEnabled]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching module data...');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/admin/modules', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Module data received:', data);
        setTenants(data.data.tenants);
        setModules(data.data.modules);
      } else {
        setError('Veriler yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (tenantId: string, moduleId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ tenantId, moduleId }),
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        setError('Modül durumu güncellenirken hata oluştu');
      }
    } catch (err) {
      setError('Modül durumu güncellenirken hata oluştu');
      console.error('Error toggling module:', err);
    }
  };

  const activateWebsite = async (tenantId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/tenant-website/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ tenantId }),
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
        alert('Website modülü başarıyla aktifleştirildi!');
      } else {
        setError('Website modülü aktifleştirilirken hata oluştu');
      }
    } catch (err) {
      setError('Website modülü aktifleştirilirken hata oluştu');
      console.error('Error activating website:', err);
    }
  };

  const updateDomain = async (tenantId: string, domain: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/tenant-website', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ tenantId, domain }),
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
        alert('Domain başarıyla güncellendi!');
      } else {
        setError('Domain güncellenirken hata oluştu');
      }
    } catch (err) {
      setError('Domain güncellenirken hata oluştu');
      console.error('Error updating domain:', err);
    }
  };

  const getModuleInfo = (moduleId: string) => {
    return Object.values(MODULES).find(m => m.id === moduleId);
  };

  const getFeatureLabel = (featureId: string) => {
    return MODULE_FEATURES[featureId as keyof typeof MODULE_FEATURES] || featureId;
  };

  // Superuser kontrolü
  if (user && user.role !== 'SUPERUSER') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya erişim için SUPERUSER yetkisi gereklidir.</p>
        </div>
      </div>
    );
  }

  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isModulesEnabled) {
    return null;
  }

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
    <div className="p-6" id="modules-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modül Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'SUPERUSER' 
            ? 'Firmaların modül erişimlerini yönetin' 
            : 'Firmanızın modül erişimlerini yönetin'
          }
        </p>
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

              {/* Domain Management */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Domain Yönetimi</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="www.example.com"
                      defaultValue={tenant.domain || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onBlur={(e) => {
                        if (e.target.value !== tenant.domain) {
                          updateDomain(tenant.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => activateWebsite(tenant.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Websiteyi Aktif Et
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const moduleInfo = getModuleInfo(module.id);
                  
                  // Check if module is enabled based on plan or database
                  const isEnabledInDB = tenant.modules.some(tm => 
                    tm.moduleId === module.id && tm.isEnabled
                  );
                  
                  // Plan-based module activation
                  const planModules: Record<string, string[]> = {
                    'basic': ['transfer'],
                    'STANDARD': ['transfer'],
                    'professional': ['transfer', 'accommodation'],
                    'enterprise': ['transfer', 'accommodation', 'flight'],
                    'premium': ['transfer', 'accommodation', 'flight', 'tour', 'website']
                  };
                  
                  const isEnabledByPlan = planModules[tenant.subscriptionPlan]?.includes(module.id) || false;
                  const isEnabled = isEnabledInDB || isEnabledByPlan;
                  
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
                          {isEnabledByPlan && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                              Plan Dahili
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => !isEnabledByPlan && toggleModule(tenant.id, module.id)}
                          disabled={isEnabledByPlan}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                          } ${isEnabledByPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isEnabledByPlan ? 'Plan dahilinde aktif' : 'Toggle modül'}
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
