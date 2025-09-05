import { NextRequest, NextResponse } from 'next/server';
import { FlightTracker } from '@/app/lib/flightTracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');
    const multiple = searchParams.get('multiple');

    if (multiple) {
      // Birden fazla uçuş bilgisi al
      const flightNumbers = multiple.split(',');
      const flights = await FlightTracker.getMultipleFlights(flightNumbers);
      return NextResponse.json(flights);
    }

    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Uçuş numarası gerekli' },
        { status: 400 }
      );
    }

    const flightInfo = await FlightTracker.getFlightInfo(flightNumber);
    
    if (!flightInfo) {
      return NextResponse.json(
        { error: 'Uçuş bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(flightInfo);
  } catch (error) {
    console.error('Uçuş bilgisi API hatası:', error);
    return NextResponse.json(
      { error: 'Uçuş bilgisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { flightNumbers } = await request.json();
    
    if (!Array.isArray(flightNumbers)) {
      return NextResponse.json(
        { error: 'Uçuş numaraları dizi olmalı' },
        { status: 400 }
      );
    }

    const flights = await FlightTracker.getMultipleFlights(flightNumbers);
    return NextResponse.json(flights);
  } catch (error) {
    console.error('Toplu uçuş bilgisi API hatası:', error);
    return NextResponse.json(
      { error: 'Uçuş bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
