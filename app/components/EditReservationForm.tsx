'use client';

export default function EditReservationForm({ voucherNumber }: { voucherNumber: string; initialData?: any }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="text-sm text-gray-600 mb-2">Voucher</div>
      <div className="text-xl font-semibold">{voucherNumber}</div>
      <p className="text-gray-500 mt-2">Düzenleme formu yakında burada olacak.</p>
    </div>
  );
}
