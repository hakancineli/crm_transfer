import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Authentication helper
async function authenticateUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Basit token kontrolü (gerçek uygulamada JWT kullanılmalı)
    if (token === 'admin-token') {
      return {
        id: 'admin',
        username: 'admin',
        role: 'SUPERUSER'
      };
    }

    return null;
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

    // Create tenant/company (if tenant system exists)
    // For now, we'll just create users with a company identifier
    
    const createdUsers = [];
    
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
      const saltRounds = 10;
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
          // Add company identifier (you can extend this based on your tenant system)
          // companyId: companyId,
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

      createdUsers.push(user);
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: authUser.id,
        action: 'CUSTOMER_SETUP',
        entityType: 'SYSTEM',
        description: `${companyName} şirketi için ${createdUsers.length} kullanıcı oluşturuldu`,
        ipAddress: '127.0.0.1'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Müşteri kurulumu başarıyla tamamlandı',
      company: {
        name: companyName,
        contactPerson,
        email,
        phone,
        address
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
