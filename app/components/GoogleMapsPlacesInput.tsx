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
  const [activeIndex, setActiveIndex] = useState<number>(-1);

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

  // v1 HTTP Autocomplete (Places API New) – JS API yoksa gerçek öneriler için
  const requestPredictionsViaHttp = async (inputValue: string) => {
    try {
      const resp = await fetch(`/api/places-autocomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputValue
        }),
      });
      if (!resp.ok) throw new Error('HTTP autocomplete failed');
      const data = await resp.json();
      const list = Array.isArray(data?.suggestions) ? data.suggestions : [];
      const mapped = list.slice(0, 5);
      if (mapped.length > 0) {
        setPredictions(mapped);
        setShowPredictions(true);
        return true;
      }
    } catch (e) {
      // ignore and fallback further
    }
    return false;
  };

  // Google Places API ile öneri iste (yeni API -> eski API -> HTTP v1 -> fallback)
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

    // 1) Yeni API: AutocompleteSuggestion (mevcutsa tercih et)
    try {
      const SuggestionCtor = g?.maps?.places?.AutocompleteSuggestion;
      if (SuggestionCtor) {
        console.log('🌍 Using Places AutocompleteSuggestion API');
        const svc = new SuggestionCtor();
        if (typeof svc.getSuggestions === 'function') {
          const sessionToken = g.maps.places.AutocompleteSessionToken ? new g.maps.places.AutocompleteSessionToken() : undefined;
          svc.getSuggestions(
            {
              input: inputValue,
              componentRestrictions: { country: ['tr'] },
              sessionToken,
              language: 'tr',
              region: 'TR'
            },
            (preds: Array<{ description: string }> | null, status: string) => {
              console.log('🌍 AutocompleteSuggestion response:', { preds, status });
              if (status && status !== 'OK') throw new Error(status);
              const list = preds || [];
              setPredictions(list.slice(0, 5));
              setShowPredictions(true);
            }
          );
          return;
        }
      }
    } catch (e) {
      console.warn('⚠️ AutocompleteSuggestion failed, will try legacy service', e);
    }

    // 2) Eski API: AutocompleteService (bazı projelerde hâlâ aktif)
    if (g?.maps?.places?.AutocompleteService) {
      console.log('🌍 Using legacy AutocompleteService API');
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
          console.log('🌍 AutocompleteService response:', { preds, status });
          if (status && status !== 'OK') {
            console.warn('❌ Legacy Places API error:', status, 'Using fallback');
            const filtered = fallbackAddresses.filter(addr => addr.toLowerCase().includes(inputValue.toLowerCase()));
            const suggestions = filtered.map(addr => ({ description: addr })).slice(0, 5);
            setPredictions(suggestions);
            setShowPredictions(true);
            return;
          }
          const list = preds || [];
          setPredictions(list.slice(0, 5));
          setShowPredictions(true);
        }
      );
      return;
    }

    // 3) HTTP v1 Autocomplete (Places API New)
    requestPredictionsViaHttp(inputValue).then((ok) => {
      if (ok) return;
      // 4) Fallback öneriler
      const filtered = fallbackAddresses.filter(addr => addr.toLowerCase().includes(inputValue.toLowerCase()));
      const suggestions = filtered.map(addr => ({ description: addr })).slice(0, 5);
      setPredictions(suggestions);
      setShowPredictions(true);
    });
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
    setActiveIndex(-1);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPredictions || predictions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev < predictions.length - 1 ? prev + 1 : 0;
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : predictions.length - 1;
        return next;
      });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < predictions.length) {
        e.preventDefault();
        handleSuggestionClick(predictions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowPredictions(false);
      setActiveIndex(-1);
    }
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
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`mt-1 block w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors duration-200 ${className}`}
        required={required}
        autoComplete="off"
        id={id}
        name={name}
      />
      
      {showPredictions && predictions.length > 0 && typeof window !== 'undefined' && portalRect && createPortal(
        <div
          style={{ position: 'absolute', top: portalRect.top, left: portalRect.left, width: portalRect.width, zIndex: 10000 }}
          className="mt-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto transition-colors duration-200"
        >
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer text-sm text-gray-900 dark:text-slate-100 ${index === activeIndex ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex((prev) => (prev === index ? -1 : prev))}
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