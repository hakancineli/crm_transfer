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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            id: true,
            permission: true,
            isActive: true,
            grantedAt: true
          }
        },
        _count: {
          select: {
            reservations: true,
            activities: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication kontrolü
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const { username, email, name, password, role, isActive } = body;

    // Kullanıcının var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {
      username,
      email,
      name,
      role,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    };

    // Şifre verilmişse hash'le
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Activity log geçici olarak devre dışı
    // TODO: Activity log'u düzelt

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenemedi' },
      { status: 500 }
    );
  }
}