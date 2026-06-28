'use client'

import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { useEffect, useState, useRef } from 'react'
import { useLang } from '@/components/LanguageContext'

// ─── Newsletter Section ───────────────────────────────────────────
function NewsletterSection() {
  const { t, isRtl } = useLang()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setDone(true)
  }

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cta/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative">
        <span className="inline-block px-4 py-1.5 bg-white/15 text-white text-xs font-bold rounded-full mb-5 border border-white/20">
          {t.newsletter.badge}
        </span>

        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">
          {t.newsletter.heading}
        </h2>
        <p className="text-white/75 text-sm sm:text-base mb-8 leading-relaxed">{t.newsletter.sub}</p>

        {!done ? (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t.newsletter.placeholder}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
            />
            <button type="submit" className="px-6 py-3.5 bg-cta text-white font-bold rounded-2xl hover:bg-cta-hover active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 text-sm whitespace-nowrap">
              {t.newsletter.button}
            </button>
          </form>
        ) : (
          <div className="bg-white/10 rounded-2xl border border-white/20 px-8 py-6 max-w-lg mx-auto">
            <div className="text-3xl mb-3">🎉</div>
            <p className="text-white font-bold text-lg mb-2">{t.thankYou}</p>
            <div className="inline-block px-6 py-2.5 bg-white rounded-xl mt-1">
              <span className="font-heading font-extrabold text-primary text-2xl tracking-widest">STAR15</span>
            </div>
          </div>
        )}

        <p className="text-white/50 text-xs mt-5">
          {t.newsletter.note}<span className="font-bold text-white/70">{t.newsletter.code}</span>
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-white/10">
          {[
            { num: '2,000+', label: isRtl ? 'مشترك' : 'Subscribers' },
            { num: '15%', label: isRtl ? 'خصم فوري' : 'Instant Discount' },
            { num: '0', label: isRtl ? 'رسائل مزعجة' : 'Spam Emails' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-heading font-extrabold text-white text-xl">{s.num}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Count-Up Hook ────────────────────────────────────────────────
function useCountUp(end: number, duration = 2200, started = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let raf: number
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(ease * end))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, started])
  return val
}

