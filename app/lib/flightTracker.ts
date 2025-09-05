import axios from 'axios';

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    terminal?: string;
    gate?: string;
    scheduled: string;
    actual?: string;
    status: 'scheduled' | 'delayed' | 'boarding' | 'departed' | 'cancelled';
  };
  arrival: {
    airport: string;
    terminal?: string;
    scheduled: string;
    actual?: string;
    status: 'scheduled' | 'delayed' | 'arrived' | 'cancelled';
  };
  status: 'scheduled' | 'delayed' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
  delay?: number; // minutes
}

// Mock uçuş verisi - gerçek API entegrasyonu için değiştirilecek
export class FlightTracker {
  private static mockFlights: { [key: string]: FlightInfo } = {
    'TK001': {
      flightNumber: 'TK001',
      airline: 'Turkish Airlines',
      departure: {
        airport: 'IST',
        terminal: 'A',
        gate: 'A12',
        scheduled: '2025-01-05T14:30:00Z',
        actual: '2025-01-05T14:45:00Z',
        status: 'delayed'
      },
      arrival: {
        airport: 'JFK',
        scheduled: '2025-01-05T18:30:00Z',
        status: 'delayed'
      },
      status: 'delayed',
      delay: 15
    },
    'TK493': {
      flightNumber: 'TK493',
      airline: 'Turkish Airlines',
      departure: {
        airport: 'IST',
        terminal: 'A',
        gate: 'A08',
        scheduled: '2025-01-05T06:00:00Z',
        actual: '2025-01-05T06:00:00Z',
        status: 'departed'
      },
      arrival: {
        airport: 'LHR',
        scheduled: '2025-01-05T08:30:00Z',
        actual: '2025-01-05T08:25:00Z',
        status: 'arrived'
      },
      status: 'arrived'
    },
    'TK2423': {
      flightNumber: 'TK2423',
      airline: 'Turkish Airlines',
      departure: {
        airport: 'IST',
        terminal: 'A',
        gate: 'A15',
        scheduled: '2025-01-05T18:10:00Z',
        actual: '2025-01-05T18:10:00Z',
        status: 'departed'
      },
      arrival: {
        airport: 'IST',
        scheduled: '2025-01-05T20:30:00Z',
        status: 'scheduled'
      },
      status: 'departed'
    }
  };

  static async getFlightInfo(flightNumber: string): Promise<FlightInfo | null> {
    try {
      // Gerçek API çağrısı burada yapılacak
      // const response = await axios.get(`https://api.flightapi.com/flight/${flightNumber}`);
      
      // Şimdilik mock veri döndürüyoruz
      const flight = this.mockFlights[flightNumber.toUpperCase()];
      
      if (!flight) {
        // Eğer uçuş bulunamazsa, varsayılan veri oluştur
        return {
          flightNumber: flightNumber.toUpperCase(),
          airline: 'Unknown',
          departure: {
            airport: 'Unknown',
            scheduled: new Date().toISOString(),
            status: 'scheduled'
          },
          arrival: {
            airport: 'Unknown',
            scheduled: new Date().toISOString(),
            status: 'scheduled'
          },
          status: 'scheduled'
        };
      }

      return flight;
    } catch (error) {
      console.error('Uçuş bilgisi alınırken hata:', error);
      return null;
    }
  }

  static async getMultipleFlights(flightNumbers: string[]): Promise<{ [key: string]: FlightInfo | null }> {
    const results: { [key: string]: FlightInfo | null } = {};
    
    for (const flightNumber of flightNumbers) {
      results[flightNumber] = await this.getFlightInfo(flightNumber);
    }
    
    return results;
  }

  static getFlightStatusColor(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'boarding':
        return 'bg-purple-100 text-purple-800';
      case 'departed':
        return 'bg-green-100 text-green-800';
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  static getFlightStatusText(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'Zamanında';
      case 'delayed':
        return 'Gecikmeli';
      case 'boarding':
        return 'Biniş';
      case 'departed':
        return 'Kalktı';
      case 'arrived':
        return 'İndi';
      case 'cancelled':
        return 'İptal';
      default:
        return 'Bilinmiyor';
    }
  }

  static formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  }

  static calculateDelay(scheduled: string, actual?: string): number {
    if (!actual) return 0;
    
    const scheduledTime = new Date(scheduled).getTime();
    const actualTime = new Date(actual).getTime();
    
    return Math.round((actualTime - scheduledTime) / (1000 * 60)); // dakika cinsinden
  }
}
