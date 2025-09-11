export type Locale = 'es' | 'en';

export interface TranslationParams {
  [key: string]: string | number;
}

export interface Translations {
  [key: string]: string | Translations;
}

export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
  fallback?: boolean;
}