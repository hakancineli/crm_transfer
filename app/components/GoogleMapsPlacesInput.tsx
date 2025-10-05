'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMaps } from '@/app/hooks/useGoogleMaps';

interface GoogleMapsPlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  forceFallback?: boolean;
}

export default function GoogleMapsPlacesInput({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  id,
  name,
  forceFallback = false
}: GoogleMapsPlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [predictions, setPredictions] = useState<Array<{ description: string }>>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const { isLoaded: googleReady, isLoading, error } = useGoogleMaps();
  const [portalRect, setPortalRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const updatePortalRect = () => {
    if (typeof window === 'undefined') return;
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPortalRect({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
  };

  // Fallback adres önerileri (Google Maps API olmadan)
  const fallbackAddresses = [
    'İstanbul Havalimanı (IST)',
    'Sabiha Gökçen Havalimanı (SAW)',
    'Taksim Meydanı',
    'Sultanahmet Camii',
    'Galata Kulesi',
    'Boğaziçi Köprüsü',
    'Ortaköy Camii',
    'Beşiktaş',
    'Kadıköy',
    'Üsküdar',
    'Beyoğlu',
    'Şişli',
    'Levent',
    'Maslak',
    'Etiler',
    'Bebek',
    'Arnavutköy',
    'Sarıyer',
    'Fatih',
    'Eminönü',
    'Karaköy',
    'Cihangir',
    'Nişantaşı',
    'Osmanbey',
    'Mecidiyeköy',
    'Gayrettepe',
    '4. Levent',
    'Ataşehir',
    'Kartal',
    'Pendik',
    'Maltepe',
    'Bostancı',
    'Kadıköy İskele',
    'Üsküdar İskele',
    'Eminönü İskele',
    'Karaköy İskele',
    'Laleli',
    'Laleli Camii',
    'Laleli Mahallesi',
    'Laleli Oteller Bölgesi',
    'Laleli Metro İstasyonu',
    'Laleli Çarşısı',
    'Laleli Han',
    'Laleli Kültür Merkezi',
    'Laleli Parkı',
    'Laleli Meydanı'
  ];

  // Google Places API ile öneri iste
  const requestPredictions = (inputValue: string) => {
    console.log('🔍 Requesting predictions for:', inputValue, 'Google ready:', googleReady);
    
    if (!inputValue || inputValue.length < 1) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    // API key geçersizse veya Google hazır değilse fallback kullan
    if (forceFallback || !googleReady) {
      console.log('📝 Using fallback suggestions (Google not ready)');
      const filtered = fallbackAddresses.filter(addr =>
        addr.toLowerCase().includes(inputValue.toLowerCase())
      );
      const suggestions = filtered.map(addr => ({ description: addr })).slice(0, 5);
      console.log('📝 Fallback suggestions:', suggestions);
      setPredictions(suggestions);
      setShowPredictions(true);
      return;
    }

    const g = (window as any).google;
    if (!g?.maps?.places?.AutocompleteService) {
      console.log('❌ Google Maps AutocompleteService not available, using fallback');
      const filtered = fallbackAddresses.filter(addr =>
        addr.toLowerCase().includes(inputValue.toLowerCase())
      );
      const suggestions = filtered.map(addr => ({ description: addr })).slice(0, 5);
      setPredictions(suggestions);
      setShowPredictions(true);
      return;
    }

    console.log('🌍 Using Google Places API');
    const service = new g.maps.places.AutocompleteService();
    const sessionToken = g.maps.places.AutocompleteSessionToken ? new g.maps.places.AutocompleteSessionToken() : undefined;
    
    service.getPlacePredictions(
      { 
        input: inputValue, 
        componentRestrictions: { country: ['tr'] }, 
        sessionToken, 
        language: 'tr', 
        region: 'TR' 
      },
      (preds: Array<{ description: string }> | null, status: string) => {
        console.log('🌍 Google Places response:', { preds, status });
        
        // Eğer API hatası varsa fallback kullan
        if (status && status !== 'OK') {
          console.warn('❌ Places API error:', status, 'Using fallback');
          const filtered = fallbackAddresses.filter(addr =>
            addr.toLowerCase().includes(inputValue.toLowerCase())
          );
          const suggestions = filtered.map(addr => ({ description: addr })).slice(0, 5);
          console.log('📝 Fallback suggestions:', suggestions);
          setPredictions(suggestions);
          setShowPredictions(true);
          return;
        }
        
        const list = preds || [];
        console.log('✅ Google suggestions:', list.slice(0, 5));
        setPredictions(list.slice(0, 5));
        setShowPredictions(true);
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    requestPredictions(inputValue);
    updatePortalRect();
  };

  const handleSuggestionClick = (prediction: { description: string }) => {
    onChange(prediction.description);
    setShowPredictions(false);
    setPredictions([]);
  };

  const handleBlur = () => {
    // Kısa bir gecikme ile suggestions'ı kapat
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
    updatePortalRect();
  };

  // Reposition on scroll/resize while dropdown is visible
  useEffect(() => {
    if (!showPredictions) return;
    const handler = () => updatePortalRect();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    handler();
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [showPredictions]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${className}`}
        required={required}
        autoComplete="off"
        id={id}
        name={name}
      />
      
      {showPredictions && predictions.length > 0 && typeof window !== 'undefined' && portalRect && createPortal(
        <div
          style={{ position: 'absolute', top: portalRect.top, left: portalRect.left, width: portalRect.width, zIndex: 10000 }}
          className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(prediction)}
            >
              {prediction.description}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}