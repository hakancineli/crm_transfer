'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
  logoUrl?: string;
  isActive: boolean;
  subscriptionPlan: string;
  createdAt: string;
  _count: {
    users: number;
  };
}

interface TenantUser {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Reservation {
  id: string;
  voucherNumber: string;
  date: string;
  time: string;
  from: string;
  to: string;
  passengerNames: string[];
  price: number;
  currency: string;
  phoneNumber: string;
  paymentStatus: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [tenantReservations, setTenantReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reservations'>('users');
  const [creating, setCreating] = useState(false);
  const [newCompany, setNewCompany] = useState({ companyName: '' });

  useEffect(() => {
    if (user?.role !== 'SUPERUSER') {
      window.location.href = '/admin';
      return;
    }
    
    fetchTenants();
  }, [user]);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL('/api/tenants', window.location.origin).toString();
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      } else if (response.status === 401 || response.status === 403) {
        // Token geçersiz, login sayfasına yönlendir
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
      } else {
        console.error('Şirketler API hata', response.status);
      }
    } catch (error) {
      console.error('Şirketler getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const slugify = (v: string) => v
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');
      const payload = {
        companyName: newCompany.companyName,
        subdomain: slugify(newCompany.companyName || 'company'),
        isActive: true,
        subscriptionPlan: 'STANDARD'
      };

      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Şirket oluşturulamadı');
      }
      
      const result = await res.json();
      if (result.adminUser) {
        alert(`Şirket oluşturuldu!\n\nAdmin Kullanıcı:\nKullanıcı Adı: ${result.adminUser.username}\nE-posta: ${result.adminUser.email}\nŞifre: admin123`);
      } else {
        alert('Şirket oluşturuldu!');
      }
      
      setNewCompany({ companyName: '' });
      await fetchTenants();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const fetchTenantUsers = async (tenantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`/api/tenants/${tenantId}/users`, window.location.origin).toString();
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTenantUsers(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
      }
    } catch (error) {
      console.error('Şirket kullanıcıları getirilemedi:', error);
    }
  };

  const fetchTenantReservations = async (tenantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`/api/reservations?tenantId=${tenantId}`, window.location.origin).toString();
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTenantReservations(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
      }
    } catch (error) {
      console.error('Şirket rezervasyonları getirilemedi:', error);
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setActiveTab('users');
    fetchTenantUsers(tenant.id);
    fetchTenantReservations(tenant.id);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPERUSER': return 'Süperkullanıcı';
      case 'AGENCY_ADMIN': return 'Acenta Yöneticisi';
      case 'AGENCY_USER': return 'Acenta Personeli';
      case 'OPERATION': return 'Operasyon';
      case 'SELLER': return 'Satıcı';
      case 'ACCOUNTANT': return 'Muhasebeci';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERUSER': return 'bg-red-100 text-red-800';
      case 'AGENCY_ADMIN': return 'bg-indigo-100 text-indigo-800';
      case 'AGENCY_USER': return 'bg-teal-100 text-teal-800';
      case 'OPERATION': return 'bg-blue-100 text-blue-800';
      case 'SELLER': return 'bg-green-100 text-green-800';
      case 'ACCOUNTANT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SUPERUSER') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Yetkisiz Erişim
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece süperkullanıcılar şirket yönetimine erişebilir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Şirket Yönetimi</h1>
      </div>

      {user?.role === 'SUPERUSER' && (
        <div className="bg-white shadow rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Yeni Şirket Oluştur</h2>
          </div>
          <form onSubmit={handleCreateTenant} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
              <input value={newCompany.companyName} onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Şirket Listesi */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Şirketler</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => handleTenantSelect(tenant)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedTenant?.id === tenant.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      {tenant.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tenant.logoUrl} alt={`${tenant.companyName} logo`} className="w-6 h-6 rounded object-cover border" />
                      )}
                      <h3 className="text-sm font-medium text-gray-900">{tenant.companyName}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{tenant.subdomain}</p>
                    <p className="text-xs text-gray-400">
                      {tenant._count.users} kullanıcı • {tenant.subscriptionPlan}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seçili Şirketin Detayları */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                {selectedTenant?.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedTenant.logoUrl} alt={`${selectedTenant.companyName} logo`} className="w-8 h-8 rounded object-cover border" />
                )}
                {selectedTenant ? selectedTenant.companyName : 'Detaylar'}
              </h2>
              {selectedTenant && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      activeTab === 'users'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Kullanıcılar
                  </button>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      activeTab === 'reservations'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Rezervasyonlar
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {selectedTenant ? (
              activeTab === 'users' ? (
                tenantUsers.length > 0 ? (
                  tenantUsers.map((tenantUser) => (
                    <div key={tenantUser.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{tenantUser.user.name}</h3>
                          <p className="text-sm text-gray-500">{tenantUser.user.username}</p>
                          <p className="text-sm text-gray-500">{tenantUser.user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(tenantUser.role)}`}>
                            {getRoleText(tenantUser.role)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tenantUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tenantUser.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Bu şirkette kullanıcı bulunmuyor
                  </div>
                )
              ) : (
                tenantReservations.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {tenantReservations.map((reservation) => (
                      <div key={reservation.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900">{reservation.voucherNumber}</h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                reservation.paymentStatus === 'PAID' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reservation.paymentStatus === 'PAID' ? 'Ödendi' : 'Beklemede'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {reservation.date} {reservation.time} - {reservation.from} → {reservation.to}
                            </p>
                            <p className="text-sm text-gray-500">
                              {reservation.passengerNames.join(', ')} • {reservation.price} {reservation.currency}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {reservation.phoneNumber} • {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Bu şirkette rezervasyon bulunmuyor
                  </div>
                )
              )
            ) : (
              <div className="p-4 text-center text-gray-500">
                Detayları görüntülemek için bir şirket seçin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
