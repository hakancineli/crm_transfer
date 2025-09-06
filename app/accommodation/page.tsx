'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { TenantService } from '@/app/lib/tenant';
import { BookingApiService, Hotel } from '@/app/lib/bookingApi';
import HotelRequestForm from '@/app/components/HotelRequestForm';
import HotelSearchResults from '@/app/components/HotelSearchResults';

export default function AccommodationPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'form' | 'search' | 'booking'>('form');
  const [requestData, setRequestData] = useState<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    // Tenant bilgilerini al
    const fetchTenant = async () => {
      try {
        // Mock tenant - gerçek uygulamada subdomain'den alınacak
        const mockTenant = await TenantService.getTenantBySubdomain('demo');
        setTenant(mockTenant);
      } catch (error) {
        console.error('Error fetching tenant:', error);
      }
    };

    fetchTenant();
  }, []);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Otel arama
      const searchParams = {
        checkin: data.checkin,
        checkout: data.checkout,
        adults: data.adults,
        children: data.children,
        rooms: data.rooms,
        city: data.city,
        region: data.region,
        minPrice: data.budget ? data.budget * 0.8 : undefined,
        maxPrice: data.budget ? data.budget * 1.2 : undefined
      };

      const searchResults = await BookingApiService.searchHotels(searchParams);
      
      setRequestData(data);
      setHotels(searchResults);
      setCurrentStep('search');
    } catch (error) {
      setError('Otel arama sırasında hata oluştu');
      console.error('Error searching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = async (hotel: Hotel, roomType: any) => {
    setSelectedHotel(hotel);
    setSelectedRoomType(roomType);
    setCurrentStep('booking');
  };

  const handleBookingConfirm = async () => {
    setLoading(true);
    
    try {
      // Rezervasyon oluştur
      const bookingData = {
        hotelId: selectedHotel!.id,
        roomTypeId: selectedRoomType.id,
        checkin: requestData.checkin,
        checkout: requestData.checkout,
        adults: requestData.adults,
        children: requestData.children,
        rooms: requestData.rooms,
        totalPrice: selectedRoomType.price,
        currency: selectedRoomType.currency,
        status: 'PENDING' as const,
        customerInfo: {
          name: requestData.customerName,
          email: requestData.customerEmail,
          phone: requestData.customerPhone
        },
        specialRequests: requestData.specialRequests
      };

      const booking = await BookingApiService.createBooking(bookingData);
      
      if (booking) {
        // Başarı mesajı göster
        alert('Rezervasyon başarıyla oluşturuldu!');
        setCurrentStep('form');
        setRequestData(null);
        setHotels([]);
        setSelectedHotel(null);
        setSelectedRoomType(null);
      } else {
        setError('Rezervasyon oluşturulurken hata oluştu');
      }
    } catch (error) {
      setError('Rezervasyon oluşturulurken hata oluştu');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'search') {
      setCurrentStep('form');
    } else if (currentStep === 'booking') {
      setCurrentStep('search');
    }
  };

  // Konaklama modülü kontrolü
  if (!tenant || !TenantService.hasModule(tenant, 'accommodation')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Konaklama Modülü Aktif Değil
          </h2>
          <p className="text-gray-600 mb-6">
            Bu özelliği kullanmak için konaklama modülünün aktif olması gerekiyor.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏨 Konaklama Yönetimi
          </h1>
          <p className="text-gray-600">
            Müşterileriniz için en uygun otelleri bulun ve rezervasyon yapın
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : currentStep === 'search' || currentStep === 'booking' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'form' ? 'bg-blue-600 text-white' : currentStep === 'search' || currentStep === 'booking' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Talep Formu</span>
            </div>
            <div className={`w-16 h-1 ${currentStep === 'search' || currentStep === 'booking' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${currentStep === 'search' ? 'text-blue-600' : currentStep === 'booking' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'search' ? 'bg-blue-600 text-white' : currentStep === 'booking' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Otel Seçimi</span>
            </div>
            <div className={`w-16 h-1 ${currentStep === 'booking' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${currentStep === 'booking' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'booking' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Rezervasyon</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Hata</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {currentStep === 'form' && (
              <HotelRequestForm
                onSubmit={handleFormSubmit}
                onCancel={() => window.history.back()}
              />
            )}

            {currentStep === 'search' && (
              <HotelSearchResults
                hotels={hotels}
                requestData={requestData}
                onSelectHotel={handleHotelSelect}
                onBack={handleBack}
              />
            )}

            {currentStep === 'booking' && selectedHotel && selectedRoomType && (
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🎯 Rezervasyon Onayı
                </h2>

                <div className="space-y-6">
                  {/* Otel Bilgileri */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Otel Bilgileri</h3>
                    <p className="font-medium">{selectedHotel.name}</p>
                    <p className="text-gray-600 text-sm">{selectedHotel.address}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500 mr-2">
                        {'⭐'.repeat(selectedHotel.stars)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedHotel.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Oda Bilgileri */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Oda Bilgileri</h3>
                    <p className="font-medium">{selectedRoomType.name}</p>
                    <p className="text-gray-600 text-sm">{selectedRoomType.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedRoomType.amenities.map((amenity: string) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Müşteri Bilgileri */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Müşteri Bilgileri</h3>
                    <p><strong>Ad:</strong> {requestData.customerName}</p>
                    <p><strong>E-posta:</strong> {requestData.customerEmail}</p>
                    <p><strong>Telefon:</strong> {requestData.customerPhone}</p>
                  </div>

                  {/* Tarih ve Fiyat */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Rezervasyon Detayları</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><strong>Giriş:</strong> {new Date(requestData.checkin).toLocaleDateString('tr-TR')}</p>
                        <p><strong>Çıkış:</strong> {new Date(requestData.checkout).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div>
                        <p><strong>Misafirler:</strong> {requestData.adults} yetişkin, {requestData.children} çocuk</p>
                        <p><strong>Odalar:</strong> {requestData.rooms}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Toplam Tutar:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          €{selectedRoomType.price * requestData.rooms}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleBack}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Geri Dön
                    </button>
                    <button
                      onClick={handleBookingConfirm}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      ✅ Rezervasyonu Onayla
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
