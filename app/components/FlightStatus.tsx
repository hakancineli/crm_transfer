'use client';

import { useState, useEffect } from 'react';
import { FlightInfo, FlightTracker } from '@/app/lib/flightTracker';

interface FlightStatusProps {
  flightCode: string;
  reservationDate: string;
  reservationTime: string;
  isArrival?: boolean; // Karşılama transferi mi?
}

export default function FlightStatus({ 
  flightCode, 
  reservationDate, 
  reservationTime, 
  isArrival = false 
}: FlightStatusProps) {
  const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flightCode || flightCode.trim() === '') {
      setLoading(false);
      return;
    }

    const fetchFlightInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/flights?flightNumber=${encodeURIComponent(flightCode)}`);
        
        if (!response.ok) {
          throw new Error('Uçuş bilgisi alınamadı');
        }
        
        const data = await response.json();
        setFlightInfo(data);
      } catch (err) {
        console.error('Uçuş bilgisi hatası:', err);
        setError('Uçuş bilgisi alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightInfo();
  }, [flightCode]);

  if (!flightCode || flightCode.trim() === '') {
    return (
      <div className="text-xs text-gray-400">
        Uçuş kodu yok
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span className="text-xs text-gray-500">Yükleniyor...</span>
      </div>
    );
  }

  if (error || !flightInfo) {
    return (
      <div className="text-xs text-gray-400">
        {flightCode}
      </div>
    );
  }

  const relevantInfo = isArrival ? flightInfo.arrival : flightInfo.departure;
  const statusColor = FlightTracker.getFlightStatusColor(relevantInfo.status);
  const statusText = FlightTracker.getFlightStatusText(relevantInfo.status);
  const delay = FlightTracker.calculateDelay(relevantInfo.scheduled, relevantInfo.actual);

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-700">{flightCode}</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      <div className="text-xs text-gray-500">
        <div>Planlanan: {FlightTracker.formatTime(relevantInfo.scheduled)}</div>
        {relevantInfo.actual && (
          <div>Gerçek: {FlightTracker.formatTime(relevantInfo.actual)}</div>
        )}
        {delay > 0 && (
          <div className="text-yellow-600 font-medium">
            +{delay} dk gecikme
          </div>
        )}
        {delay < 0 && (
          <div className="text-green-600 font-medium">
            {Math.abs(delay)} dk erken
          </div>
        )}
      </div>
      
      {'gate' in relevantInfo && relevantInfo.gate && (
        <div className="text-xs text-gray-500">
          Kapı: {relevantInfo.gate}
        </div>
      )}
    </div>
  );
}
