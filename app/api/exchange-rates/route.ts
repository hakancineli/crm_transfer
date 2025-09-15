import { NextRequest, NextResponse } from 'next/server';

// Basit kur oranları (gerçek uygulamada bir API'den alınmalı)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  TRY: 30.5
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') as keyof typeof EXCHANGE_RATES;
    const to = searchParams.get('to') as keyof typeof EXCHANGE_RATES;
    const amount = parseFloat(searchParams.get('amount') || '0');

    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: 'from, to ve amount parametreleri gerekli' },
        { status: 400 }
      );
    }

    if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[to]) {
      return NextResponse.json(
        { error: 'Geçersiz para birimi' },
        { status: 400 }
      );
    }

    // USD'ye çevir, sonra hedef para birimine çevir
    const usdAmount = amount / EXCHANGE_RATES[from];
    const convertedAmount = usdAmount * EXCHANGE_RATES[to];

    return NextResponse.json({
      from,
      to,
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // 2 ondalık basamak
      rate: EXCHANGE_RATES[to] / EXCHANGE_RATES[from]
    });
  } catch (error) {
    console.error('Kur çevirisi hatası:', error);
    return NextResponse.json(
      { error: 'Kur çevirisi yapılamadı' },
      { status: 500 }
    );
  }
}

