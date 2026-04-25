'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/components/LanguageContext'

/* ── Welcome Popup (appears after 8s on first visit) ── */
function WelcomePopup() {
  const { t, isRtl } = useLang()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('ss_popup_shown')) return
    const timer = setTimeout(() => {
      setShow(true)
      sessionStorage.setItem('ss_popup_shown', '1')
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setDone(true)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-cta to-primary" />

        {/* Close */}
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200 transition-colors z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-7 text-center">
          {/* Badge */}
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">{t.welcomePopup.badge}</span>

          {!done ? (
            <>
              <div className="mb-2">
                <p className="text-heading font-heading text-xl font-bold">{t.welcomePopup.heading}</p>
                <p className="text-4xl font-heading font-extrabold text-cta mt-1">{t.welcomePopup.highlight}</p>
              </div>
              <p className="text-muted text-sm mb-6 leading-relaxed">{t.welcomePopup.sub}</p>

              <form onSubmit={submit} className="flex flex-col gap-3">
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.welcomePopup.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-center"
                />
                <button type="submit" className="w-full py-3.5 bg-cta text-white font-bold rounded-xl hover:bg-cta-hover active:scale-95 transition-all duration-200 shadow-lg shadow-cta/30 text-sm">
                  {t.welcomePopup.button}
                </button>
              </form>

              <button onClick={() => setShow(false)} className="mt-4 text-xs text-muted hover:text-heading transition-colors">
                {t.welcomePopup.skip}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-gray-100">
                {['🔒 Secure', '✅ No Spam', '⚡ Instant'].map(b => (
                  <span key={b} className="text-[10px] text-muted font-medium">{b}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="text-5xl mb-4">🎉</div>
              <p className="font-heading font-bold text-heading text-lg mb-2">{t.thankYou}</p>
              <div className="inline-block px-6 py-3 bg-primary/10 rounded-2xl border-2 border-dashed border-primary/40 mt-2">
                <span className="font-heading font-extrabold text-primary text-2xl tracking-widest">STAR15</span>
              </div>
              <p className="text-muted text-xs mt-3">Apply at checkout. Valid for first service.</p>
              <button onClick={() => setShow(false)} className="mt-5 px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors">
                Start Growing →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Exit-Intent Popup ── */
function ExitPopup() {
  const { t, isRtl } = useLang()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    if (sessionStorage.getItem('ss_exit_shown')) return
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !fired.current) {
        fired.current = true
        sessionStorage.setItem('ss_exit_shown', '1')
        setTimeout(() => setShow(true), 200)
      }
    }
    document.addEventListener('mouseleave', onMouseLeave)
    return () => document.removeEventListener('mouseleave', onMouseLeave)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setDone(true)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp text-white">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-10">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-7 text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-4">{t.popup.badge}</span>

          {!done ? (
            <>
              <p className="text-3xl font-heading font-extrabold mb-2">{t.popup.heading}</p>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">{t.popup.sub}</p>

              <form onSubmit={submit} className="flex flex-col gap-3">
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.popup.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 text-center"
                />
                <button type="submit" className="w-full py-3.5 bg-cta text-white font-bold rounded-xl hover:bg-cta-hover active:scale-95 transition-all duration-200 shadow-lg shadow-black/20 text-sm">
                  {t.popup.button}
                </button>
              </form>
              <button onClick={() => setShow(false)} className="mt-4 text-xs text-white/50 hover:text-white/80 transition-colors">
                {t.popup.skip}
              </button>
            </>
          ) : (
            <div className="py-4">
              <div className="text-5xl mb-4">🎉</div>
              <p className="font-heading font-bold text-xl mb-3">{t.thankYou}</p>
              <div className="inline-block px-6 py-3 bg-white/20 rounded-2xl border-2 border-dashed border-white/40">
                <span className="font-heading font-extrabold text-2xl tracking-widest">STAR15</span>
              </div>
              <button onClick={() => setShow(false)} className="block mx-auto mt-6 px-6 py-2.5 bg-white text-primary font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors">
                Start Growing →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Live Activity Toast (bottom-left) ── */
function ActivityToast() {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    // Show first toast after 15s, then every 20s
    const show = () => {
      setMsgIdx(i => (i + 1) % t.toast.messages.length)
      setVisible(true)
      setTimeout(() => setVisible(false), 4500)
    }
    const firstTimer = setTimeout(show, 15000)
    const interval = setInterval(show, 22000)
    return () => { clearTimeout(firstTimer); clearInterval(interval) }
  }, [t.toast.messages.length])

  return (
    <div className={`fixed bottom-24 left-4 z-[150] max-w-xs transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <p className="text-xs font-medium text-body leading-snug">{t.toast.messages[msgIdx]}</p>
        <button onClick={() => setVisible(false)} className="text-muted hover:text-heading ml-1 shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  )
}

/* ── Floating WhatsApp + Audit buttons ── */
function FloatingCTA() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className={`fixed bottom-6 right-4 z-[150] flex flex-col gap-3 transition-all duration-500 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      {/* WhatsApp */}
      <a href="https://wa.me/+201234567890" target="_blank" rel="noopener noreferrer"
        className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="WhatsApp">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.122 1.532 5.855L.078 23.617a.5.5 0 00.614.614l5.76-1.454A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-4.964-1.349l-.356-.212-3.69.931.949-3.605-.232-.371A9.818 9.818 0 012.182 12C2.182 6.56 6.56 2.182 12 2.182S21.818 6.56 21.818 12 17.44 21.818 12 21.818z" />
        </svg>
      </a>
      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-[52px] h-[52px] rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Back to top">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}

/* ── Discount ribbon at top ── */
function DiscountRibbon() {
  const { t, isRtl } = useLang()
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary via-primary-dark to-primary text-white text-center py-2 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <p className="text-xs sm:text-sm font-bold">
        🎁 {isRtl ? 'عرض حصري' : 'Exclusive Offer'} — {isRtl ? 'خصم 15% باستخدام الكود' : 'Get 15% off with code'}{' '}
        <span className="font-extrabold bg-white text-primary px-2 py-0.5 rounded-md mx-1 tracking-widest text-xs">STAR15</span>
        {isRtl ? 'على أي خدمة' : 'on any service'}
      </p>
      <button onClick={() => setVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

export default function Popups() {
  return (
    <>
      <DiscountRibbon />
      <WelcomePopup />
      <ExitPopup />
      <ActivityToast />
      <FloatingCTA />
    </>
  )
}
