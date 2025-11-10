import { useColorScheme as useRNColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

export function useColorScheme(): 'light' | 'dark' {
  const rnScheme = useRNColorScheme();
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Eğer React Native'den bir değer geldiyse kullan
    if (rnScheme) {
      setScheme(rnScheme);
      return;
    }

    // Web ortamında sistem tercihi kontrol et
    if (typeof window === 'undefined') return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // İlk kontrol
    if (darkModeQuery.matches) {
      setScheme('dark');
    } else {
      setScheme('light');
    }

    // Değişiklikleri dinle
    const handleChange = (e: MediaQueryListEvent) => {
      setScheme(e.matches ? 'dark' : 'light');
    };

    darkModeQuery.addEventListener('change', handleChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
    };
  }, [rnScheme]);

  return scheme;
}
