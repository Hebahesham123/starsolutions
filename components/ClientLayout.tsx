'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Popups from '@/components/Popups'
import { LanguageProvider } from '@/components/LanguageContext'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <LanguageProvider>
      {!isAdmin && <Popups />}
      {!isAdmin && <Navbar />}
      <main className="pt-0">{children}</main>
      {!isAdmin && <Footer />}
    </LanguageProvider>
  )
}
