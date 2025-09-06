'use client';

import { useState } from 'react';
import { Hotel, RoomType } from '@/app/lib/bookingApi';

interface HotelSearchResultsProps {
  hotels: Hotel[];
  requestData: any;
  onSelectHotel: (hotel: Hotel, roomType: RoomType) => void;
  onBack: () => void;
}

export default function HotelSearchResults({ 
  hotels, 
  requestData, 
  onSelectHotel, 
  onBack 
}: HotelSearchResultsProps) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleHotelSelect = async (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setLoading(true);
    
    try {
      // Mock room types - gerçek API entegrasyonu için BookingApiService.getRoomTypes kullanılacak
      const mockRoomTypes: RoomType[] = [
        {
          id: '1',
          name: 'Standard Room',
          description: 'Comfortable room with city view',
          maxOccupancy: 2,
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning'],
          price: hotel.price * 0.8,
          currency: hotel.currency,
          breakfast: false,
          cancellation: 'Free cancellation until 24 hours before check-in'
        },
        {
          id: '2',
          name: 'Deluxe Room',
          description: 'Spacious room with sea view',
          maxOccupancy: 3,
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning', 'Balcony'],
          price: hotel.price,
          currency: hotel.currency,
          breakfast: true,
          cancellation: 'Free cancellation until 24 hours before check-in'
        },
        {
          id: '3',
          name: 'Suite',
          description: 'Luxury suite with separate living area',
          maxOccupancy: 4,
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning', 'Balcony', 'Jacuzzi'],
          price: hotel.price * 1.5,
          currency: hotel.currency,
          breakfast: true,
          cancellation: 'Free cancellation until 48 hours before check-in'
        }
      ];
      
      setRoomTypes(mockRoomTypes);
    } catch (error) {
      console.error('Error loading room types:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (roomType: RoomType) => {
    const checkin = new Date(requestData.checkin);
    const checkout = new Date(requestData.checkout);
    const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    return roomType.price * nights * requestData.rooms;
  };

  const getStarRating = (stars: number) => {
    return '⭐'.repeat(stars);
  };

  if (selectedHotel) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSelectedHotel(null)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Geri Dön
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedHotel.name}
          </h2>
          <p className="text-gray-600">{selectedHotel.address}</p>
          <div className="flex items-center mt-2">
            <span className="text-yellow-500 mr-2">{getStarRating(selectedHotel.stars)}</span>
            <span className="text-sm text-gray-500">
              {selectedHotel.rating}/5 • {selectedHotel.distance} km merkez
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Oda Seçenekleri</h3>
            {roomTypes.map((roomType) => (
              <div key={roomType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{roomType.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{roomType.description}</p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Max {roomType.maxOccupancy} kişi
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {roomType.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      {roomType.breakfast && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-2">
                          🥐 Kahvaltı Dahil
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{roomType.cancellation}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      €{roomType.price}
                    </div>
                    <div className="text-sm text-gray-500">gece başına</div>
                    <div className="text-lg font-semibold text-blue-600 mt-2">
                      Toplam: €{calculateTotalPrice(roomType).toFixed(2)}
                    </div>
                    <button
                      onClick={() => onSelectHotel(selectedHotel, roomType)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Seç
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Geri Dön
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏨 Otel Arama Sonuçları
        </h2>
        <p className="text-gray-600">
          {requestData.city} için {hotels.length} otel bulundu
        </p>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Uygun otel bulunamadı
          </h3>
          <p className="text-gray-600">
            Arama kriterlerinizi değiştirerek tekrar deneyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-4xl">🏨</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      €{hotel.price}
                    </div>
                    <div className="text-sm text-gray-500">gece başına</div>
                    <div className="text-xs text-green-600 font-medium">
                      Acente: €{hotel.agentPrice} (€{hotel.profitMargin} kar)
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{hotel.address}</p>
                
                <div className="flex items-center mb-3">
                  <span className="text-yellow-500 mr-2">{getStarRating(hotel.stars)}</span>
                  <span className="text-sm text-gray-500">
                    {hotel.rating}/5 • {hotel.distance} km
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {hotel.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{hotel.amenities.length - 4}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleHotelSelect(hotel)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Oda Seçenekleri
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
