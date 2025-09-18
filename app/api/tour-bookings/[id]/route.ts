import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';
import { ensureTenantId, assertModuleEnabled, loadActiveUserPermissions, assertPermission, getModuleManageChecker } from '@/app/lib/moduleAccess';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const bookingId = params.id;

    // Build where clause based on user role
    let whereClause: any = { id: bookingId };
    if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
      whereClause.tenantId = { in: tenantIds };
    }

    const booking = await prisma.tourBooking.findFirst({
      where: whereClause,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Tur rezervasyonu bulunamadı' },
        { status: 404 }
      );
    }

    // Parse passenger names
    const parsedBooking = {
      ...booking,
      passengerNames: JSON.parse(booking.passengerNames || '[]'),
      tourDate: booking.tourDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    };

    return NextResponse.json(parsedBooking);
  } catch (error) {
    console.error('Tur rezervasyonu getirme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonu getirilemedi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const bookingId = params.id;
    const body = await request.json();
    const tenantId = await ensureTenantId({ role, tenantIds });
    await assertModuleEnabled({ role, tenantId, moduleName: 'tour' });
    const perms = await loadActiveUserPermissions(userId);
    assertPermission(role, perms, getModuleManageChecker('tour'));

    const {
      routeName,
      vehicleType,
      groupSize,
      price,
      currency,
      pickupLocation,
      tourDate,
      tourTime,
      passengerNames,
      notes,
      status,
      driverId,
      driverFee
    } = body;

    // Build where clause based on user role
    let whereClause: any = role === 'SUPERUSER' ? { id: bookingId } : { id: bookingId, tenantId };

    // Check if booking exists
    const existingBooking = await prisma.tourBooking.findFirst({
      where: whereClause
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Tur rezervasyonu bulunamadı' },
        { status: 404 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.tourBooking.update({
      where: { id: bookingId },
      data: {
        routeName: routeName || existingBooking.routeName,
        vehicleType: vehicleType || existingBooking.vehicleType,
        groupSize: groupSize || existingBooking.groupSize,
        price: price || existingBooking.price,
        currency: currency || existingBooking.currency,
        pickupLocation: pickupLocation || existingBooking.pickupLocation,
        tourDate: tourDate ? new Date(tourDate) : existingBooking.tourDate,
        tourTime: tourTime || existingBooking.tourTime,
        passengerNames: passengerNames ? JSON.stringify(passengerNames.filter((name: string) => name.trim() !== '')) : existingBooking.passengerNames,
        notes: notes !== undefined ? notes : existingBooking.notes,
        status: status || existingBooking.status,
        driverId: driverId !== undefined ? driverId : existingBooking.driverId,
        driverFee: driverFee !== undefined ? parseFloat(driverFee) : existingBooking.driverFee
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    // Parse passenger names
    const parsedBooking = {
      ...updatedBooking,
      passengerNames: JSON.parse(updatedBooking.passengerNames || '[]'),
      tourDate: updatedBooking.tourDate.toISOString(),
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString()
    };

    return NextResponse.json(parsedBooking);
  } catch (error) {
    console.error('Tur rezervasyonu güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonu güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    const bookingId = params.id;
    const tenantId = await ensureTenantId({ role, tenantIds });
    await assertModuleEnabled({ role, tenantId, moduleName: 'tour' });
    const perms = await loadActiveUserPermissions(userId);
    assertPermission(role, perms, getModuleManageChecker('tour'));

    // Build where clause based on user role
    let whereClause: any = role === 'SUPERUSER' ? { id: bookingId } : { id: bookingId, tenantId };

    // Check if booking exists
    const existingBooking = await prisma.tourBooking.findFirst({
      where: whereClause
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Tur rezervasyonu bulunamadı' },
        { status: 404 }
      );
    }

    // Delete booking
    await prisma.tourBooking.delete({
      where: { id: bookingId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tur rezervasyonu silme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonu silinemedi' },
      { status: 500 }
    );
  }
}

