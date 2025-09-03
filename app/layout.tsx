import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ProTransfer - İstanbul Transfer & Havalimanı Transfer Hizmeti",
    template: "%s | ProTransfer"
  },
  description: "İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) transfer hizmeti. 7/24 VIP Mercedes Vito, lüks sedan ve şehirler arası transfer. Sabit fiyat garantisi, uçuş takibi, karşılama hizmeti.",
  keywords: [
    "İstanbul transfer",
    "havalimanı transfer",
    "IST transfer",
    "SAW transfer",
    "Sabiha Gökçen transfer",
    "İstanbul Havalimanı transfer",
    "VIP transfer",
    "Mercedes Vito",
    "şehirler arası transfer",
    "transfer hizmeti",
    "rezervasyon",
    "chauffeur service",
    "airport transfer"
  ],
  authors: [{ name: "ProTransfer" }],
  creator: "ProTransfer",
  publisher: "ProTransfer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://protransfer.com.tr'),
  alternates: {
    canonical: '/',
    languages: {
      'tr': '/tr',
      'en': '/en',
      'de': '/de',
      'fr': '/fr',
      'ar': '/ar',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://protransfer.com.tr',
    title: 'ProTransfer - İstanbul Transfer & Havalimanı Transfer Hizmeti',
    description: 'İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) transfer hizmeti. 7/24 VIP Mercedes Vito, lüks sedan ve şehirler arası transfer.',
    siteName: 'ProTransfer',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ProTransfer Transfer Hizmeti',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProTransfer - İstanbul Transfer & Havalimanı Transfer Hizmeti',
    description: 'İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) transfer hizmeti. 7/24 VIP Mercedes Vito, lüks sedan ve şehirler arası transfer.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "ProTransfer",
              "description": "İstanbul Havalimanı ve Sabiha Gökçen transfer hizmeti",
              "url": "https://protransfer.com.tr",
              "telephone": "+905545812034",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "İstanbul",
                "addressCountry": "TR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "41.0082",
                "longitude": "28.9784"
              },
              "openingHours": "Mo-Su 00:00-23:59",
              "priceRange": "$$",
              "serviceType": "Transfer Service",
              "areaServed": ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],
              "sameAs": [
                "https://wa.me/905545812034"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <a href="#main-content" className="skip-link">
            Ana içeriğe geç
          </a>
          <main id="main-content" className="w-full pt-16 pb-6 px-4 sm:px-6 lg:px-8 print:p-0">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
