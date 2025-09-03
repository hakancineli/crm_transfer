'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  onDistanceCalculated: (distance: number) => void;
  onRouteCalculated: (route: any) => void;
  fromLocation: string;
  toLocation: string;
}

export default function GoogleMap({ onDistanceCalculated, onRouteCalculated, fromLocation, toLocation }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 41.0082, lng: 28.9784 }, // İstanbul merkezi
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        const directionsServiceInstance = new google.maps.DirectionsService();
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false
        });
        const geocoderInstance = new google.maps.Geocoder();

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
        setGeocoder(geocoderInstance);
      }
    });
  }, []);

  useEffect(() => {
    if (fromLocation && toLocation && directionsService && directionsRenderer && geocoder) {
      // Geocoding ile koordinatları bul
      Promise.all([
        new Promise<google.maps.LatLng>((resolve, reject) => {
          geocoder.geocode({ address: fromLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(new Error('From location not found'));
            }
          });
        }),
        new Promise<google.maps.LatLng>((resolve, reject) => {
          geocoder.geocode({ address: toLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(new Error('To location not found'));
            }
          });
        })
      ]).then(([fromLatLng, toLatLng]) => {
        // Rota hesapla
        directionsService.route({
          origin: fromLatLng,
          destination: toLatLng,
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            
            // Mesafe hesapla (km cinsinden)
            const distance = result.routes[0].legs[0].distance?.value || 0;
            const distanceKm = distance / 1000;
            
            onDistanceCalculated(distanceKm);
            onRouteCalculated(result);
          }
        });
      }).catch(error => {
        console.error('Geocoding error:', error);
      });
    }
  }, [fromLocation, toLocation, directionsService, directionsRenderer, geocoder, onDistanceCalculated, onRouteCalculated]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
