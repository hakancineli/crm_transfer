'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEmoji } from '@/app/contexts/EmojiContext';
import Link from 'next/link';
import { BookingApiReal } from '@/app/lib/bookingApiReal';

interface PricePoolItem {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  hotelCountry: string;
  hotelRating: number;
  hotelStars: number;
  hotelImage: string;
  hotelAmenities: string[];
  roomType: string;
  roomName: string;
  roomDescription: string;
  roomAmenities: string[];
  maxOccupancy: number;
  bedType: string;
  roomSize: string;
  roomView: string;
  basePrice: number;
  agentPrice: number;
  customerPrice: number;
  profitMargin: number;
  profitPercentage: number;
  currency: string;
  validFrom: string;
  validTo: string;
  cancellationPolicy: string;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export default function HotelPricePoolPage() {
  const { user } = useAuth();
  const { emojisEnabled } = useEmoji();
  const [pricePool, setPricePool] = useState<PricePoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    city: '',
    checkin: new Date().toISOString().split('T')[0],
    checkout: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adults: 2,
    children: 0,
    rooms: 1,
    minPrice: '',
    maxPrice: '',
    stars: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [pricingData, setPricingData] = useState({
    profitPercentage: 25,
    agentPrice: 0,
    customerPrice: 0,
    profitMargin: 0
  });

  useEffect(() => {
    fetchPricePool();
  }, []);

  const fetchPricePool = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchParams.city) queryParams.append('city', searchParams.city);
      if (searchParams.checkin) queryParams.append('checkin', searchParams.checkin);
      if (searchParams.checkout) queryParams.append('checkout', searchParams.checkout);
      if (searchParams.adults) queryParams.append('adults', searchParams.adults.toString());
      if (searchParams.children) queryParams.append('children', searchParams.children.toString());
      if (searchParams.rooms) queryParams.append('rooms', searchParams.rooms.toString());
      if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);
      if (searchParams.stars) queryParams.append('stars', searchParams.stars);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/accommodation/price-pool?${queryParams}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      
      if (!response.ok) {
        throw new Error('Fiyat havuzu yüklenemedi');
      }

      const data = await response.json();
      setPricePool(data.pricePool || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPricePool();
  };

  const handleAddToPool = async () => {
    if (!selectedHotel || !selectedRoom) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/accommodation/price-pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          hotelId: selectedHotel.id,
          hotelName: selectedHotel.name,
          hotelAddress: selectedHotel.address,
          hotelCity: selectedHotel.city,
          hotelCountry: selectedHotel.country,
          hotelRating: selectedHotel.rating,
          hotelStars: selectedHotel.stars,
          hotelImage: selectedHotel.image,
          hotelAmenities: selectedHotel.amenities,
          roomType: selectedRoom.name,
          roomName: selectedRoom.name,
          roomDescription: selectedRoom.description,
          roomAmenities: selectedRoom.amenities,
          maxOccupancy: selectedRoom.maxOccupancy,
          bedType: selectedRoom.bedType,
          roomSize: selectedRoom.size,
          roomView: selectedRoom.view,
          basePrice: selectedRoom.basePrice,
          agentPrice: pricingData.agentPrice,
          customerPrice: pricingData.customerPrice,
          profitMargin: pricingData.profitMargin,
          profitPercentage: pricingData.profitPercentage,
          currency: selectedRoom.currency,
          validFrom: searchParams.checkin,
          validTo: searchParams.checkout,
          cancellationPolicy: selectedRoom.cancellationPolicy,
          breakfastIncluded: selectedRoom.breakfastIncluded,
          freeCancellation: selectedRoom.freeCancellation,
          updatedBy: user?.id || 'system'
        }),
      });

      if (!response.ok) {
        throw new Error('Fiyat havuzuna eklenemedi');
      }

      const result = await response.json();
      console.log('✅ Fiyat havuzuna eklendi:', result.message);
      
      // Formu sıfırla
      setSelectedHotel(null);
      setSelectedRoom(null);
      setShowAddForm(false);
      setPricingData({
        profitPercentage: 25,
        agentPrice: 0,
        customerPrice: 0,
        profitMargin: 0
      });
      
      // Fiyat havuzunu yenile
      fetchPricePool();
      
      alert('✅ Fiyat havuzuna başarıyla eklendi!');
    } catch (err: any) {
      console.error('Fiyat havuzuna ekleme hatası:', err);
      alert('❌ Fiyat havuzuna eklenemedi: ' + err.message);
    }
  };

  const handleProfitPercentageChange = (percentage: number) => {
    const agentPrice = selectedRoom?.basePrice * 0.75 || 0;
    const customerPrice = agentPrice / (1 - percentage / 100);
    const profitMargin = customerPrice - agentPrice;
    
    setPricingData({
      profitPercentage: percentage,
      agentPrice: Math.round(agentPrice * 100) / 100,
      customerPrice: Math.round(customerPrice * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (validTo: string) => {
    const now = new Date();
    const validToDate = new Date(validTo);
    const daysUntilExpiry = Math.ceil((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800';
    if (daysUntilExpiry < 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (validTo: string) => {
    const now = new Date();
    const validToDate = new Date(validTo);
    const daysUntilExpiry = Math.ceil((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Süresi Dolmuş';
    if (daysUntilExpiry < 7) return `${daysUntilExpiry} gün kaldı`;
    return 'Aktif';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Fiyat havuzu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPricePool}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {emojisEnabled ? '🏨 ' : ''}Otel Fiyat Havuzu
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {emojisEnabled ? '➕ ' : ''}Yeni Fiyat Ekle
              </button>
              <Link
                href="/accommodation/reservations"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {emojisEnabled ? '📋 ' : ''}Rezervasyonlar
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Tüm satış personelinin görebileceği otel fiyatları ve oda seçenekleri
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Arama Filtreleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <input
                type="text"
                placeholder="Şehir ara..."
                value={searchParams.city}
                onChange={(e) => setSearchParams((prev: any) => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giriş Tarihi
              </label>
              <input
                type="date"
                value={searchParams.checkin}
                onChange={(e) => setSearchParams((prev: any) => ({ ...prev, checkin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çıkış Tarihi
              </label>
              <input
                type="date"
                value={searchParams.checkout}
                onChange={(e) => setSearchParams((prev: any) => ({ ...prev, checkout: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıldız
              </label>
              <select
                value={searchParams.stars}
                onChange={(e) => setSearchParams((prev: any) => ({ ...prev, stars: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tümü</option>
                <option value="3">3+ Yıldız</option>
                <option value="4">4+ Yıldız</option>
                <option value="5">5 Yıldız</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🔍 Ara
            </button>
          </div>
        </div>

        {/* Price Pool List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {pricePool.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{emojisEnabled ? '🏨' : ''}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fiyat havuzunda otel bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                Arama kriterlerinize uygun fiyat bulunamadı veya henüz fiyat eklenmemiş
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                İlk Fiyatı Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Otel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyatlar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Geçerlilik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pricePool.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={item.hotelImage || '/vehicles/vito-1.jpg'}
                              alt={item.hotelName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.hotelName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.hotelCity}, {item.hotelCountry}
                            </div>
                            <div className="text-sm text-gray-500">
                              {'⭐'.repeat(item.hotelStars)} {item.hotelRating}/5
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.roomName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.bedType} • {item.maxOccupancy} kişi
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.roomSize} • {item.roomView}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex justify-between">
                            <span>Müşteri:</span>
                            <span className="font-semibold text-green-600">
                              €{item.customerPrice}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Acente:</span>
                            <span className="font-semibold text-blue-600">
                              €{item.agentPrice}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Kar:</span>
                            <span className="font-semibold text-purple-600">
                              €{item.profitMargin} ({item.profitPercentage}%)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatDate(item.validFrom)}</div>
                        <div className="text-gray-500">-</div>
                        <div>{formatDate(item.validTo)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.validTo)}`}>
                          {getStatusText(item.validTo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // TODO: Rezervasyon oluştur
                              alert('Rezervasyon oluşturma özelliği yakında eklenecek');
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            {emojisEnabled ? '📋 ' : ''}Rezervasyon
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Düzenle
                              alert('Düzenleme özelliği yakında eklenecek');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            ✏️ Düzenle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <AddToPricePoolModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onAdd={handleAddToPool}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            selectedHotel={selectedHotel}
            setSelectedHotel={setSelectedHotel}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            pricingData={pricingData}
            setPricingData={setPricingData}
            onProfitPercentageChange={handleProfitPercentageChange}
          />
        )}
      </div>
    </div>
  );
}

// Add to Price Pool Modal Component
function AddToPricePoolModal({
  isOpen,
  onClose,
  onAdd,
  searchParams,
  setSearchParams,
  selectedHotel,
  setSelectedHotel,
  selectedRoom,
  setSelectedRoom,
  pricingData,
  setPricingData,
  onProfitPercentageChange
}: any) {
  const { emojisEnabled } = useEmoji();
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchHotels = async () => {
    if (!searchParams.city) {
      alert('Lütfen şehir seçin');
      return;
    }

    setLoading(true);
    try {
      const hotels = await BookingApiReal.searchHotels({
        city: searchParams.city,
        checkin: searchParams.checkin,
        checkout: searchParams.checkout,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms
      });
      setHotels(hotels);
    } catch (error) {
      console.error('Otel arama hatası:', error);
      alert('Otel arama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const searchRooms = async (hotelId: string) => {
    setLoading(true);
    try {
      const rooms = await BookingApiReal.getRoomPrices(hotelId, {
        city: searchParams.city,
        checkin: searchParams.checkin,
        checkout: searchParams.checkout,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms
      });
      setRooms(rooms);
    } catch (error) {
      console.error('Oda arama hatası:', error);
      alert('Oda arama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotel: any) => {
    setSelectedHotel(hotel);
    setSelectedRoom(null);
    setRooms([]);
    searchRooms(hotel.id);
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    const pricing = BookingApiReal.calculateAgentPricing(room.basePrice, pricingData.profitPercentage);
    setPricingData(pricing);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {emojisEnabled ? '➕ ' : ''}Fiyat Havuzuna Ekle
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Otel Ara</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    placeholder="Şehir adı"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams((prev: any) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giriş Tarihi
                  </label>
                  <input
                    type="date"
                    value={searchParams.checkin}
                    onChange={(e) => setSearchParams((prev: any) => ({ ...prev, checkin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Çıkış Tarihi
                  </label>
                  <input
                    type="date"
                    value={searchParams.checkout}
                    onChange={(e) => setSearchParams((prev: any) => ({ ...prev, checkout: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={searchHotels}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Aranıyor...' : '🔍 Otel Ara'}
                </button>
              </div>
            </div>

            {/* Hotel Selection */}
            {hotels.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{emojisEnabled ? '🏨 ' : ''}Otel Seçin</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => handleHotelSelect(hotel)}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-blue-50 ${
                        selectedHotel?.id === hotel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-sm text-gray-500">
                            {hotel.city} • {'⭐'.repeat(hotel.stars)} {hotel.rating}/5
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Selection */}
            {rooms.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🛏️ Oda Seçin</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelect(room)}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-blue-50 ${
                        selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-sm text-gray-500">
                            {room.bedType} • {room.maxOccupancy} kişi • €{room.basePrice}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">€{room.basePrice}</div>
                          <div className="text-sm text-gray-500">{room.currency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {selectedRoom && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{emojisEnabled ? '💰 ' : ''}Fiyatlandırma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kar Oranı (%)
                    </label>
                    <input
                      type="number"
                      value={pricingData.profitPercentage}
                      onChange={(e) => onProfitPercentageChange(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acente Alış Fiyatı (€)
                    </label>
                    <input
                      type="number"
                      value={pricingData.agentPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Müşteri Satış Fiyatı (€)
                    </label>
                    <input
                      type="number"
                      value={pricingData.customerPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kar Marjı (€)
                    </label>
                    <input
                      type="number"
                      value={pricingData.profitMargin}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                İptal
              </button>
              <button
                onClick={onAdd}
                disabled={!selectedHotel || !selectedRoom}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                💾 Fiyat Havuzuna Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
