'use client';

import { useEffect, useState } from 'react';

interface GoogleMapsHook {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadGoogleMaps: () => void;
}

export function useGoogleMaps(): GoogleMapsHook {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoogleMaps = () => {
    // Eğer zaten yüklenmişse, tekrar yükleme
    if (isLoaded || isLoading) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Google Maps API key not found or invalid');
      console.warn('Google Maps API key not found or invalid');
      return;
    }

    // Script zaten yüklenmiş mi kontrol et
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // Script var ama Google Maps henüz hazır değilse bekle
      if ((window as any).google?.maps?.places) {
        setIsLoaded(true);
        setError(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr&v=weekly&loading=async`;
    
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully');
      
      // Billing hatası kontrolü
      if ((window as any).google?.maps?.places) {
        // Test request yaparak billing durumunu kontrol et
        const service = new (window as any).google.maps.places.AutocompleteService();
        const request = {
          input: 'test',
          componentRestrictions: { country: 'tr' }
        };
        
        service.getPlacePredictions(request, (predictions: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.BILLING_NOT_ENABLED) {
            console.error('❌ Google Maps billing not enabled');
            setError('Google Maps billing not enabled. Please enable billing in Google Cloud Console.');
            setIsLoading(false);
            return;
          }
          
          // Billing aktif, API kullanılabilir
          setIsLoaded(true);
          setIsLoading(false);
          setError(null);
        });
      } else {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      }
    };
    
    script.onerror = () => {
      console.error('❌ Google Maps script failed to load');
      setError('Failed to load Google Maps API - Check billing settings');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
  };

  useEffect(() => {
    // Component mount olduğunda otomatik yükle
    loadGoogleMaps();
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    loadGoogleMaps
  };
}
