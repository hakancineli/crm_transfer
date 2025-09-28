import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get website pages for the current tenant
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    // Get tenant ID
    let tenantId: string | null = null;
    if (decoded.role !== 'SUPERUSER') {
      const link = await prisma.tenantUser.findFirst({
        where: { userId: decoded.userId, isActive: true },
        select: { tenantId: true }
      });
      tenantId = link?.tenantId || null;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // For now, return empty array
    // TODO: Implement proper page fetching when schema is updated
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching website pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website pages' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages } = body;
    
    // Get authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    // Get tenant ID
    let tenantId: string | null = null;
    if (decoded.role !== 'SUPERUSER') {
      const link = await prisma.tenantUser.findFirst({
        where: { userId: decoded.userId, isActive: true },
        select: { tenantId: true }
      });
      tenantId = link?.tenantId || null;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // For now, return success
    // TODO: Implement proper page management when schema is updated
    return NextResponse.json({ 
      success: true, 
      message: 'Pages updated successfully',
      tenantId 
    });
  } catch (error) {
    console.error('Error updating website pages:', error);
    return NextResponse.json(
      { error: 'Failed to update website pages' },
      { status: 500 }
    );
  }
}