// ─── Intersection Observer hook ──────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Animated Bar Chart ───────────────────────────────────────────
function BarChart({ started }: { started: boolean }) {
  const bars = [
    { label: 'Jan', before: 30, after: 55 },
    { label: 'Feb', before: 35, after: 65 },
    { label: 'Mar', before: 25, after: 80 },
    { label: 'Apr', before: 40, after: 90 },
    { label: 'May', before: 45, after: 110 },
    { label: 'Jun', before: 38, after: 130 },
  ]
  const max = 140
  return (
    <div className="relative w-full h-44">
      <svg viewBox="0 0 360 155" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="30" y1={10 + i * 33} x2="350" y2={10 + i * 33} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {bars.map((b, i) => {
          const x = 40 + i * 54
          const beforeH = started ? (b.before / max) * 110 : 0
          const afterH = started ? (b.after / max) * 110 : 0
          return (
            <g key={i}>
              <rect x={x} y={140 - beforeH} width="18" height={beforeH} rx="3" fill="#94a3b8"
                style={{ transition: `all 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s` }} />
              <rect x={x + 20} y={140 - afterH} width="18" height={afterH} rx="3" fill="#0EA5E9"
                style={{ transition: `all 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1 + 0.05}s` }} />
              <text x={x + 18} y="152" fontSize="9" fill="#94a3b8" textAnchor="middle">{b.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="absolute top-0 right-0 flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400 inline-block" /> Before</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block" /> After</span>
      </div>
    </div>
  )
}

// ─── Animated Line Chart ──────────────────────────────────────────
function LineChart({ started }: { started: boolean }) {
  const points = [8, 15, 12, 28, 35, 32, 48, 52, 45, 68, 72, 88]
  const w = 320, h = 100, pad = 10
  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2)
    const y = h - pad - (v / 100) * (h - pad * 2)
    return `${x},${y}`
  })
  const pathD = `M ${coords.join(' L ')}`
  const areaD = `M ${coords[0]} L ${coords.join(' L ')} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
        </linearGradient>
        <clipPath id="revealClip">
          <rect x="0" y="0" width={started ? w : 0} height={h} style={{ transition: 'width 2.5s ease-in-out' }} />
        </clipPath>
      </defs>
      <path d={areaD} fill="url(#lineGrad)" clipPath="url(#revealClip)" />
      <path d={pathD} fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#revealClip)" />
      {started && points.map((_, i) => {
        const [x, y] = coords[i].split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="3" fill="#0EA5E9" style={{ opacity: 1, transition: `opacity 0.3s ${i * 0.2}s` }} />
      })}
    </svg>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({ end, suffix, label, icon, delay, started }: {
  end: number; suffix: string; label: string; icon: string; delay: number; started: boolean
}) {
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (started) { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t) }
    return undefined
  }, [started, delay])
  const val = useCountUp(end, 2000, go)
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 text-center overflow-hidden active:scale-95 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 touch-manipulation">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{icon}</div>
      <p className="font-heading text-3xl sm:text-4xl font-extrabold text-heading tabular-nums">
        {val.toLocaleString()}{suffix}
      </p>
      <p className="text-xs sm:text-sm text-muted mt-1 font-medium leading-snug">{label}</p>
    </div>
  )
}

// ─── Testimonial Card ─────────────────────────────────────────────
function TestiCard({ quote, author, role, avatar }: {
  quote: string; author: string; role: string; avatar: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 flex-shrink-0 w-[85vw] sm:w-auto hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-[0.98] touch-manipulation">
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-body text-sm leading-relaxed mb-4 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
          {avatar}
        </div>
        <div>
          <p className="text-xs font-bold text-heading">{author}</p>
          <p className="text-[11px] text-muted">{role}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Home() {
  const { t, isRtl } = useLang()

  const [revenue, setRevenue] = useState(12847.5)
  const [orders, setOrders] = useState(342)
  const [visitors, setVisitors] = useState(1892)
  const [revenueFlash, setRevenueFlash] = useState(false)

  useEffect(() => {
    const t1 = setInterval(() => {
      setRevenue(p => p + Math.random() * 40 + 10)
      setRevenueFlash(true)
      setTimeout(() => setRevenueFlash(false), 400)
    }, 1800)
    const t2 = setInterval(() => setOrders(p => p + 1), 4200)
    const t3 = setInterval(() => setVisitors(p => p + Math.floor(Math.random() * 3) + 1), 2000)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [])

  const { ref: statsRef, inView: statsVisible } = useInView()
  const { ref: chartRef, inView: chartVisible } = useInView()

  const [baView, setBaView] = useState<'before' | 'after'>('before')

  const notifications = [
    { time: '2s', msg: '🛍️ New order — $129.99', color: 'text-green-400' },
    { time: '14s', msg: '🤖 AI replied to customer', color: 'text-primary-light' },
    { time: '41s', msg: '📢 Post scheduled (TikTok)', color: 'text-purple-400' },
    { time: '1m', msg: '💰 Upsell accepted — +$45', color: 'text-green-400' },
    { time: '2m', msg: '🎯 Ad budget optimized', color: 'text-orange-400' },
  ]
  const [notifIdx, setNotifIdx] = useState(0)
  const [notifVisible, setNotifVisible] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifVisible(false)
      setTimeout(() => { setNotifIdx(p => (p + 1) % notifications.length); setNotifVisible(true) }, 350)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const testiScrollRef = useRef<HTMLDivElement>(null)
  const partners = ['Shopify', 'Meta Ads', 'Google Ads', 'TikTok', 'WhatsApp', 'OpenAI']

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#EFF9FF] via-[#F0F9FF] to-white min-h-screen flex items-center">
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary/10"
              style={{
                width: `${Math.random() * 7 + 3}px`,
                height: `${Math.random() * 7 + 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `particleFloat ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
          <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-cta/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left content */}
            <div>
              <h1 className="fade-up d1 font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-5 text-heading">
                {t.hero.h1a}<br />{t.hero.h1b}<br />
                <span className="text-primary">{t.hero.h1c}</span>
              </h1>

              <p className="fade-up d2 text-base sm:text-lg text-muted leading-relaxed mb-7 max-w-lg">
                {t.hero.sub} <strong className="text-heading">{t.hero.subStrong}</strong>.
              </p>

              {/* CTA buttons — full width on mobile */}
              <div className="fade-up d3 flex flex-col sm:flex-row gap-3 mb-7">
                <Link href="#contact"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-4 bg-cta text-white font-bold rounded-2xl hover:bg-cta-hover active:scale-95 shadow-2xl shadow-cta/40 transition-all duration-200 text-base touch-manipulation">
                  {t.hero.cta1}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link href="#results"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-4 bg-white text-heading font-bold rounded-2xl border border-gray-200 hover:border-primary/30 hover:text-primary active:scale-95 transition-all duration-200 text-base touch-manipulation shadow-sm">
                  {t.hero.cta2}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </Link>
              </div>

              {/* Live notification */}
              <div className={`fade-up d4 inline-flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm max-w-full transition-all duration-300 ${notifVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-sm font-medium truncate text-body">{notifications[notifIdx].msg}</span>
                <span className="text-[10px] text-muted shrink-0">{notifications[notifIdx].time}</span>
              </div>
            </div>

            {/* Right: Live Dashboard (hidden on smallest mobile, shown on sm+) */}
            <div className="fade-up d4 relative hidden sm:block">
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{t.hero.liveDash}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-4 mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">{t.hero.todayRevenue}</p>
                  <p className={`font-heading text-3xl font-extrabold tabular-nums transition-colors duration-200 ${revenueFlash ? 'text-green-300' : 'text-white'}`}>
                    ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <span className="text-xs font-bold text-green-300">{t.hero.vsLastWeek}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: t.hero.orders, val: orders, icon: '🛍️' },
                    { label: t.hero.visitors, val: visitors.toLocaleString(), icon: '👁️' },
                    { label: 'ROAS', val: '4.2x', icon: '🎯' },
                  ].map((s, i) => (
                    <div key={i} className="bg-surface rounded-xl p-3 text-center">
                      <div className="text-lg mb-0.5">{s.icon}</div>
                      <p className="font-heading font-bold text-heading text-sm tabular-nums">{s.val}</p>
                      <p className="text-[9px] text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mini bar preview */}
                <div className="bg-surface rounded-xl p-3">
                  <p className="text-[9px] text-muted uppercase tracking-wider mb-2">{t.hero.revenueTrend}</p>
                  <div className="flex items-end gap-1 h-10">
                    {[35, 48, 42, 65, 58, 78, 72, 88, 82, 95, 90, 110].map((v, i) => (
                      <div key={i} className="flex-1 rounded-t bg-primary" style={{ height: `${(v / 110) * 100}%`, opacity: 0.3 + (i / 12) * 0.7 }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-cta text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-cta/30 float">
                🚀 +127% Growth
              </div>
            </div>
          </div>

          {/* Mobile mini dashboard (only on xs) */}
          <div className="sm:hidden mt-8 fade-up d5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-primary/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{t.hero.liveRevenueToday}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-600 font-bold">LIVE</span>
                </div>
              </div>
              <p className={`font-heading text-3xl font-extrabold tabular-nums mb-3 transition-colors duration-200 ${revenueFlash ? 'text-green-500' : 'text-heading'}`}>
                ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t.hero.orders, val: orders },
                  { label: t.hero.visitors, val: visitors.toLocaleString() },
                  { label: 'ROAS', val: '4.2x' },
                ].map((s, i) => (
                  <div key={i} className="bg-surface rounded-xl p-2.5 text-center">
                    <p className="font-heading font-bold text-heading text-base tabular-nums">{s.val}</p>
                    <p className="text-[9px] text-muted mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-10 lg:mt-16 fade-up d5">
            <div className="flex flex-col items-center gap-2 text-muted/60 text-xs animate-bounce">
              <span>{t.hero.scroll}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS COUNTER ══════════════════════════════════════════ */}
      <section id="results" className="py-14 sm:py-24 bg-white" ref={statsRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.stats.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.stats.heading}</h2>
            <p className="text-muted mt-3 text-sm sm:text-base max-w-xl mx-auto">{t.stats.sub}</p>
          </div>

          {/* 2-col on mobile, 4-col on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard end={320} suffix="%" label={t.stats.avgRevenue} icon="📈" delay={0} started={statsVisible} />
            <StatCard end={150} suffix="+" label={t.stats.businesses} icon="🏢" delay={150} started={statsVisible} />
            <StatCard end={20} suffix="hrs" label={t.stats.savedWeek} icon="⏱️" delay={300} started={statsVisible} />
            <StatCard end={50000} suffix="+" label={t.stats.followersGrown} icon="👥" delay={450} started={statsVisible} />
          </div>

          {/* Extra metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {[
              { label: t.stats.aov, val: '45%', bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
              { label: t.stats.support, val: '80%', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
              { label: t.stats.adSpend, val: '35%', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
            ].map((m, i) => (
              <div key={i} className={`${m.bg} ${m.text} rounded-2xl border p-4 sm:p-5 text-center`}>
                <p className="font-heading text-2xl sm:text-3xl font-extrabold">{m.val}</p>
                <p className="text-xs sm:text-sm font-medium mt-1 opacity-80">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHARTS ═════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-24 bg-surface" ref={chartRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.charts.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.charts.heading}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-heading text-sm sm:text-base">{t.charts.monthlyRevenue}</h3>
                  <p className="text-xs text-muted">{t.charts.beforeAfter}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{t.charts.avgBadge}</span>
              </div>
              <BarChart started={chartVisible} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-heading text-sm sm:text-base">{t.charts.orderVolume}</h3>
                  <p className="text-xs text-muted">{t.charts.months}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">↑ 4.2x</span>
              </div>
              <LineChart started={chartVisible} />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: t.charts.dailyOrders, val: '85+' },
                  { label: t.charts.conversion, val: '4.8%' },
                  { label: t.charts.repeat, val: '62%' },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-surface rounded-xl p-2.5">
                    <p className="font-heading font-bold text-primary text-base sm:text-lg">{s.val}</p>
                    <p className="text-[10px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═════════════════════════════════════════ */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.beforeAfter.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.beforeAfter.heading}</h2>
          </div>

          {/* Toggle — large tap targets */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 w-full max-w-xs sm:max-w-sm">
              <button
                onClick={() => setBaView('before')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 touch-manipulation ${baView === 'before' ? 'bg-white text-heading shadow-md' : 'text-muted active:bg-white/50'}`}
              >
                {t.beforeAfter.beforeBtn}
              </button>
              <button
                onClick={() => setBaView('after')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 touch-manipulation ${baView === 'after' ? 'bg-primary text-white shadow-md' : 'text-muted active:bg-primary/10'}`}
              >
                {t.beforeAfter.afterBtn}
              </button>
            </div>
          </div>

          {/* Cards — 1 col on mobile, 2 col on md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {baView === 'before' ? (
              t.beforeAfter.before.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 sm:p-5 bg-red-50 rounded-2xl border border-red-100 active:scale-[0.98] transition-transform duration-150 touch-manipulation">
                  <span className="text-2xl sm:text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-red-800 text-sm sm:text-base mb-0.5">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-red-600/80">{item.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              t.beforeAfter.after.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 sm:p-5 bg-green-50 rounded-2xl border border-green-200 active:scale-[0.98] transition-transform duration-150 touch-manipulation">
                  <span className="text-2xl sm:text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-green-800 text-sm sm:text-base mb-0.5">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-green-700/80">{item.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="#contact"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-cta text-white font-bold rounded-2xl hover:bg-cta-hover active:scale-95 shadow-lg shadow-cta/30 transition-all duration-200 touch-manipulation text-base">
              {t.beforeAfter.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SOLUTIONS ══════════════════════════════════════════════ */}
      <section id="solutions" className="py-14 sm:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.solutions.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.solutions.heading}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {t.solutions.items.map((s, i) => (
              <div key={i} className="group relative bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:border-primary/40 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 touch-manipulation">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="text-3xl sm:text-4xl">{s.icon}</div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{s.badge}</span>
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold mb-2 text-heading">{s.title}</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MAKE MONEY WHILE YOU SLEEP ═════════════════════════════ */}
      <section className="py-14 sm:py-24 bg-heading text-white overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-cta/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-10 sm:mb-16 fade-up">
            <div className="text-4xl sm:text-6xl mb-4">😴</div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 text-white">{t.sleep.heading}</h2>
            <p className="text-white/60 text-sm sm:text-lg max-w-xl mx-auto">{t.sleep.sub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Live counter */}
            <div className="fade-up">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/15 p-6 sm:p-8">
                <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">{t.sleep.revenueLabel}</p>
                <p className={`font-heading text-4xl sm:text-5xl font-extrabold tabular-nums mb-1 transition-colors duration-300 ${revenueFlash ? 'text-green-300' : 'text-white'}`}>
                  ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs sm:text-sm font-bold">{t.sleep.live}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t.sleep.ordersProcessed, val: orders },
                    { label: t.sleep.messagesAnswered, val: Math.floor(orders * 2.3) },
                    { label: t.sleep.adsOptimized, val: Math.floor(orders / 12) },
                    { label: t.sleep.postsPublished, val: Math.floor(orders / 28) },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <p className="font-heading font-bold text-xl sm:text-2xl tabular-nums text-white">{s.val.toLocaleString()}</p>
                      <p className="text-[11px] text-white/50 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="fade-up d2 space-y-3">
              {t.sleep.timeline.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${item.color} active:scale-[0.98] transition-transform duration-150 touch-manipulation`}>
                  <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs text-white/40 font-mono shrink-0">{item.time}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{item.title}</span>
                    </div>
                    <p className="text-xs text-white/60">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════ */}
      <section id="how" className="py-14 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.how.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.how.heading}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {t.how.steps.map((step, i) => (
              <div key={i} className={`fade-up ${['', 'd1', 'd2'][i]} flex sm:flex-col items-center sm:text-center gap-5 sm:gap-0 p-5 bg-surface rounded-2xl hover:shadow-lg transition-shadow duration-300`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${step.color} text-white flex items-center justify-center shrink-0 sm:mx-auto sm:mb-5 shadow-lg`}>
                  <span className="text-2xl sm:text-3xl">{step.icon}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{step.num}</div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold mb-1.5 text-heading">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OUR WORK ════════════════════════════════════════════════ */}
      <section id="work" className="py-14 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.work.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.work.heading}</h2>
            <p className="text-muted mt-3 text-sm sm:text-base max-w-xl mx-auto">{t.work.sub}</p>
          </div>

          {/* Live Websites */}
          <div className="mb-12">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-heading mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base">🌐</span>
              {t.work.liveWebsites}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {t.work.websites.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col bg-surface rounded-2xl border border-gray-100 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation">
                  <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-heading font-bold text-heading text-base">{item.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.tag}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                    <div className="mt-4 text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t.work.visitSite} <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Demo Systems */}
          <div className="mb-12">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-heading mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base">🖥️</span>
              {t.work.customSystems}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {t.work.systems.map((item, i) => (
                <div key={i}
                  className="flex flex-col bg-surface rounded-2xl border border-gray-100 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-heading font-bold text-heading text-base">{item.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{item.tag}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted bg-gray-100 px-2 py-1 rounded-lg shrink-0">{t.work.demoAvailable}</span>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                    <div className="mt-4 text-xs font-semibold text-muted">{t.work.contactDemo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Automations */}
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-heading mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base">🤖</span>
              {t.work.aiAutomations}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {t.work.automations.map((item, i) => (
                <div key={i} className="group bg-surface rounded-2xl border border-gray-100 p-4 text-center hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 touch-manipulation">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <p className="font-heading font-bold text-heading text-[11px] sm:text-xs leading-tight">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS (swipeable on mobile) ══════════════════════════ */}
      <section className="py-14 sm:py-24 bg-surface overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.reviews.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.reviews.heading}</h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-bold text-heading text-sm sm:text-base">4.9/5</span>
              <span className="text-muted text-xs sm:text-sm">{t.reviews.fromClients}</span>
            </div>
            {/* Mobile swipe hint */}
            <p className="sm:hidden text-xs text-muted mt-2 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              {t.reviews.swipe}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </p>
          </div>

          {/* Mobile: horizontal scroll. Desktop: grid */}
          <div
            ref={testiScrollRef}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {t.reviews.items.map((item, i) => (
              <div key={i} className="snap-start shrink-0 sm:shrink sm:snap-none w-[85vw] sm:w-auto">
                <TestiCard {...item} />
              </div>
            ))}
          </div>

          {/* Mobile scroll dots */}
          <div className="flex sm:hidden justify-center gap-2 mt-4">
            {t.reviews.items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = testiScrollRef.current
                  if (el) el.scrollTo({ left: i * el.offsetWidth * 0.88, behavior: 'smooth' })
                }}
                className="w-2 h-2 rounded-full bg-gray-300 transition-all duration-200 active:bg-primary touch-manipulation"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTNERS ═══════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted mb-6">{t.partners.label}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {partners.map((p, i) => (
              <div key={i} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-muted hover:bg-primary/5 hover:border-primary/30 hover:text-primary active:scale-95 transition-all duration-200 cursor-default touch-manipulation">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 fade-up">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">{t.team.badge}</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-heading">{t.team.heading}</h2>
            <p className="text-muted mt-3 text-sm sm:text-base max-w-xl mx-auto">{t.team.sub}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {t.team.members.map((m, i) => (
              <div key={i} className={`fade-up ${['', 'd1', 'd2', 'd1', 'd2', 'd3', 'd1'][i]} group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 text-center hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all duration-300 touch-manipulation`}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-heading font-extrabold text-base sm:text-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {m.init}
                </div>
                <h3 className="font-heading font-bold text-heading text-xs sm:text-sm leading-tight">{m.name}</h3>
                <p className="text-[10px] sm:text-xs text-primary font-medium mt-1 leading-tight">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═════════════════════════════════════════════ */}
      <NewsletterSection />

      {/* ═══ CTA + CONTACT ══════════════════════════════════════════ */}
      <section id="contact" className="py-14 sm:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="fade-up text-center mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-3">{t.contact.badge}</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-heading">{t.contact.heading}</h2>
            <p className="text-muted text-sm sm:text-lg max-w-md mx-auto mb-7">
              {t.contact.sub}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
              <Link href="#contact-form"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-cta text-white font-bold rounded-2xl hover:bg-cta-hover active:scale-95 shadow-xl shadow-cta/30 transition-all duration-200 text-base touch-manipulation">
                {t.contact.cta1}
              </Link>
              <a href="https://wa.me/+201234567890" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 active:scale-95 transition-all duration-200 text-base touch-manipulation shadow-lg shadow-green-500/20">
                {t.contact.cta2}
              </a>
            </div>
          </div>
          <div id="contact-form" className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-gray-100">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ═══ MOBILE STICKY CTA ══════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white border-t border-gray-200 p-3 shadow-2xl safe-area-bottom">
        <div className="flex gap-2">
          <Link href="#contact"
            className="flex-1 flex items-center justify-center py-3.5 bg-cta text-white font-bold rounded-2xl active:scale-95 transition-all duration-150 shadow-lg shadow-cta/30 text-sm touch-manipulation">
            🚀 Free Audit
          </Link>
          <a href="https://wa.me/+201234567890" target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center py-3.5 bg-green-500 text-white font-bold rounded-2xl active:scale-95 transition-all duration-150 text-sm touch-manipulation">
            💬 WhatsApp
          </a>
        </div>
      </div>

      {/* bottom padding on mobile for sticky bar */}
      <div className="sm:hidden h-20" />
    </div>
  )
}
