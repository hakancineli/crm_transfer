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
        await prisma.tenantModule.update({
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
}

export default TenantService;
