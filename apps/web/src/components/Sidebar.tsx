'use client'

import { useI18n } from '@nfticket/i18n'

export function Sidebar() {
  const { t } = useI18n()

  const navItems = [
    { label: t('home.title'), href: '/', icon: '🏠' },
    { label: t('events.title'), href: '/events', icon: '🎫' },
    { label: 'Communities', href: '/communities', icon: '👥' },
    { label: 'My Tickets', href: '/tickets', icon: '🎟️' },
    { label: 'Profile', href: '/profile', icon: '👤' },
  ]

  return (
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}