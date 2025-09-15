'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { useEmoji } from '@/app/contexts/EmojiContext';

interface ReservationTypeSelectorProps {
  onClose?: () => void;
  variant?: 'default' | 'header';
}

const ReservationTypeSelector = ({ onClose, variant = 'default' }: ReservationTypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { emojisEnabled } = useEmoji();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const accommodationEnabled = useModule('accommodation');
  const flightEnabled = useModule('flight');
  const tourEnabled = useModule('tour');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const reservationTypes = [
    {
      name: 'Transfer Rezervasyonu',
      href: '/admin/new-reservation',
      icon: '🚗',
      description: 'Havaalanı transfer hizmetleri',
      module: 'transfer',
      alwaysVisible: true
    },
    {
      name: 'Tur Rezervasyonu',
      href: '/admin/tour/reservations/new',
      icon: '🚌',
      description: 'Grup turları ve şehir turları',
      module: 'tour',
      alwaysVisible: false
    },
    {
      name: 'Konaklama Rezervasyonu',
      href: '/admin/accommodation/reservations/new',
      icon: '🏨',
      description: 'Otel ve konaklama rezervasyonları',
      module: 'accommodation',
      alwaysVisible: false
    }
  ];

  // Kullanıcının erişebileceği rezervasyon tiplerini filtrele
  const availableTypes = reservationTypes.filter(type => {
    if (type.alwaysVisible) return true;
    
    if (type.module === 'tour' && tourEnabled) return true;
    if (type.module === 'accommodation' && accommodationEnabled) return true;
    
    return false;
  });

  const handleTypeSelect = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isClient) {
    if (variant === 'header') {
      return (
        <Link
          href="/admin/new-reservation"
          className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          Yeni Rezervasyon
        </Link>
      );
    }
    
    return (
      <Link
        href="/admin/new-reservation"
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <span className="text-2xl">➕</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
            Yeni Rezervasyon
          </div>
          <div className="text-xs text-gray-500 group-hover:text-gray-400">
            Yeni rezervasyon oluştur
          </div>
        </div>
      </Link>
    );
  }

  // Eğer sadece transfer modülü varsa, direkt link göster
  if (availableTypes.length === 1) {
    if (variant === 'header') {
      return (
        <Link
          href={availableTypes[0].href}
          onClick={handleTypeSelect}
          className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          Yeni Rezervasyon
        </Link>
      );
    }
    
    return (
      <Link
        href={availableTypes[0].href}
        onClick={handleTypeSelect}
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <span className="text-2xl">{emojisEnabled ? availableTypes[0].icon : '➕'}</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
            Yeni Rezervasyon
          </div>
          <div className="text-xs text-gray-500 group-hover:text-gray-400">
            {availableTypes[0].description}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'header') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          Yeni Rezervasyon
          <svg 
            className={`ml-1 w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {availableTypes.map((type, index) => (
                <Link
                  key={type.name}
                  href={type.href}
                  onClick={handleTypeSelect}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-xl">{emojisEnabled ? type.icon : '📋'}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400">
                      {type.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
      >
        <span className="text-2xl">{emojisEnabled ? '➕' : '➕'}</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
            Yeni Rezervasyon
          </div>
          <div className="text-xs text-gray-500 group-hover:text-gray-400">
            Rezervasyon tipi seçin
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {availableTypes.map((type, index) => (
              <Link
                key={type.name}
                href={type.href}
                onClick={handleTypeSelect}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xl">{emojisEnabled ? type.icon : '📋'}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {type.name}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400">
                    {type.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTypeSelector;
