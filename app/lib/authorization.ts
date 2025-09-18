import { prisma } from '@/app/lib/prisma';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

export interface EvaluatedPermissions {
  role: string | null;
  has: (permission: string) => boolean;
  hasAny: (...perms: string[]) => boolean;
}

export async function evaluatePermissions(userId: string | null, role: string | null): Promise<EvaluatedPermissions> {
  // Read explicit user permissions if we have a userId
  let explicit: string[] = [];
  if (userId) {
    const rows = await prisma.userPermission.findMany({
      where: { userId, isActive: true },
      select: { permission: true }
    });
    explicit = rows.map((r: any) => r.permission);
  }

  const rolePerms: string[] = role ? ((ROLE_PERMISSIONS as any)[role] || []) : [];

  const set = new Set<string>([...rolePerms, ...explicit]);

  const has = (permission: string) => set.has(permission);
  const hasAny = (...perms: string[]) => perms.some(p => set.has(p));

  return { role, has, hasAny };
}

export function canViewAllReservationsEval(evald: EvaluatedPermissions): boolean {
  return evald.role === 'SUPERUSER' || evald.has(PERMISSIONS.VIEW_ALL_RESERVATIONS);
}

export function shouldRestrictToOwnReservations(evald: EvaluatedPermissions): boolean {
  return !canViewAllReservationsEval(evald);
}


