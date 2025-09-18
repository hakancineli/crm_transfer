'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PERMISSIONS, PERMISSION_LABELS } from '@/app/lib/permissions';
import { useAuth } from '@/app/contexts/AuthContext';
import { canManageUsers } from '@/app/lib/permissions';

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

export default function UserPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, refreshUser } = useAuth();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // SUPERUSER or AGENCY_ADMIN can access user permissions
    if (currentUser && !['SUPERUSER', 'AGENCY_ADMIN'].includes(currentUser.role)) {
      window.location.href = '/admin';
      return;
    }
    
    // Prevent users from editing their own permissions
    if (currentUser && currentUser.id === userId) {
      alert('Kendi izinlerinizi değiştiremezsiniz. Bu işlem sadece süper kullanıcı veya acenta yöneticisi tarafından yapılabilir.');
      window.location.href = '/admin/users';
      return;
    }
    
    if (userId) {
      fetchUser();
    }
  }, [userId, currentUser]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        // Initialize permissions state
        const permState: Record<string, boolean> = {};
        data.permissions.forEach((perm: UserPermission) => {
          permState[perm.permission] = perm.isActive;
        });
        setPermissions(permState);
      } else {
        alert('Kullanıcı bulunamadı');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Kullanıcı bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const handleSave = async () => {
    if (!user || !currentUser) return;

    // Role hierarchy check (AGENCY_ADMIN tenant içinde tüm rolleri yönetebilir)
    const roleHierarchy = {
      'SUPERUSER': 5,
      'AGENCY_ADMIN': 4,
      'MANAGER': 3,
      'OPERATION': 2,
      'ACCOUNTANT': 2,
      'SELLER': 1,
      'AGENCY_USER': 1,
      'CUSTOMER_SERVICE': 1,
      'FINANCE': 1
    } as const;

    const currentUserLevel = roleHierarchy[currentUser.role as keyof typeof roleHierarchy] || 0;
    const targetUserLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;

    // Only allow editing users with lower or equal role level
    if (currentUserLevel < targetUserLevel) {
      alert('Bu kullanıcının izinlerini değiştirme yetkiniz yok. Sadece aynı seviye veya daha düşük seviye kullanıcıların izinlerini değiştirebilirsiniz.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        alert('Yetkiler başarıyla güncellendi');
        // If admin edited their own permissions, refresh session
        if (currentUser && currentUser.id === userId) {
          await refreshUser();
        }
        router.push('/admin/users');
      } else {
        const error = await response.json();
        alert(error.error || 'Yetkiler güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Yetkiler güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const getPermissionInfo = (permission: string) => {
    const permissionInfo: Record<string, { description: string }> = {
      // Rezervasyon İzinleri
      'VIEW_OWN_SALES': {
        description: 'Sadece kendi oluşturduğu rezervasyonları görme yetkisi'
      },
      'VIEW_ALL_RESERVATIONS': {
        description: 'Sistemdeki tüm rezervasyonları görme yetkisi'
      },
      'CREATE_RESERVATIONS': {
        description: 'Yeni rezervasyon oluşturma yetkisi'
      },
      'EDIT_RESERVATIONS': {
        description: 'Mevcut rezervasyonları düzenleme yetkisi'
      },
      'DELETE_RESERVATIONS': {
        description: 'Rezervasyonları silme yetkisi'
      },
      
      // Şoför İzinleri
      'VIEW_DRIVERS': {
        description: 'Şoför listesini görme yetkisi'
      },
      'MANAGE_DRIVERS': {
        description: 'Şoför ekleme, düzenleme ve silme yetkisi'
      },
      'ASSIGN_DRIVERS': {
        description: 'Rezervasyonlara şoför atama yetkisi'
      },
      
      // Rapor İzinleri
      'VIEW_REPORTS': {
        description: 'Detaylı raporlar ve analizleri görme yetkisi'
      },
      'EXPORT_REPORTS': {
        description: 'Raporları Excel/PDF formatında dışa aktarma yetkisi'
      },
      'VIEW_ACCOUNTING': {
        description: 'Muhasebe ve ödeme bilgilerini görme yetkisi'
      },
      
      // Kullanıcı İzinleri
      'MANAGE_USERS': {
        description: 'Kullanıcı oluşturma, düzenleme ve silme yetkisi'
      },
      'MANAGE_PERMISSIONS': {
        description: 'Kullanıcı izinlerini yönetme yetkisi'
      },
      'MANAGE_ACTIVITIES': {
        description: 'Sistem aktivitelerini ve logları görme yetkisi'
      },
      
      // Sistem İzinleri
      'SYSTEM_SETTINGS': {
        description: 'Sistem ayarlarını değiştirme yetkisi'
      },
      'BACKUP_RESTORE': {
        description: 'Veri yedekleme ve geri yükleme yetkisi'
      },
      'AUDIT_LOGS': {
        description: 'Denetim loglarını görme yetkisi'
      },
      
      // Müşteri İzinleri
      'MANAGE_CUSTOMERS': {
        description: 'Müşteri bilgilerini yönetme yetkisi'
      },
      'VIEW_CUSTOMER_DATA': {
        description: 'Müşteri verilerini görme yetkisi'
      },
      
      // Finansal İzinler
      'MANAGE_PAYMENTS': {
        description: 'Ödeme işlemlerini yönetme yetkisi'
      },
      'VIEW_FINANCIAL_DATA': {
        description: 'Finansal verileri görme yetkisi'
      },
      'MANAGE_COMMISSIONS': {
        description: 'Komisyon hesaplamalarını yönetme yetkisi'
      },
      
      // Performans İzinleri
      'VIEW_PERFORMANCE': {
        description: 'Kullanıcı performans verilerini görme yetkisi'
      },
      'MANAGE_PERFORMANCE': {
        description: 'Kullanıcı performans yönetimi yapma yetkisi'
      }
    };
    return {
      title: PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS] || permission,
      description: permissionInfo[permission]?.description || 'Bu izin için açıklama bulunmuyor'
    };
  };

  // Check permissions before rendering
  const hasManageUsersPermission = currentUser?.permissions?.some(p => 
    p.permission === 'MANAGE_USERS' && p.isActive
  );
  const hasManagePermissionsPermission = currentUser?.permissions?.some(p => 
    p.permission === 'MANAGE_PERMISSIONS' && p.isActive
  );
  const canAccess = currentUser
    ? (currentUser.role === 'SUPERUSER' || currentUser.role === 'AGENCY_ADMIN' || hasManageUsersPermission || hasManagePermissionsPermission)
    : false;
  
  // Check if user can access permissions page
  if (currentUser && !canAccess) {
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
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Gerekli izin: MANAGE_PERMISSIONS veya MANAGE_USERS.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcı Bulunamadı</h2>
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Kullanıcılar Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yetkileri</h1>
          <p className="text-gray-600 mt-1">
            {user.name} ({user.username}) - {user.role}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Geri Dön
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Yetki Ayarları</h2>

        {(() => {
          const GROUPS: { title: string; keys: (keyof typeof PERMISSIONS)[] }[] = [
            { title: 'Genel', keys: ['VIEW_DASHBOARD'] },
            { title: 'Rezervasyon', keys: ['VIEW_OWN_SALES','VIEW_ALL_RESERVATIONS','CREATE_RESERVATIONS','EDIT_RESERVATIONS','DELETE_RESERVATIONS'] },
            { title: 'Şoför', keys: ['VIEW_DRIVERS','MANAGE_DRIVERS','ASSIGN_DRIVERS'] },
            { title: 'Rapor / Muhasebe', keys: ['VIEW_REPORTS','EXPORT_REPORTS','VIEW_ACCOUNTING'] },
            { title: 'Kullanıcı / İzin / Aktivite', keys: ['MANAGE_USERS','MANAGE_PERMISSIONS','MANAGE_ACTIVITIES','VIEW_ACTIVITIES'] },
            { title: 'Sistem', keys: ['SYSTEM_SETTINGS','BACKUP_RESTORE','AUDIT_LOGS'] },
            { title: 'Müşteri', keys: ['MANAGE_CUSTOMERS','VIEW_CUSTOMER_DATA'] },
            { title: 'Finansal', keys: ['MANAGE_PAYMENTS','VIEW_FINANCIAL_DATA','MANAGE_COMMISSIONS'] },
            { title: 'Performans', keys: ['VIEW_PERFORMANCE','MANAGE_PERFORMANCE'] },
            { title: 'Tur Modülü', keys: ['VIEW_TOUR_MODULE','MANAGE_TOUR_BOOKINGS','MANAGE_TOUR_ROUTES','MANAGE_TOUR_VEHICLES','VIEW_TOUR_REPORTS'] }
          ];

          return (
            <div className="space-y-8">
              {GROUPS.map(group => (
                <div key={group.title}>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">{group.title}</h3>
                  <div className="space-y-3">
                    {group.keys.map((k) => {
                      const permission = PERMISSIONS[k];
                      const permissionInfo = getPermissionInfo(permission);
                      return (
                        <div key={permission} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{permissionInfo.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{permissionInfo.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[permission] || false}
                              onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Dikkat</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Yetki değişiklikleri anında etkili olur. Kullanıcı yetkilerini dikkatli bir şekilde yönetin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
