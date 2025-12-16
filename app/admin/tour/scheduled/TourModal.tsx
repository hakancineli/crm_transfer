'use client';

import { useState, useEffect } from 'react';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    tour?: any;
}

export default function TourModal({ isOpen, onClose, onSave, tour }: TourModalProps) {
    const [formData, setFormData] = useState({
        routeId: '',
        startDate: '',
        startTime: '09:00',
        vehicleId: '',
        driverId: '',
        guideId: '',
        capacity: ''
    });

    const [routes, setRoutes] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
            if (tour) {
                setFormData({
                    routeId: tour.routeId,
                    startDate: new Date(tour.startDate).toISOString().split('T')[0],
                    startTime: tour.startTime || '09:00',
                    vehicleId: tour.vehicleId || '',
                    driverId: tour.driverId || '',
                    guideId: tour.guideId || '',
                    capacity: tour.capacity?.toString() || ''
                });
            } else {
                setFormData({
                    routeId: '',
                    startDate: new Date().toISOString().split('T')[0],
                    startTime: '09:00',
                    vehicleId: '',
                    driverId: '',
                    guideId: '',
                    capacity: ''
                });
            }
        }
    }, [isOpen, tour]);

    const fetchDependencies = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [routesRes, vehiclesRes, driversRes] = await Promise.all([
                fetch('/api/tour-routes', { headers }),
                fetch('/api/vehicles', { headers }),
                fetch('/api/drivers', { headers })
            ]);

            if (routesRes.ok) setRoutes(await routesRes.json());
            if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
            if (driversRes.ok) setDrivers(await driversRes.json());

        } catch (error) {
            console.error('Error fetching dependencies:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = tour ? `/api/tours/${tour.id}` : '/api/tours';
            const method = tour ? 'PUT' : 'POST';

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
            console.error('Error saving tour:', error);
            alert('Kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{tour ? 'Turu Düzenle' : 'Yeni Tur Planla'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Güzergah *</label>
                        <select
                            required
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                            value={formData.routeId}
                            onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                        >
                            <option value="">Seçiniz</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.duration} gün)</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tarih *</label>
                            <input
                                type="date"
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Saat</label>
                            <input
                                type="time"
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Araç</label>
                        <select
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                            value={formData.vehicleId}
                            onChange={e => {
                                const vehicle = vehicles.find(v => v.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    vehicleId: e.target.value,
                                    capacity: vehicle ? vehicle.capacity.toString() : formData.capacity
                                });
                            }}
                        >
                            <option value="">Araç Seçiniz</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.licensePlate} - {v.type} ({v.capacity} Kişilik)</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sürücü</label>
                            <select
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={formData.driverId}
                                onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                            >
                                <option value="">Sürücü Seçiniz</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                            <input
                                type="number"
                                className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rehber</label>
                        <input
                            type="text"
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                            placeholder="Rehber Adı (Opsiyonel)"
                            value={formData.guideId}
                            onChange={e => setFormData({ ...formData, guideId: e.target.value })}
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
