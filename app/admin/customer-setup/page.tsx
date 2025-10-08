'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';

interface CustomerSetupData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  initialUsers: {
    username: string;
    name: string;
    email: string;
    role: 'OPERATION' | 'SELLER' | 'ACCOUNTANT';
    password: string;
  }[];
}

export default function CustomerSetupPage() {
  const { user } = useAuth();
  const { isEnabled: isCustomerSetupEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState<CustomerSetupData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    initialUsers: [
      { username: '', name: '', email: '', role: 'OPERATION', password: '' },
      { username: '', name: '', email: '', role: 'SELLER', password: '' }
    ]
  });

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isCustomerSetupEnabled) {
      router.push('/admin');
      return;
    }
  }, [moduleLoading, isCustomerSetupEnabled, router]);

  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isCustomerSetupEnabled) {
    return null;
  }

  // Only SUPERUSER can access this page
  if (user?.role !== 'SUPERUSER') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Yetkisiz Erişim</h3>
          <p className="mt-2 text-sm text-red-700">
            Bu sayfaya sadece süper kullanıcılar erişebilir.
          </p>
        </div>
      </div>
    );
  }

  const handleCompanyInfoChange = (field: keyof Omit<CustomerSetupData, 'initialUsers'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      initialUsers: prev.initialUsers.map((user, i) => 
        i === index ? { ...user, [field]: value } : user
      )
    }));
  };

  const addUser = () => {
    setFormData(prev => ({
      ...prev,
      initialUsers: [...prev.initialUsers, { username: '', name: '', email: '', role: 'SELLER', password: '' }]
    }));
  };

  const removeUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      initialUsers: prev.initialUsers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customer-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.adminUser) {
          alert(`Müşteri kurulumu başarıyla tamamlandı!\n\nAdmin Kullanıcı:\nKullanıcı Adı: ${result.adminUser.username}\nE-posta: ${result.adminUser.email}\nŞifre: ${result.adminUser.password}`);
        } else {
          alert('Müşteri kurulumu başarıyla tamamlandı!');
        }
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          initialUsers: [
            { username: '', name: '', email: '', role: 'OPERATION', password: '' },
            { username: '', name: '', email: '', role: 'SELLER', password: '' }
          ]
        });
        setStep(1);
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      console.error('Setup error:', error);
      alert('Kurulum sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6" id="customer-setup-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Müşteri Kurulumu</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Şirket Bilgileri</span>
            <span className="text-sm text-gray-600">Kullanıcılar</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Şirket Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim Kişisi *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleCompanyInfoChange('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.companyName || !formData.contactPerson || !formData.email}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İleri
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">İlk Kullanıcılar</h2>
              <button
                onClick={addUser}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Kullanıcı Ekle
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.initialUsers.map((user, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Kullanıcı {index + 1}</h3>
                    {formData.initialUsers.length > 1 && (
                      <button
                        onClick={() => removeUser(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kullanıcı Adı *
                      </label>
                      <input
                        type="text"
                        value={user.username}
                        onChange={(e) => handleUserChange(index, 'username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => handleUserChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) => handleUserChange(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => handleUserChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="OPERATION">Operasyon</option>
                        <option value="SELLER">Satış</option>
                        <option value="ACCOUNTANT">Muhasebe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre *
                      </label>
                      <input
                        type="password"
                        value={user.password}
                        onChange={(e) => handleUserChange(index, 'password', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || formData.initialUsers.some(u => !u.username || !u.name || !u.email || !u.password)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kurulum Yapılıyor...' : 'Kurulumu Tamamla'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
