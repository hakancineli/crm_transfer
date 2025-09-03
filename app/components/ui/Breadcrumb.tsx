'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Varsayılan breadcrumb öğeleri
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Ana Sayfa', href: '/' }
  ];

  // Pathname'e göre breadcrumb öğelerini ekle
  if (pathname === '/customer-reservation') {
    defaultItems.push({ label: 'Rezervasyon', href: '/customer-reservation' });
  } else if (pathname.startsWith('/customer-reservation/')) {
    defaultItems.push({ label: 'Rezervasyon', href: '/customer-reservation' });
    if (pathname.includes('thank-you')) {
      defaultItems.push({ label: 'Teşekkürler', href: pathname });
    }
  }

  const breadcrumbItems = items || defaultItems;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
            {index === breadcrumbItems.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-green-600 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      
      {/* Schema.org BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": `https://protransfer.com.tr${item.href}`
            }))
          })
        }}
      />
    </nav>
  );
}
