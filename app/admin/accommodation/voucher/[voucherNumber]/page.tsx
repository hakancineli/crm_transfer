'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import HotelVoucher from '@/app/components/HotelVoucher';

interface HotelBooking {
  voucherNumber: string;
  hotelName: string;
  hotelAddress: string;
  roomType: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number;
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  cancellationPolicy: string;
  bookingReference: string;
}

export default function HotelVoucherPage() {
  const params = useParams();
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/accommodation/bookings/by-voucher/${params.voucherNumber}`);
        
        if (!response.ok) {
          throw new Error('Rezervasyon bulunamadı');
        }

        const data = await response.json();
        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.voucherNumber) {
      fetchBooking();
    }
  }, [params.voucherNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Voucher yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Voucher Bulunamadı</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Aradığınız voucher numarası bulunamadı'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <HotelVoucher booking={booking} />
    </div>
  );
}
