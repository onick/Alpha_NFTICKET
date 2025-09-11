'use client'

import { useI18n } from '@nfticket/i18n'
import { Button } from '@nfticket/ui'

export function AppHeader() {
  const { t, locale, setLocale } = useI18n()

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-[var(--header-h)]">
      <div className="container flex items-center justify-between h-full">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-primary-600">NFTicket</h1>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-600 hover:text-gray-900">{t('home.title')}</a>
            <a href="/events" className="text-gray-600 hover:text-gray-900">{t('events.title')}</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            {locale === 'es' ? 'EN' : 'ES'}
          </Button>
          <Button size="sm">{t('auth.login')}</Button>
        </div>
      </div>
    </header>
  )
}