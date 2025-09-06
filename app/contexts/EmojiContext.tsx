'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EmojiContextType {
  emojisEnabled: boolean;
  toggleEmojis: () => void;
  setEmojisEnabled: (enabled: boolean) => void;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

export function EmojiProvider({ children }: { children: React.ReactNode }) {
  const [emojisEnabled, setEmojisEnabledState] = useState(true);

  useEffect(() => {
    // SSR sırasında localStorage'a erişmeyi önle
    if (typeof window === 'undefined') {
      return;
    }
    
    // LocalStorage'dan emoji ayarını yükle
    const saved = localStorage.getItem('emojisEnabled');
    if (saved !== null) {
      const parsedValue = JSON.parse(saved);
      console.log('Loading emoji setting from localStorage:', parsedValue);
      setEmojisEnabledState(parsedValue);
    } else {
      console.log('No emoji setting found in localStorage, using default: true');
    }
  }, []);

  const setEmojisEnabled = (enabled: boolean) => {
    setEmojisEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('emojisEnabled', JSON.stringify(enabled));
    }
  };

  const toggleEmojis = () => {
    const newValue = !emojisEnabled;
    console.log('Emoji toggle:', emojisEnabled, '->', newValue);
    setEmojisEnabledState(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('emojisEnabled', JSON.stringify(newValue));
    }
  };

  return (
    <EmojiContext.Provider value={{ emojisEnabled, toggleEmojis, setEmojisEnabled }}>
      {children}
    </EmojiContext.Provider>
  );
}

export function useEmoji() {
  const context = useContext(EmojiContext);
  if (context === undefined) {
    throw new Error('useEmoji must be used within an EmojiProvider');
  }
  return context;
}
