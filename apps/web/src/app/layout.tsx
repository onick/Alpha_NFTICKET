import './globals.css'
import { Inter } from 'next/font/google'
import { SimpleHeader } from '../components/SimpleHeader'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen">
          <SimpleHeader />
          <main className="pt-[var(--header-h)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}