'use client';

import { useEffect } from 'react';
import ReservationForm from '@/app/components/ReservationForm';

export default function AdminNewReservationPage() {
  // Google Maps API'yi yükle
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      console.warn('Google Maps API key not found or invalid, using fallback mode');
      return;
    }

    const scriptId = 'gmaps-places-script';
    if (document.getElementById(scriptId)) {
      return; // Script zaten yüklenmiş
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`;
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
    };
    script.onerror = () => {
      console.error('Google Maps script failed to load');
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Yeni Rezervasyon (Admin)</h1>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <ReservationForm />
        </div>
      </div>
    </div>
  );
}
