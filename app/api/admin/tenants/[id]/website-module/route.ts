import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// PUT /api/admin/tenants/[id]/website-module - Enable/disable website module for tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is SUPERUSER
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid enabled value' }, { status: 400 });
    }

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: { websiteModuleEnabled: enabled },
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        websiteModuleEnabled: true
      }
    });

    return NextResponse.json({
      message: `Website module ${enabled ? 'enabled' : 'disabled'} for ${tenant.companyName}`,
      tenant
    });

  } catch (error) {
    console.error('Error updating website module status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/tenants/[id]/website-module - Get website module status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is SUPERUSER
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        websiteModuleEnabled: true,
        websites: {
          select: {
            id: true,
            domain: true,
            subdomain: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);

  } catch (error) {
    console.error('Error fetching website module status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

