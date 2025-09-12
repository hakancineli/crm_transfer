'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ReservationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (user?.role === 'SELLER') {
      router.push('/admin/reservations');
    } else if (user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENCY_USER') {
      router.push('/admin/reservations');
    } else if (user?.role === 'SUPERUSER') {
      router.push('/admin/reservations');
    } else {
      // For other roles or customers, redirect to customer reservation page
      router.push('/customer-reservation');
    }
    
    setLoading(false);
  }, [isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return null;
}
