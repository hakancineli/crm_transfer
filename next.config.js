/** @type {import('next').NextConfig} */
const nextConfig = {
  // SEO optimizasyonları
  poweredByHeader: false,
  compress: true,
  
  // Image optimizasyonu
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/transfer',
        destination: '/customer-reservation',
        permanent: true,
      },
      {
        source: '/rezervasyon',
        destination: '/customer-reservation',
        permanent: true,
      },
      {
        source: '/reservations',
        destination: '/customer-reservation',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 