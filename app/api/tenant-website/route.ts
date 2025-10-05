import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        companyName: true,
        domain: true,
        websites: {
          include: {
            settings: true
          }
        }
      }
    });

    return NextResponse.json(tenants);

  } catch (error) {
    console.error('Tenant websites fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tenant websites' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tenantId, domain } = await request.json();

    // Update tenant domain
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { domain }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Domain updated successfully' 
    });

  } catch (error) {
    console.error('Domain update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update domain' 
    }, { status: 500 });
  }
}
