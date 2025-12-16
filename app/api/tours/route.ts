
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
    try {
        const context = await getRequestUserContext(request);
        let tenantId = '985046c2-aaa0-467b-8a10-ed965f6cdb43'; // Default tenant

        if (context && context.tenantIds && context.tenantIds.length > 0) {
            tenantId = context.tenantIds[0];
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const whereClause: any = {
            tenantId,
        };

        if (startDate && endDate) {
            whereClause.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        } else {
            // Default to upcoming tours from today
            whereClause.startDate = {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            };
        }

        const tours = await prisma.tour.findMany({
            where: whereClause,
            include: {
                route: true,
                vehicle: true,
                // driver: true - Driver relation might be problematic if not strictly defined in include, let's check schema
            },
            orderBy: { startDate: 'asc' }
        });

        // We need to fetch drivers separately if relation is not straightforward or to be safe
        // But schema says Tour has driverId. Does it have relation to Driver model?
        // Looking at schema: `driverId String?`. No `@relation`.
        // Wait, let me check the schema I read again.
        // Line 462: `driverId String?`
        // Line 400 (TourBooking) has relation `driver Driver?`.
        // Line 457 (Tour) does NOT seem to have a `driver` relation defined in the snippet I saw?
        // Let me re-read line 457-480 carefully.
        // Line 478-480: tenant, route, vehicle relations are there.
        // There is NO `driver` relation on Tour model in the schema snippet I saw!
        // So I need to fetch driver manually or update schema.
        // Updating schema is expensive/risky mid-flight. I will fetch drivers manually for the list.

        // Better: I will use `driverId` to display, or fetch drivers in the frontend.
        // Or I can perform a second query to get drivers.

        // Let's just return tours for now. Frontend can resolve driverId if needed, 
        // or I can map it if I fetch all drivers.

        // Actually, I can fix the schema to add the relation if I want, but let's stick to what we have.
        // If I need driver name, I might need to fetch it.

        return NextResponse.json(tours);
    } catch (error) {
        console.error('Turlar getirilemedi:', error);
        return NextResponse.json(
            { error: 'Turlar getirilemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const context = await getRequestUserContext(request);
        const body = await request.json();

        let tenantId = '985046c2-aaa0-467b-8a10-ed965f6cdb43';
        if (context && context.tenantIds && context.tenantIds.length > 0) {
            tenantId = context.tenantIds[0];
        }

        const { routeId, startDate, startTime, vehicleId, driverId, guideId, capacity } = body;

        if (!routeId || !startDate) {
            return NextResponse.json({ error: 'Route and Start Date are required' }, { status: 400 });
        }

        // Determine capacity
        let finalCapacity = 0;
        if (capacity) {
            finalCapacity = parseInt(capacity);
        } else if (vehicleId) {
            // Fetch vehicle capacity
            const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
            if (vehicle) finalCapacity = vehicle.capacity;
        }

        const newTour = await prisma.tour.create({
            data: {
                tenantId,
                routeId,
                vehicleId,
                driverId,
                guideId,
                startDate: new Date(startDate),
                startTime,
                capacity: finalCapacity,
                status: 'SCHEDULED',
                occupancy: 0
            }
        });

        return NextResponse.json(newTour, { status: 201 });

    } catch (error) {
        console.error('Tur oluşturma hatası:', error);
        return NextResponse.json(
            { error: 'Tur oluşturulamadı' },
            { status: 500 }
        );
    }
}
