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
        flightCode?: string;
        luggageCount?: number;
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
            flightCode?: string;
        } | null;
        originalTransfer?: {
            voucherNumber: string;
            date: string;
            time: string;
            from: string;
            to: string;
            flightCode?: string;
        } | null;
        tenant?: {
            id: string;
            companyName: string;
            subdomain: string;
        };
    };
    isDriverVoucher?: boolean;
}

export default function VoucherContent({ reservation, isDriverVoucher }: VoucherContentProps) {
    const [selectedLanguage, setSelectedLanguage] = useState('tr');
    const [editingDriverPhone, setEditingDriverPhone] = useState(false);
    const [driverPhone, setDriverPhone] = useState<string>((reservation as any)?.driver?.phoneNumber || '');
    const [savingDriver, setSavingDriver] = useState(false);
    const [editingDriverName, setEditingDriverName] = useState(false);
    const [driverName, setDriverName] = useState<string>((reservation as any)?.driver?.name || '');
    const [editingDriverFee, setEditingDriverFee] = useState(false);
    const [driverFee, setDriverFee] = useState<number | ''>(reservation.driverFee ?? '');
    const [savingFee, setSavingFee] = useState(false);
    
    // Open address in navigation app (Yandex preferred), robust for mobile browsers
    const openInNavigation = (rawAddress: string) => {
        if (!rawAddress) return;
        const address = (AIRPORTS[rawAddress as keyof typeof AIRPORTS] || rawAddress).toString();
        const encoded = encodeURIComponent(address);

        const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);

        // Preferred app deep links
        const yandexApp = isIOS ? `yandexmaps://?text=${encoded}` : `yandexmaps://maps.yandex.com/?text=${encoded}`;
        const appleMaps = `maps://?q=${encoded}`; // iOS Apple Maps
        const yandexWeb = `https://yandex.com.tr/maps/?text=${encoded}`;
        const googleWeb = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

        // Use location.href (more reliable than window.open for deep links)
        const start = Date.now();
        try { window.location.href = yandexApp; } catch {}

        // Fallback after 1.2s if app didn't take over
        setTimeout(() => {
            const elapsed = Date.now() - start;
            if (elapsed < 1300) {
                if (isIOS) {
                    // Try Apple Maps on iOS as secondary fallback
                    try { window.location.href = appleMaps; } catch {}
                } else {
                    // Android/browser fallback to Yandex web first
                    try { window.location.href = yandexWeb; } catch {}
                }

                // Final fallback to Google Maps web
                setTimeout(() => {
                    try { window.open(googleWeb, '_blank'); } catch {}
                }, 900);
            }
        }, 1200);
    };
    
    const normalizePhone = (raw?: string): string | null => {
        if (!raw) return null;
        // Keep leading + and digits only
        let cleaned = raw.replace(/[^+\d]/g, '');
        // If starts with 00 convert to +
        if (cleaned.startsWith('00')) cleaned = `+${cleaned.slice(2)}`;
        // If missing + and seems local TR, prefix +90
        if (!cleaned.startsWith('+')) {
            if (cleaned.length === 10) cleaned = `+90${cleaned}`; // e.g. 5xx...
            else if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = `+9${cleaned}`; // 0xxxxxxxxxx
        }
        return cleaned;
    };

    const buildVoucherUrl = (): string => {
        // Use current URL without query to share voucher page
        if (typeof window !== 'undefined') {
            return window.location.href.split('?')[0];
        }
        // Fallback
        const base = isDriverVoucher ? 'driver-voucher' : 'customer-voucher';
        return `/admin/reservations/${reservation.voucherNumber}/${base}`;
    };
    
    const buildPdfUrl = (): string => {
        // Conventional query flag to hint browser to download/print as PDF
        const baseUrl = buildVoucherUrl();
        return `${baseUrl}?download=pdf`;
    };

    const handleSendWhatsApp = () => {
        const targetPhone = isDriverVoucher
            ? (driverPhone || (reservation as any)?.driver?.phoneNumber || undefined)
            : reservation.phoneNumber;
        const phone = normalizePhone(targetPhone);
        if (!phone) {
            alert('Telefon numarası bulunamadı.');
            return;
        }
        const msgLines = [
            isDriverVoucher ? 'Şoför voucherı' : 'Müşteri voucherı',
            `Voucher: ${reservation.voucherNumber}`,
            `Tarih: ${reservation.date} Saat: ${reservation.time}`,
            `Nereden: ${reservation.from}`,
            `Nereye: ${reservation.to}`,
        ];
        if (reservation.flightCode) msgLines.push(`Uçuş: ${reservation.flightCode}`);
        const url = buildVoucherUrl();
        const pdfUrl = buildPdfUrl();
        msgLines.push(`Bağlantı: ${url}`);
        msgLines.push(`PDF: ${pdfUrl}`);
        const text = encodeURIComponent(msgLines.join('\n'));
        const waUrl = `https://wa.me/${phone.replace('+', '')}?text=${text}`;
        if (typeof window !== 'undefined') window.open(waUrl, '_blank');
    };

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
        fr: {
            title: 'Bon de Chauffeur',
            transferInfo: 'Informations de Transfert',
            date: 'Date',
            time: 'Heure',
            from: 'De',
            to: 'À',
            flightInfo: 'Informations de Vol',
            flightCode: 'Code de Vol',
            luggage: 'Bagage',
            passengers: 'Passagers',
            passengerInfo: 'Informations Passager',
            passengerCount: 'Nombre de Passagers',
            luggageCount: 'Bagage',
            contact: 'Contact',
            person: 'Personne',
            piece: 'Pièce',
            paymentInfo: 'Informations de Paiement',
            driverFee: 'Frais Chauffeur',
            customerPayment: 'Paiement Client',
            bankInfo: 'Informations Bancaires',
            iban: 'IBAN',
            accountHolder: 'Titulaire du Compte',
            bank: 'Banque',
            print: 'Imprimer',
            returnTransfer: 'Transfert Retour',
            originalTransfer: 'Transfert Aller',
            transferType: 'Type de Transfert',
            outbound: 'Transfert Intermédiaire',
            inbound: 'Transfert Retour',
            arrival: 'Transfert Arrivée',
            departure: 'Transfert Départ'
        },
        ru: {
            title: 'Ваучер водителя',
            transferInfo: 'Информация о трансфере',
            date: 'Дата',
            time: 'Время',
            from: 'Откуда',
            to: 'Куда',
            flightInfo: 'Информация о рейсе',
            flightCode: 'Код рейса',
            luggage: 'Багаж',
            passengers: 'Пассажиры',
            passengerInfo: 'Информация о пассажирах',
            passengerCount: 'Количество пассажиров',
            luggageCount: 'Багаж',
            contact: 'Контакт',
            person: 'Человек',
            piece: 'Шт.',
            paymentInfo: 'Платёжная информация',
            driverFee: 'Оплата водителю',
            customerPayment: 'Платёж клиента',
            bankInfo: 'Банковская информация',
            iban: 'IBAN',
            accountHolder: 'Владелец счёта',
            bank: 'Банк',
            print: 'Печать',
            returnTransfer: 'Обратный трансфер',
            originalTransfer: 'Трансфер туда',
            transferType: 'Тип трансфера',
            outbound: 'Промежуточный трансфер',
            inbound: 'Обратный трансфер',
            arrival: 'Трансфер прибытия',
            departure: 'Трансфер отправления'
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
        <div className="print-content bg-white p-8 print:p-4 rounded-2xl shadow-lg max-w-4xl mx-auto print:shadow-none print:max-w-full border border-gray-100">
            {/* Language Selector */}
            <div className="flex justify-end mb-4 print:hidden no-print">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    title="Dil seçimi"
                    className="block w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ru">Русский</option>
                    <option value="ar">العربية</option>
                </select>
            </div>

            {/* Header */}
            <div className="text-center mb-8 print:mb-4 border-b-2 border-gradient-to-r from-blue-500 to-green-500 pb-6 print:pb-3">
                <div className="flex justify-center items-center mb-6 print:mb-3">
                    {/* Şirket Adı */}
                    <span className="text-4xl print:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                        {reservation.tenant?.companyName || (reservation as any).companyName || 'Şirket Adı'}
                    </span>
                </div>
                <h1 className="text-2xl print:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                    {isDriverVoucher ? t.title : 'Müşteri Voucherı'}
                </h1>
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm print:text-xs font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Voucher No: {reservation.voucherNumber}
                </div>
            </div>

            {/* U-ETDS Butonu (Sadece Şoför Voucher'ında) */}
            {isDriverVoucher && (
                <div className="mb-6 print:hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">🚌</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">U-ETDS Bildirimi</h3>
                                    <p className="text-sm text-gray-600">Transfer bilgilerini U-ETDS sistemine bildirin</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    // U-ETDS oluştur sayfasına yönlendir
                                    window.open(`/admin/uetds/create?reservation=${reservation.voucherNumber}`, '_blank');
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                            >
                                <span className="mr-2">🚌</span>
                                U-ETDS Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="space-y-6 print:space-y-3">
                {/* Transfer ve Uçuş Bilgileri Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-3">
                    {/* Transfer Bilgileri */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 print:p-3 rounded-2xl print:bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-600">{t.from}:</div>
                                        <div className="font-medium">
                                            {AIRPORTS[reservation.from as keyof typeof AIRPORTS] || reservation.from}
                                        </div>
                                    </div>
                                    {isDriverVoucher && (
                                        <button
                                            onClick={() => openInNavigation(reservation.from)}
                                            className="ml-4 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                                            title="Navigasyonda aç"
                                        >
                                            🚘 Git
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="py-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-600">{t.to}:</div>
                                        <div className="font-medium">
                                            {AIRPORTS[reservation.to as keyof typeof AIRPORTS] || reservation.to}
                                        </div>
                                    </div>
                                    {isDriverVoucher && (
                                        <button
                                            onClick={() => openInNavigation(reservation.to)}
                                            className="ml-4 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                            title="Navigasyonda aç"
                                        >
                                            🧭 Git
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Uçuş Bilgileri */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 print:p-3 rounded-2xl print:bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            {t.flightInfo}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-gray-600">{t.flightCode}:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{reservation.flightCode || '—'}</span>
                                    {reservation.flightCode && (
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent(reservation.flightCode + ' uçuş durumu')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                            title="Google'da uçuş durumunu ara"
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Ara
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">{t.luggage}:</span>
                                <span className="font-medium">{reservation.luggageCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Yolcular */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 print:p-3 rounded-2xl print:bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 print:p-3 rounded-2xl print:bg-white border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                            <span className="font-medium">{reservation.luggageCount} {t.piece}</span>
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
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 print:p-3 rounded-2xl print:bg-white border border-cyan-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h2 className="text-sm print:text-xs font-semibold text-blue-800 mb-3 print:mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Ödeme Bilgisi
                        </h2>
                        <div className="text-xl print:text-lg font-bold text-blue-600 text-center">
                            {reservation.price} {CURRENCIES[reservation.currency as keyof typeof CURRENCIES]}
                        </div>
                        {/* Şoför iletişim düzenleme */}
                        {(reservation as any)?.driver && (
                            <div className="bg-white border border-gray-200 p-4 rounded-xl print:hidden">
                                <h2 className="text-sm font-semibold text-gray-800 mb-3">Şoför İletişimi</h2>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm">
                                        <div className="text-gray-600">Ad Soyad</div>
                                        {!editingDriverName ? (
                                            <div className="flex items-center gap-2 font-medium">
                                                <span>{driverName || (reservation as any).driver?.name || '-'}</span>
                                                <button
                                                    onClick={()=> setEditingDriverName(true)}
                                                    className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                                >Düzenle</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={driverName}
                                                    onChange={(e)=> setDriverName(e.target.value)}
                                                    placeholder="Ad Soyad"
                                                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                                />
                                                <button
                                                    onClick={async ()=>{
                                                        try {
                                                            setSavingDriver(true);
                                                            const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                                                            if (typeof window !== 'undefined') {
                                                                const token = localStorage.getItem('token');
                                                                if (token) headers['Authorization'] = `Bearer ${token}`;
                                                            }
                                                            const res = await fetch(`/api/drivers/${(reservation as any).driver.id}`, {
                                                                method: 'PUT',
                                                                headers,
                                                                body: JSON.stringify({ name: driverName })
                                                            });
                                                            if (!res.ok) throw new Error('Güncellenemedi');
                                                            setEditingDriverName(false);
                                                        } catch (e) {
                                                            alert('Şoför adı güncellenemedi');
                                                        } finally {
                                                            setSavingDriver(false);
                                                        }
                                                    }}
                                                    disabled={savingDriver}
                                                    className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                                >{savingDriver ? 'Kaydediliyor...' : 'Kaydet'}</button>
                                                <button
                                                    onClick={()=>{ setEditingDriverName(false); setDriverName((reservation as any).driver?.name || ''); }}
                                                    className="px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                                                >İptal</button>
                                            </div>
                                        )}
                                    </div>
                                    {!editingDriverPhone ? (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{driverPhone || (reservation as any).driver?.phoneNumber || '-'}</span>
                                            <button
                                                onClick={() => setEditingDriverPhone(true)}
                                                className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Düzenle
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={driverPhone}
                                                onChange={(e)=>setDriverPhone(e.target.value)}
                                                placeholder="+90555..."
                                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setSavingDriver(true);
                                                        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                                                        if (typeof window !== 'undefined') {
                                                            const token = localStorage.getItem('token');
                                                            if (token) headers['Authorization'] = `Bearer ${token}`;
                                                        }
                                                        const res = await fetch(`/api/drivers/${(reservation as any).driver.id}`, {
                                                            method: 'PUT',
                                                            headers,
                                                            body: JSON.stringify({ phoneNumber: driverPhone })
                                                        });
                                                        if (!res.ok) throw new Error('Güncellenemedi');
                                                        setEditingDriverPhone(false);
                                                    } catch (e) {
                                                        alert('Şoför telefonu güncellenemedi');
                                                    } finally {
                                                        setSavingDriver(false);
                                                    }
                                                }}
                                                disabled={savingDriver}
                                                className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {savingDriver ? 'Kaydediliyor...' : 'Kaydet'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingDriverPhone(false); setDriverPhone((reservation as any).driver?.phoneNumber || ''); }}
                                                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                                {editingDriverFee ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="number"
                                            value={driverFee}
                                            onChange={(e)=> setDriverFee(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-32 text-center"
                                            placeholder="Hakediş"
                                        />
                                        <button
                                            onClick={async ()=>{
                                                try {
                                                    setSavingFee(true);
                                                    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                                                    if (typeof window !== 'undefined') {
                                                        const token = localStorage.getItem('token');
                                                        if (token) headers['Authorization'] = `Bearer ${token}`;
                                                    }
                                                    const res = await fetch(`/api/reservations/${reservation.voucherNumber}` ,{
                                                        method: 'PUT',
                                                        headers,
                                                        body: JSON.stringify({ driverFee })
                                                    });
                                                    if (!res.ok) throw new Error('Hakediş güncellenemedi');
                                                    setEditingDriverFee(false);
                                                } catch (e) {
                                                    alert('Hakediş güncellenemedi');
                                                } finally {
                                                    setSavingFee(false);
                                                }
                                            }}
                                            disabled={savingFee}
                                            className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {savingFee ? 'Kaydediliyor...' : 'Kaydet'}
                                        </button>
                                        <button
                                            onClick={()=>{ setEditingDriverFee(false); setDriverFee(reservation.driverFee ?? ''); }}
                                            className="px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>{(driverFee === '' ? reservation.driverFee : driverFee) ?? 0} TL</span>
                                        <button
                                            onClick={()=> setEditingDriverFee(true)}
                                            className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            Düzenle
                                        </button>
                                    </div>
                                )}
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
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 print:p-3 rounded-2xl print:bg-white border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{t.transferType}:</span>
                        <span className="font-medium text-gray-900">
                            {reservation.isReturn ? (
                                t.inbound
                            ) : (
                                (reservation.from?.includes('IST') || reservation.from?.includes('SAW')) ? t.arrival :
                                (reservation.to?.includes('IST') || reservation.to?.includes('SAW')) ? t.departure :
                                t.outbound
                            )}
                        </span>
                    </div>
                </div>

                {/* İlişkili Transfer Bilgisi */}
                {(reservation.returnTransfer || reservation.originalTransfer) && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 print:p-3 rounded-2xl print:bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-200 mb-4">
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
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{reservation.originalTransfer.flightCode || '—'}</span>
                                                {reservation.originalTransfer.flightCode && (
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(reservation.originalTransfer.flightCode + ' uçuş durumu')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                        title="Google'da uçuş durumunu ara"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        Ara
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/admin/reservations/${reservation.originalTransfer.voucherNumber}${isDriverVoucher ? '?view=driver' : ''}`}
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
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{reservation.returnTransfer.flightCode || '—'}</span>
                                                {reservation.returnTransfer.flightCode && (
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(reservation.returnTransfer.flightCode + ' uçuş durumu')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                        title="Google'da uçuş durumunu ara"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        Ara
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/admin/reservations/${reservation.returnTransfer.voucherNumber}${isDriverVoucher ? '?view=driver' : ''}`}
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

            {/* Yazdır / WhatsApp Butonları */}
            <div className="mt-8 print:hidden no-print flex items-center justify-center gap-3">
                <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {t.print}
                </button>
                <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-sky-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                    title="PDF indir"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 2H8a2 2 0 00-2 2v3h2V4h11v16H8v-3H6v3a2 2 0 002 2h11a2 2 0 002-2V4a2 2 0 00-2-2z"/>
                        <path d="M12 17l5-5h-3V4h-4v8H7l5 5z"/>
                    </svg>
                    PDF indir
                </button>
                <button
                    onClick={handleSendWhatsApp}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                    title="WhatsApp ile gönder"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.52 3.48A11.8 11.8 0 0012.06 0C5.5 0 .2 5.3.2 11.86c0 2.09.56 4.1 1.62 5.88L0 24l6.42-1.74a11.86 11.86 0 005.64 1.45h.01c6.56 0 11.86-5.3 11.86-11.86 0-3.17-1.23-6.14-3.41-8.32zM12.06 21.3h-.01a9.42 9.42 0 01-4.8-1.31l-.34-.2-3.8 1.03 1.02-3.7-.22-.38a9.45 9.45 0 01-1.46-5.08c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.98 6.7 2.76a9.45 9.45 0 012.78 6.7c0 5.22-4.25 9.45-9.45 9.45zm5.48-7.09c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5-.17 0-.37-.03-.57-.03-.2 0-.52.08-.8.37-.27.3-1.05 1.03-1.05 2.52s1.08 2.93 1.23 3.13c.15.2 2.12 3.24 5.15 4.55.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z" />
                    </svg>
                    WhatsApp ile gönder
                </button>
            </div>
            </div>
        </div>
    );
} 