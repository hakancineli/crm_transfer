'use client';

import { useParams } from 'next/navigation';
import TourVoucher from '@/app/components/TourVoucher';

export default function TourVoucherPage() {
  const params = useParams();
  const bookingId = params.id as string;

  return <TourVoucher bookingId={bookingId} />;
}


