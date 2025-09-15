'use client';

import { useParams } from 'next/navigation';
import TourVoucher from '@/app/components/TourVoucher';

export default function TourCustomerVoucherPage() {
  const params = useParams();
  const bookingId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <TourVoucher bookingId={bookingId} />
      </div>
    </div>
  );
}


