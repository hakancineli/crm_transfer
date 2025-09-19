/** @type {import('next').NextConfig} */
const nextConfig = {
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