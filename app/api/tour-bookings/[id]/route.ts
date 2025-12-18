import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
        },
        customer: {
          select: {
            id: true,
            name: true,
            surname: true,
            phone: true
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

    // Safe Parse passenger names
    let passengers: string[] = [];
    if (booking.passengerNames) {
      if (booking.passengerNames.trim().startsWith('[')) {
        try {
          passengers = JSON.parse(booking.passengerNames);
        } catch (e) {
          passengers = booking.passengerNames.split(',').map(s => s.trim());
        }
      } else {
        passengers = booking.passengerNames.split(',').map(s => s.trim());
      }
    }

    const parsedBooking = {
      ...booking,
      passengerNames: passengers,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, tenantIds } = await getRequestUserContext(request);
    const bookingId = params.id;
    const body = await request.json();

    const booking = await prisma.tourBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 });
    }

    // Auth check
    if (role !== 'SUPERUSER' && (!tenantIds || !tenantIds.includes(booking.tenantId))) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const data: any = {};
    if (body.paymentReminderDate) {
      data.paymentReminder = new Date(`${body.paymentReminderDate}T${body.paymentReminderTime || '10:00'}`);
    }
    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
    if (body.paidAmount !== undefined) data.paidAmount = parseFloat(body.paidAmount);
    if (body.remainingAmount !== undefined) data.remainingAmount = parseFloat(body.remainingAmount);

    const updated = await prisma.tourBooking.update({
      where: { id: bookingId },
      data
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let { userId, role, tenantIds } = await getRequestUserContext(request);
    const bookingId = params.id;
    const body = await request.json();

    // Load booking first to determine its tenant
    const bookingForAuth = await prisma.tourBooking.findUnique({ where: { id: bookingId }, select: { id: true, tenantId: true } });
    if (!bookingForAuth) {
      return NextResponse.json({ error: 'Tur rezervasyonu bulunamadı' }, { status: 404 });
    }

    // Hydrate tenantIds if missing
    if (role !== 'SUPERUSER' && (!tenantIds || tenantIds.length === 0) && userId) {
      const links = await prisma.tenantUser.findMany({ where: { userId, isActive: true }, select: { tenantId: true } });
      tenantIds = links.map((l: any) => l.tenantId);
    }

    // Authorization: SUPERUSER always allowed; otherwise must belong to booking's tenant
    const bookingTenantId = bookingForAuth.tenantId;
    if (role !== 'SUPERUSER') {
      if (!tenantIds || tenantIds.length === 0 || !tenantIds.includes(bookingTenantId)) {
        return NextResponse.json({ error: 'Bu rezervasyon için yetkiniz yok' }, { status: 403 });
      }
    }

    // Module check: SUPERUSER ve AGENCY_ADMIN için modül kontrolü yok; diğer roller için kontrol et
    if (role !== 'SUPERUSER' && role !== 'AGENCY_ADMIN') {
      try {
        await assertModuleEnabled({ role, tenantId: bookingTenantId, moduleName: 'tour' });
        const perms = await loadActiveUserPermissions(userId);
        assertPermission(role, perms, getModuleManageChecker('tour'));
      } catch (moduleError) {
        console.error('Module check failed:', moduleError);
        return NextResponse.json({ error: 'Modül erişim yetkisi yok' }, { status: 403 });
      }
    }

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

    // Validate driver fee if provided
    let normalizedDriverFee: number | undefined = undefined;
    if (driverFee !== undefined) {
      const feeCandidate = typeof driverFee === 'string' ? parseFloat(driverFee) : Number(driverFee);
      if (Number.isNaN(feeCandidate)) {
        return NextResponse.json({ error: 'Geçersiz şoför ücreti' }, { status: 400 });
      }
      normalizedDriverFee = feeCandidate;
    }

    // Validate driver existence if driverId provided
    if (driverId) {
      const driverExists = await prisma.driver.findUnique({ where: { id: driverId }, select: { id: true } });
      if (!driverExists) {
        return NextResponse.json({ error: 'Şoför bulunamadı' }, { status: 404 });
      }
    }

    // Fetch existing booking (already loaded tenant), ensure it still exists
    const existingBooking = await prisma.tourBooking.findUnique({ where: { id: bookingId } });

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
        price: price ? parseFloat(price) : existingBooking.price,
        currency: currency || existingBooking.currency,
        pickupLocation: pickupLocation || existingBooking.pickupLocation,
        tourDate: tourDate ? new Date(tourDate) : existingBooking.tourDate,
        tourTime: tourTime || existingBooking.tourTime,
        passengerNames: passengerNames ? JSON.stringify(passengerNames.filter((name: string) => name.trim() !== '')) : existingBooking.passengerNames,
        notes: notes !== undefined ? notes : existingBooking.notes,
        status: status || existingBooking.status,
        driverId: driverId !== undefined ? driverId : existingBooking.driverId,
        driverFee: normalizedDriverFee !== undefined ? normalizedDriverFee : existingBooking.driverFee
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

    // Safe Parse passenger names
    let passengers: string[] = [];
    if (updatedBooking.passengerNames) {
      if (updatedBooking.passengerNames.trim().startsWith('[')) {
        try {
          passengers = JSON.parse(updatedBooking.passengerNames);
        } catch (e) {
          passengers = updatedBooking.passengerNames.split(',').map(s => s.trim());
        }
      } else {
        passengers = updatedBooking.passengerNames.split(',').map(s => s.trim());
      }
    }

    const parsedBooking = {
      ...updatedBooking,
      passengerNames: passengers,
      tourDate: updatedBooking.tourDate.toISOString(),
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString()
    };

    return NextResponse.json(parsedBooking);
  } catch (error: any) {
    console.error('Tur rezervasyonu güncelleme hatası:', error);
    const message = typeof error?.message === 'string' ? error.message : 'Tur rezervasyonu güncellenemedi';
    return NextResponse.json(
      { error: message },
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

