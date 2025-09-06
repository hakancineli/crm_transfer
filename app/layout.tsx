import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/ui/Header";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

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
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <Header />
            <main className="w-full pt-16 pb-6 px-4 sm:px-6 lg:px-8 print:p-0">
              {children}
            </main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
