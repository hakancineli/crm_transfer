'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

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

const transparent1x1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/epb7OQAAAAASUVORK5CYII=';

export default function VehicleSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const goPrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);
  const goNext = () => setIndex((prev) => (prev + 1) % images.length);

  const eagerSet = useMemo(() => {
    const next = (index + 1) % images.length;
    const prev = (index - 1 + images.length) % images.length;
    return new Set([images[index], images[next], images[prev]]);
  }, [index]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-white shadow">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)`, width: `${images.length * 100}%` }}
      >
        {images.map((src) => {
          const isEager = eagerSet.has(src);
          return (
            <div key={src} className="relative w-full shrink-0 aspect-video max-h-[420px] sm:max-h-[480px] lg:max-h-[520px] bg-white">
              <Image
                src={src}
                alt="Mercedes Vito VIP"
                fill
                className="object-contain object-center"
                sizes="100vw"
                priority={isEager}
                loading={isEager ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL={transparent1x1}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Önceki"
        onClick={goPrev}
        className="absolute left-0 top-0 h-full w-1/5 cursor-pointer bg-transparent hover:bg-black/5 transition-colors"
      />
      <button
        type="button"
        aria-label="Sonraki"
        onClick={goNext}
        className="absolute right-0 top-0 h-full w-1/5 cursor-pointer bg-transparent hover:bg-black/5 transition-colors"
      />

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
