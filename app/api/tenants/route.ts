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
    const { companyName, subdomain, subscriptionPlan = 'STANDARD', isActive = true, adminUserId, createAdmin = true } = body;
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
    const normalizedSub = `${slugify(subdomain)}-${timestamp}`;

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
      const adminUsername = `${normalizedSub}-admin-${timestamp}`;
      const adminEmail = `admin-${timestamp}@${normalizedSub}.com`;
      const adminPassword = 'admin123'; // Default password
      
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: adminUsername }
      });
      
      if (!existingUser) {
        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        
        // Create admin user
        adminUser = await prisma.user.create({
          data: {
            username: adminUsername,
            email: adminEmail,
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

        // Add permissions to User Permissions table
        const userPermissions = [
          'VIEW_DASHBOARD',
          'VIEW_OWN_SALES',
          'VIEW_ALL_RESERVATIONS',
          'CREATE_RESERVATION',
          'EDIT_RESERVATION',
          'DELETE_RESERVATION',
          'MANAGE_USERS',
          'MANAGE_PERMISSIONS',
          'VIEW_REPORTS',
          'MANAGE_ACTIVITIES',
          'VIEW_ACCOUNTING'
        ];

        for (const permission of userPermissions) {
          await prisma.userPermission.create({
            data: {
              userId: adminUser.id,
              permission: permission,
              isActive: true
            }
          });
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

