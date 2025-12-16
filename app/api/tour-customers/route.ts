import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
    try {
        const context = await getRequestUserContext(request);
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tenantIds } = context;
        if (!tenantIds || tenantIds.length === 0) {
            return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }
        const tenantId = tenantIds[0];

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        // Basic search by name, email, phone, or passport
        const where: any = {
            tenantId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { surname: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { passportNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit results for now
            include: {
                _count: {
                    select: { tourBookings: true }
                }
            }
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const context = await getRequestUserContext(request);
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tenantIds } = context;
        if (!tenantIds || tenantIds.length === 0) {
            return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }
        const tenantId = tenantIds[0];

        const body = await request.json();
        const { name, surname, email, phone, passportNumber, nationality, notes } = body;

        // Check if customer already exists (by passport or email if provided)
        if (passportNumber) {
            const existing = await prisma.customer.findFirst({
                where: { tenantId, passportNumber }
            });
            if (existing) {
                return NextResponse.json(
                    { error: 'Customer with this passport number already exists', customer: existing },
                    { status: 409 }
                );
            }
        }

        const customer = await prisma.customer.create({
            data: {
                tenantId,
                name,
                surname,
                email,
                phone,
                passportNumber,
                nationality,
                notes
            }
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
