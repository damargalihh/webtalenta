import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Talenta Mahasiswa UMS - Showcase Talenta Mahasiswa',
  description: 'Platform untuk menampilkan skill dan portofolio mahasiswa Universitas Muhammadiyah Surakarta',
}

export default function RootLayout({ children }: any) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}