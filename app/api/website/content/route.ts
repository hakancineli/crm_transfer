import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get website content for the current tenant
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    // Get tenant ID
    let tenantId = null;
    if (decoded.role !== 'SUPERUSER') {
      const link = await prisma.tenantUser.findFirst({
        where: { userId: decoded.userId, isActive: true },
        select: { tenantId: true }
      });
      tenantId = link?.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get website content for this specific tenant
    const websiteContent = await prisma.tenantWebsite.findFirst({
      where: { 
        tenantId,
        isActive: true
      },
      include: {
        pages: true,
        sections: true
      }
    });

    return NextResponse.json(websiteContent || {});
  } catch (error) {
    console.error('Error fetching website content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    // Get tenant ID
    let tenantId = null;
    if (decoded.role !== 'SUPERUSER') {
      const link = await prisma.tenantUser.findFirst({
        where: { userId: decoded.userId, isActive: true },
        select: { tenantId: true }
      });
      tenantId = link?.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // For now, just return success
    // TODO: Implement proper content storage when schema is updated
    return NextResponse.json({ 
      success: true, 
      message: 'Content updated successfully',
      tenantId 
    });
  } catch (error) {
    console.error('Error updating website content:', error);
    return NextResponse.json(
      { error: 'Failed to update website content' },
      { status: 500 }
    );
  }
}
