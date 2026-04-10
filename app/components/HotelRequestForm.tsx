'use client';

import { useState } from 'react';
import { BookingApiService } from '@/app/lib/bookingApi';

interface HotelRequestFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function HotelRequestForm({ onSubmit, onCancel }: HotelRequestFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    checkin: '',
    checkout: '',
    adults: 2,
    children: 0,
    rooms: 1,
    city: '',
    region: '',
    budget: '',
    roomType: '',
    breakfast: false,
    amenities: [] as string[],
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const popularCities = BookingApiService.getPopularCities();
  const availableAmenities = BookingApiService.getAmenities();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(id => id !== amenityId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Müşteri adı gerekli';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefon numarası gerekli';
    }

    if (!formData.checkin) {
      newErrors.checkin = 'Giriş tarihi gerekli';
    }

    if (!formData.checkout) {
      newErrors.checkout = 'Çıkış tarihi gerekli';
    } else if (formData.checkin && formData.checkout <= formData.checkin) {
      newErrors.checkout = 'Çıkış tarihi giriş tarihinden sonra olmalı';
    }

    if (!formData.city) {
      newErrors.city = 'Şehir seçimi gerekli';
    }

    if (formData.adults < 1) {
      newErrors.adults = 'En az 1 yetişkin gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 max-w-2xl mx-auto transition-colors duration-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">🏨 Otel Konaklama Talebi</h2>
        <p className="text-gray-600 dark:text-slate-400">Müşteri tercihlerinizi belirtin, size en uygun otelleri bulalım</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Müşteri Bilgileri */}
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">👤 Müşteri Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
                placeholder="Müşteri adı soyadı"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.customerEmail ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
                placeholder="ornek@email.com"
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.customerPhone ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
                placeholder="+90 555 123 45 67"
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tarih ve Misafir Bilgileri */}
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">📅 Tarih ve Misafir Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giriş Tarihi *
              </label>
              <input
                type="date"
                name="checkin"
                value={formData.checkin}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.checkin ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              />
              {errors.checkin && (
                <p className="text-red-500 text-sm mt-1">{errors.checkin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çıkış Tarihi *
              </label>
              <input
                type="date"
                name="checkout"
                value={formData.checkout}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.checkout ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              />
              {errors.checkout && (
                <p className="text-red-500 text-sm mt-1">{errors.checkout}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Yetişkin Sayısı *
              </label>
              <input
                type="number"
                name="adults"
                value={formData.adults}
                onChange={handleInputChange}
                min="1"
                max="10"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.adults ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              />
              {errors.adults && (
                <p className="text-red-500 text-sm mt-1">{errors.adults}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çocuk Sayısı
              </label>
              <input
                type="number"
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oda Sayısı
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Lokasyon ve Bütçe */}
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">📍 Lokasyon ve Bütçe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şehir *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 ${
                  errors.city ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              >
                <option value="">Şehir seçin</option>
                {popularCities.map(city => (
                  <option key={city.id} value={city.name}>
                    {city.name} ({city.region})
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bölge (Opsiyonel)
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Örn: Sultanahmet, Lara, Goreme"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bütçe (EUR) - Gece başına
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="0"
                step="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Örn: 100"
              />
            </div>
          </div>
        </div>

        {/* Oda Tercihleri */}
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">🛏️ Oda Tercihleri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oda Tipi
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Oda tipi seçin</option>
                <option value="single">Tek Kişilik</option>
                <option value="double">Çift Kişilik</option>
                <option value="twin">İki Tek Yatak</option>
                <option value="triple">Üç Kişilik</option>
                <option value="family">Aile Odası</option>
                <option value="suite">Suit</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="breakfast"
                checked={formData.breakfast}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-slate-300">
                🥐 Kahvaltı dahil
              </label>
            </div>
          </div>
        </div>

        {/* Otel Özellikleri */}
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">⭐ Otel Özellikleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableAmenities.map(amenity => (
              <div key={amenity.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={amenity.id}
                  checked={formData.amenities.includes(amenity.id)}
                  onChange={(e) => handleAmenityChange(amenity.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={amenity.id} className="ml-2 block text-sm text-gray-700">
                  {amenity.icon} {amenity.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Özel İstekler */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Özel İstekler</h3>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🏨 Otel Ara
          </button>
        </div>
      </form>
    </div>
  );
}
