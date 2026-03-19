// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/ClientProviders'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MBI Digital Agency',
  description: 'A beautiful, responsive website template built with Next.js, TypeScript, and Tailwind CSS',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {/* ✅ Catches any crash in the entire app */}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  )
}