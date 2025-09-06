import { getReservation } from '@/app/actions/reservations';
import EditReservationForm from '@/app/components/EditReservationForm';

export default async function EditReservationPage({
    params
}: {
    params: { voucherNumber: string }
}) {
    const reservation = await getReservation(params.voucherNumber);

    if (!reservation) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Rezervasyon Bulunamadı</h1>
                    <p className="text-gray-600">Bu voucher numarasına ait rezervasyon bulunamadı.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Rezervasyon Düzenle</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Voucher No: {params.voucherNumber}
                </p>
            </div>
            <EditReservationForm
                voucherNumber={params.voucherNumber}
                initialData={reservation}
            />
        </div>
    );
} 