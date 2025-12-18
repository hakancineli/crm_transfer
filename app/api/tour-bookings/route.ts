import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestUserContext } from '@/app/lib/requestContext';

export async function GET(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause: any = {};
    if (role !== 'SUPERUSER' && tenantIds && tenantIds.length > 0) {
      whereClause.tenantId = { in: tenantIds };
    }

    // Add filtering by tourId if provided
    const tourId = searchParams.get('tourId');
    if (tourId) {
      whereClause.tourId = tourId;
    }

    const bookings = await prisma.tourBooking.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            surname: true,
            phone: true,
            passportNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.tourBooking.count({ where: whereClause });

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Tur rezervasyonları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonları getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role, tenantIds } = await getRequestUserContext(request);
    console.log('Tour bookings POST - User context:', { userId, role, tenantIds });
    const body = await request.json();
    const {
      routeId,
      customRouteName,
      vehicleType,
      groupSize,
      price,
      currency,
      pickupLocation,
      tourDate,
      tourTime,
      tourDuration,
      passengerNames,
      notes,
      // New fields
      tourId,
      seatNumber,
      // Auto-create customer
      newCustomerName,
      newCustomerSurname,
      newCustomerPhone
    } = body;

    // Determine tenant ID based on user role
    let tenantId: string;
    if (role === 'SUPERUSER') {
      // SUPERUSER için tenant ID'yi body'den al veya default kullan
      tenantId = body.tenantId || '985046c2-aaa0-467b-8a10-ed965f6cdb43';
    } else if (tenantIds && tenantIds.length > 0) {
      // Diğer kullanıcılar için kendi tenant ID'lerini kullan
      tenantId = tenantIds[0];
    } else {
      return NextResponse.json(
        { error: 'Tenant ID bulunamadı' },
        { status: 400 }
      );
    }

    // Voucher numarası oluştur
    const voucherNumber = `TUR-${Date.now()}`;

    // Rota adını belirle
    let finalRouteName = body.routeName || 'Özel Tur';

    if (routeId && routeId !== 'custom') {
      // Eğer rota ID'si varsa veritabanından rota adını çekmeyi dene
      const dbRoute = await prisma.tourRoute.findUnique({
        where: { id: routeId },
        select: { name: true }
      });
      if (dbRoute) {
        finalRouteName = dbRoute.name;
      }
    } else if (routeId === 'custom' && customRouteName) {
      finalRouteName = customRouteName;
    }


    // CRM Enforcement: Handle Customer Creation for all passengers
    let finalCustomerId = body.customerId;

    // Handle the main booking customer first
    if (!finalCustomerId && newCustomerName && newCustomerPhone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone: newCustomerPhone, tenantId: tenantId }
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            tenantId,
            name: newCustomerName,
            surname: newCustomerSurname || '',
            phone: newCustomerPhone,
            passportNumber: '',
            email: '',
            nationality: '',
            source: 'booking_auto_create'
          }
        });
        finalCustomerId = newCustomer.id;
      }
    }

    // Now handle other passengers as customers if they have names and surnames
    if (body.passengerDetails && Array.isArray(body.passengerDetails)) {
      for (const p of body.passengerDetails) {
        if (p.name && p.surname) {
          // Check if this passenger already exists (by name and surname as phone might be missing)
          const existing = await prisma.customer.findFirst({
            where: {
              name: p.name,
              surname: p.surname,
              tenantId
            }
          });

          if (!existing) {
            await prisma.customer.create({
              data: {
                tenantId,
                name: p.name,
                surname: p.surname,
                source: 'passenger_auto_create'
              }
            });
          }
        }
      }
    }

    // Kur çevirisi yap (USD bazında) - sadece fiyat varsa
    let usdPrice = price;
    if (price > 0) {
      if (currency === 'EUR') {
        usdPrice = price / 0.85; // EUR to USD
      } else if (currency === 'TRY') {
        usdPrice = price / 30.5; // TRY to USD
      }
      // Round to 2 decimal places
      usdPrice = Math.round(usdPrice * 100) / 100;
    }

    // Rezervasyon oluştur
    // Construct Payment Reminder Date
    let paymentReminder: Date | null = null;
    if (body.paymentReminderDate) {
      const reminderString = `${body.paymentReminderDate}T${body.paymentReminderTime || '10:00'}:00`;
      paymentReminder = new Date(reminderString);
    }

    // Rezervasyon oluştur
    // Rezervasyon oluştur
    const numericPrice = parseFloat(String(price || 0));
    const numericPaid = parseFloat(String(body.paidAmount || 0));
    const numericGroupSize = parseInt(String(groupSize || 1));
    const numericDuration = parseInt(String(tourDuration || 1));

    const booking = await prisma.tourBooking.create({
      data: {
        tenantId,
        voucherNumber,
        routeName: finalRouteName,
        passengerNames: Array.isArray(passengerNames) ? passengerNames.join(', ') : String(passengerNames || ''),
        price: numericPrice,
        currency,
        vehicleType,
        groupSize: numericGroupSize,
        pickupLocation,
        tourDate: new Date(tourDate),
        tourTime,
        tourDuration: numericDuration,
        notes: notes || '',
        status: 'PENDING',
        source: role === 'SUPERUSER' ? 'admin' : 'agency',
        // New CRM and Payment fields

        customerId: finalCustomerId,
        paymentStatus: body.paymentStatus || 'PENDING',
        paymentMethod: body.paymentMethod || 'CASH',
        paidAmount: numericPaid,
        remainingAmount: body.paymentStatus === 'PAID' ? 0 : (numericPrice - numericPaid),
        // Scheduled Tour Links
        tourId: tourId || null,
        seatNumber: seatNumber || null,
        paymentReminder: body.paymentStatus !== 'PAID' && body.paymentReminderDate ? new Date(`${body.paymentReminderDate}T${body.paymentReminderTime || '10:00'}`) : null,
        passengerDetails: body.passengerDetails || null, // Store detailed seat mapping
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          }
        }
      }
    });

    // If linked to a scheduled tour, update occupancy
    if (tourId) {
      try {
        await prisma.tour.update({
          where: { id: tourId },
          data: {
            occupancy: {
              increment: parseInt(groupSize) // Assuming groupSize = 1 for seat selection but safe to use variable
            }
          }
        });
      } catch (updateError) {
        console.error('Error updating tour occupancy:', updateError);
        // Don't fail the booking if this fails, but log it
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      voucherNumber: booking.voucherNumber,
      originalPrice: price,
      originalCurrency: currency,
      convertedPrice: usdPrice,
      convertedCurrency: 'USD'
    });
  } catch (error) {
    console.error('Tur rezervasyonu oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Tur rezervasyonu oluşturulamadı' },
      { status: 500 }
    );
  }
}

