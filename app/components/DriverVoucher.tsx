'use client';

import { useState, useEffect } from 'react';
import { AIRPORTS } from '@/app/types';

interface DriverVoucherProps {
    reservation: {
        date: string;
        time: string;
        from: string;
        to: string;
        flightCode: string;
        passengerNames: string;
        luggageCount: number;
        driverFee: number | null;
        voucherNumber: string;
        driver: {
            name: string;
            phoneNumber: string | null;
        } | null;
    };
}

export default function DriverVoucher({ reservation }: DriverVoucherProps) {
    const [passengerList, setPassengerList] = useState<string[]>([]);

    useEffect(() => {
        try {
            const parsed = JSON.parse(reservation.passengerNames);
            if (Array.isArray(parsed)) {
                setPassengerList(parsed);
            }
        } catch (e) {
            console.error('Yolcu isimleri parse edilemedi:', e);
            setPassengerList([]);
        }
    }, [reservation.passengerNames]);

    const getLocationDisplay = (location: string) => {
        return AIRPORTS[location as keyof typeof AIRPORTS] || location;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 transition-colors duration-200">
                <div className="border-b border-gray-200 dark:border-slate-700 pb-4 mb-4 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Sürücü Bilgileri</h1>
                        <p className="text-gray-600 dark:text-slate-300">Voucher No: {reservation.voucherNumber}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {reservation.driver && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-slate-200">Sürücü</h3>
                            <p className="mt-2 text-gray-900 dark:text-slate-100">İsim: {reservation.driver.name}</p>
                            {reservation.driver.phoneNumber && (
                                <p className="text-gray-900 dark:text-slate-100">Telefon: {reservation.driver.phoneNumber}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-slate-200">Transfer Bilgileri</h3>
                        <p className="mt-2 text-gray-900 dark:text-slate-100">Tarih: {reservation.date}</p>
                        <p className="text-gray-900 dark:text-slate-100">Saat: {reservation.time}</p>
                        <p className="text-gray-900 dark:text-slate-100">Nereden: {getLocationDisplay(reservation.from)}</p>
                        <p className="text-gray-900 dark:text-slate-100">Nereye: {getLocationDisplay(reservation.to)}</p>
                        <p className="text-gray-900 dark:text-slate-100">Uçuş Kodu: {reservation.flightCode}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-slate-200">Yolcu Bilgileri</h3>
                        <p className="mt-2 text-gray-900 dark:text-slate-100">Yolcu Sayısı: {passengerList.length}</p>
                        <p className="text-gray-900 dark:text-slate-100">Bagaj Sayısı: {reservation.luggageCount}</p>
                    </div>

                    {reservation.driverFee && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-slate-200">Hakediş Bilgisi</h3>
                            <p className="mt-2 text-xl text-gray-900 dark:text-slate-100">
                                {reservation.driverFee} TL
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => window.print()}
                            className="print:hidden px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Yazdır
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 