import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Rezervasyonlar getiriliyor...');
    
    // Transfer rezervasyonlarını getir
    const reservations = await prisma.reservation.findMany({
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
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

    // Tur rezervasyonlarını getir
    const tourBookings = await prisma.tourBooking.findMany({
      take: 50,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            username: true
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

    console.log('API: Bulunan transfer sayısı:', reservations.length);
    console.log('API: Bulunan tur sayısı:', tourBookings.length);

    // Transfer rezervasyonlarını formatla
    const transferResults = reservations.map(r => ({
      id: r.id,
      voucherNumber: r.voucherNumber,
      date: r.date,
      time: r.time,
      from: r.from,
      to: r.to,
      passengerNames: JSON.parse(r.passengerNames || '[]'),
      price: r.price,
      currency: r.currency,
      paymentStatus: r.paymentStatus,
      user: r.user,
      driver: r.driver,
      type: 'transfer'
    }));

    // Tur rezervasyonlarını formatla
    const tourResults = tourBookings.map(t => ({
      id: t.id,
      voucherNumber: t.voucherNumber,
      date: t.tourDate.toISOString().split('T')[0],
      time: t.tourTime || '00:00',
      from: t.pickupLocation,
      to: t.routeName,
      passengerNames: JSON.parse(t.passengerNames || '[]'),
      price: t.price,
      currency: t.currency,
      paymentStatus: t.status,
      user: t.User,
      driver: t.driver,
      type: 'tur'
    }));

    // Tüm rezervasyonları birleştir ve tarihe göre sırala
    const allResults = [...transferResults, ...tourResults]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('API: Toplam rezervasyon sayısı:', allResults.length);

    return NextResponse.json(allResults);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Rezervasyonlar getirilemedi' },
      { status: 500 }
    );
  }
}