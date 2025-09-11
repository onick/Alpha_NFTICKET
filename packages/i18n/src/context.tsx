import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Translations, TranslationParams, I18nConfig } from './types';
import { loadTranslations } from './loader';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  config: I18nConfig;
  initialLocale?: Locale;
}

export function I18nProvider({ 
  children, 
  config, 
  initialLocale 
}: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(
    initialLocale || config.defaultLocale
  );
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    loadTranslations(locale).then(setTranslations);
  }, [locale]);

  const t = (key: string, params?: TranslationParams): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        if (config.fallback && locale !== config.defaultLocale) {
          return `[${key}]`;
        }
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}