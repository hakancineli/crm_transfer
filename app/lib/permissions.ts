export const PERMISSIONS = {
  // Rezervasyon İzinleri
  VIEW_OWN_SALES: 'VIEW_OWN_SALES',
  VIEW_ALL_RESERVATIONS: 'VIEW_ALL_RESERVATIONS',
  CREATE_RESERVATIONS: 'CREATE_RESERVATIONS',
  EDIT_RESERVATIONS: 'EDIT_RESERVATIONS',
  DELETE_RESERVATIONS: 'DELETE_RESERVATIONS',
  
  // Şoför İzinleri
  VIEW_DRIVERS: 'VIEW_DRIVERS',
  MANAGE_DRIVERS: 'MANAGE_DRIVERS',
  ASSIGN_DRIVERS: 'ASSIGN_DRIVERS',
  
  // Rapor İzinleri
  VIEW_REPORTS: 'VIEW_REPORTS',
  EXPORT_REPORTS: 'EXPORT_REPORTS',
  VIEW_ACCOUNTING: 'VIEW_ACCOUNTING',
  
  // Kullanıcı İzinleri
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  MANAGE_ACTIVITIES: 'MANAGE_ACTIVITIES',
  
  // Sistem İzinleri
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  BACKUP_RESTORE: 'BACKUP_RESTORE',
  AUDIT_LOGS: 'AUDIT_LOGS',
  
  // Müşteri İzinleri
  MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',
  VIEW_CUSTOMER_DATA: 'VIEW_CUSTOMER_DATA',
  
  // Finansal İzinler
  MANAGE_PAYMENTS: 'MANAGE_PAYMENTS',
  VIEW_FINANCIAL_DATA: 'VIEW_FINANCIAL_DATA',
  MANAGE_COMMISSIONS: 'MANAGE_COMMISSIONS',
  
  // Performans İzinleri
  VIEW_PERFORMANCE: 'VIEW_PERFORMANCE',
  MANAGE_PERFORMANCE: 'MANAGE_PERFORMANCE'
} as const;

export const PERMISSION_LABELS = {
  // Rezervasyon İzinleri
  VIEW_OWN_SALES: 'Kendi Satışlarını Görme',
  VIEW_ALL_RESERVATIONS: 'Tüm Rezervasyonları Görme',
  CREATE_RESERVATIONS: 'Rezervasyon Oluşturma',
  EDIT_RESERVATIONS: 'Rezervasyon Düzenleme',
  DELETE_RESERVATIONS: 'Rezervasyon Silme',
  
  // Şoför İzinleri
  VIEW_DRIVERS: 'Şoförleri Görme',
  MANAGE_DRIVERS: 'Şoför Yönetimi',
  ASSIGN_DRIVERS: 'Şoför Atama',
  
  // Rapor İzinleri
  VIEW_REPORTS: 'Raporları Görme',
  EXPORT_REPORTS: 'Rapor Dışa Aktarma',
  VIEW_ACCOUNTING: 'Muhasebe Bilgilerini Görme',
  
  // Kullanıcı İzinleri
  MANAGE_USERS: 'Kullanıcı Yönetimi',
  MANAGE_PERMISSIONS: 'İzin Yönetimi',
  MANAGE_ACTIVITIES: 'Aktivite Loglarını Görme',
  
  // Sistem İzinleri
  SYSTEM_SETTINGS: 'Sistem Ayarları',
  BACKUP_RESTORE: 'Yedekleme/Geri Yükleme',
  AUDIT_LOGS: 'Denetim Logları',
  
  // Müşteri İzinleri
  MANAGE_CUSTOMERS: 'Müşteri Yönetimi',
  VIEW_CUSTOMER_DATA: 'Müşteri Verilerini Görme',
  
  // Finansal İzinler
  MANAGE_PAYMENTS: 'Ödeme Yönetimi',
  VIEW_FINANCIAL_DATA: 'Finansal Verileri Görme',
  MANAGE_COMMISSIONS: 'Komisyon Yönetimi',
  
  // Performans İzinleri
  VIEW_PERFORMANCE: 'Performans Verilerini Görme',
  MANAGE_PERFORMANCE: 'Performans Yönetimi'
} as const;

export const ROLE_PERMISSIONS = {
  SUPERUSER: [
    // Tüm izinler
    ...Object.values(PERMISSIONS)
  ],
  OPERATION: [
    PERMISSIONS.VIEW_ALL_RESERVATIONS,
    PERMISSIONS.CREATE_RESERVATIONS,
    PERMISSIONS.EDIT_RESERVATIONS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.ASSIGN_DRIVERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ACTIVITIES
  ],
  ACCOUNTANT: [
    PERMISSIONS.VIEW_ALL_RESERVATIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_ACCOUNTING,
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_COMMISSIONS
  ],
  SELLER: [
    PERMISSIONS.VIEW_OWN_SALES,
    PERMISSIONS.CREATE_RESERVATIONS,
    PERMISSIONS.EDIT_RESERVATIONS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_CUSTOMER_DATA
  ],
  MANAGER: [
    PERMISSIONS.VIEW_ALL_RESERVATIONS,
    PERMISSIONS.CREATE_RESERVATIONS,
    PERMISSIONS.EDIT_RESERVATIONS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.MANAGE_DRIVERS,
    PERMISSIONS.ASSIGN_DRIVERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_DATA,
    PERMISSIONS.VIEW_ACTIVITIES,
    PERMISSIONS.VIEW_PERFORMANCE
  ]
} as const;

export interface UserPermissions {
  role: string;
  permissions: string[];
  customPermissions: string[];
}

export function hasPermission(userPermissions: UserPermissions, permission: string): boolean {
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[userPermissions.role as keyof typeof ROLE_PERMISSIONS] || [];
  if ((rolePermissions as readonly string[]).includes(permission)) {
    return true;
  }
  
  // Check custom permissions
  return userPermissions.customPermissions.includes(permission);
}

export function canViewReports(role: string): boolean {
  return ['SUPERUSER', 'OPERATION', 'ACCOUNTANT'].includes(role);
}

export function canViewAccounting(role: string): boolean {
  return ['SUPERUSER', 'ACCOUNTANT'].includes(role);
}

export function canViewAllReservations(role: string): boolean {
  return ['SUPERUSER', 'OPERATION', 'ACCOUNTANT'].includes(role);
}

export function canViewOwnSales(role: string): boolean {
  return ['SUPERUSER', 'SELLER'].includes(role);
}

export function canManageUsers(role: string): boolean {
  return role === 'SUPERUSER';
}

export function canManageActivities(role: string): boolean {
  return role === 'SUPERUSER';
}

export function canCreateReservation(role: string): boolean {
  return ['SUPERUSER', 'OPERATION', 'SELLER'].includes(role);
}
