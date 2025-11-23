import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TopMove Trading Journal - Journal de Trading Professionnel',
  description: 'Journal de trading professionnel avec import Sierra Chart, analytics avancées et position sizing calculator',
  keywords: ['trading journal', 'futures', 'sierra chart', 'trading analytics', 'position sizing'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
