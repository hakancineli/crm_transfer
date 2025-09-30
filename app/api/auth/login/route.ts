import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Try database login first
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username }
          ]
        },
        include: {
          tenantUsers: {
            include: {
              tenant: true
            }
          }
        }
      });

      if (user) {
        // Check if user is active
        if (!user.isActive) {
          return NextResponse.json(
            { error: 'Hesabınız deaktif edilmiş' },
            { status: 401 }
          );
        }

        // Check password for superuser
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (user.role === 'SUPERUSER' && isPasswordValid) {
          if (!process.env.JWT_SECRET) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
          }

          const accessToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          const refreshToken = jwt.sign(
            { userId: user.id, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return NextResponse.json({
            success: true,
            token: accessToken,
            refreshToken,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              email: user.email,
              name: user.name || user.username
            }
          });
        }
      }
    } catch (dbError) {
      console.error('Database login error:', dbError);
      // Fall through to hardcoded login
    }

    // Hardcoded fallback for superuser (disabled by default in production)
    // Enable only by setting ENABLE_HARDCODED_LOGIN=true (use with caution)
    if (
      process.env.ENABLE_HARDCODED_LOGIN === 'true' &&
      username === 'superuser' &&
      password === 'Pamukkale34.'
    ) {
      if (!process.env.JWT_SECRET) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
      }
      
      const accessToken = jwt.sign(
        { userId: '1', username: 'superuser', role: 'SUPERUSER' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: '1', type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        token: accessToken,
        refreshToken,
        user: {
          id: '1',
          username: 'superuser',
          role: 'SUPERUSER',
          email: 'superuser@proacente.com',
          name: 'Superuser'
        }
      });
    }

    return NextResponse.json(
      { error: 'Geçersiz kullanıcı adı veya şifre' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', errorMessage);
    console.error('Error stack:', errorStack);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: errorMessage },
      { status: 500 }
    );
  }
}