'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const vehicles = [
  {
    id: 1,
    name: 'Mercedes Vito',
    image: '/vehicles/vito-1.jpg',
    alt: 'Mercedes Vito VIP transfer aracı'
  },
  {
    id: 2,
    name: 'Mercedes Vito Premium',
    image: '/vehicles/vito-2.jpg',
    alt: 'Mercedes Vito Premium VIP transfer aracı'
  },
  {
    id: 3,
    name: 'Lüks Sedan',
    image: '/vehicles/vito-3.jpg',
    alt: 'Lüks sedan VIP transfer aracı'
  }
];

export default function VehicleSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % vehicles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <div className="aspect-[4/3] relative">
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={vehicle.image}
              alt={vehicle.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
              quality={85}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg">{vehicle.name}</h3>
              <p className="text-white/90 text-sm">VIP Transfer Hizmeti</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {vehicles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}


