import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'GDG Vitória da Conquista',
    template: '%s | GDG Vitória da Conquista',
  },
  description: 'Comunidade de desenvolvedores do sudoeste baiano',
  openGraph: {
    siteName: 'GDG Vitória da Conquista',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
