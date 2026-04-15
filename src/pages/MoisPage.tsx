import { useState } from 'react'
import { AppData } from '../types'
import {
  getDaysOfMonth, formatYMD, MONTH_NAMES_FR, DAY_ABBR_FR, todayStr,
  parseDate,
} from '../utils/dates'
import { calcScore, scoreColor, getApplicableHabits, habitDone } from '../utils/score'

interface Props {
  year: number
  data: AppData
  onNavigateToDay: (date: string) => void
}

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
}

function PrayerDot({ status }: { status: string | null }) {
  let color = '#2a2a2a'
  if (status === 'mosque') color = '#f5c518'
  else if (status === 'home') color = '#22c55e'
  else if (status === 'late') color = '#ef4444'
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: 5, height: 5, backgroundColor: color }}
    />
  )
}

export default function MoisPage({ year, data, onNavigateToDay }: Props) {
  const [month, setMonth] = useState(new Date().getMonth())

  const days = getDaysOfMonth(year, month)
  const today = todayStr()
  const goodHabits = data.habits.filter(h => !h.isBad)
  const badHabits = data.habits.filter(h => h.isBad)

  const dayScores = days.map(d => {
    const ds = formatYMD(d)
    return { date: ds, score: calcScore(data.habits, data.entries[ds], ds) }
  })

  const tracked = dayScores.filter(d => d.score !== null)
  const avgScore = tracked.length > 0
    ? Math.round(tracked.reduce((a, b) => a + b.score!, 0) / tracked.length)
    : null
  const bestScore = tracked.length > 0 ? Math.max(...(tracked.map(d => d.score!) as number[])) : null
  const perfectDays = tracked.filter(d => d.score === 100).length

  // Prayer stats for month
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
      const applicableHabits = getApplicableHabits(data.habits, ds)
      if (applicableHabits.find(h => h.id === habit.id)) {
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
      total += data.entries[ds]?.badHabits[habit.id] ?? 0
    })
    return { habit, total }
  }).filter(b => b.total > 0)

  const topHabits = [...habitStats].sort((a, b) => b.pct - a.pct).slice(0, 3).filter(h => h.applicable > 0)
  const bottomHabits = [...habitStats].sort((a, b) => a.pct - b.pct).slice(0, 3).filter(h => h.applicable > 0)

  // Calendar grid: first day of month offset
  const firstDay = days[0]
  const firstDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 0=Mon
  const calendarCells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ]
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}
          className="p-2 text-lg transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          ←
        </button>
        <div className="font-bold tracking-widest text-sm" style={{ color: '#f5c518' }}>
          {MONTH_NAMES_FR[month]} {year}
        </div>
        <button
          onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}
          className="p-2 text-lg transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          →
        </button>
      </div>

      {/* Rapport Mois */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          RAPPORT MOIS
        </div>
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'SCORE MOY.', value: avgScore !== null ? `${avgScore}` : '—', color: scoreColor(avgScore) },
              { label: 'MEILLEUR', value: bestScore !== null ? `${bestScore}` : '—', color: '#22c55e' },
              { label: 'TRACKES', value: `${tracked.length}/${days.length}`, color: '#888888' },
              { label: 'PARFAITS', value: `${perfectDays}`, color: '#f5c518' },
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
              PRIÈRES DU MOIS
            </div>
            <div className="space-y-1.5">
              {PRAYER_KEYS.map(pk => (
                <div key={pk} className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: '#ffffff' }}>{PRAYER_LABELS[pk]}</span>
                  <div className="flex gap-3">
                    <span style={{ color: '#f5c518' }}>🕌 {prayerStats[pk].mosque}</span>
                    <span style={{ color: '#22c55e' }}>🏠 {prayerStats[pk].home}</span>
                    <span style={{ color: '#ef4444' }}>⏰ {prayerStats[pk].late}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-1 text-xs" style={{ color: '#888888' }}>
                <span>Rawatib: <span style={{ color: '#f5c518' }}>{rawatibCount}</span></span>
                <span>Doha: <span style={{ color: '#f5c518' }}>{dohaCount}</span></span>
              </div>
            </div>
          </div>

          {/* Bad habits */}
          {badHabitStats.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>
                PÉCHÉS CE MOIS
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

          {/* À améliorer */}
          {bottomHabits.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: '#ef44440f', border: '1px solid #ef444433' }}
            >
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>
                À AMÉLIORER
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

      {/* Calendar */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          CALENDRIER
        </div>
        <div className="p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_ABBR_FR.map(d => (
              <div key={d} className="text-center text-xs font-bold py-1" style={{ color: '#888888' }}>
                {d.slice(0, 3)}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />
              const ds = formatYMD(cell)
              const score = calcScore(data.habits, data.entries[ds], ds)
              const col = scoreColor(score)
              const isToday2 = ds === today
              const entry = data.entries[ds]

              return (
                <button
                  key={ds}
                  onClick={() => onNavigateToDay(ds)}
                  className="rounded p-1 flex flex-col items-center transition-all"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: `1px solid ${isToday2 ? '#f5c518' : '#2a2a2a'}`,
                    minHeight: 52,
                  }}
                >
                  <span
                    className="text-xs font-semibold mb-0.5"
                    style={{ color: score !== null ? col : '#888888' }}
                  >
                    {cell.getDate()}
                  </span>
                  {score !== null && (
                    <span className="text-xs font-bold" style={{ color: col }}>
                      {score}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                    {PRAYER_KEYS.slice(0, 5).map(pk => (
                      <PrayerDot key={pk} status={entry?.prayers[pk] ?? null} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
