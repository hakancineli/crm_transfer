'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { ROLE_PERMISSIONS, PERMISSIONS } from '@/app/lib/permissions';

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { isEnabled: isActivitiesEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isActivitiesEnabled) {
      router.push('/admin');
      return;
    }

    const roleAllows = user?.role === 'SUPERUSER' || (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.MANAGE_ACTIVITIES));
    const hasManageActivitiesPermission = user?.permissions?.some(p => p.permission === PERMISSIONS.MANAGE_ACTIVITIES && p.isActive);
    if (user && !(roleAllows || hasManageActivitiesPermission)) {
      window.location.href = '/admin';
      return;
    }
    fetchActivities();
  }, [filter, user, moduleLoading, isActivitiesEnabled, router]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities?limit=100`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      case 'LOGIN': return '🔑';
      case 'LOGOUT': return '🚪';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300';
      case 'LOGIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'USER': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20';
      case 'RESERVATION': return 'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
      case 'DRIVER': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20';
      case 'SYSTEM': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERUSER': return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300';
      case 'OPERATION': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300';
      case 'SELLER': return 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPERUSER': return 'Süperkullanıcı';
      case 'OPERATION': return 'Operasyon';
      case 'SELLER': return 'Satıcı';
      default: return role;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.action === filter;
  });

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

  if (!isActivitiesEnabled) {
    return null;
  }

  // Check permissions before rendering
  const hasManageActivitiesPermission = user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.MANAGE_ACTIVITIES)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.MANAGE_ACTIVITIES && p.isActive);
  
  if (user && !hasManageActivitiesPermission) {
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
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece süperkullanıcılar aktivite loglarını görebilir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/4 mb-4 transition-colors duration-200"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-slate-800 rounded transition-colors duration-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200" id="activities-page">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <option value="all">Tüm Aktiviteler</option>
            <option value="CREATE">Oluşturma</option>
            <option value="UPDATE">Güncelleme</option>
            <option value="DELETE">Silme</option>
            <option value="LOGIN">Giriş</option>
            <option value="LOGOUT">Çıkış</option>
          </select>
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 shadow dark:shadow-none rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Sistem Logları ({filteredActivities.length} aktivite)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 dark:text-slate-500 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Aktivite Bulunamadı</h3>
              <p className="text-gray-500 dark:text-slate-400">
                {filter === 'all' ? 'Henüz hiç aktivite kaydedilmemiş.' : 'Bu filtre için aktivite bulunamadı.'}
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors duration-150">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center transition-colors duration-200">
                      <span className="text-lg">{getActionIcon(activity.action)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEntityTypeColor(activity.entityType)}`}>
                        {activity.entityType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(activity.user.role)}`}>
                        {getRoleText(activity.user.role)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 dark:text-slate-100 mb-1">
                      <span className="font-medium">{activity.user.name}</span> ({activity.user.username})
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
                      <span>
                        {new Date(activity.createdAt).toLocaleString('tr-TR')}
                      </span>
                      {activity.ipAddress && (
                        <span>IP: {activity.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
