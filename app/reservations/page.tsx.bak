'use client';

import { useState } from 'react';
import ReservationList from './ReservationList';

export default function ReservationsPage() {
    const [title, setTitle] = useState('Tüm Rezervasyonlar');
    const [description, setDescription] = useState('Sistemdeki tüm rezervasyonları görüntüleyin ve yönetin.');

    const handleFilterChange = (filter: string) => {
        switch (filter) {
            case 'today':
                setTitle('Bugünün Transferleri');
                setDescription('Bugün gerçekleşecek transferleri görüntüleyin.');
                break;
            case 'tomorrow':
                setTitle('Yarının Transferleri');
                setDescription('Yarın gerçekleşecek transferleri görüntüleyin.');
                break;
            case 'thisWeek':
                setTitle('Bu Haftanın Transferleri');
                setDescription('Bu hafta gerçekleşecek transferleri görüntüleyin.');
                break;
            case 'assigned':
                setTitle('Şoför Atanmış Transferler');
                setDescription('Şoför atanmış transferleri görüntüleyin.');
                break;
            case 'unassigned':
                setTitle('Şoför Bekleyen Transferler');
                setDescription('Şoför atanmamış transferleri görüntüleyin.');
                break;
            default:
                setTitle('Tüm Rezervasyonlar');
                setDescription('Sistemdeki tüm rezervasyonları görüntüleyin ve yönetin.');
                break;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                <p className="mt-2 text-sm text-gray-600">
                    {description}
                </p>
            </div>
            <ReservationList onFilterChange={handleFilterChange} />
        </div>
    );
}