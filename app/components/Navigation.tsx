import Link from 'next/link'; // Link bileşenini içe aktardık

const Navigation = () => {
  return (
    <nav className="flex space-x-4">
      <Link
        href="/reservations/new"
        className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Yeni Rezervasyon
      </Link>
      
      <Link
        href="/reservations"
        className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Tüm Rezervasyonlar
      </Link>
      
      <Link
        href="/flight-status"
        className="flex-1 text-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      >
        Uçuş Durumu
      </Link>
      
      <Link
        href="/reports"
        className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Raporlar
      </Link>
    </nav>
  );
};

export default Navigation;
