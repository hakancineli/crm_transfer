import { getReservation } from '@/app/actions/reservations';
import ReservationDetail from './ReservationDetail';
import { redirect } from 'next/navigation';

async function ReservationPage({
    params,
    searchParams
}: {
    params: { voucherNumber: string },
    searchParams: { [key: string]: string | undefined }
}) {
    const voucherNumber = params.voucherNumber;
    const viewMode = searchParams.view;
    const editMode = searchParams.edit;
    const reservation = await getReservation(voucherNumber);

    // Eğer edit=true parametresi varsa, düzenleme sayfasına yönlendir
    if (editMode === 'true') {
        redirect(`/reservations/${voucherNumber}/edit`);
    }

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
        <ReservationDetail
            reservation={reservation}
            isDriverVoucher={viewMode === 'driver'}
            isEditMode={!!editMode}
            editType={editMode as 'customer' | 'driver'}
        />
    );
}

export default ReservationPage; 