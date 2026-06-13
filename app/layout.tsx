import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'QBDS | QIMS Blood Donors Society',
  description:
    'QBDS - QIMS Blood Donors Society. Connect compassionate donors with patients in urgent need.',

  generator: 'v0.app',

  icons: {
    icon: '/logo.PNG',
    apple: '/logo.PNG',
  },

  // ✅ Google Search Console verification
  verification: {
    google: 'HfdkvB8Y_OdhqwBC6nHG5sinWSv-Na5RAXOfmkKo3Sw',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}