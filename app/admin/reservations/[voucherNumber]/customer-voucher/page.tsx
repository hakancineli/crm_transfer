import VoucherContent from '../VoucherContent';

interface PageParams {
	params: {
		voucherNumber: string;
	};
}

async function fetchReservation(voucherNumber: string): Promise<any | null> {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reservations/${voucherNumber}`, {
			cache: 'no-store'
		});
		
		if (!response.ok) {
			return null;
		}
		
		return await response.json();
	} catch {
		return null;
	}
}

export default async function CustomerVoucherPage({ params }: PageParams) {
	const reservation = await fetchReservation(params.voucherNumber);

	if (!reservation) {
		return (
			<div className="p-6">
				<div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 text-center">
					<p className="text-gray-700">Voucher bulunamadı veya yüklenemedi.</p>
				</div>
			</div>
		);
	}

	const passengerNames = Array.isArray(reservation.passengerNames)
		? reservation.passengerNames
		: typeof reservation.passengerNames === 'string'
			? (() => {
				try {
					return JSON.parse(reservation.passengerNames);
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
