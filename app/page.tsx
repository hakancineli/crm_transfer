import Image from "next/image";
import ReservationForm from './components/ReservationForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Müşteri Rezervasyon Linki */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Müşteri Rezervasyon Talebi</h2>
        <p className="text-blue-600 mb-4">
          Müşterileriniz için özel rezervasyon formu - fiyat bilgisi olmadan
        </p>
        <Link 
          href="/customer-reservation" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Müşteri Formu Aç
        </Link>
        <div className="mt-3 text-sm text-blue-500">
          Bu linki müşterilerinizle paylaşabilirsiniz
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Yeni Rezervasyon</h1>
        <p className="mt-2 text-sm text-gray-600">
          Transfer rezervasyonu oluşturmak için aşağıdaki formu doldurun.
        </p>
      </div>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <ReservationForm />
      </div>
    </div>
  );
}
