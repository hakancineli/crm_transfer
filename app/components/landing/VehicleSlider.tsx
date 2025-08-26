'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const images = [
  '/vehicles/vito-1.jpg',
  '/vehicles/vito-2.jpg',
  '/vehicles/vito-3.jpg',
  '/vehicles/vito-4.jpg',
  '/vehicles/vito-5.jpg',
  '/vehicles/vito-6.jpg',
  '/vehicles/vito-7.jpg',
  '/vehicles/vito-8.jpg',
  '/vehicles/vito-9.jpg',
  '/vehicles/vito-10.jpg',
  '/vehicles/vito-11.jpg',
  '/vehicles/vito-12.jpg',
];

export default function VehicleSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-white shadow">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)`, width: `${images.length * 100}%` }}
      >
        {images.map((src) => (
          <div key={src} className="relative w-full shrink-0 h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 bg-black">
            <Image src={src} alt="Mercedes Vito VIP" fill className="object-contain object-center" sizes="(max-width: 1280px) 100vw, 600px" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-green-600' : 'bg-gray-300'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
