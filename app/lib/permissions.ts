export const PERMISSIONS = {
  VIEW_OWN_SALES: 'VIEW_OWN_SALES',
  VIEW_ALL_RESERVATIONS: 'VIEW_ALL_RESERVATIONS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  VIEW_ACCOUNTING: 'VIEW_ACCOUNTING',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ACTIVITIES: 'MANAGE_ACTIVITIES'
} as const;

export const PERMISSION_LABELS = {
  VIEW_OWN_SALES: 'Kendi Satışlarını Görme',
  VIEW_ALL_RESERVATIONS: 'Tüm Rezervasyonları Görme',
  VIEW_REPORTS: 'Raporları Görme',
  VIEW_ACCOUNTING: 'Muhasebe Bilgilerini Görme',
  MANAGE_USERS: 'Kullanıcı Yönetimi',
  MANAGE_ACTIVITIES: 'Aktivite Loglarını Görme'
} as const;

export const ROLE_PERMISSIONS = {
  SUPERUSER: [
    PERMISSIONS.VIEW_OWN_SALES,
    PERMISSIONS.VIEW_ALL_RESERVATIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ACCOUNTING,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ACTIVITIES
  ],
  OPERATION: [
    PERMISSIONS.VIEW_ALL_RESERVATIONS,
    PERMISSIONS.VIEW_REPORTS
  ],
  ACCOUNTANT: [
    PERMISSIONS.VIEW_ALL_RESERVATIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ACCOUNTING
  ],
  SELLER: [
    PERMISSIONS.VIEW_OWN_SALES
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
  if (rolePermissions.includes(permission)) {
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
