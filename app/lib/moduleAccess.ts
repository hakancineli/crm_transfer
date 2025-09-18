import { prisma } from '@/app/lib/prisma';
import { canManageTourBookings, canManageTourRoutes, canManageTourVehicles, canViewTourModule } from '@/app/lib/permissions';

export async function ensureTenantId(params: { role: string; tenantIds?: string[] | null; bodyTenantId?: string; }): Promise<string> {
  const { role, tenantIds, bodyTenantId } = params;
  if (role === 'SUPERUSER') {
    if (bodyTenantId) return bodyTenantId;
    const anyTenant = await prisma.tenant.findFirst({ where: { isActive: true }, select: { id: true } });
    if (!anyTenant) throw new Error('NO_ACTIVE_TENANT');
    return anyTenant.id;
  }
  if (tenantIds && tenantIds.length > 0) return tenantIds[0];
  throw new Error('NO_TENANT');
}

export async function assertModuleEnabled(params: { role: string; tenantId: string; moduleName: 'tour' | 'transfer' | 'accommodation' | 'flight'; }): Promise<void> {
  const { role, tenantId, moduleName } = params;
  if (role === 'SUPERUSER') return; // SUPERUSER tüm modüllere erişir
  const mod = await prisma.module.findUnique({ where: { name: moduleName } });
  if (!mod) throw new Error('MODULE_NOT_DEFINED');
  const tm = await prisma.tenantModule.findFirst({ where: { tenantId, moduleId: mod.id, isEnabled: true } });
  if (!tm) throw new Error('MODULE_DISABLED');
}

export async function loadActiveUserPermissions(userId: string | null | undefined) {
  if (!userId) return [] as { permission: string; isActive: boolean }[];
  return prisma.userPermission.findMany({ where: { userId, isActive: true }, select: { permission: true, isActive: true } });
}

export function assertPermission(role: string, userPerms: { permission: string; isActive: boolean }[], checker: (role: string, userPerms?: any[]) => boolean) {
  if (role === 'SUPERUSER') return; // her şeye yetkili
  const ok = checker(role, userPerms);
  if (!ok) throw new Error('FORBIDDEN');
}

// Yardımcı: modül adına göre uygun permission checker döndür
export function getModuleManageChecker(moduleName: 'tour' | 'transfer' | 'accommodation' | 'flight') {
  switch (moduleName) {
    case 'tour':
      return canManageTourBookings; // tur rezervasyonları temel yetki
    default:
      return (_role: string) => true; // diğerleri için şimdilik açık; ilgili checker eklenebilir
  }
}


