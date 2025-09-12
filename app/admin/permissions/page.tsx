'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { PERMISSIONS, PERMISSION_LABELS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: UserPermission[];
}

interface UserPermission {
  id: string;
  permission: string;
  isActive: boolean;
  grantedAt: string;
}

export default function PermissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }
    
    // SUPERUSER veya MANAGE_PERMISSIONS izni olan kullanıcı erişebilir
    if (!user) return;

    const canAccess =
      user.role === 'SUPERUSER' ||
      user.permissions?.some((p) => p.permission === 'MANAGE_PERMISSIONS' && p.isActive);

    if (!canAccess) {
      window.location.href = '/admin';
      return;
    }

    fetchUsers();
  }, [user, authLoading]);

  const fetchUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setUserPermissions(user.permissions.filter(p => p.isActive).map(p => p.permission));
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setUserPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser || !user) return;

    // Role hierarchy check
    const roleHierarchy = {
      'SUPERUSER': 4,
      'MANAGER': 3,
      'OPERATION': 2,
      'SELLER': 1,
      'ACCOUNTANT': 1,
      'CUSTOMER_SERVICE': 1,
      'FINANCE': 1
    };

    const currentUserLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const targetUserLevel = roleHierarchy[selectedUser.role as keyof typeof roleHierarchy] || 0;

    // Only allow editing users with lower or equal role level
    if (currentUserLevel < targetUserLevel) {
      alert('Bu kullanıcının izinlerini değiştirme yetkiniz yok. Sadece aynı seviye veya daha düşük seviye kullanıcıların izinlerini değiştirebilirsiniz.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: userPermissions
        }),
      });

      if (response.ok) {
        await fetchUsers();
        alert('İzinler başarıyla güncellendi');
      } else {
        alert('İzinler güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('İzin güncelleme hatası:', error);
      alert('İzinler güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getRolePermissions = (role: string): string[] => {
    const perms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    return [...(perms as readonly string[])];
  };

  const isPermissionInRole = (permission: string, role: string) => {
    return getRolePermissions(role).includes(permission);
  };

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      // Rezervasyon İzinleri
      'VIEW_OWN_SALES': 'Sadece kendi oluşturduğu rezervasyonları görme yetkisi',
      'VIEW_ALL_RESERVATIONS': 'Sistemdeki tüm rezervasyonları görme yetkisi',
      'CREATE_RESERVATIONS': 'Yeni rezervasyon oluşturma yetkisi',
      'EDIT_RESERVATIONS': 'Mevcut rezervasyonları düzenleme yetkisi',
      'DELETE_RESERVATIONS': 'Rezervasyonları silme yetkisi',
      
      // Şoför İzinleri
      'VIEW_DRIVERS': 'Şoför listesini görme yetkisi',
      'MANAGE_DRIVERS': 'Şoför ekleme, düzenleme ve silme yetkisi',
      'ASSIGN_DRIVERS': 'Rezervasyonlara şoför atama yetkisi',
      
      // Rapor İzinleri
      'VIEW_REPORTS': 'Detaylı raporlar ve analizleri görme yetkisi',
      'EXPORT_REPORTS': 'Raporları Excel/PDF formatında dışa aktarma yetkisi',
      'VIEW_ACCOUNTING': 'Muhasebe ve ödeme bilgilerini görme yetkisi',
      
      // Kullanıcı İzinleri
      'MANAGE_USERS': 'Kullanıcı oluşturma, düzenleme ve silme yetkisi',
      'MANAGE_PERMISSIONS': 'Kullanıcı izinlerini yönetme yetkisi',
      'MANAGE_ACTIVITIES': 'Sistem aktivitelerini ve logları görme yetkisi',
      
      // Sistem İzinleri
      'SYSTEM_SETTINGS': 'Sistem ayarlarını değiştirme yetkisi',
      'BACKUP_RESTORE': 'Veri yedekleme ve geri yükleme yetkisi',
      'AUDIT_LOGS': 'Denetim loglarını görme yetkisi',
      
      // Müşteri İzinleri
      'MANAGE_CUSTOMERS': 'Müşteri bilgilerini yönetme yetkisi',
      'VIEW_CUSTOMER_DATA': 'Müşteri verilerini görme yetkisi',
      
      // Finansal İzinler
      'MANAGE_PAYMENTS': 'Ödeme işlemlerini yönetme yetkisi',
      'VIEW_FINANCIAL_DATA': 'Finansal verileri görme yetkisi',
      'MANAGE_COMMISSIONS': 'Komisyon hesaplamalarını yönetme yetkisi'
    };
    
    return descriptions[permission] || 'Bu izin için açıklama bulunmuyor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has permission to manage permissions
  const hasManagePermissions = user?.permissions?.some(p => 
    p.permission === 'MANAGE_PERMISSIONS' && p.isActive
  );

  if (user?.role !== 'SUPERUSER' && !hasManagePermissions) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">İzin Yönetimi</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kullanıcı Listesi */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Kullanıcılar</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.username} ({user.role})</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* İzin Yönetimi */}
              <div>
                {selectedUser ? (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedUser.name} - İzinler
                    </h2>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(PERMISSIONS).map(([key, permission]) => {
                        const isInRole = isPermissionInRole(permission, selectedUser.role);
                        const isSelected = userPermissions.includes(permission);
                        
                        return (
                          <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                              </p>
                              <p className="text-sm text-gray-500">{getPermissionDescription(permission)}</p>
                              {isInRole && (
                                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                                  Rol İzni
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isInRole}
                              />
                              {isInRole && (
                                <span className="text-xs text-gray-500">Rol izni</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">İzinlerini düzenlemek için bir kullanıcı seçin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
