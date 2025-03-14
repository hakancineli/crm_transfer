import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/ui/Header";

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
    <html lang="tr">
      <body className={inter.className}>
        <div className="print:hidden">
          <Header />
        </div>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:p-0">
          {children}
        </main>
      </body>
    </html>
  );
}
