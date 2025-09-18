import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/prisma';


export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Early fallback login (env-controlled) to avoid outage (default disabled)
    const fallbackEnabled = (process.env.FALLBACK_ENABLE || 'false').toLowerCase() === 'true';
    if (fallbackEnabled) {
      const pairs = [
        { u: process.env.FALLBACK_USER_1, p: process.env.FALLBACK_PASS_1, r: process.env.FALLBACK_ROLE_1 || 'SUPERUSER' },
        { u: process.env.FALLBACK_USER_2, p: process.env.FALLBACK_PASS_2, r: process.env.FALLBACK_ROLE_2 || 'AGENCY_ADMIN' }
      ].filter(x => !!x.u && !!x.p);

      const match = pairs.find(x => x.u === username && x.p === password);
      if (match) {
        const token = jwt.sign(
          { userId: 'fallback', username: match.u, role: match.r },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        return NextResponse.json({
          message: 'Giriş başarılı',
          user: { id: 'fallback', username: match.u, role: match.r, isActive: true },
          token
        });
      }
    }

    // Find user by username (avoid fragile includes in prod)
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { username }
      });
    } catch (dbErr) {
      console.error('Login DB error:', dbErr);
      // Fallback to env-based emergency login to avoid total outage (default disabled)
      const fbEnabled = (process.env.FALLBACK_ENABLE || 'false').toLowerCase() === 'true';
      if (fbEnabled) {
        const fallbackUsers = [
          {
            username: process.env.FALLBACK_USER_1,
            password: process.env.FALLBACK_PASS_1,
            role: process.env.FALLBACK_ROLE_1 || 'SUPERUSER'
          },
          {
            username: process.env.FALLBACK_USER_2,
            password: process.env.FALLBACK_PASS_2,
            role: process.env.FALLBACK_ROLE_2 || 'AGENCY_ADMIN'
          }
        ].filter(u => u.username && u.password);

        const matched = fallbackUsers.find(u => u.username === username && u.password === password);
        if (matched) {
          const token = jwt.sign(
            { userId: 'fallback', username: matched.username, role: matched.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );
          return NextResponse.json({
            message: 'Giriş başarılı (fallback)',
            user: { id: 'fallback', username: matched.username, role: matched.role, isActive: true },
            token
          });
        }
      }

      return NextResponse.json(
        { error: 'Sunucu hatası' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Hesap deaktif' },
        { status: 401 }
      );
    }

    // Check password with graceful fallbacks
    let isPasswordValid = false;
    if (!user.password) {
      // No password set for this user
      return NextResponse.json(
        { error: 'Şifre tanımlı değil. Lütfen yöneticiye başvurun.' },
        { status: 401 }
      );
    } else if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      // Bcrypt hash
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (cmpErr) {
        console.error('bcrypt compare error:', cmpErr);
        isPasswordValid = false;
      }
    } else {
      // Legacy/plaintext fallback
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz şifre' },
        { status: 401 }
      );
    }

    // Generate JWT token with refresh token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // 1 saat
    );

    // Generate refresh token (7 gün)
    const refreshToken = jwt.sign(
      { 
        userId: user.id, 
        type: 'refresh' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userWithoutPassword,
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}