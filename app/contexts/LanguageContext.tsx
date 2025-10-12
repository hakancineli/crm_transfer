'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'tr' | 'de' | 'fr' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('tr');
  const [translations, setTranslations] = useState<any>({});
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // Local storage'dan dil tercihini al
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ar', 'tr', 'de', 'fr', 'ru'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Dil dosyasını yükle
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        // Bazı hostinglerde content-type hatalı gelebilir; yine de JSON parse dene
        let data: any = {};
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Invalid JSON body for translations');
        }
        setTranslations(data || {});
        setReady(true);
      } catch (error) {
        console.error(`Failed to load ${language} translations:`, error);
        // Fallback olarak İngilizce yükle
        try {
          const response = await fetch('/locales/en.json', { cache: 'no-store' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          let data: any = {};
          try {
            data = await response.json();
          } catch (e) {
            throw new Error('Invalid JSON body for fallback');
          }
          setTranslations(data || {});
          setReady(true);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
          // En kötü senaryoda boş çeviri ile devam et
          setTranslations({});
          setReady(true);
        }
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    // Eğer çeviriler henüz yüklenmemişse, anahtarı döndür
    if (!translations || Object.keys(translations).length === 0) {
      return key;
    }
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Anahtar bulunamazsa anahtarı döndür
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    dir
  };

  return (
    <LanguageContext.Provider value={value}>
      {ready ? (
        <div dir={dir} lang={language} suppressHydrationWarning>
          {children}
        </div>
      ) : null}
    </LanguageContext.Provider>
  );
};
