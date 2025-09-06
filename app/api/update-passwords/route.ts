import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Security token kontrolü
    if (token !== 'SECURITY_TOKEN_123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcı şifrelerini güncelle
    const updates = [
      {
        username: 'admin',
        password: '$2b$10$ZvoVC5f/3rmoxaA9RPobrOuy2P782FT4h157jLAZ5P4vb0g4s4Mn2'
      },
      {
        username: 'seller1',
        password: '$2b$10$zgj8DLl6n/oHmx7bKhV33usjdi1Rlox2HbBD8PKE6WdWRA/zuxZDe'
      },
      {
        username: 'operation',
        password: '$2b$10$bF07oxPoFLv7OiiZBwB8i.9Aifu.OYitK7apPFlfgXsRebEWj6Esi'
      }
    ];

    const results = [];
    for (const update of updates) {
      try {
        const result = await prisma.user.update({
          where: { username: update.username },
          data: { password: update.password }
        });
        results.push({ username: update.username, success: true });
      } catch (error) {
        results.push({ 
          username: update.username, 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json({
      message: 'Password update completed',
      results
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
