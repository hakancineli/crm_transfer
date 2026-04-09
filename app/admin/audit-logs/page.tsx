'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    name: string;
    username: string;
  };
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const { isEnabled: isAuditLogsEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
    userId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isAuditLogsEnabled) {
      router.push('/admin');
      return;
    }

    // Only SUPERUSER can access audit logs
    if (user && user.role !== 'SUPERUSER') {
      router.push('/admin');
      return;
    }

    fetchLogs();
  }, [currentPage, filters, moduleLoading, isAuditLogsEnabled, user, router]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...filters
      });
      
      const response = await fetch(`/api/audit-logs?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Audit logları getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      dateFrom: '',
      dateTo: '',
      userId: ''
    });
    setCurrentPage(1);
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

  if (!isAuditLogsEnabled) {
    return null;
  }

  // Check if user has permission to view audit logs
  const hasAuditLogsPermission = user?.permissions?.some(p => 
    p.permission === 'AUDIT_LOGS' && p.isActive
  );

  if (user?.role !== 'SUPERUSER' && !hasAuditLogsPermission) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 dark:text-slate-400">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200" id="audit-logs-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900/90 shadow dark:shadow-none rounded-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Denetim Logları</h1>
            
            {/* Filtreler */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aksiyon</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Tümü</option>
                  <option value="CREATE">Oluştur</option>
                  <option value="UPDATE">Güncelle</option>
                  <option value="DELETE">Sil</option>
                  <option value="LOGIN">Giriş</option>
                  <option value="LOGOUT">Çıkış</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Türü</label>
                <select
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Tümü</option>
                  <option value="USER">Kullanıcı</option>
                  <option value="RESERVATION">Rezervasyon</option>
                  <option value="DRIVER">Şoför</option>
                  <option value="TENANT">Müşteri</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Log Listesi */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900/70 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 rounded-full text-xs transition-colors duration-200">
                              {log.entityType}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              {new Date(log.createdAt).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-1">{log.description}</p>
                          <p className="text-sm text-gray-600">
                            <strong>Kullanıcı:</strong> {log.user.name} ({log.user.username})
                          </p>
                          
                          {log.details && Object.keys(log.details).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                                Detayları Göster
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  
                  <span className="px-3 py-2 text-gray-700">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
