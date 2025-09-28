import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { ActivityLogger } from '@/app/lib/activityLogger';


export async function GET(request: NextRequest) {
  try {
    // Only SUPERUSER can access all tenants
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER yetkisi gerekli' }, { status: 403 });
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Şirketler getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Bu işlem için SUPERUSER yetkisi gerekli' }, { status: 403 });
    }

    const body = await request.json();
    const { companyName, subdomain, subscriptionPlan = 'STANDARD', isActive = true, adminUserId, createAdmin = true, adminUsername, adminPassword, adminEmail } = body;
    if (!companyName || !subdomain) {
      return NextResponse.json({ error: 'Şirket adı ve subdomain zorunludur' }, { status: 400 });
    }

    // Normalize subdomain with timestamp to avoid duplicates
    const slugify = (v: string) => v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');
    const timestamp = Date.now();
    const normalizedSub = slugify(subdomain);

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        companyName,
        subdomain: normalizedSub,
        subscriptionPlan,
        isActive
      }
    });

    // Create admin user if requested
    let adminUser = null;
    let link = null;
    
    if (createAdmin && !adminUserId) {
      // Generate admin credentials with timestamp to avoid duplicates
      const timestamp = Date.now();
      const generatedUsername = adminUsername && String(adminUsername).trim().length > 0 ? adminUsername : `${normalizedSub}-admin-${timestamp}`;
      const finalEmail = adminEmail && String(adminEmail).trim().length > 0 ? adminEmail : `admin-${timestamp}@${normalizedSub}.com`;
      const plainPassword = adminPassword && String(adminPassword).trim().length > 0 ? adminPassword : 'admin123';
      
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: generatedUsername }
      });
      
      if (!existingUser) {
        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(plainPassword, 12);
        
        // Create admin user
        adminUser = await prisma.user.create({
          data: {
            username: generatedUsername,
            email: finalEmail,
            password: hashedPassword,
            name: `${companyName} Admin`,
            role: 'AGENCY_ADMIN',
            isActive: true,
            createdBy: null
          }
        });
        
        // Link admin to tenant with default permissions
        link = await prisma.tenantUser.create({
          data: {
            tenantId: tenant.id,
            userId: adminUser.id,
            role: 'AGENCY_ADMIN',
            isActive: true,
            permissions: JSON.stringify([
              'MANAGE_USERS',
              'MANAGE_PERMISSIONS',
              'VIEW_REPORTS',
              'MANAGE_ACTIVITIES',
              'VIEW_ACCOUNTING'
            ])
          }
        });

        // Add all modules to tenant
        const modules = await prisma.module.findMany({
          where: { isActive: true },
          select: { id: true, name: true }
        });

        for (const module of modules) {
          await prisma.tenantModule.create({
            data: {
              tenantId: tenant.id,
              moduleId: module.id,
              isEnabled: true,
              activatedAt: new Date()
            }
          });
        }

        // Add comprehensive permissions to User Permissions table
        const userPermissions = [
          'VIEW_DASHBOARD',
          'VIEW_OWN_SALES',
          'VIEW_ALL_RESERVATIONS',
          'CREATE_RESERVATIONS',
          'EDIT_RESERVATIONS',
          'DELETE_RESERVATIONS',
          'VIEW_DRIVERS',
          'MANAGE_DRIVERS',
          'ASSIGN_DRIVERS',
          'VIEW_REPORTS',
          'EXPORT_REPORTS',
          'VIEW_ACCOUNTING',
          'MANAGE_PAYMENTS',
          'MANAGE_COMMISSIONS',
          'MANAGE_CUSTOMERS',
          'VIEW_CUSTOMER_DATA',
          'MANAGE_USERS',
          'MANAGE_PERMISSIONS',
          'VIEW_ACTIVITIES',
          'SYSTEM_SETTINGS',
          'BACKUP_RESTORE',
          'AUDIT_LOGS',
          'VIEW_FINANCIAL_DATA',
          'VIEW_PERFORMANCE',
          'MANAGE_PERFORMANCE',
          // Tur modülü izinleri
          'VIEW_TOUR_MODULE',
          'MANAGE_TOUR_BOOKINGS',
          'MANAGE_TOUR_ROUTES',
          'MANAGE_TOUR_VEHICLES',
          'VIEW_TOUR_REPORTS'
        ];

        for (const permission of userPermissions) {
          await prisma.userPermission.create({
            data: {
              userId: adminUser.id,
              permission: permission,
              isActive: true,
              grantedAt: new Date()
            }
          });
        }
      } else {
        // Username already exists: link this existing user as tenant admin
        adminUser = existingUser as any;
        try {
          link = await prisma.tenantUser.create({
            data: {
              tenantId: tenant.id,
              userId: existingUser.id,
              role: 'AGENCY_ADMIN',
              isActive: true,
              permissions: JSON.stringify([
                'MANAGE_USERS',
                'MANAGE_PERMISSIONS',
                'VIEW_REPORTS',
                'MANAGE_ACTIVITIES',
                'VIEW_ACCOUNTING'
              ])
            }
          });
        } catch (e) {
          // If already linked, ignore
        }

        // Ensure default user permissions are present for this admin
        const defaultAdminPermissions = [
          'VIEW_DASHBOARD',
          'VIEW_OWN_SALES',
          'VIEW_ALL_RESERVATIONS',
          'CREATE_RESERVATIONS',
          'EDIT_RESERVATIONS',
          'DELETE_RESERVATIONS',
          'VIEW_DRIVERS',
          'MANAGE_DRIVERS',
          'ASSIGN_DRIVERS',
          'VIEW_REPORTS',
          'EXPORT_REPORTS',
          'VIEW_ACCOUNTING',
          'MANAGE_PAYMENTS',
          'MANAGE_COMMISSIONS',
          'MANAGE_CUSTOMERS',
          'VIEW_CUSTOMER_DATA',
          'MANAGE_USERS',
          'MANAGE_PERMISSIONS',
          'VIEW_ACTIVITIES',
          'SYSTEM_SETTINGS',
          'BACKUP_RESTORE',
          'AUDIT_LOGS',
          'VIEW_FINANCIAL_DATA',
          'VIEW_PERFORMANCE',
          'MANAGE_PERFORMANCE',
          'VIEW_TOUR_MODULE',
          'MANAGE_TOUR_BOOKINGS',
          'MANAGE_TOUR_ROUTES',
          'MANAGE_TOUR_VEHICLES',
          'VIEW_TOUR_REPORTS'
        ];
        for (const permission of defaultAdminPermissions) {
          try {
            await prisma.userPermission.create({ data: { userId: existingUser.id, permission, isActive: true } });
          } catch {}
        }
      }
    } else if (adminUserId) {
      // Link existing user
      link = await prisma.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: adminUserId,
          role: 'AGENCY_ADMIN',
          isActive: true
        }
      });
    }

    // Activity log - only if we have a valid userId
    try {
      await ActivityLogger.logActivity({
        userId: decoded.userId,
        action: 'CREATE',
        entityType: 'SYSTEM',
        entityId: tenant.id,
        description: `Yeni şirket oluşturuldu: ${companyName} (${subdomain})`,
        details: { subscriptionPlan, isActive, adminUserId },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (activityError) {
      console.warn('Activity logging failed:', activityError);
      // Continue without failing the main operation
    }

    return NextResponse.json({ 
      tenant, 
      link, 
      adminUser: adminUser ? {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      } : null
    });
  } catch (error) {
    console.error('Şirket oluşturma hatası:', error);
    return NextResponse.json({ error: 'Şirket oluşturulamadı' }, { status: 500 });
  }
}

