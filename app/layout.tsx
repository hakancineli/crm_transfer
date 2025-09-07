import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/ui/Header";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { EmojiProvider } from "./contexts/EmojiContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.protransfer.com.tr"),
  title: {
    default: "ProTransfer - İstanbul Havalimanı Transfer Hizmeti",
    template: "%s | ProTransfer",
  },
  description:
    "İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) VIP transfer. 7/24 Mercedes Vito, lüks sedan, şehirler arası transfer. Sabit fiyat, uçuş takibi, karşılama.",
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
    url: "https://www.protransfer.com.tr/",
    siteName: "ProTransfer",
    title: "ProTransfer - İstanbul Havalimanı Transfer",
    description:
      "IST ve SAW için VIP transfer. Sabit fiyat, uçuş takibi, karşılama hizmeti.",
    images: [
      { url: "/logo.svg", width: 1200, height: 630, alt: "ProTransfer" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTransfer - İstanbul Havalimanı Transfer",
    description:
      "IST ve SAW için VIP transfer. Sabit fiyat, uçuş takibi, karşılama hizmeti.",
    images: ["/logo.svg"],
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
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self';" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent extension errors from appearing in console
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('chrome-extension://')) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
              
              // Override console.error to filter extension errors
              const originalError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('chrome-extension://') || 
                    message.includes('runtime.lastError') ||
                    message.includes('querySelector') ||
                    message.includes('microsofttranslator.com') ||
                    message.includes('api-edge.cognitive')) {
                  return;
                }
                originalError.apply(console, args);
              };
              
              // Override fetch to prevent Microsoft Translator calls
              const originalFetch = window.fetch;
              window.fetch = function(url, options) {
                if (typeof url === 'string' && url.includes('microsofttranslator.com')) {
                  return Promise.reject(new Error('Translation service blocked'));
                }
                return originalFetch.call(this, url, options);
              };
            `,
          }}
        />
      </head>
      <body className={inter.className}>
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
