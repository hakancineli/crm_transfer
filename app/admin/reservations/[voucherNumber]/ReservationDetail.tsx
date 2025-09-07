'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AIRPORTS, CURRENCIES } from '@/app/types';
import PrintButton from '@/app/components/PrintButton';
import VoucherContent from './VoucherContent';
import DriverAssignForm from './DriverAssignForm';

interface Driver {
    id: string;
    name: string;
    phoneNumber?: string | null;
}

interface ReservationDetailProps {
    reservation: {
        id: string;
        date: string;
        time: string;
        from: string;
        to: string;
        flightCode: string;
        passengerNames: string[] | string;
        luggageCount: number;
        price: number;
        currency: string;
        voucherNumber: string;
        driverFee: number | null;
        driver: Driver | null;
        isReturn?: boolean;
    };
    isDriverVoucher?: boolean;
    isEditMode?: boolean;
    editType?: 'customer' | 'driver';
}

export default function ReservationDetail({ 
    reservation, 
    isDriverVoucher = false,
    isEditMode = false,
    editType
}: ReservationDetailProps) {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<string>(reservation.driver?.id || '');
    const [driverFee, setDriverFee] = useState<string>(reservation.driverFee?.toString() || '');
    const [isLoading, setIsLoading] = useState(false);
    const [passengerList, setPassengerList] = useState<string[]>([]);

    const getLocationDisplay = (location: string) => {
        return AIRPORTS[location as keyof typeof AIRPORTS] || location;
    };

    useEffect(() => {
        try {
            const names = typeof reservation.passengerNames === 'string' 
                ? JSON.parse(reservation.passengerNames)
                : reservation.passengerNames;
            setPassengerList(Array.isArray(names) ? names : []);
        } catch (error) {
            console.error('Yolcu isimleri parse hatası:', error);
            setPassengerList([]);
        }
    }, [reservation.passengerNames]);

    useEffect(() => {
        fetch('/api/drivers')
            .then(res => res.json())
            .then(data => setDrivers(data))
            .catch(error => console.error('Sürücü listesi getirme hatası:', error));
    }, []);

    const handleDriverAssign = async (driverId: string, driverFee: number) => {
        try {
            const response = await fetch(`/api/reservations/${reservation.voucherNumber}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ driverId, driverFee }),
            });

            if (response.ok) {
                router.refresh();
                router.push(`/admin/reservations/${reservation.voucherNumber}?view=driver`);
            }
        } catch (error) {
            console.error('Şoför atama hatası:', error);
        }
    };

    if (isEditMode && editType === 'driver') {
        return <DriverAssignForm reservation={reservation} onAssign={handleDriverAssign} />;
    }

    return <VoucherContent reservation={{
        ...reservation,
        passengerNames: Array.isArray(reservation.passengerNames) 
            ? reservation.passengerNames 
            : typeof reservation.passengerNames === 'string' 
                ? JSON.parse(reservation.passengerNames) 
                : [],
        driverFee: reservation.driverFee || undefined,
        isReturn: reservation.isReturn || false
    }} isDriverVoucher={isDriverVoucher} />;
} 