'use client';

import { useState, useEffect } from 'react';

interface Customer {
    id?: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    passportNumber: string;
    nationality: string;
    notes: string;
}

interface TourCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    customer?: Customer;
}

export default function TourCustomerModal({ isOpen, onClose, onSave, customer }: TourCustomerModalProps) {
    const [formData, setFormData] = useState<Customer>({
        name: '',
        surname: '',
        email: '',
        phone: '',
        passportNumber: '',
        nationality: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData(customer);
        } else {
            setFormData({
                name: '',
                surname: '',
                email: '',
                phone: '',
                passportNumber: '',
                nationality: '',
                notes: ''
            });
        }
    }, [customer, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = customer ? `/api/tour-customers/${customer.id}` : '/api/tour-customers';
            const method = customer ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                const error = await response.json();
                alert(error.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{customer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">İsim *</label>
                            <input
                                type="text"
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Soyisim *</label>
                            <input
                                type="text"
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.surname}
                                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefon</label>
                        <input
                            type="tel"
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta</label>
                        <input
                            type="email"
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pasaport No</label>
                            <input
                                type="text"
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.passportNumber}
                                onChange={e => setFormData({ ...formData, passportNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Uyruk</label>
                            <input
                                type="text"
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.nationality}
                                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notlar</label>
                        <textarea
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                            rows={3}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
