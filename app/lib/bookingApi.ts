// Booking.com API entegrasyonu için servis
export interface HotelSearchParams {
  checkin: string;
  checkout: string;
  adults: number;
  children?: number;
  rooms: number;
  city?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  amenities?: string[];
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  stars: number;
  price: number;
  currency: string;
  images: string[];
  amenities: string[];
  rating: number;
  distance: number; // km from city center
  availability: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  amenities: string[];
  price: number;
  currency: string;
  breakfast: boolean;
  cancellation: string;
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  roomTypeId: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  bookingReference: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  createdAt: Date;
}

export class BookingApiService {
  private static readonly API_BASE_URL = 'https://distribution-xml.booking.com/2.5/json';
  private static readonly API_KEY = process.env.BOOKING_API_KEY;

  // Otel arama
  static async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
    try {
      // Mock data - gerçek API entegrasyonu için Booking.com API kullanılacak
      const mockHotels: Hotel[] = [
        {
          id: '1',
          name: 'Grand Hotel Istanbul',
          address: 'Sultanahmet, Istanbul',
          city: 'Istanbul',
          region: 'Sultanahmet',
          stars: 5,
          price: 150,
          currency: 'EUR',
          images: ['/hotels/grand-istanbul-1.jpg'],
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking'],
          rating: 4.5,
          distance: 0.5,
          availability: true
        },
        {
          id: '2',
          name: 'Boutique Hotel Cappadocia',
          address: 'Goreme, Cappadocia',
          city: 'Cappadocia',
          region: 'Goreme',
          stars: 4,
          price: 80,
          currency: 'EUR',
          images: ['/hotels/cappadocia-1.jpg'],
          amenities: ['WiFi', 'Breakfast', 'Cave Room', 'Terrace'],
          rating: 4.2,
          distance: 1.2,
          availability: true
        },
        {
          id: '3',
          name: 'Beach Resort Antalya',
          address: 'Lara, Antalya',
          city: 'Antalya',
          region: 'Lara',
          stars: 5,
          price: 120,
          currency: 'EUR',
          images: ['/hotels/antalya-1.jpg'],
          amenities: ['WiFi', 'Pool', 'Beach', 'Spa', 'Restaurant', 'Kids Club'],
          rating: 4.7,
          distance: 0.1,
          availability: true
        },
        {
          id: '4',
          name: 'Istanbul Marriott Hotel',
          address: 'Taksim, Istanbul',
          city: 'Istanbul',
          region: 'Taksim',
          stars: 4,
          price: 180,
          currency: 'EUR',
          images: ['/hotels/marriott-istanbul-1.jpg'],
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym'],
          rating: 4.3,
          distance: 0.8,
          availability: true
        },
        {
          id: '5',
          name: 'Hilton Istanbul Bomonti',
          address: 'Bomonti, Istanbul',
          city: 'Istanbul',
          region: 'Bomonti',
          stars: 5,
          price: 200,
          currency: 'EUR',
          images: ['/hotels/hilton-bomonti-1.jpg'],
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Business Center'],
          rating: 4.6,
          distance: 1.2,
          availability: true
        },
        {
          id: '6',
          name: 'Four Seasons Hotel Istanbul',
          address: 'Sultanahmet, Istanbul',
          city: 'Istanbul',
          region: 'Sultanahmet',
          stars: 5,
          price: 350,
          currency: 'EUR',
          images: ['/hotels/fourseasons-istanbul-1.jpg'],
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym', 'Business Center', 'Concierge'],
          rating: 4.8,
          distance: 0.3,
          availability: true
        }
      ];

      // GEÇİCİ ÇÖZÜM: Tüm filtreleri devre dışı bırak - sadece Istanbul otellerini döndür
      console.log('Search params:', params);
      console.log('All hotels:', mockHotels.map(h => h.city));
      
      // Sadece Istanbul otellerini döndür
      const istanbulHotels = mockHotels.filter(hotel => 
        hotel.city.toLowerCase().includes('istanbul')
      );
      
      console.log('Istanbul hotels found:', istanbulHotels.length);
      console.log('Hotel names:', istanbulHotels.map(h => h.name));
      
      return istanbulHotels;
    } catch (error) {
      console.error('Error searching hotels:', error);
      return [];
    }
  }

  // Oda tiplerini getir
  static async getRoomTypes(hotelId: string, params: HotelSearchParams): Promise<RoomType[]> {
    try {
      const mockRoomTypes: RoomType[] = [
        {
          id: '1',
          name: 'Standard Room',
          description: 'Comfortable room with city view',
          maxOccupancy: 2,
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning'],
          price: 100,
          currency: 'EUR',
          breakfast: false,
          cancellation: 'Free cancellation until 24 hours before check-in'
        },
        {
          id: '2',
          name: 'Deluxe Room',
          description: 'Spacious room with sea view',
          maxOccupancy: 3,
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning', 'Balcony'],
          price: 150,
          currency: 'EUR',
          breakfast: true,
          cancellation: 'Free cancellation until 24 hours before check-in'
        },
        {
          id: '3',
          name: 'Suite',
          description: 'Luxury suite with separate living area',
          maxOccupancy: 4,
          amenities: ['WiFi', 'TV', 'Minibar', 'Air Conditioning', 'Balcony', 'Jacuzzi'],
          price: 250,
          currency: 'EUR',
          breakfast: true,
          cancellation: 'Free cancellation until 48 hours before check-in'
        }
      ];

      return mockRoomTypes;
    } catch (error) {
      console.error('Error getting room types:', error);
      return [];
    }
  }

  // Rezervasyon oluştur
  static async createBooking(booking: Omit<HotelBooking, 'id' | 'bookingReference' | 'createdAt'>): Promise<HotelBooking | null> {
    try {
      const newBooking: HotelBooking = {
        ...booking,
        id: `booking_${Date.now()}`,
        bookingReference: `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: new Date()
      };

      // Gerçek API entegrasyonu burada yapılacak
      console.log('Booking created:', newBooking);
      
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  }

  // Rezervasyon durumunu güncelle
  static async updateBookingStatus(bookingId: string, status: HotelBooking['status']): Promise<boolean> {
    try {
      // Gerçek API entegrasyonu burada yapılacak
      console.log(`Booking ${bookingId} status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  }

  // Popüler şehirler
  static getPopularCities(): Array<{id: string, name: string, region: string}> {
    return [
      { id: 'istanbul', name: 'Istanbul', region: 'Marmara' },
      { id: 'ankara', name: 'Ankara', region: 'Central Anatolia' },
      { id: 'izmir', name: 'Izmir', region: 'Aegean' },
      { id: 'antalya', name: 'Antalya', region: 'Mediterranean' },
      { id: 'cappadocia', name: 'Cappadocia', region: 'Central Anatolia' },
      { id: 'bodrum', name: 'Bodrum', region: 'Aegean' },
      { id: 'marmaris', name: 'Marmaris', region: 'Aegean' },
      { id: 'kemer', name: 'Kemer', region: 'Mediterranean' }
    ];
  }

  // Otel özellikleri
  static getAmenities(): Array<{id: string, name: string, icon: string}> {
    return [
      { id: 'wifi', name: 'WiFi', icon: '📶' },
      { id: 'pool', name: 'Pool', icon: '🏊' },
      { id: 'spa', name: 'Spa', icon: '🧘' },
      { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
      { id: 'parking', name: 'Parking', icon: '🅿️' },
      { id: 'gym', name: 'Gym', icon: '💪' },
      { id: 'beach', name: 'Beach', icon: '🏖️' },
      { id: 'breakfast', name: 'Breakfast', icon: '🥐' },
      { id: 'kids-club', name: 'Kids Club', icon: '👶' },
      { id: 'business-center', name: 'Business Center', icon: '💼' }
    ];
  }
}

export default BookingApiService;
