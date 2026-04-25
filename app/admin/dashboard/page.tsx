'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormSubmission } from '@/types'

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  new:         { label: 'New',         dot: 'bg-blue-400',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  contacted:   { label: 'Contacted',   dot: 'bg-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  'in-progress': { label: 'In Progress', dot: 'bg-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  completed:   { label: 'Completed',   dot: 'bg-green-400',  badge: 'bg-green-500/15 text-green-400 border-green-500/20' },
  lost:        { label: 'Lost',        dot: 'bg-red-400',    badge: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['new']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<FormSubmission | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { fetchSubmissions() }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions')
      if (!res.ok) throw new Error('Failed')
      setSubmissions(await res.json())
    } catch { /* empty */ }
    finally { setLoading(false) }
  }

  const updateStatus = async (id: string, status: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const updated = await res.json()
      setSubmissions(p => p.map(s => s.id === id ? updated : s))
      setSelected(updated)
    } catch { /* empty */ }
    finally { setSaving(false) }
  }

  const addNote = async () => {
    if (!selected || !note.trim()) return
    setSaving(true)
    try {
      const newNotes = [...selected.notes, note.trim()]
      const res = await fetch(`/api/submissions/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes }),
      })
      const updated = await res.json()
      setSubmissions(p => p.map(s => s.id === selected.id ? updated : s))
      setSelected(updated)
      setNote('')
    } catch { /* empty */ }
    finally { setSaving(false) }
  }

  const filtered = submissions.filter(s => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.company || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const stats = [
    { label: 'Total Leads', value: submissions.length, icon: '📋', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20', text: 'text-blue-400' },
    { label: 'New', value: submissions.filter(s => s.status === 'new').length, icon: '🔔', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20', text: 'text-yellow-400' },
    { label: 'In Progress', value: submissions.filter(s => s.status === 'in-progress').length, icon: '⚙️', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20', text: 'text-purple-400' },
    { label: 'Completed', value: submissions.filter(s => s.status === 'completed').length, icon: '✅', color: 'from-green-500/20 to-green-600/10 border-green-500/20', text: 'text-green-400' },
  ]

  const openDetail = (sub: FormSubmission) => { setSelected(sub); setSidebarOpen(true) }
  const closeDetail = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-body">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading font-bold text-base text-white leading-none">StarSolution.ai</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-semibold">Live</span>
            </div>
            <button
              onClick={() => { document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'; router.push('/admin/login') }}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm rounded-xl hover:bg-red-500/20 transition-colors active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-4 sm:p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl sm:text-2xl">{s.icon}</span>
                <span className={`text-3xl sm:text-4xl font-heading font-extrabold tabular-nums ${s.text}`}>{s.value}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search & Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'new', 'contacted', 'in-progress', 'completed', 'lost'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${filterStatus === s ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                {s === 'all' ? 'All' : (STATUS_CONFIG[s]?.label ?? s)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading submissions...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="text-4xl">📭</div>
              <p className="text-slate-400 font-semibold">No submissions found</p>
              <p className="text-slate-500 text-sm">Leads from your contact form will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Email</th>
                    <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Company</th>
                    <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Date</th>
                    <th className="px-4 sm:px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(sub => (
                    <tr key={sub.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{sub.name}</p>
                            <p className="text-xs text-slate-500 md:hidden">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-slate-400 hidden md:table-cell">{sub.email}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">{sub.company || '—'}</td>
                      <td className="px-4 sm:px-6 py-4"><StatusBadge status={sub.status} /></td>
                      <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {new Date(sub.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => openDetail(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          View
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Side Panel ── */}
      {/* Backdrop */}
      <div
        onClick={closeDetail}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen && selected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 bg-[#1e293b] border-l border-white/10 overflow-y-auto shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen && selected ? 'translate-x-0' : 'translate-x-full'}`}>
        {selected && (
          <>
            {/* Drawer header */}
            <div className="sticky top-0 bg-[#1e293b]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{selected.name}</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <button onClick={closeDetail} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Client Information</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Name', val: selected.name, icon: '👤' },
                    { label: 'Email', val: selected.email, icon: '📧' },
                    { label: 'Phone', val: selected.phone || '—', icon: '📱' },
                    { label: 'Company', val: selected.company || '—', icon: '🏢' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-base mt-0.5">{f.icon}</span>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{f.label}</p>
                        <p className="text-sm text-white font-medium mt-0.5 break-all">{f.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Message</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{selected.message}</p>
              </div>

              {/* Status */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <button
                      key={val}
                      disabled={saving}
                      onClick={() => updateStatus(selected.id, val)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${selected.status === val ? `${cfg.badge} shadow-lg` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm rounded-xl hover:bg-blue-500/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email
                </a>
                {selected.phone && (
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-sm rounded-xl hover:bg-green-500/20 transition-colors"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Notes {selected.notes.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white/10 rounded-full text-[10px]">{selected.notes.length}</span>}
                </h3>
                {selected.notes.length === 0 ? (
                  <p className="text-sm text-slate-500 italic mb-4">No notes yet. Add your first note below.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {selected.notes.map((n, i) => (
                      <div key={i} className="flex gap-2 bg-white/5 rounded-xl p-3">
                        <span className="text-slate-500 text-xs font-mono mt-0.5">#{i + 1}</span>
                        <p className="text-sm text-slate-300 flex-1">{n}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNote()}
                    placeholder="Add a note..."
                    className="flex-1 px-3.5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    onClick={addNote}
                    disabled={saving || !note.trim()}
                    className="px-4 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-slate-600 text-center">
                Submitted on {new Date(selected.timestamp).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
