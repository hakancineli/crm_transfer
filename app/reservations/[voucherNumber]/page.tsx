'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReservationDetail from './ReservationDetail';

export default function VoucherPage() {
  const params = useParams();
  const voucherNumber = params.voucherNumber as string;
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (voucherNumber) {
      fetch(`/api/reservations/${voucherNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setReservation(data);
          }
        })
        .catch(err => {
          setError('Rezervasyon bulunamadı');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [voucherNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return reservation ? <ReservationDetail reservation={reservation} /> : null;
}
