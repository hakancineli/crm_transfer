import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/ui/Header";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { EmojiProvider } from "./contexts/EmojiContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.proacente.com"),
  title: {
    default: "Pro Acente | Turizm Acente Yönetim Sistemi, Transfer ve Tur Operasyon Yazılımı",
    template: "%s | Pro Acente",
  },
  description:
    "Pro Acente; turizm acenteleri için transfer, tur, operasyon, muhasebe, WhatsApp, yapay zeka ve website modüllerini tek platformda birleştiren yönetim sistemidir.",
  keywords: [
    "turizm acente yönetim sistemi",
    "acente otomasyonu",
    "transfer yönetim yazılımı",
    "tur operatörü yazılımı",
    "tur rezervasyon sistemi",
    "transfer ve tur yazılımı",
    "whatsapp entegrasyonlu crm",
    "yapay zeka destekli acente yazılımı",
    "online rezervasyon yazılımı",
    "operasyon ve muhasebe yazılımı",
    "acente crm",
  ],
  alternates: {
    canonical: "/",
    languages: { tr: "/", en: "/en", ar: "/ar", de: "/de" },
  },
  openGraph: {
    type: "website",
    url: "https://www.proacente.com/",
    siteName: "Pro Acente",
    title: "Pro Acente | Turizm Acente Yönetim Sistemi",
    description:
      "Transfer, tur, operasyon, muhasebe, WhatsApp ve yapay zeka destekli süreçleri tek panelden yönetin.",
    images: [
      { url: "/screenshots/dashboard.png", width: 1200, height: 630, alt: "Pro Acente dashboard" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Acente | Turizm Acente Yönetim Sistemi",
    description:
      "Transfer, tur, muhasebe, website, WhatsApp ve yapay zeka modüllerini tek platformda yönetin.",
    images: ["/screenshots/dashboard.png"],
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
        <GoogleAnalytics />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('crm-theme') || 'light';
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=tr&v=weekly&loading=async`}
          strategy="afterInteractive"
        />
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <EmojiProvider>
                <Header />
                <main className="w-full pt-16 pb-6 px-4 sm:px-6 lg:px-8 print:p-0 bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-200">
                  {children}
                </main>
              </EmojiProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
