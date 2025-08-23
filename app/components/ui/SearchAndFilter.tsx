'use client';

import { useState } from 'react';

interface SearchAndFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filter: string) => void;
}

export function SearchAndFilter({ onSearch, onFilter }: SearchAndFilterProps) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
        onFilter(filter);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const handleDateSearch = (date: string) => {
        setSearchDate(date);
        onSearch(date);
    };

    const getButtonClass = (filter: string) => {
        const baseClass = "inline-flex items-center px-4 py-2 border shadow-sm text-sm font-semibold rounded-lg transition-all duration-200";
        return `${baseClass} ${
            activeFilter === filter
                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-md'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`;
    };

    return (
        <div className="space-y-4">
            {/* Arama */}
            <div className="flex gap-4 max-w-lg">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Voucher, güzergah veya yolcu ara..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <input
                        type="date"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={searchDate}
                        onChange={(e) => handleDateSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleFilterClick('today')}
                    className={getButtonClass('today')}
                >
                    Bugün
                </button>
                <button
                    onClick={() => handleFilterClick('tomorrow')}
                    className={getButtonClass('tomorrow')}
                >
                    Yarın
                </button>
                <button
                    onClick={() => handleFilterClick('thisWeek')}
                    className={getButtonClass('thisWeek')}
                >
                    Bu Hafta
                </button>
                <button
                    onClick={() => handleFilterClick('assigned')}
                    className={getButtonClass('assigned')}
                >
                    Şoför Atanmış
                </button>
                <button
                    onClick={() => handleFilterClick('unassigned')}
                    className={getButtonClass('unassigned')}
                >
                    Şoför Bekleniyor
                </button>
                <button
                    onClick={() => handleFilterClick('all')}
                    className={getButtonClass('all')}
                >
                    Tümü
                </button>
            </div>
        </div>
    );
} 