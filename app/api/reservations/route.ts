import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getRequestUserContext, buildTenantWhere } from '@/app/lib/requestContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';
import { evaluatePermissions, shouldRestrictToOwnReservations } from '@/app/lib/authorization';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Rezervasyonlar getiriliyor...');
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const tenantId = searchParams.get('tenantId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10))); // default 50
    const fromDate = searchParams.get('from'); // YYYY-MM-DD
    const toDate = searchParams.get('to');     // YYYY-MM-DD
    const { userId: currentUserId, role: currentUserRole, tenantIds: currentTenantIds } = await getRequestUserContext(request);

    // If phone parameter is provided, search by phone number
    if (phone) {
      const normalized = phone.trim();
      const noSpaces = normalized.replace(/\s+/g, '');
      const digitsOnly = normalized.replace(/\D+/g, ''); // keep only numbers
      const digitsNoLeadingZero = digitsOnly.replace(/^0+/, '');

      const reservations = await prisma.reservation.findMany({
        where: {
          OR: [
            { phoneNumber: { equals: normalized } },
            { phoneNumber: { equals: noSpaces } },
            { phoneNumber: { contains: normalized } },
            { phoneNumber: { contains: digitsOnly } },
            { phoneNumber: { contains: digitsNoLeadingZero } },
            { phoneNumber: { contains: `+${digitsNoLeadingZero}` } }
          ]
        },
        orderBy: [
          { date: 'desc' },
          { time: 'desc' }
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          driver: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          tenant: {
            select: {
              id: true,
              companyName: true,
              subdomain: true
            }
          }
        }
      });

      // Parse passenger names for each reservation
      const parsedReservations = reservations.map(reservation => {
        try {
          return {
            ...reservation,
            passengerNames: JSON.parse(reservation.passengerNames || '[]'),
            createdAt: reservation.createdAt.toISOString()
          };
        } catch (error) {
          console.error('Yolcu isimleri parse hatası:', error);
          return {
            ...reservation,
            passengerNames: [],
            createdAt: reservation.createdAt.toISOString()
          };
        }
      });

      return NextResponse.json(parsedReservations);
    }

    // If no phone parameter, return reservations (scoped)
    console.log('API: Tüm rezervasyonlar getiriliyor...');
    const whereClause: any = buildTenantWhere(currentUserRole, currentTenantIds, tenantId || undefined);
    // Optional date range on string field `date` (YYYY-MM-DD)
    if (fromDate || toDate) {
      whereClause.date = {} as any;
      if (fromDate) (whereClause.date as any).gte = fromDate;
      if (toDate) (whereClause.date as any).lte = toDate;
    }
    const evald = await evaluatePermissions(currentUserId, currentUserRole);
    if (shouldRestrictToOwnReservations(evald) && currentUserId) {
      whereClause.userId = currentUserId;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        driver: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true
          }
        }
      }
    });
    console.log('API: Bulunan rezervasyon sayısı:', reservations.length);

    // Her rezervasyon için yolcu isimlerini parse et
    const parsedReservations = reservations.map(reservation => {
      try {
        return {
          ...reservation,
          passengerNames: JSON.parse(reservation.passengerNames || '[]'),
          createdAt: reservation.createdAt.toISOString()
        };
      } catch (error) {
        console.error('Yolcu isimleri parse hatası:', error);
        return {
          ...reservation,
          passengerNames: [],
          createdAt: reservation.createdAt.toISOString()
        };
      }
    });

    return NextResponse.json(parsedReservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyonlar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { userId: currentUserId, role, tenantIds } = await getRequestUserContext(request);

        // Check if this is a customer reservation (no auth token)
        const isCustomerReservation = !currentUserId;
        
        // Permission: require CREATE_RESERVATIONS unless SUPERUSER or customer reservation
        if (role !== 'SUPERUSER' && !isCustomerReservation) {
          let allowed = role && (ROLE_PERMISSIONS as any)[role]?.includes(PERMISSIONS.CREATE_RESERVATIONS) ? true : false;
          if (currentUserId) {
            const perms = await prisma.userPermission.findMany({
              where: { userId: currentUserId, isActive: true },
              select: { permission: true }
            });
            allowed = perms.some(p => p.permission === PERMISSIONS.CREATE_RESERVATIONS);
          }
          if (!allowed) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
          }
        }

        // Determine tenant
        const currentTenantId: string | null = role === 'SUPERUSER' ? null : (tenantIds && tenantIds.length > 0 ? tenantIds[0] : null);
        
        // Yolcu isimlerini JSON string'e çevir
        const passengerNames = Array.isArray(data.passengerNames) 
            ? JSON.stringify(data.passengerNames)
            : JSON.stringify([]);

        // Voucher numarası oluştur - daha güvenli algoritma
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        
        // O günkü mevcut voucher numaralarını al
        const todayVouchers = await prisma.reservation.findMany({
            where: {
                voucherNumber: {
                    startsWith: `VIP${formattedDate}-`
                }
            },
            select: {
                voucherNumber: true
            }
        });
        
        // Sıradaki numarayı bul
        let nextNumber = 1;
        if (todayVouchers.length > 0) {
            const numbers = todayVouchers.map(v => {
                const match = v.voucherNumber.match(/VIP\d+-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        
        const voucherNumber = `VIP${formattedDate}-${nextNumber}`;

        const reservation = await prisma.reservation.create({
            data: {
                date: data.date,
                time: data.time,
                from: data.from,
                to: data.to,
                flightCode: data.flightCode,
                passengerNames,
                luggageCount: data.luggageCount,
                price: data.price,
                currency: data.currency,
                phoneNumber: data.phoneNumber,
                distanceKm: data.distanceKm,
                voucherNumber,
                driverId: null,
                driverFee: null,
                userId: currentUserId || null,
                tenantId: currentTenantId || null
            }
        });

        // Telegram bildirimi (opsiyonel + log)
        let telegramAttempted = false;
        let telegramOk = false;
        try {
            const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
            if (BOT_TOKEN && CHAT_ID) {
                telegramAttempted = true;
                const textLines = [
                    isCustomerReservation ? 'Yeni Müşteri Talebi ✅' : 'Yeni Rezervasyon Oluşturuldu ✅',
                    `Voucher: ${voucherNumber}`,
                    `Tarih: ${data.date} ${data.time}`,
                    `Güzergah: ${data.from} → ${data.to}`,
                    `Yolcular: ${(Array.isArray(data.passengerNames) ? data.passengerNames.join(', ') : '') || '-'}`,
                    data.phoneNumber ? `Telefon: ${data.phoneNumber}` : undefined,
                    data.flightCode ? `Uçuş: ${data.flightCode}` : undefined,
                    data.specialRequests ? `Not: ${data.specialRequests}` : undefined
                ].filter(Boolean).join('\n');

                // Fire-and-forget with timeout (prevents slow create)
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 1500);
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: String(CHAT_ID), text: textLines }),
                    signal: controller.signal
                })
                .then(async (tgRes) => {
                    clearTimeout(timeout);
                    if (!tgRes.ok) {
                        const errText = await tgRes.text();
                        console.error('Telegram bildirim hatası (response):', tgRes.status, errText);
                    } else {
                        telegramOk = true;
                    }
                })
                .catch((e) => {
                    clearTimeout(timeout);
                    console.error('Telegram fetch error:', e?.name || e);
                });
            } else {
                console.warn('Telegram env eksik: BOT_TOKEN veya CHAT_ID yok');
            }
        } catch (notifyErr) {
            console.error('Telegram bildirim hatası (fetch):', notifyErr);
        }

        return NextResponse.json({
            ...reservation,
            passengerNames: JSON.parse(passengerNames),
            telegramAttempted,
            telegramOk
        });
    } catch (error) {
        console.error('Rezervasyon oluşturma hatası:', error);
        return NextResponse.json(
            { error: 'Rezervasyon oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
} 