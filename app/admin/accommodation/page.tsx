'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { useEmoji } from '@/app/contexts/EmojiContext';
import { TenantService } from '@/app/lib/tenant';
import { BookingApiService, Hotel } from '@/app/lib/bookingApi';
import { VoucherUtils } from '@/app/lib/voucherUtils';
import { EmailService } from '@/app/lib/emailService';
import HotelRequestForm from '@/app/components/HotelRequestForm';
import HotelSearchResults from '@/app/components/HotelSearchResults';
import HotelBookingConfirmation from '@/app/components/HotelBookingConfirmation';

export default function AccommodationPage() {
  const { user } = useAuth();
  const { isEnabled: isAccommodationEnabled, isLoading: moduleLoading } = useModule('accommodation');
  const router = useRouter();
  const { emojisEnabled } = useEmoji();
  const [currentStep, setCurrentStep] = useState<'form' | 'search' | 'booking'>('form');
  const [requestData, setRequestData] = useState<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isAccommodationEnabled) {
      router.push('/admin');
      return;
    }

    // Tenant bilgilerini al
    const fetchTenant = async () => {
      try {
        console.log('Fetching tenant...');
        // Mock tenant - gerçek uygulamada subdomain'den alınacak
        const mockTenant = await TenantService.getTenantBySubdomain('demo');
        console.log('Tenant fetched:', mockTenant);
        setTenant(mockTenant);
      } catch (error) {
        console.error('Error fetching tenant:', error);
        setError('Tenant bilgileri yüklenemedi');
      }
    };

    fetchTenant();
  }, [moduleLoading, isAccommodationEnabled, router]);

  // Debug log
  console.log('Tenant state:', tenant);
  console.log('Has accommodation module:', tenant?.modules?.some((tm: any) => tm.moduleId === 'accommodation' && tm.isEnabled));

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
      
      console.log('Search results:', searchResults);
      console.log('Search params sent:', searchParams);
      
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
      // Voucher numarası oluştur
      const voucherNumber = VoucherUtils.generateVoucherNumber('demo', 'HOTEL');
      
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
        specialRequests: requestData.specialRequests,
        voucherNumber: voucherNumber
      };

      const booking = await BookingApiService.createBooking(bookingData);
      
      if (booking) {
        // E-posta gönder
        try {
          const emailResult = await EmailService.sendBookingConfirmation({
            voucherNumber: voucherNumber,
            hotelName: selectedHotel!.name,
            hotelAddress: selectedHotel!.address || 'Adres bilgisi mevcut değil',
            roomType: selectedRoomType.name,
            checkin: requestData.checkin,
            checkout: requestData.checkout,
            adults: requestData.adults,
            children: requestData.children,
            rooms: requestData.rooms,
            totalPrice: selectedRoomType.price,
            currency: selectedRoomType.currency,
            customerInfo: {
              name: requestData.customerName,
              email: requestData.customerEmail,
              phone: requestData.customerPhone
            },
            specialRequests: requestData.specialRequests,
            bookingReference: `REF-${Date.now()}`
          });

          if (emailResult.success) {
            console.log('✅ E-posta başarıyla gönderildi:', emailResult.messageId);
          } else {
            console.warn('⚠️ E-posta gönderilemedi:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ E-posta hatası:', emailError);
        }

        // Başarı mesajı göster ve customer voucher sayfasına yönlendir
        alert(`🎉 Rezervasyon başarıyla oluşturuldu!\n\nVoucher Numarası: ${voucherNumber}\n\nE-posta adresinize onay e-postası gönderildi.`);
        
        // Customer voucher sayfasına yönlendir
        window.location.href = `/admin/accommodation/voucher/${voucherNumber}`;
        
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

  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAccommodationEnabled) {
    return null;
  }

  // Geçici olarak tüm kontrolleri devre dışı bırak - sadece test için
  console.log('Rendering accommodation page...');

  return (
    <div className="min-h-screen bg-gray-50 py-8" id="accommodation-page">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {emojisEnabled ? '🏨 ' : ''}Konaklama Yönetimi
          </h1>
          <p className="text-gray-600 mb-6">
            Müşterileriniz için en uygun otelleri bulun ve rezervasyon yapın
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/accommodation/reservations"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {emojisEnabled ? '📋 ' : ''}Tüm Rezervasyonları Görüntüle
            </Link>
          </div>
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

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Debug Info</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Tenant: {tenant ? 'Loaded' : 'Not loaded'}</p>
                <p>Current Step: {currentStep}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

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
        <HotelBookingConfirmation
          hotel={selectedHotel}
          roomType={selectedRoomType}
          requestData={requestData}
          onConfirm={handleBookingConfirm}
          onBack={handleBack}
          loading={loading}
        />
      )}

          </>
        )}
      </div>
    </div>
  );
}
