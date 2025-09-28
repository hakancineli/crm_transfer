'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { ArrowLeft, Calendar, MapPin, Users, Phone, Mail, Eye, CheckCircle, XCircle } from 'lucide-react';

interface WebsiteReservation {
  id: string;
  voucherNumber: string;
  type: string;
  from: string;
  to: string;
  date: string;
  time: string;
  passengerNames: string[];
  phoneNumber: string;
  email?: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  notes?: string;
}

export default function WebsiteReservationsPage() {
  const { user } = useAuth();
  const { isEnabled: websiteEnabled, isLoading } = useModule('website');
  const [reservations, setReservations] = useState<WebsiteReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<WebsiteReservation | null>(null);

  useEffect(() => {
    if (websiteEnabled) {
      fetchWebsiteReservations();
    }
  }, [websiteEnabled]);

  const fetchWebsiteReservations = async () => {
    try {
      const response = await fetch('/api/reservations?source=website');
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching website reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!websiteEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Website Modülü Kapalı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Website modülünü kullanmak için lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <a
              href="/admin/website"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Geri Dön
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Website Rezervasyonları</h1>
          <p className="mt-2 text-gray-600">
            Website üzerinden gelen rezervasyon taleplerini görüntüleyin ve yönetin
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Rezervasyon</p>
                <p className="text-2xl font-bold text-blue-600">{reservations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.status.toLowerCase() === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Onaylanan</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.status.toLowerCase() === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bu Ay</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reservations.filter(r => {
                    const reservationDate = new Date(r.createdAt);
                    const currentDate = new Date();
                    return reservationDate.getMonth() === currentDate.getMonth() && 
                           reservationDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rezervasyon Listesi</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz rezervasyon yok</h3>
              <p className="mt-1 text-sm text-gray-500">
                Website üzerinden henüz rezervasyon talebi gelmemiş.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Güzergah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih/Saat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yolcular
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
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
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.voucherNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {reservation.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{reservation.from} → {reservation.to}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{reservation.date} {reservation.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{reservation.passengerNames.length} kişi</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{reservation.phoneNumber}</span>
                        </div>
                        {reservation.email && (
                          <div className="flex items-center mt-1">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{reservation.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{reservation.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reservation Detail Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Rezervasyon Detayı</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Voucher No</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.voucherNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tip</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nereden</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.from}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nereye</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.to}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tarih</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Saat</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.time}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Yolcular</label>
                  <div className="mt-1">
                    {selectedReservation.passengerNames.map((name, index) => (
                      <p key={index} className="text-sm text-gray-900">{name}</p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.email || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fiyat</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.price} {selectedReservation.currency}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durum</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusIcon(selectedReservation.status)}
                      <span className="ml-1">{selectedReservation.status}</span>
                    </span>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notlar</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReservation.notes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rezervasyon Tarihi</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedReservation.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
