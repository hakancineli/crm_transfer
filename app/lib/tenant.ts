import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
  domain?: string;
  isActive: boolean;
  subscriptionPlan: string;
  modules: TenantModule[];
  users: TenantUser[];
}

export interface TenantModule {
  id: string;
  tenantId: string;
  moduleId: string;
  isEnabled: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  features: string[];
  module: Module;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export class TenantService {
  static async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain },
        include: {
          modules: {
            include: {
              module: true
            }
          },
          users: true
        }
      });

      console.log('Tenant loaded:', tenant?.companyName, 'Modules:', tenant?.modules?.length);
      return tenant as unknown as Tenant;
    } catch (error) {
      console.error('Error getting tenant by subdomain:', error);
      return null;
    }
  }

  static async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          modules: {
            include: {
              module: true
            }
          },
          users: true
        }
      });

      return tenant as unknown as Tenant;
    } catch (error) {
      console.error('Error getting tenant by ID:', error);
      return null;
    }
  }

  static hasModule(tenant: Tenant, moduleId: string): boolean {
    return tenant.modules.some(tm => 
      tm.moduleId === moduleId && tm.isEnabled
    );
  }

  static async canAccessFeature(tenant: Tenant, feature: string): Promise<boolean> {
    const module = tenant.modules.find(tm => 
      tm.module.features.includes(feature) && tm.isEnabled
    );
    return !!module;
  }

  static async getEnabledModules(tenant: Tenant): Promise<TenantModule[]> {
    return tenant.modules.filter(tm => tm.isEnabled);
  }

  static async createTenant(data: {
    subdomain: string;
    companyName: string;
    domain?: string;
    subscriptionPlan?: string;
  }): Promise<Tenant | null> {
    try {
      const tenant = await prisma.tenant.create({
        data: {
          subdomain: data.subdomain,
          companyName: data.companyName,
          domain: data.domain,
          subscriptionPlan: data.subscriptionPlan || 'basic',
          isActive: true
        },
        include: {
          modules: {
            include: {
              module: true
            }
          },
          users: true
        }
      });

      return tenant as unknown as Tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      return null;
    }
  }

  static async toggleModule(tenantId: string, moduleId: string): Promise<boolean> {
    try {
      // Helper: default permissions per module for AGENCY_ADMIN
      const defaultPermsByModule: Record<string, string[]> = {
        tour: [
          'VIEW_TOUR_MODULE',
          'MANAGE_TOUR_BOOKINGS',
          'MANAGE_TOUR_ROUTES',
          'MANAGE_TOUR_VEHICLES',
          'VIEW_TOUR_REPORTS',
          'CREATE_TOUR_BOOKINGS',
          'EDIT_TOUR_BOOKINGS',
          'DELETE_TOUR_BOOKINGS',
          'MANAGE_TOUR_GUIDES',
          'VIEW_TOUR_ANALYTICS'
        ],
        transfer: [
          'VIEW_ALL_RESERVATIONS',
          'CREATE_RESERVATIONS',
          'EDIT_RESERVATIONS',
          'DELETE_RESERVATIONS',
          'VIEW_DRIVERS',
          'MANAGE_DRIVERS',
          'ASSIGN_DRIVERS',
          'VIEW_TRANSFER_REPORTS',
          'MANAGE_VEHICLES',
          'VIEW_TRANSFER_ANALYTICS'
        ],
        accommodation: [
          'VIEW_ACCOMMODATION_MODULE',
          'MANAGE_HOTEL_BOOKINGS',
          'CREATE_HOTEL_BOOKINGS',
          'EDIT_HOTEL_BOOKINGS',
          'DELETE_HOTEL_BOOKINGS',
          'VIEW_ACCOMMODATION_REPORTS',
          'MANAGE_HOTEL_PARTNERS',
          'VIEW_ACCOMMODATION_ANALYTICS'
        ],
        flight: [
          'VIEW_FLIGHT_MODULE',
          'MANAGE_FLIGHT_BOOKINGS',
          'CREATE_FLIGHT_BOOKINGS',
          'EDIT_FLIGHT_BOOKINGS',
          'DELETE_FLIGHT_BOOKINGS',
          'VIEW_FLIGHT_REPORTS',
          'MANAGE_FLIGHT_PARTNERS',
          'VIEW_FLIGHT_ANALYTICS'
        ],
        website: [
          'MANAGE_WEBSITE',
          'EDIT_WEBSITE_CONTENT',
          'MANAGE_WEBSITE_SETTINGS',
          'VIEW_WEBSITE_ANALYTICS'
        ]
      };

      const mod = await prisma.module.findUnique({ where: { id: moduleId } });
      const moduleName = (mod?.name || '').toLowerCase();

      const existingModule = await prisma.tenantModule.findUnique({
        where: {
          tenantId_moduleId: {
            tenantId,
            moduleId
          }
        }
      });

      if (existingModule) {
        // Toggle existing module
        const updated = await prisma.tenantModule.update({
          where: {
            tenantId_moduleId: {
              tenantId,
              moduleId
            }
          },
          data: {
            isEnabled: !existingModule.isEnabled,
            activatedAt: !existingModule.isEnabled ? new Date() : existingModule.activatedAt
          }
        });
        // If enabling now, grant default permissions to AGENCY_ADMIN users of this tenant
        if (!existingModule.isEnabled && moduleName) {
          const perms = defaultPermsByModule[moduleName] || [];
          if (perms.length > 0) {
            const adminLinks = await prisma.tenantUser.findMany({ where: { tenantId, role: 'AGENCY_ADMIN', isActive: true }, select: { userId: true } });
            for (const { userId } of adminLinks) {
              for (const permission of perms) {
                // Upsert-like: try create; ignore if exists
                try {
                  await prisma.userPermission.create({ data: { userId, permission, isActive: true } });
                } catch {}
              }
            }
          }
        }
      } else {
        // Create new module assignment
        await prisma.tenantModule.create({
          data: {
            tenantId,
            moduleId,
            isEnabled: true,
            activatedAt: new Date()
          }
        });
        // Grant default permissions to tenant admins on first enable
        if (moduleName) {
          const perms = defaultPermsByModule[moduleName] || [];
          if (perms.length > 0) {
            const adminLinks = await prisma.tenantUser.findMany({ where: { tenantId, role: 'AGENCY_ADMIN', isActive: true }, select: { userId: true } });
            for (const { userId } of adminLinks) {
              for (const permission of perms) {
                try {
                  await prisma.userPermission.create({ data: { userId, permission, isActive: true } });
                } catch {}
              }
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error toggling module:', error);
      return false;
    }
  }

  static async getAllTenants(): Promise<Tenant[]> {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          modules: {
            include: {
              module: true
            }
          },
          users: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return tenants as unknown as Tenant[];
    } catch (error) {
      console.error('Error getting all tenants:', error);
      return [];
    }
  }

  static async ensureModulesForPlan(tenantId: string, plan: string): Promise<void> {
    try {
      // Map plan names to module arrays
      const planModules: Record<string, string[]> = {
        'basic': ['transfer'],
        'STANDARD': ['transfer'],
        'professional': ['transfer', 'accommodation'],
        'enterprise': ['transfer', 'accommodation', 'flight'],
        'premium': ['transfer', 'accommodation', 'flight', 'tour', 'website']
      };

      const modulesToActivate = planModules[plan] || ['transfer'];

      for (const moduleId of modulesToActivate) {
        await prisma.tenantModule.upsert({
          where: {
            tenantId_moduleId: {
              tenantId: tenantId,
              moduleId: moduleId // Keep original case
            }
          },
          update: {
            isEnabled: true
          },
          create: {
            tenantId: tenantId,
            moduleId: moduleId, // Keep original case
            isEnabled: true
          }
        });
      }
    } catch (error) {
      console.error('Error ensuring modules for plan:', error);
    }
  }

  static async getAllModules(): Promise<Module[]> {
    try {
      const modules = await prisma.module.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      return modules as unknown as Module[];
    } catch (error) {
      console.error('Error getting all modules:', error);
      return [];
    }
  }

  static async getTenantsByUserId(userId: string): Promise<Tenant[]> {
    try {
      const tenantUsers = await prisma.tenantUser.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        include: {
          tenant: {
            include: {
              modules: {
                include: {
                  module: true
                }
              },
              users: {
                where: { isActive: true }
              }
            }
          }
        }
      });

      return tenantUsers.map(tu => tu.tenant as unknown as Tenant);
    } catch (error) {
      console.error('Error getting tenants by user ID:', error);
      return [];
    }
  }
}

export default TenantService;
