import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/ui/Header";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { EmojiProvider } from "./contexts/EmojiContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://protransfer.com"),
  title: {
    default: "Pro Transfer - İstanbul Havalimanı Transfer Hizmeti",
    template: "%s | Pro Transfer",
  },
  description:
    "Pro Transfer ile İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) VIP transfer. 7/24 Mercedes Vito, sabit fiyat, uçuş takibi ve karşılama hizmeti.",
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
    "airport transfer",
  ],
  alternates: {
    canonical: "/",
    languages: { tr: "/", en: "/en", ar: "/ar", de: "/de" },
  },
  openGraph: {
    type: "website",
    url: "https://protransfer.com/",
    siteName: "Pro Transfer",
    title: "Pro Transfer - İstanbul Havalimanı Transfer Hizmeti",
    description:
      "Pro Transfer ile IST ve SAW VIP transfer. Sabit fiyat, uçuş takibi, karşılama.",
    images: [
      { url: "/seref-vural-tours/vito-1.jpg", width: 1200, height: 630, alt: "Pro Transfer Vito" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Transfer - İstanbul Havalimanı Transfer",
    description:
      "Pro Transfer ile IST ve SAW VIP transfer. Sabit fiyat, uçuş takibi, karşılama.",
    images: ["/seref-vural-tours/vito-1.jpg"],
  },
  robots: { index: true, follow: true },
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
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Comprehensive error filtering system
              (function() {
                // Store original console methods
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalLog = console.log;
                
                // Filter function for extension errors
                function shouldFilter(message) {
                  const filterPatterns = [
                    'chrome-extension://',
                    'runtime.lastError',
                    'querySelector',
                    'microsofttranslator.com',
                    'api-edge.cognitive',
                    'message port closed',
                    'listener indicated an asynchronous response',
                    'X-Frame-Options may only be set via an HTTP header',
                    'Extra attributes from the server: rp-extension',
                    'Error handling response: TypeError: Cannot read properties of undefined',
                    'Unchecked runtime.lastError: The message port closed before a response was received'
                  ];
                  
                  return filterPatterns.some(pattern => 
                    message.toLowerCase().includes(pattern.toLowerCase())
                  );
                }
                
                // Override console methods
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (shouldFilter(message)) return;
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (shouldFilter(message)) return;
                  originalWarn.apply(console, args);
                };
                
                console.log = function(...args) {
                  const message = args.join(' ');
                  if (shouldFilter(message)) return;
                  originalLog.apply(console, args);
                };
                
                // Prevent extension errors from appearing
                window.addEventListener('error', function(e) {
                  const errorMessage = e.message || e.error?.message || '';
                  if (shouldFilter(errorMessage)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
                
                // Prevent unhandled promise rejections from extensions
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && shouldFilter(e.reason.toString())) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // Override fetch to prevent unwanted API calls
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                  if (typeof url === 'string' && shouldFilter(url)) {
                    return Promise.reject(new Error('Blocked by filter'));
                  }
                  return originalFetch.call(this, url, options);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=tr&v=weekly&loading=async`}
          strategy="afterInteractive"
        />
        <AuthProvider>
          <LanguageProvider>
            <EmojiProvider>
              <Header />
              <main className="w-full pt-16 pb-6 px-4 sm:px-6 lg:px-8 print:p-0">
                {children}
              </main>
            </EmojiProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
