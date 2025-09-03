"use client";
import { AIRPORTS, CURRENCIES } from '@/app/types';
import { useState } from 'react';
import Link from 'next/link';

interface VoucherContentProps {
    reservation: {
        voucherNumber: string;
        date: string;
        time: string;
        from: string;
        to: string;
        flightCode?: string | null;
        luggageCount?: number | null;
        passengerNames: string[];
        price: number;
        currency: string;
        driverFee?: number;
        phoneNumber?: string;
        isReturn: boolean;
        returnTransfer?: {
            voucherNumber: string;
            date: string;
            time: string;
            from: string;
            to: string;
            flightCode?: string | null;
        } | null;
        originalTransfer?: {
            voucherNumber: string;
            date: string;
            time: string;
            from: string;
            to: string;
            flightCode?: string | null;
        } | null;
    };
    isDriverVoucher?: boolean;
}

export default function VoucherContent({ reservation, isDriverVoucher }: VoucherContentProps) {
    const [selectedLanguage, setSelectedLanguage] = useState('tr');

    const translations = {
        tr: {
            title: 'Şoför Voucherı',
            transferInfo: 'Transfer Bilgileri',
            date: 'Tarih',
            time: 'Saat',
            from: 'Nereden',
            to: 'Nereye',
            flightInfo: 'Uçuş Bilgileri',
            flightCode: 'Uçuş Kodu',
            luggage: 'Bagaj',
            passengers: 'Yolcular',
            passengerInfo: 'Yolcu Bilgileri',
            passengerCount: 'Yolcu Sayısı',
            luggageCount: 'Bagaj',
            contact: 'İletişim',
            person: 'Kişi',
            piece: 'Adet',
            paymentInfo: 'Ödeme Bilgisi',
            driverFee: 'Hakediş Bilgisi',
            customerPayment: 'Müşteriden Alınacak',
            bankInfo: 'Ödeme Bilgileri',
            iban: 'IBAN',
            accountHolder: 'Hesap Sahibi',
            bank: 'Banka',
            print: 'Yazdır',
            returnTransfer: 'Dönüş Transferi',
            originalTransfer: 'Gidiş Transferi',
            transferType: 'Transfer Tipi',
            outbound: 'Ara Transfer',
            inbound: 'Dönüş Transferi',
            arrival: 'Karşılama Transferi',
            departure: 'Çıkış Transferi'
        },
        en: {
            title: 'Driver Voucher',
            transferInfo: 'Transfer Information',
            date: 'Date',
            time: 'Time',
            from: 'From',
            to: 'To',
            flightInfo: 'Flight Information',
            flightCode: 'Flight Code',
            luggage: 'Luggage',
            passengers: 'Passengers',
            passengerInfo: 'Passenger Information',
            passengerCount: 'Passenger Count',
            luggageCount: 'Luggage',
            contact: 'Contact',
            person: 'Person',
            piece: 'Piece',
            paymentInfo: 'Payment Information',
            driverFee: 'Driver Fee',
            customerPayment: 'Customer Payment',
            bankInfo: 'Bank Information',
            iban: 'IBAN',
            accountHolder: 'Account Holder',
            bank: 'Bank',
            print: 'Print',
            returnTransfer: 'Return Transfer',
            originalTransfer: 'Outbound Transfer',
            transferType: 'Transfer Type',
            outbound: 'Inter Transfer',
            inbound: 'Return Transfer',
            arrival: 'Arrival Transfer',
            departure: 'Departure Transfer'
        },
        ar: {
            title: 'قسيمة السائق',
            transferInfo: 'معلومات النقل',
            date: 'التاريخ',
            time: 'الوقت',
            from: 'من',
            to: 'إلى',
            flightInfo: 'معلومات الرحلة',
            flightCode: 'رقم الرحلة',
            luggage: 'الأمتعة',
            passengers: 'الركاب',
            passengerInfo: 'معلومات الركاب',
            passengerCount: 'عدد الركاب',
            luggageCount: 'الأمتعة',
            contact: 'الاتصال',
            person: 'شخص',
            piece: 'قطعة',
            paymentInfo: 'معلومات الدفع',
            driverFee: 'أجرة السائق',
            customerPayment: 'المبلغ المطلوب من العميل',
            bankInfo: 'المعلومات المصرفية',
            iban: 'رقم الحساب الدولي',
            accountHolder: 'صاحب الحساب',
            bank: 'البنك',
            print: 'طباعة',
            returnTransfer: 'رحلة العودة',
            originalTransfer: 'رحلة الذهاب',
            transferType: 'نوع النقل',
            outbound: 'نقل بيني',
            inbound: 'نقل العودة',
            arrival: 'نقل الوصول',
            departure: 'نقل المغادرة'
        }
    };

    const t = translations[selectedLanguage as keyof typeof translations];

    const formatDate = (dateStr: string) => {
        try {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    const formatPassengerNames = (names: string[] | string): string[] => {
        if (typeof names === 'string') {
            try {
                return JSON.parse(names);
            } catch (e) {
                return [names];
            }
        }
        return Array.isArray(names) ? names : [];
    };

    const passengerNames = formatPassengerNames(reservation.passengerNames);

    return (
        <div className="bg-white p-6 print:p-2 rounded-xl shadow-sm max-w-3xl mx-auto print:shadow-none print:max-w-full">
            {/* Language Selector */}
            <div className="flex justify-end mb-4 print:hidden">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="block w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                </select>
            </div>

            {/* Header */}
            <div className="text-center mb-4 print:mb-2 border-b pb-4 print:pb-2 print:hidden">
                <div className="flex justify-center items-center mb-4 print:mb-2">
                    <span className="text-3xl print:text-xl font-bold tracking-tight">
                        <span className="text-black">Pro</span>
                        <span className="text-green-600">Transfer</span>
                    </span>
                </div>
                <h1 className="text-xl print:text-lg font-bold text-blue-600 mb-1">
                    {isDriverVoucher ? t.title : 'Müşteri Voucherı'}
                </h1>
                <div className="text-gray-600 text-sm print:text-xs font-medium">
                    Voucher No: {reservation.voucherNumber}
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4 print:space-y-2">
                {/* Transfer ve Uçuş Bilgileri Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                    {/* Transfer Bilgileri */}
                    <div className="bg-gray-50 p-4 print:p-2 rounded-xl print:bg-white border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                            {t.transferInfo}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-gray-600">{t.date}:</span>
                                <span className="font-medium">{formatDate(reservation.date)}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-gray-600">{t.time}:</span>
                                <span className="font-medium">{reservation.time}</span>
                            </div>
                            <div className="py-1 border-b border-gray-100">
                                <div className="text-gray-600">{t.from}:</div>
                                <div className="font-medium">
                                    {AIRPORTS[reservation.from as keyof typeof AIRPORTS] || reservation.from}
                                </div>
                            </div>
                            <div className="py-1">
                                <div className="text-gray-600">{t.to}:</div>
                                <div className="font-medium">
                                    {AIRPORTS[reservation.to as keyof typeof AIRPORTS] || reservation.to}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Uçuş Bilgileri */}
                    <div className="bg-gray-50 p-4 print:p-2 rounded-xl print:bg-white border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            {t.flightInfo}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-gray-600">{t.flightCode}:</span>
                                <span className="font-medium">{reservation.flightCode ?? '-'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">{t.luggage}:</span>
                                <span className="font-medium">{reservation.luggageCount ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Yolcular */}
                <div className="bg-gray-50 p-4 print:p-2 rounded-xl print:bg-white border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {t.passengers}
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {passengerNames.map((name, index) => (
                            <div key={index} className="py-1 border-b border-gray-100 last:border-0">
                                <span className="font-medium">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Yolcu Bilgileri */}
                <div className="bg-gray-50 p-4 print:p-2 rounded-xl print:bg-white border border-gray-100 print:border-none">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t.passengerInfo}
                    </h2>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t.passengerCount}:</span>
                            <span className="font-medium">{passengerNames.length} {t.person}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t.luggageCount}:</span>
                            <span className="font-medium">{reservation.luggageCount ?? 0} {t.piece}</span>
                        </div>
                        {reservation.phoneNumber && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">{t.contact}:</span>
                                <span className="font-medium">{reservation.phoneNumber}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ödeme Bilgileri */}
                {!isDriverVoucher && (
                    <div className="bg-blue-50 p-4 print:p-2 rounded-xl print:bg-white border border-blue-100 print:border-none">
                        <h2 className="text-sm print:text-xs font-semibold text-blue-800 mb-3 print:mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Ödeme Bilgisi
                        </h2>
                        <div className="text-xl print:text-lg font-bold text-blue-600 text-center">
                            {reservation.price} {CURRENCIES[reservation.currency as keyof typeof CURRENCIES]}
                        </div>
                    </div>
                )}

                {/* Şoför Bilgileri */}
                {isDriverVoucher && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                        <div className="bg-green-50 p-4 print:p-2 rounded-xl print:bg-white border border-green-100 print:border-none">
                            <h2 className="text-sm print:text-xs font-semibold text-green-800 mb-3 print:mb-1 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t.driverFee}
                            </h2>
                            <div className="text-xl print:text-lg font-bold text-green-600 text-center">
                                {reservation.driverFee} TL
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 print:p-2 rounded-xl print:bg-white border border-blue-100 print:border-none">
                            <h2 className="text-sm print:text-xs font-semibold text-blue-800 mb-3 print:mb-1 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                                {t.customerPayment}
                            </h2>
                            <div className="text-xl print:text-lg font-bold text-blue-600 text-center">
                                {reservation.price} {CURRENCIES[reservation.currency as keyof typeof CURRENCIES]}
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 print:p-2 rounded-xl print:bg-white border border-yellow-100 print:border-none col-span-2">
                            <h2 className="text-sm print:text-xs font-semibold text-yellow-800 mb-3 print:mb-1 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t.bankInfo}
                            </h2>
                            <div className="space-y-2 print:space-y-1">
                                <div className="flex flex-col">
                                    <span className="text-gray-600 text-sm print:text-xs">{t.iban}</span>
                                    <span className="font-medium font-mono tracking-wider print:text-sm">TR68 0006 2000 3680 0006 6673 77</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-600 text-sm print:text-xs">{t.accountHolder}</span>
                                    <span className="font-medium print:text-sm">HAKAN ÇİNELİ</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-600 text-sm print:text-xs">{t.bank}</span>
                                    <span className="font-medium print:text-sm">GARANTİ BANKASI</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transfer Tipi Bilgisi */}
                <div className="bg-gray-50 p-4 print:p-2 rounded-xl print:bg-white border border-gray-100 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{t.transferType}:</span>
                        <span className="font-medium text-gray-900">
                            {reservation.isReturn ? (
                                t.inbound
                            ) : (
                                Object.keys(AIRPORTS).includes(reservation.from) ? t.arrival : 
                                Object.keys(AIRPORTS).includes(reservation.to) ? t.departure : 
                                t.outbound
                            )}
                        </span>
                    </div>
                </div>

                {/* İlişkili Transfer Bilgisi */}
                {(reservation.returnTransfer || reservation.originalTransfer) && (
                    <div className="bg-blue-50 p-4 print:p-2 rounded-xl print:bg-white border border-blue-100 mb-4">
                        <h2 className="text-sm font-semibold text-blue-800 mb-3">
                            {reservation.isReturn ? t.originalTransfer : t.returnTransfer}
                        </h2>
                        <div className="space-y-2 text-sm">
                            {reservation.isReturn ? (
                                // Orijinal transfer bilgileri
                                reservation.originalTransfer && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t.date}:</span>
                                            <span className="font-medium">{formatDate(reservation.originalTransfer.date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t.time}:</span>
                                            <span className="font-medium">{reservation.originalTransfer.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t.flightCode}:</span>
                                            <span className="font-medium">{reservation.originalTransfer.flightCode}</span>
                                        </div>
                                        <Link 
                                            href={`/reservations/${reservation.originalTransfer.voucherNumber}${isDriverVoucher ? '?view=driver' : ''}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 inline-block"
                                        >
                                            Voucher: {reservation.originalTransfer.voucherNumber}
                                        </Link>
                                    </>
                                )
                            ) : (
                                // Dönüş transfer bilgileri
                                reservation.returnTransfer && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t.date}:</span>
                                            <span className="font-medium">{formatDate(reservation.returnTransfer.date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t.time}:</span>
                                            <span className="font-medium">{reservation.returnTransfer.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{t.flightCode}:</span>
                                            <span className="font-medium">{reservation.returnTransfer.flightCode}</span>
                                        </div>
                                        <Link 
                                            href={`/reservations/${reservation.returnTransfer.voucherNumber}${isDriverVoucher ? '?view=driver' : ''}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 inline-block"
                                        >
                                            Voucher: {reservation.returnTransfer.voucherNumber}
                                        </Link>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Yazdır Butonu */}
                <div className="mt-6 text-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        {t.print}
                    </button>
                </div>
            </div>
        </div>
    );
} 