'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, Clock, X } from 'lucide-react';
import GoogleMapsPlacesInput from '@/app/components/GoogleMapsPlacesInput';
import { useGoogleMaps } from '@/app/hooks/useGoogleMaps';

type Currency = 'TRY' | 'USD' | 'EUR';

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  isAdminForm?: boolean; // Admin panelinde kullanıldığında fiyat hesaplama kapatılır
}

export default function ReservationForm({ isOpen, onClose, tenantId, isAdminForm = false }: ReservationFormProps) {
  const { isLoaded: googleMapsLoaded, isLoading: googleMapsLoading, error: googleMapsError } = useGoogleMaps();
  const [formData, setFormData] = useState({
    type: 'transfer',
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    passengers: [''],
        luggageCount: 0,
    name: '',
    phone: '',
    email: '',
    notes: '',
    flightCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [estimatedPriceTRY, setEstimatedPriceTRY] = useState<number | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);
  const [fxRates, setFxRates] = useState<Partial<Record<Currency, number>>>({});
  const [error, setError] = useState<string>('');

  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);

  // Kur bilgilerini çek
  useEffect(() => {
    async function fetchFx() {
      try {
        const res = await fetch('/api/exchange-rates');
        const data = await res.json();
        const next: Partial<Record<Currency, number>> = {
          TRY: 1,
          USD: data?.rates?.USD ?? undefined,
          EUR: data?.rates?.EUR ?? undefined
        };
        setFxRates(next);
      } catch (err) {
        setFxRates({ TRY: 1, USD: 0.03, EUR: 0.03 });
      }
    }
    fetchFx();
  }, []);

  // Fiyat hesaplama
  function getPriceFromKm(km: number): number | null {
    if (km <= 0) return 800;
    if (km <= 10) return 800;
    if (km <= 20) return 1100;
    if (km <= 30) return 1400;
    if (km <= 40) return 1500;
    if (km <= 45) return 1700;
    if (km <= 50) return 1850;
    if (km <= 60) return 2200;
    if (km <= 70) return 2300;
    if (km <= 80) return 2400;
    if (km <= 90) return 2500;
    const extraBlocks = Math.ceil((km - 90) / 10);
    return 2500 + extraBlocks * 300;
  }

  // Mesafe hesaplama - Directions API ile fallback (sadece müşteri formunda)
  useEffect(() => {
    // Admin formunda fiyat hesaplama yapma
    if (isAdminForm) return;
    
    const g = (window as any).google;
    if (!formData.from || !formData.to || !googleMapsLoaded) return;
    
    let cancelled = false;
    setEstimating(true);
    
    // Önce Directions API dene
    if (g?.maps?.DirectionsService) {
      const directionsService = new g.maps.DirectionsService();
      
      directionsService.route({
        origin: formData.from,
        destination: formData.to,
        travelMode: g.maps.TravelMode.DRIVING,
        unitSystem: g.maps.UnitSystem.METRIC,
        language: 'tr',
        region: 'TR'
      }, (result: any, status: string) => {
        if (cancelled) return;
        
        try {
          if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
            const leg = result.routes[0].legs[0];
            const km = leg.distance.value / 1000; // meters to km
            setDistanceKm(km);
            setEstimatedPriceTRY(getPriceFromKm(km));
          } else {
            console.warn('Directions API error:', status);
            // Fallback: Basit mesafe tahmini
            estimateDistanceFallback();
          }
        } finally {
          setEstimating(false);
        }
      });
    } else {
      // Google Maps yoksa fallback
      estimateDistanceFallback();
    }
    
    function estimateDistanceFallback() {
      // Basit mesafe tahmini (İstanbul içi için)
      const estimatedKm = 25; // Varsayılan mesafe
      setDistanceKm(estimatedKm);
      setEstimatedPriceTRY(getPriceFromKm(estimatedKm));
      setEstimating(false);
    }
    
    return () => { cancelled = true; };
  }, [formData.from, formData.to, googleMapsLoaded, isAdminForm]);

  // Google Places API handled by GoogleMapsPlacesInput component

  // Yolcu yönetimi
  const addPassenger = () => setFormData(prev => ({ ...prev, passengers: [...prev.passengers, ''] }));
  const updatePassenger = (i: number, v: string) => setFormData(prev => ({ 
    ...prev, 
    passengers: prev.passengers.map((p, idx) => (idx === i ? v : p)) 
  }));
  const removePassenger = (i: number) => setFormData(prev => ({ 
    ...prev, 
    passengers: prev.passengers.filter((_, idx) => idx !== i) 
  }));

  if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    setIsSubmitting(true);
        setError('');

    try {
      const priceToSubmit = (() => {
        if (isAdminForm) {
          // Admin formunda manuel girilen fiyat kullanılır
          return estimatedPriceTRY || 0;
        } else {
          // Müşteri formunda hesaplanan fiyat kullanılır
          if (estimatedPriceTRY == null) return 0;
          if (currency === 'TRY') return estimatedPriceTRY;
          const rate = fxRates[currency];
          return rate ? estimatedPriceTRY * rate : estimatedPriceTRY;
        }
      })();

            const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: (() => {
          const base: Record<string, string> = { 'Content-Type': 'application/json' };
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) base['Authorization'] = `Bearer ${token}`;
          }
          return base;
        })(),
        body: JSON.stringify({
          type: formData.type,
          from: formData.from,
          to: formData.to,
                    date: formData.date,
                    time: formData.time,
          passengerNames: formData.passengers,
          luggageCount: formData.luggageCount,
          price: priceToSubmit,
          currency,
          phoneNumber: formData.phone,
          name: formData.name,
          notes: formData.notes,
                    flightCode: formData.flightCode,
          distanceKm: distanceKm || null,
          tenantId,
          source: isAdminForm ? 'admin' : 'website'
                }),
            });

      if (response.ok) {
        const result = await response.json();
        
        if (isAdminForm) {
          // Admin form için voucher sayfasına yönlendir
          window.location.href = `/admin/reservations/${result.voucherNumber}/customer-voucher`;
        } else {
          alert('Rezervasyon talebiniz başarıyla gönderildi! En kısa sürede sizinle iletişime geçeceğiz.');
          onClose();
        }
        
        // Reset form
        setFormData({
          type: 'transfer',
          from: '',
          to: '',
          date: new Date().toISOString().split('T')[0],
          time: '12:00',
          passengers: [''],
          luggageCount: 0,
          name: '',
          phone: '',
          email: '',
          notes: '',
          flightCode: ''
        });
        setDistanceKm(null);
        setEstimatedPriceTRY(null);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
      }
    } catch (error: any) {
      console.error('Error submitting reservation:', error);
      setError(error?.message || 'Rezervasyon talebi gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
      setIsSubmitting(false);
        }
    };

  const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
      [field]: value
        }));
    };

  const convertFromTRY = (amountTRY: number | null, to: Currency): number | null => {
    if (amountTRY == null) return null;
    if (to === 'TRY') return amountTRY;
    const rate = fxRates[to];
    if (!rate || rate <= 0) return null;
    return amountTRY * rate;
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Rezervasyon Talebi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-700">{error}</div>
          )}

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hizmet Türü
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="transfer">Transfer</option>
              <option value="tour">Tur</option>
              <option value="accommodation">Konaklama</option>
            </select>
          </div>

          {/* Location Fields with Google Maps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Nereden
              </label>
              <GoogleMapsPlacesInput
                value={formData.from}
                onChange={(v) => handleInputChange('from', v)}
                placeholder="Adres yazın (örn. İstanbul Havalimanı)"
                className=""
                required
                id="from-address"
                name="from-address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Nereye
              </label>
              <GoogleMapsPlacesInput
                value={formData.to}
                onChange={(v) => handleInputChange('to', v)}
                placeholder="Adres yazın (örn: Taksim)"
                className=""
                required
                id="to-address"
                name="to-address"
              />
            </div>
                            </div>

          {/* Distance and Price Display - Sadece müşteri formunda göster */}
          {!isAdminForm && (formData.from && formData.to) && (
            <div className="text-sm text-gray-700 flex items-center gap-3">
              <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
                {googleMapsError ? 'Hesaplama hatası' : !googleMapsLoaded ? 'Google Maps yükleniyor…' : estimating || distanceKm === null ? 'Hesaplanıyor…' : `${distanceKm.toFixed(1)} km`}
              </span>
              {estimatedPriceTRY !== null && (
                <>
                  <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2 py-1 font-medium text-green-700">
                    Tahmini Fiyat: {estimatedPriceTRY.toLocaleString('tr-TR')} TRY
                  </span>
                  {currency !== 'TRY' && (
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-medium text-blue-700">
                      ≈ {(() => {
                        const converted = convertFromTRY(estimatedPriceTRY, currency);
                        return converted != null ? converted.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '-';
                      })()} {currency}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Tarih
              </label>
                                <input
                                    type="date"
                                    value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                                    required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Saat
              </label>
                                <input
                                    type="time"
                                    value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                                    required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                        </div>
                    </div>

          {/* Flight Code and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uçuş Kodu (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.flightCode}
                onChange={(e) => handleInputChange('flightCode', e.target.value)}
                placeholder="TK1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Admin Form - Manuel Fiyat Girişi */}
          {isAdminForm && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (Manuel Giriş)
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={estimatedPriceTRY || ''}
                  onChange={(e) => setEstimatedPriceTRY(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Fiyat girin"
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700">
                  {currency}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Admin panelinde fiyat manuel olarak girilir
              </p>
            </div>
          )}

          {/* Multi-Passenger Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
                            Yolcu Bilgileri
            </label>
                        <div className="space-y-2">
              {formData.passengers.map((passenger, i) => (
                <div key={i} className="flex gap-2">
                                    <input
                                        type="text"
                    value={passenger}
                    onChange={(e) => updatePassenger(i, e.target.value)}
                    placeholder={`Yolcu ${i + 1} adı`}
                                        required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                  {formData.passengers.length > 1 && (
                                        <button
                                            type="button"
                      onClick={() => removePassenger(i)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                                        >
                      Sil
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addPassenger}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                            >
                + Yolcu Ekle
                            </button>
              <p className="text-xs text-gray-600">Yolcu bilgilerini eksiksiz giriniz.</p>
            </div>
                        </div>

          {/* Luggage Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bagaj Sayısı
                            </label>
            <input
              type="number"
              min={0}
              value={formData.luggageCount === 0 ? '' : formData.luggageCount}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === '' ? 0 : parseInt(value, 10);
                handleInputChange('luggageCount', Number.isNaN(numValue) ? 0 : numValue);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
                                </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
                                    <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                                        required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

          {/* Email alanı kaldırıldı */}

          {/* Notes removed per request */}

          

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
                        <button
                            type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gönderiliyor...
                                </>
                            ) : (
                'Rezervasyon oluştur'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 