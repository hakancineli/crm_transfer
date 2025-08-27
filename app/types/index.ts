export type Currency = 'USD' | 'EUR' | 'TRY';

export const AIRPORTS = {
    IST: 'İstanbul Havalimanı',
    SAW: 'Sabiha Gökçen Havalimanı'
} as const;

export type Airport = keyof typeof AIRPORTS | string;

export interface Reservation {
    id: string;
    date: string;
    time: string;
    from: string;
    to: string;
    flightCode: string;
    passengerNames: string;
    luggageCount: number;
    price: number;
    currency: Currency;
    distanceKm?: number;
    voucherNumber: string;
    createdAt: Date;
}

export const CURRENCIES: Record<Currency, string> = {
    USD: 'USD ($)',
    EUR: 'EUR (€)',
    TRY: 'TL (₺)'
}; 