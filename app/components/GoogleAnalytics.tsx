'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const GA_ID = 'G-VQE81CFZCV';
const EXCLUDED_PREFIXES = ['/admin', '/api'];
const EXCLUDED_ROUTES = ['/admin-login', '/login', '/staff-login'];

export default function GoogleAnalytics() {
  const pathname = usePathname();

  const isExcluded =
    EXCLUDED_ROUTES.includes(pathname) ||
    EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (isExcluded) return;
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', GA_ID, { page_path: pathname });
    }
  }, [isExcluded, pathname]);

  if (isExcluded) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  );
}
