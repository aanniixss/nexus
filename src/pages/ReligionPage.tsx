import { useState } from 'react'
import { Check, TrendingUp } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { PrayerEntry, PrayerStatus, RawatibEntry, QiyamEntry, CoranEntry } from '../types'
import Timer from '../components/ui/Timer'
import { today, getLast7Days, getLast30Days } from '../utils/dates'

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type PrayerKey = typeof PRAYERS[number]

const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhouhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

const STATUS_OPTIONS: { value: PrayerStatus; label: string; emoji: string; style: string }[] = [
  { value: 'mosque', label: 'Mosquée', emoji: '🕌', style: 'border-accent bg-accent/10 text-accent' },
  { value: 'home', label: 'Maison', emoji: '🏠', style: 'border-white/40 text-white' },
  { value: 'late', label: 'Hors heure', emoji: '⏰', style: 'border-muted text-muted' },
]

function defaultPrayerEntry(date: string): PrayerEntry {
  return { date, fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null }
}

export default function ReligionPage() {
  const [prayerEntries, setPrayerEntries] = useLocalStorage<PrayerEntry[]>('nexus_prayers', [])
  const [rawatibEntries, setRawatibEntries] = useLocalStorage<RawatibEntry[]>('nexus_rawatib', [])
  const [qiyamEntries, setQiyamEntries] = useLocalStorage<QiyamEntry[]>('nexus_qiyam', [])
  const [coranEntries, setCoranEntries] = useLocalStorage<CoranEntry[]>('nexus_coran', [])
  const [view, setView] = useState<'today' | 'stats'>('today')
  const [coranPages, setCoranPages] = useState('')

  const todayStr = today()
  const todayPrayer = prayerEntries.find(e => e.date === todayStr) || defaultPrayerEntry(todayStr)
  const todayRawatib = rawatibEntries.find(e => e.date === todayStr) || { date: todayStr, done: false, duration: 0 }
  const todayQiyam = qiyamEntries.find(e => e.date === todayStr) || { date: todayStr, done: false, duration: 0 }
  const todayCoran = coranEntries.find(e => e.date === todayStr) || { date: todayStr, pages: 0, duration: 0 }

  const setPrayerStatus = (prayer: PrayerKey, status: PrayerStatus) => {
    const updated = { ...todayPrayer, [prayer]: status }
    setPrayerEntries(prev => {
      const idx = prev.findIndex(e => e.date === todayStr)
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n }
      return [updated, ...prev]
    })
  }

  const upsertRawatib = (changes: Partial<RawatibEntry>) => {
    const updated = { ...todayRawatib, ...changes }
    setRawatibEntries(prev => {
      const idx = prev.findIndex(e => e.date === todayStr)
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n }
      return [updated, ...prev]
    })
  }

  const upsertQiyam = (changes: Partial<QiyamEntry>) => {
    const updated = { ...todayQiyam, ...changes }
    setQiyamEntries(prev => {
      const idx = prev.findIndex(e => e.date === todayStr)
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n }
      return [updated, ...prev]
    })
  }

  const upsertCoran = (changes: Partial<CoranEntry>) => {
    const updated = { ...todayCoran, ...changes }
    setCoranEntries(prev => {
      const idx = prev.findIndex(e => e.date === todayStr)
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n }
      return [updated, ...prev]
    })
  }

  const addCoranPages = () => {
    const p = Number(coranPages)
    if (!p) return
    upsertCoran({ pages: todayCoran.pages + p })
    setCoranPages('')
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl tracking-widest uppercase">Religion</h1>
        <div className="flex bg-card border border-border rounded-xl overflow-hidden">
          {(['today', 'stats'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                view === v ? 'bg-accent text-black' : 'text-muted hover:text-white'
              }`}
            >
              {v === 'today' ? "Aujourd'hui" : 'Stats'}
            </button>
          ))}
        </div>
      </div>

      {view === 'today' && (
        <div className="space-y-4">
          {/* ── Prières ── */}
          <Section title="🕌 Prières du jour">
            <div className="space-y-3">
              {PRAYERS.map(p => (
                <div key={p} className="bg-card border border-border rounded-xl px-4 py-3">
                  <p className="text-white font-gotham font-semibold mb-2">{PRAYER_LABELS[p]}</p>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(opt => {
                      const isActive = todayPrayer[p] === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPrayerStatus(p, isActive ? null : opt.value)}
                          className={`
                            flex-1 flex flex-col items-center gap-1 rounded-xl border py-2 px-1 transition-all text-xs font-gotham font-semibold
                            ${isActive ? opt.style + ' opacity-100' : 'border-border text-border hover:border-muted'}
                            ${opt.value === 'mosque' && isActive ? 'shadow-[0_0_12px_rgba(245,197,24,0.3)]' : ''}
                          `}
                        >
                          <span className="text-base">{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Rawatib ── */}
          <Section title="📿 Rawatib (Sunnah)">
            <div className="bg-card border border-border rounded-xl px-4 py-4 flex items-center gap-3">
              <button
                onClick={() => upsertRawatib({ done: !todayRawatib.done })}
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  todayRawatib.done ? 'bg-accent border-accent' : 'border-muted hover:border-accent'
                }`}
              >
                {todayRawatib.done && <Check size={14} className="text-black" strokeWidth={3} />}
              </button>
              <span className={`flex-1 font-gotham font-semibold ${todayRawatib.done ? 'text-accent' : 'text-white'}`}>
                Rawatib effectués
              </span>
              <Timer
                onStop={s => upsertRawatib({ duration: todayRawatib.duration + s })}
                existingSeconds={todayRawatib.duration}
              />
            </div>
          </Section>

          {/* ── Qiyam ── */}
          <Section title="🌙 Qiyam">
            <div className="bg-card border border-border rounded-xl px-4 py-4 flex items-center gap-3">
              <button
                onClick={() => upsertQiyam({ done: !todayQiyam.done })}
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  todayQiyam.done ? 'bg-accent border-accent' : 'border-muted hover:border-accent'
                }`}
              >
                {todayQiyam.done && <Check size={14} className="text-black" strokeWidth={3} />}
              </button>
              <span className={`flex-1 font-gotham font-semibold ${todayQiyam.done ? 'text-accent' : 'text-white'}`}>
                Qiyam effectué
              </span>
              <Timer
                onStop={s => upsertQiyam({ duration: todayQiyam.duration + s })}
                existingSeconds={todayQiyam.duration}
              />
            </div>
          </Section>

          {/* ── Coran ── */}
          <Section title="📖 Lecture du Coran">
            <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted text-sm">Pages aujourd'hui</span>
                <span className="text-accent font-bold text-xl font-gotham">{todayCoran.pages}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={coranPages}
                  onChange={e => setCoranPages(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCoranPages()}
                  placeholder="Nb de pages lues"
                  className="flex-1 bg-card2 border border-border rounded-xl px-3 py-2 text-white font-gotham text-sm placeholder-muted focus:outline-none focus:border-accent"
                />
                <button
                  onClick={addCoranPages}
                  className="bg-accent text-black font-bold px-4 rounded-xl text-sm uppercase tracking-wider"
                >
                  +
                </button>
              </div>
              <Timer
                onStop={s => upsertCoran({ duration: todayCoran.duration + s })}
                existingSeconds={todayCoran.duration}
                label="Temps de lecture"
              />
            </div>
          </Section>
        </div>
      )}

      {view === 'stats' && (
        <StatsView prayerEntries={prayerEntries} coranEntries={coranEntries} rawatibEntries={rawatibEntries} qiyamEntries={qiyamEntries} />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-muted text-xs font-bold uppercase tracking-widest mb-2">{title}</h2>
      {children}
    </div>
  )
}

function StatsView({
  prayerEntries,
  coranEntries,
  rawatibEntries,
  qiyamEntries,
}: {
  prayerEntries: PrayerEntry[]
  coranEntries: CoranEntry[]
  rawatibEntries: RawatibEntry[]
  qiyamEntries: QiyamEntry[]
}) {
  const [period, setPeriod] = useState<'7' | '30' | 'all'>('7')

  const dates = period === '7' ? getLast7Days() : period === '30' ? getLast30Days() : null
  const filtered = dates
    ? prayerEntries.filter(e => dates.includes(e.date))
    : prayerEntries
  const total = filtered.length * 5 || 1

  const counts = { mosque: 0, home: 0, late: 0, null: 0 }
  filtered.forEach(e => {
    PRAYERS.forEach(p => {
      const s = e[p]
      if (s === null) counts.null++
      else counts[s]++
    })
  })

  // Per-prayer mosque %
  const perPrayerMosque = PRAYERS.map(p => ({
    prayer: PRAYER_LABELS[p],
    pct: filtered.length > 0
      ? Math.round((filtered.filter(e => e[p] === 'mosque').length / filtered.length) * 100)
      : 0,
  }))

  // Coran stats
  const coranFiltered = dates ? coranEntries.filter(e => dates.includes(e.date)) : coranEntries
  const coranTotal = coranFiltered.reduce((a, e) => a + e.pages, 0)
  const allCoranPages = coranEntries.reduce((a, e) => a + e.pages, 0)

  // Monthly coran
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const coranMonth = coranEntries.filter(e => e.date.startsWith(monthKey)).reduce((a, e) => a + e.pages, 0)

  // Rawatib / Qiyam
  const rawFiltered = dates ? rawatibEntries.filter(e => dates.includes(e.date)) : rawatibEntries
  const qFiltered = dates ? qiyamEntries.filter(e => dates.includes(e.date)) : qiyamEntries

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex bg-card border border-border rounded-xl overflow-hidden">
        {([['7', '7 jours'], ['30', '30 jours'], ['all', 'Tout']] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setPeriod(v)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              period === v ? 'bg-accent text-black' : 'text-muted hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Prayer breakdown */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-muted text-xs uppercase tracking-widest flex items-center gap-2">
          <TrendingUp size={12} /> Prières — {filtered.length} jours trackés
        </h3>
        {[
          { label: '🕌 Mosquée', count: counts.mosque, color: '#f5c518' },
          { label: '🏠 Maison', count: counts.home, color: '#ffffff' },
          { label: '⏰ Hors heure', count: counts.late, color: '#888888' },
        ].map(s => (
          <div key={s.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted font-gotham">{s.label}</span>
              <span className="text-white font-gotham font-semibold">
                {s.count} <span className="text-muted text-xs">({Math.round((s.count / total) * 100)}%)</span>
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Per prayer mosque % */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-muted text-xs uppercase tracking-widest">% Mosquée par prière</h3>
        {perPrayerMosque.map(p => (
          <div key={p.prayer} className="flex items-center gap-3">
            <span className="text-muted text-sm w-20 font-gotham">{p.prayer}</span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${p.pct}%` }} />
            </div>
            <span className="text-accent text-sm font-gotham font-bold w-10 text-right">{p.pct}%</span>
          </div>
        ))}
      </div>

      {/* Coran stats */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-muted text-xs uppercase tracking-widest mb-3">📖 Coran</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-card2 rounded-xl p-3">
            <p className="text-accent font-bold text-xl font-gotham">{coranTotal}</p>
            <p className="text-muted text-xs uppercase">Cette période</p>
          </div>
          <div className="text-center bg-card2 rounded-xl p-3">
            <p className="text-accent font-bold text-xl font-gotham">{coranMonth}</p>
            <p className="text-muted text-xs uppercase">Ce mois</p>
          </div>
          <div className="text-center bg-card2 rounded-xl p-3">
            <p className="text-accent font-bold text-xl font-gotham">{allCoranPages}</p>
            <p className="text-muted text-xs uppercase">Total</p>
          </div>
        </div>
      </div>

      {/* Rawatib & Qiyam */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <h3 className="text-muted text-xs uppercase tracking-widest mb-3">Rawatib & Qiyam</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted font-gotham">📿 Rawatib</span>
          <span className="text-white font-gotham font-semibold">{rawFiltered.filter(e => e.done).length}/{rawFiltered.length || (dates?.length ?? coranEntries.length)} jours</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted font-gotham">🌙 Qiyam</span>
          <span className="text-white font-gotham font-semibold">{qFiltered.filter(e => e.done).length}/{qFiltered.length || (dates?.length ?? coranEntries.length)} jours</span>
        </div>
      </div>
    </div>
  )
}
