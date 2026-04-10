'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { EmailService } from '@/app/lib/emailService';
import EditHotelBookingModal from '@/app/components/EditHotelBookingModal';
import HotelBookingStats from '@/app/components/HotelBookingStats';

interface HotelBooking {
  id: string;
  voucherNumber: string;
  hotelName: string;
  hotelAddress: string;
  roomType: string;
  checkin: Date;
  checkout: Date;
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  bookingReference: string;
  createdAt: Date;
}

export default function HotelReservationsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<HotelBooking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/accommodation/bookings', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      
      if (!response.ok) {
        throw new Error('Rezervasyonlar yüklenemedi');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status.toLowerCase() === filter;
    const matchesSearch = 
      booking.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'CONFIRMED': return 'Onaylandı';
      case 'CANCELLED': return 'İptal Edildi';
      case 'COMPLETED': return 'Tamamlandı';
      default: return status;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateNights = (checkin: Date | string, checkout: Date | string) => {
    return Math.ceil(
      (new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleSendEmail = async (booking: HotelBooking, type: 'confirmation' | 'cancellation' | 'modification') => {
    setSendingEmail(booking.id);
    
    try {
      let result;
      
      switch (type) {
        case 'confirmation':
          result = await EmailService.sendBookingConfirmation({
            voucherNumber: booking.voucherNumber,
            hotelName: booking.hotelName,
            hotelAddress: booking.hotelAddress,
            roomType: booking.roomType,
            checkin: booking.checkin.toISOString(),
            checkout: booking.checkout.toISOString(),
            adults: booking.adults,
            children: booking.children,
            rooms: booking.rooms,
            totalPrice: booking.totalPrice,
            currency: booking.currency,
            customerInfo: booking.customerInfo,
            specialRequests: booking.specialRequests,
            bookingReference: booking.bookingReference
          });
          break;
        
        case 'cancellation':
          result = await EmailService.sendBookingCancellation({
            voucherNumber: booking.voucherNumber,
            hotelName: booking.hotelName,
            customerInfo: booking.customerInfo,
            cancellationReason: 'Müşteri talebi'
          });
          break;
        
        case 'modification':
          result = await EmailService.sendBookingModification({
            voucherNumber: booking.voucherNumber,
            hotelName: booking.hotelName,
            customerInfo: booking.customerInfo,
            changes: 'Rezervasyon bilgilerinde değişiklik yapılmıştır.'
          });
          break;
      }

      if (result.success) {
        alert(`✅ E-posta başarıyla gönderildi!\n\nMesaj ID: ${result.messageId}`);
      } else {
        alert(`❌ E-posta gönderilemedi: ${result.error}`);
      }
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      alert('❌ E-posta gönderilirken hata oluştu');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleEditBooking = (booking: HotelBooking) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleSaveBooking = (updatedBooking: HotelBooking) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    );
    setShowEditModal(false);
    setEditingBooking(null);
  };

  const handleCancelBooking = async (booking: HotelBooking) => {
    if (!confirm(`"${booking.voucherNumber}" numaralı rezervasyonu iptal etmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/accommodation/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...booking,
          status: 'CANCELLED'
        }),
      });

      if (!response.ok) {
        throw new Error('Rezervasyon iptal edilemedi');
      }

      // Rezervasyonu güncelle
      const updatedBooking = { ...booking, status: 'CANCELLED' as const };
      setBookings(prev => 
        prev.map(b => b.id === booking.id ? updatedBooking : b)
      );

      // İptal e-postası gönder
      try {
        await EmailService.sendBookingCancellation({
          voucherNumber: booking.voucherNumber,
          hotelName: booking.hotelName,
          customerInfo: booking.customerInfo,
          cancellationReason: 'Müşteri talebi'
        });
        console.log('✅ İptal e-postası gönderildi');
      } catch (emailError) {
        console.warn('⚠️ İptal e-postası gönderilemedi:', emailError);
      }

      alert('✅ Rezervasyon başarıyla iptal edildi');
    } catch (error) {
      console.error('İptal hatası:', error);
      alert('❌ Rezervasyon iptal edilemedi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Rezervasyonlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Hata</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              🏨 Konaklama Rezervasyonları
            </h1>
            <div className="flex space-x-4">
              <Link
                href="/accommodation"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                ➕ Yeni Rezervasyon
              </Link>
              <Link
                href="/accommodation/reports"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                📊 Raporlar
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Tüm otel rezervasyonlarını yönetin ve takip edin
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 mb-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama
              </label>
              <input
                type="text"
                placeholder="Voucher, otel, müşteri adı veya e-posta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum Filtresi
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all">Tümü</option>
                <option value="pending">Beklemede</option>
                <option value="confirmed">Onaylandı</option>
                <option value="cancelled">İptal Edildi</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <HotelBookingStats bookings={bookings} />

        {/* Bookings List */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Rezervasyon bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Arama kriterlerinize uygun rezervasyon bulunamadı' : 'Henüz rezervasyon bulunmuyor'}
              </p>
              <Link
                href="/accommodation"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                İlk Rezervasyonu Oluştur
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 transition-colors duration-200">
                <thead className="bg-gray-50 dark:bg-slate-950/70 transition-colors duration-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Otel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarihler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gece
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900/90 divide-y divide-gray-200 dark:divide-slate-800 transition-colors duration-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.voucherNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.hotelName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.roomType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerInfo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerInfo.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.checkin)} - {formatDate(booking.checkout)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateNights(booking.checkin, booking.checkout)} gece
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          €{booking.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.rooms} oda
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/accommodation/voucher/${booking.voucherNumber}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️ Görüntüle
                          </Link>
                          <button
                            onClick={() => handleSendEmail(booking, 'confirmation')}
                            disabled={sendingEmail === booking.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {sendingEmail === booking.id ? '⏳' : '📧'} Onay E-postası
                          </button>
                          <button
                            onClick={() => handleSendEmail(booking, 'cancellation')}
                            disabled={sendingEmail === booking.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {sendingEmail === booking.id ? '⏳' : '❌'} İptal E-postası
                          </button>
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            ✏️ Düzenle
                          </button>
                          {booking.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="text-red-600 hover:text-red-900"
                            >
                              ❌ İptal Et
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <EditHotelBookingModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBooking(null);
          }}
          booking={editingBooking}
          onSave={handleSaveBooking}
        />
      </div>
    </div>
  );
}
