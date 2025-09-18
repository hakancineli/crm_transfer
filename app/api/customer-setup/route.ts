import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ActivityLogger } from '@/app/lib/activityLogger';

// Authentication helper
async function authenticateUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    return {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication kontrolü
    const authUser = await authenticateUser(request);
    if (!authUser || authUser.role !== 'SUPERUSER') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, contactPerson, email, phone, address, initialUsers } = body;

    // Validate required fields
    if (!companyName || !contactPerson || !email || !initialUsers || initialUsers.length === 0) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Create tenant/company first
    const slugify = (v: string) => v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');
    
    const subdomain = slugify(companyName);
    
    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain }
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: `'${companyName}' şirketi zaten mevcut` },
        { status: 400 }
      );
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        companyName,
        subdomain,
        subscriptionPlan: 'basic',
        isActive: true
      }
    });

    // First create an Agency Admin user automatically
    const adminUsername = `${subdomain}-admin`;
    const adminEmail = `admin@${subdomain}.com`;
    const adminPassword = 'admin123';
    
    // Check if admin username already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminUsername }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: `Admin kullanıcı adı '${adminUsername}' zaten kullanılıyor` },
        { status: 400 }
      );
    }

    // Hash admin password
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        name: `${companyName} Admin`,
        password: hashedAdminPassword,
        role: 'AGENCY_ADMIN',
        isActive: true,
        createdBy: null
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Link admin to tenant with default permissions
    await prisma.tenantUser.create({
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

    const createdUsers = [adminUser];
    
    for (const userData of initialUsers) {
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: `Kullanıcı adı '${userData.username}' zaten kullanılıyor` },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: `E-posta '${userData.email}' zaten kullanılıyor` },
          { status: 400 }
        );
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
          createdBy: null // Set to null to avoid foreign key constraint
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      // Link user to tenant (normal users get no permissions by default)
      await prisma.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: userData.role,
          isActive: true,
          permissions: JSON.stringify([]) // Normal users get no permissions by default
        }
      });

      // Normal users get no User Permissions by default
      // Only Agency Admins get permissions

      createdUsers.push(user);
    }

    // Activity log - only if we have a valid userId
    try {
      await ActivityLogger.logActivity({
        userId: authUser.id,
        action: 'CREATE',
        entityType: 'SYSTEM',
        entityId: tenant.id,
        description: `Müşteri kurulumu: ${companyName} şirketi ve ${createdUsers.length} kullanıcı oluşturuldu`,
        details: { 
          companyName, 
          contactPerson, 
          email, 
          phone, 
          address,
          userCount: createdUsers.length 
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      });
    } catch (activityError) {
      console.warn('Activity logging failed:', activityError);
      // Continue without failing the main operation
    }

    return NextResponse.json({
      success: true,
      message: 'Müşteri kurulumu başarıyla tamamlandı',
      tenant: {
        id: tenant.id,
        companyName: tenant.companyName,
        subdomain: tenant.subdomain,
        subscriptionPlan: tenant.subscriptionPlan
      },
      company: {
        name: companyName,
        contactPerson,
        email,
        phone,
        address
      },
      adminUser: {
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        password: adminPassword
      },
      users: createdUsers
    });

  } catch (error) {
    console.error('Customer setup error:', error);
    return NextResponse.json(
      { error: 'Kurulum sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
