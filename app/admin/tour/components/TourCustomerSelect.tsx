'use client';

import { useState, useEffect } from 'react';

interface Customer {
    id: string;
    name: string;
    surname: string;
    passportNumber: string;
}

interface TourCustomerSelectProps {
    onSelect: (customer: Customer) => void;
}

export default function TourCustomerSelect({ onSelect }: TourCustomerSelectProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 2) {
                searchCustomers();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const searchCustomers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tour-customers?search=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri Ara</label>
            <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="İsim, pasaport veya telefon ile..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {loading && <div className="absolute right-3 top-9 text-gray-500">...</div>}

            {results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {results.map((customer) => (
                        <div
                            key={customer.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                onSelect(customer);
                                setQuery(`${customer.name} ${customer.surname}`);
                                setResults([]);
                            }}
                        >
                            <div className="font-medium">{customer.name} {customer.surname}</div>
                            <div className="text-xs text-gray-500">{customer.passportNumber}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
