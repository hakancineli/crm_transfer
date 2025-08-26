import ReservationForm from '@/app/components/ReservationForm';

export default function AdminNewReservationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Yeni Rezervasyon (Admin)</h1>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <ReservationForm />
        </div>
      </div>
    </div>
  );
}
