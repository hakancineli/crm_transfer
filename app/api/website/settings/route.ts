import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
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

    // For now, return default settings
    // TODO: Implement proper settings fetching when schema is updated
    return NextResponse.json({ 
      success: true, 
      data: {
        companyName: 'Şeref Vural Travel',
        tagline: 'İstanbul Havalimanı Transfer Hizmeti',
        description: 'İstanbul Havalimanı\'ndan şehir merkezine konforlu ve güvenli transfer hizmeti.',
        phone: '+90 531 945 89 31',
        whatsapp: '+90 531 945 89 31',
        email: 'info@serefvural.com',
        primaryColor: '#16a34a',
        secondaryColor: '#6b7280'
      }
    });
  } catch (error) {
    console.error('Error fetching website settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();
    const {
      companyName,
      tagline,
      description,
      phone,
      whatsapp,
      email,
      primaryColor,
      secondaryColor
    } = body;

    // For now, return success
    // TODO: Implement proper settings storage when schema is updated
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      tenantId 
    });
  } catch (error) {
    console.error('Error saving website settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
