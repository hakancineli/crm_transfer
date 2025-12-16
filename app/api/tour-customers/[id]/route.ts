
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const context = await getRequestUserContext(request);
        // Basic auth check - in production you might want stricter checks
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                tourBookings: {
                    orderBy: { tourDate: 'desc' },
                    take: 10 // Recent history
                }
            }
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const context = await getRequestUserContext(request);
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { name, surname, email, phone, passportNumber, nationality, notes } = body;

        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                surname,
                email,
                phone,
                passportNumber,
                nationality,
                notes
            }
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const context = await getRequestUserContext(request);
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        await prisma.customer.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
