/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations for Vercel
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // Domain-based redirects are handled in `middleware.ts`.
  // Keep Next.js redirects empty to avoid conflicts across domains.
  async redirects() {
    return [
      // Block CRM paths on protransfer.com.tr at the edge
      {
        source: '/admin-login',
        has: [ { type: 'host', value: 'protransfer.com.tr' } ],
        destination: '/protransfer',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        has: [ { type: 'host', value: 'protransfer.com.tr' } ],
        destination: '/protransfer',
        permanent: false,
      },
      // Also block on www subdomain just in case
      {
        source: '/admin-login',
        has: [ { type: 'host', value: 'www.protransfer.com.tr' } ],
        destination: '/protransfer',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        has: [ { type: 'host', value: 'www.protransfer.com.tr' } ],
        destination: '/protransfer',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return [
      // Allow website and website API to pass through on protransfer.com.tr
      {
        source: '/website/:path*',
        has: [ { type: 'host', value: 'protransfer.com.tr' } ],
        destination: '/website/:path*',
      },
      {
        source: '/api/website/:path*',
        has: [ { type: 'host', value: 'protransfer.com.tr' } ],
        destination: '/api/website/:path*',
      },
      // Serve dedicated protransfer page at root for any other path on protransfer.com.tr
      {
        source: '/:path*',
        has: [ { type: 'host', value: 'protransfer.com.tr' } ],
        destination: '/protransfer',
      },
      // And for www subdomain
      {
        source: '/:path*',
        has: [ { type: 'host', value: 'www.protransfer.com.tr' } ],
        destination: '/protransfer',
      },
    ]
  },
  
  async headers() {
    // Development modunda CSP'yi tamamen devre dışı bırak
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      return []; // Development modunda CSP header'ı gönderme
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: https://maps.gstatic.com https://maps.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' data: blob:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 