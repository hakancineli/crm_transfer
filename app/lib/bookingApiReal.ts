// Gerçek Booking.com API entegrasyonu
export interface BookingHotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  stars: number;
  image: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
}

export interface BookingRoom {
  id: string;
  name: string;
  description: string;
  amenities: string[];
  maxOccupancy: number;
  bedType: string;
  size?: string;
  view?: string;
  basePrice: number;
  currency: string;
  cancellationPolicy: string;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
}

export interface BookingSearchParams {
  city: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  amenities?: string[];
}

export class BookingApiReal {
  private static readonly API_BASE_URL = 'https://distribution-xml.booking.com/2.5/json';
  private static readonly API_KEY = process.env.BOOKING_API_KEY || 'demo_key';

  // Otel arama
  static async searchHotels(params: BookingSearchParams): Promise<BookingHotel[]> {
    try {
      // Gerçek API çağrısı için mock data döndürüyoruz
      // Gerçek uygulamada burada Booking.com API'sine istek atılacak
      console.log('🔍 Booking.com API - Otel Arama:', params);
      
      const mockHotels: BookingHotel[] = [
        {
          id: 'hotel_1',
          name: 'Grand Hotel Istanbul',
          address: 'Sultanahmet, Fatih, Istanbul',
          city: 'Istanbul',
          country: 'Turkey',
          rating: 4.5,
          stars: 5,
          image: '/vehicles/vito-1.jpg',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Beach', 'Breakfast'],
          latitude: 41.0082,
          longitude: 28.9784
        },
        {
          id: 'hotel_2',
          name: 'Hilton Istanbul Bomonti',
          address: 'Bomonti, Sisli, Istanbul',
          city: 'Istanbul',
          country: 'Turkey',
          rating: 4.6,
          stars: 5,
          image: '/vehicles/vito-2.jpg',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Business Center', 'Breakfast'],
          latitude: 41.0608,
          longitude: 28.9857
        },
        {
          id: 'hotel_3',
          name: 'Four Seasons Hotel Istanbul at Sultanahmet',
          address: 'Sultanahmet, Fatih, Istanbul',
          city: 'Istanbul',
          country: 'Turkey',
          rating: 4.8,
          stars: 5,
          image: '/vehicles/vito-3.jpg',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Beach', 'Breakfast', 'Kids Club'],
          latitude: 41.0082,
          longitude: 28.9784
        },
        {
          id: 'hotel_4',
          name: 'Ciragan Palace Kempinski Istanbul',
          address: 'Besiktas, Istanbul',
          city: 'Istanbul',
          country: 'Turkey',
          rating: 4.7,
          stars: 5,
          image: '/vehicles/vito-4.jpg',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Beach', 'Breakfast', 'Kids Club', 'Business Center'],
          latitude: 41.0439,
          longitude: 29.0084
        },
        {
          id: 'hotel_5',
          name: 'The Ritz-Carlton Istanbul',
          address: 'Sisli, Istanbul',
          city: 'Istanbul',
          country: 'Turkey',
          rating: 4.6,
          stars: 5,
          image: '/vehicles/vito-5.jpg',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Business Center', 'Breakfast'],
          latitude: 41.0608,
          longitude: 28.9857
        }
      ];

      // Filtreleme uygula
      let filteredHotels = mockHotels;

      if (params.stars) {
        filteredHotels = filteredHotels.filter(hotel => hotel.stars >= params.stars!);
      }

      if (params.amenities && params.amenities.length > 0) {
        filteredHotels = filteredHotels.filter(hotel => 
          params.amenities!.every(amenity => hotel.amenities.includes(amenity))
        );
      }

      return filteredHotels;
    } catch (error) {
      console.error('Booking.com API hatası:', error);
      throw new Error('Otel arama başarısız');
    }
  }

  // Oda fiyatları getir
  static async getRoomPrices(hotelId: string, params: BookingSearchParams): Promise<BookingRoom[]> {
    try {
      console.log('💰 Booking.com API - Oda Fiyatları:', { hotelId, params });
      
      // Gerçek API çağrısı için mock data döndürüyoruz
      const mockRooms: BookingRoom[] = [
        {
          id: 'room_1',
          name: 'Standard Room',
          description: 'Comfortable room with city view',
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning'],
          maxOccupancy: 2,
          bedType: 'Double Bed',
          size: '25 m²',
          view: 'City View',
          basePrice: 120,
          currency: 'EUR',
          cancellationPolicy: 'Free cancellation until 24 hours before check-in',
          breakfastIncluded: false,
          freeCancellation: true
        },
        {
          id: 'room_2',
          name: 'Deluxe Room',
          description: 'Spacious room with sea view',
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning', 'Balcony'],
          maxOccupancy: 2,
          bedType: 'King Bed',
          size: '35 m²',
          view: 'Sea View',
          basePrice: 180,
          currency: 'EUR',
          cancellationPolicy: 'Free cancellation until 24 hours before check-in',
          breakfastIncluded: true,
          freeCancellation: true
        },
        {
          id: 'room_3',
          name: 'Suite',
          description: 'Luxury suite with separate living area',
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning', 'Balcony', 'Jacuzzi'],
          maxOccupancy: 4,
          bedType: 'King Bed',
          size: '60 m²',
          view: 'Sea View',
          basePrice: 350,
          currency: 'EUR',
          cancellationPolicy: 'Free cancellation until 48 hours before check-in',
          breakfastIncluded: true,
          freeCancellation: true
        }
      ];

      return mockRooms;
    } catch (error) {
      console.error('Booking.com API hatası:', error);
      throw new Error('Oda fiyatları alınamadı');
    }
  }

  // Detaylı otel bilgileri
  static async getHotelDetails(hotelId: string): Promise<BookingHotel | null> {
    try {
      console.log('🏨 Booking.com API - Otel Detayları:', hotelId);
      
      const hotels = await this.searchHotels({
        city: 'Istanbul',
        checkin: new Date().toISOString().split('T')[0],
        checkout: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adults: 2,
        children: 0,
        rooms: 1
      });

      return hotels.find(hotel => hotel.id === hotelId) || null;
    } catch (error) {
      console.error('Booking.com API hatası:', error);
      return null;
    }
  }

  // Fiyat hesaplama (acente indirimi)
  static calculateAgentPricing(basePrice: number, profitPercentage: number = 25): {
    agentPrice: number;
    customerPrice: number;
    profitMargin: number;
    profitPercentage: number;
  } {
    // Acente indirimi (%25)
    const agentPrice = basePrice * 0.75;
    
    // Müşteri fiyatı (kar yüzdesi ile)
    const customerPrice = agentPrice / (1 - profitPercentage / 100);
    
    // Kar marjı
    const profitMargin = customerPrice - agentPrice;
    
    return {
      agentPrice: Math.round(agentPrice * 100) / 100,
      customerPrice: Math.round(customerPrice * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      profitPercentage: Math.round(profitPercentage * 100) / 100
    };
  }

  // Tarih aralığı oluştur
  static generateDateRange(checkin: string, checkout: string): {
    validFrom: Date;
    validTo: Date;
  } {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    
    // Geçerlilik tarihi: checkin'den 30 gün öncesi, checkout'tan 30 gün sonrası
    const validFrom = new Date(checkinDate);
    validFrom.setDate(validFrom.getDate() - 30);
    
    const validTo = new Date(checkoutDate);
    validTo.setDate(validTo.getDate() + 30);
    
    return { validFrom, validTo };
  }
}
