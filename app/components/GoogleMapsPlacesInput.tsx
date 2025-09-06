'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapsPlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}

export default function GoogleMapsPlacesInput({
  value,
  onChange,
  placeholder,
  className = '',
  required = false
}: GoogleMapsPlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [predictions, setPredictions] = useState<Array<{ description: string }>>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Google Maps API'nin yüklenip yüklenmediğini kontrol et
  useEffect(() => {
    const checkGoogleMaps = () => {
      const g = (window as any).google;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
      
      console.log('Checking Google Maps API:', {
        google: !!g,
        maps: !!g?.maps,
        places: !!g?.maps?.places,
        autocompleteService: !!g?.maps?.places?.AutocompleteService,
        apiKey: apiKey ? (apiKey === 'your_google_maps_api_key_here' ? 'INVALID' : 'VALID') : 'MISSING'
      });
      
      // API key geçersizse veya yoksa fallback kullan
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        console.log('❌ Invalid API key, using fallback mode');
        setGoogleReady(false);
        return false;
      }
      
      if (g?.maps?.places?.AutocompleteService) {
        setGoogleReady(true);
        console.log('✅ Google Maps API is ready!');
        return true;
      }
      return false;
    };

    // Hemen kontrol et
    if (checkGoogleMaps()) return;

    // Eğer henüz yüklenmemişse, kısa aralıklarla kontrol et
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 500);

    // 10 saniye sonra timeout
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('❌ Google Maps API did not load within 10 seconds, using fallback suggestions');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

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
    if (!googleReady) {
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
  };

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
      />
      
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(prediction)}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}