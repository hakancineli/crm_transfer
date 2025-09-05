'use client';

import { useState, useEffect } from 'react';

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [filter]);

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
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'USER': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESERVATION': return 'bg-green-50 text-green-700 border-green-200';
      case 'DRIVER': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'SYSTEM': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERUSER': return 'bg-red-100 text-red-800';
      case 'OPERATION': return 'bg-blue-100 text-blue-800';
      case 'SELLER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Son Aktiviteler</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Sistem Logları ({filteredActivities.length} aktivite)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aktivite Bulunamadı</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'Henüz hiç aktivite kaydedilmemiş.' : 'Bu filtre için aktivite bulunamadı.'}
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
                    
                    <p className="text-sm text-gray-900 mb-1">
                      <span className="font-medium">{activity.user.name}</span> ({activity.user.username})
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
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
