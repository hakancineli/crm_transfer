import VoucherContent from '../VoucherContent';

interface PageParams {
	params: { voucherNumber: string };
}

async function fetchReservation(voucherNumber: string): Promise<any | null> {
	try {
		const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
		const res = await fetch(`${base}/api/reservations/${voucherNumber}`, { cache: 'no-store' });
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

export default async function DriverVoucherPage({ params }: PageParams) {
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
				try { return JSON.parse(reservation.passengerNames); } catch { return []; }
			})()
			: [];
	const normalized = { ...reservation, passengerNames, driverFee: reservation.driverFee ?? undefined, isReturn: !!reservation.isReturn };
	return <VoucherContent reservation={normalized} isDriverVoucher />;
}
