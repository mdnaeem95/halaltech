import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import SessionRefresh from './components/auth/SessionRefresh'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TechHalal - Tech Services for Muslim Businesses in Singapore',
  description: 'Professional web development, mobile apps, and design services tailored for Muslim-owned businesses in Singapore.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SessionRefresh />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}