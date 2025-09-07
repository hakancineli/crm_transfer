'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VoucherContent from '../VoucherContent';

export default function CustomerVoucherPage() {
	const params = useParams();
	const [reservation, setReservation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const voucherNumber = params.voucherNumber as string;

	useEffect(() => {
		const fetchReservation = async () => {
			try {
				setLoading(true);
				const response = await fetch(`/api/reservations/${voucherNumber}`);
				
				if (!response.ok) {
					throw new Error('Rezervasyon bulunamadı');
				}
				
				const data = await response.json();
				setReservation(data);
			} catch (err) {
				console.error('Rezervasyon getirme hatası:', err);
				setError(err instanceof Error ? err.message : 'Rezervasyon yüklenirken hata oluştu');
			} finally {
				setLoading(false);
			}
		};

		if (voucherNumber) {
			fetchReservation();
		}
	}, [voucherNumber]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded mb-4"></div>
						<div className="h-4 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !reservation) {
		return (
			<div className="p-6">
				<div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 text-center">
					<p className="text-gray-700">{error || 'Voucher bulunamadı veya yüklenemedi.'}</p>
				</div>
			</div>
		);
	}

	const passengerNames = Array.isArray((reservation as any).passengerNames)
		? (reservation as any).passengerNames
		: typeof (reservation as any).passengerNames === 'string'
			? (() => {
				try {
					return JSON.parse((reservation as any).passengerNames);
				} catch {
					return [];
				}
			})()
			: [];

	const normalized = {
		...reservation,
		passengerNames: passengerNames as string[],
		driverFee: reservation.driverFee ?? undefined,
		isReturn: !!reservation.isReturn,
	};

	return <VoucherContent reservation={normalized} isDriverVoucher={false} />;
}
