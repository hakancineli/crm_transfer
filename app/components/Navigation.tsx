import Link from 'next/link'; // Link bileşenini içe aktardık

const Navigation = () => {
  return (
    <nav className="flex space-x-4">
      <Link
        href="/reservations/new"
        className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Yeni Rezervasyon
      </Link>
      
      <Link
        href="/reservations"
        className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Tüm Rezervasyonlar
      </Link>
      
      <Link
        href="/flight-status"
        className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Uçuş Durumu
      </Link>
      
      <Link
        href="/reports"
        className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Raporlar
      </Link>
    </nav>
  );
};

export default Navigation;
