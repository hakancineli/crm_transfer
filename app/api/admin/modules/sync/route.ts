import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tüm tenantlarda açık modüllerin varsayılan izinlerini admin kullanıcılara senkronlar (idempotent)
export async function POST(_request: NextRequest) {
  try {
    // Varsayılan izin setleri
    const defaultPermsByModule: Record<string, string[]> = {
      tour: [
        'VIEW_TOUR_MODULE',
        'MANAGE_TOUR_BOOKINGS',
        'MANAGE_TOUR_ROUTES',
        'MANAGE_TOUR_VEHICLES',
        'VIEW_TOUR_REPORTS'
      ],
      transfer: [
        'VIEW_ALL_RESERVATIONS',
        'CREATE_RESERVATIONS',
        'EDIT_RESERVATIONS',
        'DELETE_RESERVATIONS'
      ],
      accommodation: [
        // Gerekirse detaylandırılabilir
      ],
      flight: [
        'VIEW_REPORTS'
      ]
    };

    const modules = await prisma.module.findMany({ select: { id: true, name: true } });
    const moduleIdToName = new Map(modules.map(m => [m.id, (m.name || '').toLowerCase()] as const));

    const enabled = await prisma.tenantModule.findMany({ where: { isEnabled: true }, select: { tenantId: true, moduleId: true } });

    let created = 0;

    // 1) Base admin permissions for all tenants (genel yönetim yetkileri)
    const BASE_ADMIN_PERMS: string[] = [
      'VIEW_DASHBOARD',
      'VIEW_OWN_SALES',
      'VIEW_ALL_RESERVATIONS',
      'CREATE_RESERVATIONS',
      'EDIT_RESERVATIONS',
      'DELETE_RESERVATIONS',
      'VIEW_DRIVERS',
      'MANAGE_DRIVERS',
      'ASSIGN_DRIVERS',
      'EXPORT_REPORTS',
      'VIEW_ACCOUNTING',
      'MANAGE_USERS',
      'MANAGE_PERMISSIONS',
      'VIEW_ACTIVITIES',
      'SYSTEM_SETTINGS',
      'BACKUP_RESTORE',
      'AUDIT_LOGS',
      'MANAGE_CUSTOMERS',
      'VIEW_CUSTOMER_DATA',
      'MANAGE_PAYMENTS',
      'VIEW_FINANCIAL_DATA',
      'MANAGE_COMMISSIONS',
      'VIEW_PERFORMANCE',
      'MANAGE_PERFORMANCE'
    ];

    const allTenants = await prisma.tenant.findMany({ select: { id: true } });
    for (const t of allTenants) {
      const admins = await prisma.tenantUser.findMany({ where: { tenantId: t.id, role: 'AGENCY_ADMIN', isActive: true }, select: { userId: true } });
      for (const { userId } of admins) {
        for (const p of BASE_ADMIN_PERMS) {
          const existing = await prisma.userPermission.findFirst({ where: { userId, permission: p } });
          if (existing) {
            if (!existing.isActive) {
              await prisma.userPermission.update({ where: { id: existing.id }, data: { isActive: true } });
              created += 1;
            }
          } else {
            await prisma.userPermission.create({ data: { userId, permission: p, isActive: true } });
            created += 1;
          }
        }
      }
    }
    // 2) Module-specific permissions for enabled modules
    for (const tm of enabled) {
      const moduleName = moduleIdToName.get(tm.moduleId) || '';
      const perms = defaultPermsByModule[moduleName] || [];
      if (perms.length === 0) continue;

      const admins = await prisma.tenantUser.findMany({ where: { tenantId: tm.tenantId, role: 'AGENCY_ADMIN', isActive: true }, select: { userId: true } });
      for (const { userId } of admins) {
        for (const p of perms) {
          // Idempotent upsert: varsa aktif et, yoksa oluştur
          const existing = await prisma.userPermission.findFirst({ where: { userId, permission: p } });
          if (existing) {
            if (!existing.isActive) {
              await prisma.userPermission.update({ where: { id: existing.id }, data: { isActive: true } });
              created += 1;
            }
          } else {
            await prisma.userPermission.create({ data: { userId, permission: p, isActive: true } });
            created += 1;
          }
        }
      }
    }

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('Module permission sync error:', error);
    return NextResponse.json({ success: false, error: 'sync_failed' }, { status: 500 });
  }
}


