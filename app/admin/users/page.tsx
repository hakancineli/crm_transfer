'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { canManageUsers } from '@/app/lib/permissions';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'SUPERUSER' | 'AGENCY_ADMIN' | 'AGENCY_USER' | 'OPERATION' | 'SELLER' | 'ACCOUNTANT';
  isActive: boolean;
  createdAt: string;
  creator?: { name: string };
  _count: { reservations: number };
  tenant?: {
    id: string;
    companyName: string;
    subdomain: string;
  };
}

export default function UsersPage() {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const { isEnabled: isUsersEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [groupedUsers, setGroupedUsers] = useState<Record<string, User[]>>({});
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    currentPassword: '',
    name: '',
    role: 'SELLER' as 'SUPERUSER' | 'AGENCY_ADMIN' | 'AGENCY_USER' | 'OPERATION' | 'SELLER' | 'ACCOUNTANT',
    isActive: true
  });

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading || moduleLoading) {
      return;
    }
    
    if (!currentUser) {
      window.location.href = '/admin';
      return;
    }

    // Check module access
    if (!isUsersEnabled) {
      router.push('/admin');
      return;
    }
    
    // Allow SUPERUSER or AGENCY_ADMIN (or roles with MANAGE_USERS permission)
    const allowed = canManageUsers(currentUser.role) || currentUser.permissions?.some(p => p.permission === 'MANAGE_USERS' && p.isActive);
    if (!allowed) {
      window.location.href = '/admin';
      return;
    }
    
    // For non-SUPERUSER roles, only show users from their own tenant
    if (currentUser.role !== 'SUPERUSER') {
      // This will be handled by the API with tenant filtering
    }
    
    fetchUsers();
  }, [currentUser, authLoading, moduleLoading, isUsersEnabled, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const exclude = encodeURIComponent('bayraktravel,Ahjaaz Travel');
      const response = await fetch(`/api/users?excludeUsernames=${exclude}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Users API error:', data);
        setUsers([]);
        return;
      }

      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData);
      
      // Group users by tenant
      const grouped = usersData.reduce((acc: Record<string, User[]>, user: User) => {
        const tenantKey = user.tenant?.companyName || 'Sistem Kullanıcıları';
        if (!acc[tenantKey]) {
          acc[tenantKey] = [];
        }
        acc[tenantKey].push(user);
        return acc;
      }, {});
      
      setGroupedUsers(grouped);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setGroupedUsers({});
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ username: '', email: '', password: '', currentPassword: '', name: '', role: 'SELLER', isActive: true });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Kullanıcı oluşturulamadı');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', currentPassword: '', name: '', role: 'SELLER', isActive: true });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Kullanıcı güncellenemedi');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
        , headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kullanıcı silinemedi');
    }
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
      case 'SUPERUSER': return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300';
      case 'AGENCY_ADMIN': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300';
      case 'AGENCY_USER': return 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300';
      case 'OPERATION': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300';
      case 'SELLER': return 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300';
      case 'ACCOUNTANT': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  // Check permissions before rendering
  const hasManageUsersPermission = currentUser?.permissions?.some(p => 
    p.permission === 'MANAGE_USERS' && p.isActive
  );
  
  // Check if user can manage users (SUPERUSER or AGENCY_ADMIN or has MANAGE_USERS)
  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isUsersEnabled) {
    return null;
  }

  if (currentUser && !canManageUsers(currentUser.role) && !hasManageUsersPermission) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 transition-colors duration-200">
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
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece Süperkullanıcılar veya Acenta Yöneticileri erişebilir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/4 mb-4 transition-colors duration-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-800 rounded transition-colors duration-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 text-gray-900 dark:text-slate-100 transition-colors duration-200" id="users-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Kullanıcı Yönetimi</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base"
        >
          Yeni Kullanıcı
        </button>
      </div>

      {/* Kullanıcı Listesi - Desktop - Acente Bazlı Gruplandırma */}
      <div className="hidden lg:block space-y-6">
        {Object.entries(groupedUsers).map(([tenantName, tenantUsers]) => (
          <div key={tenantName} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{tenantName}</h3>
              <p className="text-sm text-gray-500">{tenantUsers.length} kullanıcı</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rezervasyonlar
                  </th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user._count.reservations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        username: user.username,
                        email: user.email,
                        password: '',
                        currentPassword: '',
                        name: user.name,
                        role: user.role,
                        isActive: user.isActive
                      });
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Düzenle
                  </button>
                  {user.role !== 'SUPERUSER' && (
                    <button
                      onClick={() => window.location.href = `/admin/users/${user.id}/permissions`}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Yetkileri Yönet"
                    >
                      🔐 Yetkiler
                    </button>
                  )}
                  {user.role !== 'SUPERUSER' && user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  )}
                </td>
              </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Kullanıcı Listesi - Mobile */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-lg font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.username}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleText(user.role)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
              <span>Rezervasyon: {user._count.reservations}</span>
              <span>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditingUser(user);
                  setFormData({
                    username: user.username,
                    email: user.email,
                    password: '',
                    currentPassword: '',
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive
                  });
                }}
                className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 border border-blue-200 rounded"
              >
                Düzenle
              </button>
              <button
                onClick={() => window.location.href = `/admin/users/${user.id}/permissions`}
                className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 border border-blue-200 rounded"
              >
                🔐 Yetkiler
              </button>
              {user.role !== 'SUPERUSER' && user.id !== currentUser?.id && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-900 text-sm px-3 py-1 border border-red-200 rounded"
                >
                  Sil
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcı Oluşturma Formu */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 max-w-[calc(100vw-2rem)] shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Yeni Kullanıcı</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şifre</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="AGENCY_ADMIN">Acenta Yöneticisi</option>
                    <option value="AGENCY_USER">Acenta Personeli</option>
                    <option value="SELLER">Satıcı</option>
                    <option value="OPERATION">Operasyon</option>
                    <option value="ACCOUNTANT">Muhasebeci</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kullanıcı Düzenleme Formu */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kullanıcı Düzenle</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yeni Şifre (boş bırakırsanız değişmez)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="AGENCY_ADMIN">Acenta Yöneticisi</option>
                    <option value="AGENCY_USER">Acenta Personeli</option>
                    <option value="SELLER">Satıcı</option>
                    <option value="OPERATION">Operasyon</option>
                    <option value="ACCOUNTANT">Muhasebeci</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif Kullanıcı</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
