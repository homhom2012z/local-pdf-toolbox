import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const viewport = 'width=device-width, initial-scale=1'
export const themeColor = '#3b82f6'

export const metadata: Metadata = {
  title: 'Local PDF Toolbox - Privacy-First PDF Tools',
  description: 'A privacy-focused, local-first PDF utility website that operates entirely on your local machine. No files are uploaded to external servers.',
  keywords: ['PDF', 'local-first', 'privacy', 'browser', 'tools', 'merge', 'split', 'convert', 'unlock', 'metadata', 'compress', 'extract'],
  authors: [{ name: 'Local PDF Toolbox Team' }],
  creator: 'Local PDF Toolbox',
  publisher: 'Local PDF Toolbox',
  robots: 'index, follow',
  openGraph: {
    title: 'Local PDF Toolbox - Privacy-First PDF Tools',
    description: 'Process PDFs locally in your browser. No uploads, no server, complete privacy.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local PDF Toolbox - Privacy-First PDF Tools',
    description: 'Process PDFs locally in your browser. No uploads, no server, complete privacy.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <div className="min-h-full flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
} 