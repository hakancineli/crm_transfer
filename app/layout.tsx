import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/ui/Header";
import { LanguageProvider } from "./contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProTransfer CRM",
  description: "Transfer rezervasyon yönetim sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Header />
          <main className="w-full pt-16 pb-6 px-4 sm:px-6 lg:px-8 print:p-0">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
