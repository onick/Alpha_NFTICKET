import { Locale, Translations } from './types';
import esTranslations from './locales/es';
import enTranslations from './locales/en';

const translations = {
  es: esTranslations,
  en: enTranslations,
};

export async function loadTranslations(locale: Locale): Promise<Translations> {
  try {
    return translations[locale] || translations.es;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    return {};
  }
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'es';
  }

  const stored = localStorage.getItem('nfticket-locale') as Locale;
  if (stored && ['es', 'en'].includes(stored)) {
    return stored;
  }

  const browserLang = navigator.language.split('-')[0];
  if (['es', 'en'].includes(browserLang)) {
    return browserLang as Locale;
  }

  return 'es';
}

export function saveLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nfticket-locale', locale);
  }
}