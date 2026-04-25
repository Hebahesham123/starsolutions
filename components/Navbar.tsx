'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLang } from '@/components/LanguageContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang, setLang, t, isRtl } = useLang()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navLinks = [
    { href: '/#solutions', label: t.nav.solutions, icon: '⚙️' },
    { href: '/#results', label: t.nav.results, icon: '📈' },
    { href: '/#how', label: t.nav.howItWorks, icon: '🔍' },
    { href: '/#work', label: t.nav.ourWork, icon: '💼' },
    { href: '/blog', label: t.nav.blog, icon: '📝' },
    { href: '/about', label: t.nav.about, icon: '👋' },
  ]

  return (
    <>
      <nav className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-md border-b border-gray-100/50'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-lg text-heading">
              Star<span className="text-primary">Solution</span><span className={scrolled ? 'text-primary' : 'text-primary-light'}>.ai</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            {navLinks.slice(0, 5).map(({ href, label }) => (
              <Link key={href} href={href} className="transition-colors duration-200 text-body hover:text-primary font-semibold">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-body hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200"
              title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              {lang === 'en' ? (
                <><span>🇸🇦</span><span className="hidden sm:inline">عربي</span></>
              ) : (
                <><span>🇺🇸</span><span className="hidden sm:inline">EN</span></>
              )}
            </button>

            <Link href="/#contact" className="hidden sm:inline-flex items-center px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-xl hover:bg-cta-hover transition-all duration-200 hover:scale-105 shadow-lg shadow-cta/20">
              {t.nav.freeAudit}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-200 hover:bg-gray-100"
            >
              <span className={`block w-5 h-0.5 rounded-full bg-heading transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 rounded-full bg-heading transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-0.5 rounded-full bg-heading transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile slide-down menu */}
      <div className={`fixed top-0 left-0 right-0 z-40 md:hidden bg-white rounded-b-3xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'translate-y-0' : '-translate-y-full'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-heading">Star<span className="text-primary">Solution</span>.ai</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle in mobile menu */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-body"
            >
              {lang === 'en' ? '🇸🇦 عربي' : '🇺🇸 EN'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="px-5 py-4 space-y-1">
          {navLinks.map(({ href, label, icon }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface active:bg-primary/5 transition-colors duration-150 group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-xl w-8 text-center">{icon}</span>
              <span className="font-semibold text-body group-hover:text-primary transition-colors">{label}</span>
              <svg className={`w-4 h-4 text-muted ${isRtl ? 'mr-auto' : 'ml-auto'} group-hover:text-primary group-hover:translate-x-1 transition-all`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-6 pt-2">
          <Link
            href="/#contact"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-4 bg-cta text-white font-bold rounded-2xl hover:bg-cta-hover active:scale-95 transition-all duration-200 shadow-lg shadow-cta/30 text-base"
          >
            🚀 {t.nav.freeAudit}
          </Link>
          <a
            href="https://wa.me/+201234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 active:scale-95 transition-all duration-200 mt-3 text-base"
          >
            💬 WhatsApp Us
          </a>
        </div>
      </div>
    </>
  )
}
