import { useState } from 'react'
import { AppData } from '../types'
import {
  getWeeksOfYear, formatYMD, fmtShortDate, DAY_ABBR_FR, addDays as addDaysFn,
  parseDate,
} from '../utils/dates'
import { calcScore, scoreColor, getApplicableHabits, habitDone } from '../utils/score'
import { addDays } from 'date-fns'

interface Props {
  year: number
  data: AppData
  onNavigateToDay: (date: string) => void
}

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

function PrayerDot({ status }: { status: string | null }) {
  let color = '#2a2a2a'
  if (status === 'mosque') color = '#f5c518'
  else if (status === 'home') color = '#22c55e'
  else if (status === 'late') color = '#ef4444'
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: 7, height: 7, backgroundColor: color }}
    />
  )
}

function WeekDetailView({
  weekData,
  data,
  onNavigateToDay,
  onBack,
}: {
  weekData: { weekNum: number; start: Date; end: Date }
  data: AppData
  onNavigateToDay: (date: string) => void
  onBack: () => void
}) {
  const days: Date[] = []
  let cur = weekData.start
  for (let i = 0; i < 7; i++) {
    days.push(new Date(cur))
    cur = addDays(cur, 1)
  }

  const scores = days.map(d => {
    const ds = formatYMD(d)
    return calcScore(data.habits, data.entries[ds], ds)
  })

  const tracked = scores.filter(s => s !== null)
  const avgScore = tracked.length > 0 ? Math.round(tracked.reduce((a, b) => a + b!, 0) / tracked.length) : null
  const bestScore = tracked.length > 0 ? Math.max(...(tracked as number[])) : null
  const worstScore = tracked.length > 0 ? Math.min(...(tracked as number[])) : null

  const goodHabits = data.habits.filter(h => !h.isBad).sort((a, b) => a.order - b.order)
  const badHabits = data.habits.filter(h => h.isBad)

  // Prayer stats
  const prayerStats: Record<string, { mosque: number; home: number; late: number }> = {}
  PRAYER_KEYS.forEach(pk => { prayerStats[pk] = { mosque: 0, home: 0, late: 0 } })
  let rawatibCount = 0, dohaCount = 0

  days.forEach(d => {
    const ds = formatYMD(d)
    const entry = data.entries[ds]
    if (!entry) return
    PRAYER_KEYS.forEach(pk => {
      const v = entry.prayers[pk]
      if (v === 'mosque') prayerStats[pk].mosque++
      else if (v === 'home') prayerStats[pk].home++
      else if (v === 'late') prayerStats[pk].late++
    })
    if (entry.prayers.rawatib) rawatibCount++
    if (entry.prayers.doha) dohaCount++
  })

  // Habit stats
  const habitStats = goodHabits.map(habit => {
    let applicable = 0, done = 0
    days.forEach(d => {
      const ds = formatYMD(d)
      const entry = data.entries[ds]
      const applicable_habits = getApplicableHabits(data.habits, ds)
      if (applicable_habits.find(h => h.id === habit.id)) {
        applicable++
        if (habitDone(habit, entry)) done++
      }
    })
    return { habit, applicable, done, pct: applicable > 0 ? Math.round((done / applicable) * 100) : 0 }
  })

  // Bad habit stats
  const badHabitStats = badHabits.map(habit => {
    let total = 0
    days.forEach(d => {
      const ds = formatYMD(d)
      const entry = data.entries[ds]
      total += entry?.badHabits[habit.id] ?? 0
    })
    return { habit, total }
  }).filter(b => b.total > 0)

  const topHabits = [...habitStats].sort((a, b) => b.pct - a.pct).slice(0, 3).filter(h => h.applicable > 0)
  const bottomHabits = [...habitStats].sort((a, b) => a.pct - b.pct).slice(0, 3).filter(h => h.applicable > 0)

  const PRAYER_LABELS: Record<string, string> = {
    fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
  }

  return (
    <div className="space-y-4">
      {/* Week header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <button
          onClick={onBack}
          className="text-sm font-semibold transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          ← Retour
        </button>
        <div className="text-center">
          <div className="font-bold tracking-widest text-sm" style={{ color: '#f5c518' }}>
            SEM.{weekData.weekNum}
          </div>
          <div className="text-xs" style={{ color: '#888888' }}>
            {fmtShortDate(weekData.start)} &gt; {fmtShortDate(weekData.end)}
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-2 gap-2">
        {days.map((d, i) => {
          const ds = formatYMD(d)
          const entry = data.entries[ds]
          const s = scores[i]
          const col = scoreColor(s)
          const applicable = getApplicableHabits(data.habits, ds)
          const doneCount = applicable.filter(h => habitDone(h, entry)).length
          const pct = applicable.length > 0 ? (doneCount / applicable.length) * 100 : 0

          return (
            <button
              key={ds}
              onClick={() => onNavigateToDay(ds)}
              className="rounded-lg p-3 text-left transition-all hover:border-gold/40"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: '#888888' }}>
                  {DAY_ABBR_FR[i]} {d.getDate()}/{d.getMonth() + 1}
                </span>
                <span className="text-base font-bold" style={{ color: col }}>
                  {s !== null ? s : '—'}
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden mb-2"
                style={{ backgroundColor: '#2a2a2a' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: col }}
                />
              </div>
              <div className="flex gap-1">
                {PRAYER_KEYS.map(pk => (
                  <PrayerDot key={pk} status={entry?.prayers[pk] ?? null} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Rapport */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          RAPPORT SEM.{weekData.weekNum}
        </div>
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'SCORE MOY.', value: avgScore !== null ? `${avgScore}` : '—', color: scoreColor(avgScore) },
              { label: 'MEILLEUR', value: bestScore !== null ? `${bestScore}` : '—', color: '#22c55e' },
              { label: 'PIRE', value: worstScore !== null ? `${worstScore}` : '—', color: '#ef4444' },
              { label: 'TRACKES', value: `${tracked.length}/7`, color: '#888888' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs" style={{ color: '#888888' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Prayers */}
          <div className="mb-4">
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#888888' }}>
              PRIÈRES DE LA SEMAINE
            </div>
            <div className="space-y-1.5">
              {PRAYER_KEYS.map(pk => (
                <div key={pk} className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: '#ffffff' }}>{PRAYER_LABELS[pk]}</span>
                  <div className="flex gap-3">
                    <span style={{ color: '#f5c518' }}>🕌 {prayerStats[pk].mosque}x</span>
                    <span style={{ color: '#22c55e' }}>🏠 {prayerStats[pk].home}x</span>
                    <span style={{ color: '#ef4444' }}>⏰ {prayerStats[pk].late}x</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-1 text-xs" style={{ color: '#888888' }}>
                <span>Rawatib: <span style={{ color: '#f5c518' }}>{rawatibCount} fois</span></span>
                <span>Doha: <span style={{ color: '#f5c518' }}>{dohaCount} fois</span></span>
              </div>
            </div>
          </div>

          {/* Habits detail */}
          <div className="mb-4">
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#888888' }}>
              DÉTAIL DES HABITUDES
            </div>
            <div className="space-y-2">
              {habitStats.filter(h => h.applicable > 0).map(({ habit, applicable, done, pct }) => {
                const badge = pct >= 66
                  ? { label: 'Solide', color: '#22c55e' }
                  : pct < 33
                  ? { label: 'Faible', color: '#ef4444' }
                  : null
                return (
                  <div key={habit.id} className="flex items-center gap-2">
                    <span className="text-base flex-shrink-0">{habit.icon}</span>
                    <span className="flex-1 text-xs truncate" style={{ color: '#ffffff' }}>{habit.name}</span>
                    {badge && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{ backgroundColor: `${badge.color}22`, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div
                        className="w-16 h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#2a2a2a' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: '#888888' }}>{done}/{applicable}j</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bad habits */}
          {badHabitStats.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>
                PÉCHÉS / MAUVAISES HABITUDES
              </div>
              <div className="space-y-1">
                {badHabitStats.map(({ habit, total }) => (
                  <div key={habit.id} className="flex items-center gap-2 text-xs">
                    <span>{habit.icon}</span>
                    <span style={{ color: '#ffffff' }}>{habit.name}</span>
                    <span
                      className="ml-auto px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#ef444422', color: '#ef4444' }}
                    >
                      {total}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Points forts */}
          {topHabits.length > 0 && (
            <div
              className="rounded-lg p-3 mb-3"
              style={{ backgroundColor: '#22c55e0f', border: '1px solid #22c55e33' }}
            >
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#22c55e' }}>
                POINTS FORTS
              </div>
              {topHabits.map(({ habit, pct }) => (
                <div key={habit.id} className="flex items-center gap-2 text-xs mb-1">
                  <span>{habit.icon}</span>
                  <span style={{ color: '#ffffff' }}>{habit.name}</span>
                  <span className="ml-auto font-bold" style={{ color: '#22c55e' }}>{pct}%</span>
                </div>
              ))}
            </div>
          )}

          {/* À travailler */}
          {bottomHabits.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: '#ef44440f', border: '1px solid #ef444433' }}
            >
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>
                À TRAVAILLER
              </div>
              {bottomHabits.map(({ habit, pct }) => (
                <div key={habit.id} className="flex items-center gap-2 text-xs mb-1">
                  <span>{habit.icon}</span>
                  <span style={{ color: '#ffffff' }}>{habit.name}</span>
                  <span className="ml-auto font-bold" style={{ color: '#ef4444' }}>{pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SemainesPage({ year, data, onNavigateToDay }: Props) {
  const [selectedWeek, setSelectedWeek] = useState<{ weekNum: number; start: Date; end: Date } | null>(null)
  const weeks = getWeeksOfYear(year)

  if (selectedWeek) {
    return (
      <div className="max-w-2xl mx-auto px-3 py-4">
        <WeekDetailView
          weekData={selectedWeek}
          data={data}
          onNavigateToDay={onNavigateToDay}
          onBack={() => setSelectedWeek(null)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <div className="text-xs font-bold tracking-widest mb-3" style={{ color: '#888888' }}>
        TOUTES LES SEMAINES — {year}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {weeks.map(week => {
          const days: Date[] = []
          let cur = week.start
          for (let i = 0; i < 7; i++) {
            days.push(new Date(cur))
            cur = addDays(cur, 1)
          }
          const scores = days.map(d => {
            const ds = formatYMD(d)
            return calcScore(data.habits, data.entries[ds], ds)
          })
          const tracked = scores.filter(s => s !== null)
          const avg = tracked.length > 0
            ? Math.round(tracked.reduce((a, b) => a + b!, 0) / tracked.length)
            : null

          return (
            <button
              key={week.weekNum}
              onClick={() => setSelectedWeek(week)}
              className="rounded-lg p-3 text-left transition-all"
              style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#f5c518'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold tracking-widest" style={{ color: '#f5c518' }}>
                  SEMAINE {week.weekNum}
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: scoreColor(avg) }}
                >
                  {avg !== null ? avg : '—'}
                </span>
              </div>
              <div className="text-xs mb-1" style={{ color: '#888888' }}>
                {fmtShortDate(week.start)} — {fmtShortDate(week.end)}
              </div>
              <div className="text-xs" style={{ color: '#888888' }}>
                {tracked.length}/7 jours
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
