'use client';

import { useState } from 'react';

interface SearchAndFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filter: string) => void;
    pageSizeControl?: React.ReactNode;
}

export function SearchAndFilter({ onSearch, onFilter, pageSizeControl }: SearchAndFilterProps) {
    const [activeFilter, setActiveFilter] = useState('today');
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
                ? 'bg-[#16A34A] text-white border-[#16A34A] hover:bg-[#15803D] shadow-md'
                : 'text-[#334155] dark:text-[#E2E8F0] bg-white dark:bg-[#1E293B] border-gray-300 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#273449] hover:border-gray-400 dark:hover:border-[#475569]'
        }`;
    };

    return (
        <div className="space-y-4">
            {/* Arama */}
            <div className="flex gap-4 items-end">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-[#94A3B8]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#334155] rounded-md leading-5 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-[#E5E7EB] placeholder-gray-500 dark:placeholder-[#94A3B8] focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-[#94A3B8] focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] sm:text-sm transition-colors duration-200"
                        placeholder="Voucher, güzergah veya yolcu ara..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-end gap-3">
                    <div className="relative">
                        <input
                            type="date"
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-[#334155] rounded-md leading-5 bg-white dark:bg-[#111827] text-gray-900 dark:text-[#E5E7EB] placeholder-gray-500 dark:placeholder-[#94A3B8] focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-[#94A3B8] focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] sm:text-sm transition-colors duration-200"
                            value={searchDate}
                            onChange={(e) => handleDateSearch(e.target.value)}
                        />
                    </div>
                    {pageSizeControl}
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