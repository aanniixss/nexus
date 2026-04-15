import { AppData } from '../types'
import {
  getDaysOfYear, getDaysOfMonth, formatYMD, MONTH_NAMES_FR, DAY_ABBR_FR, todayStr,
} from '../utils/dates'
import { calcScore, scoreColor, calcStreak, getApplicableHabits, habitDone } from '../utils/score'

interface Props {
  year: number
  data: AppData
  onNavigateToDay: (date: string) => void
}

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export default function AnneePage({ year, data, onNavigateToDay }: Props) {
  const allDays = getDaysOfYear(year)
  const today = todayStr()
  const streak = calcStreak(data)

  const dayScores = allDays.map(d => {
    const ds = formatYMD(d)
    return { date: ds, day: d, score: calcScore(data.habits, data.entries[ds], ds) }
  })

  const tracked = dayScores.filter(d => d.score !== null)
  const avgScore = tracked.length > 0
    ? Math.round(tracked.reduce((a, b) => a + b.score!, 0) / tracked.length)
    : null
  const perfectDays = tracked.filter(d => d.score === 100).length

  // Prayer stats
  let mosqueTotal = 0, homeTotal = 0
  allDays.forEach(d => {
    const ds = formatYMD(d)
    const entry = data.entries[ds]
    if (!entry) return
    PRAYER_KEYS.forEach(pk => {
      if (entry.prayers[pk] === 'mosque') mosqueTotal++
      else if (entry.prayers[pk] === 'home') homeTotal++
    })
  })
  const totalPossiblePrayers = tracked.length * 5
  const mosquePct = totalPossiblePrayers > 0 ? Math.round((mosqueTotal / totalPossiblePrayers) * 100) : 0

  // Bad habits
  const badHabits = data.habits.filter(h => h.isBad)
  const badHabitStats = badHabits.map(habit => {
    let total = 0
    allDays.forEach(d => {
      const ds = formatYMD(d)
      total += data.entries[ds]?.badHabits[habit.id] ?? 0
    })
    return { habit, total }
  }).filter(b => b.total > 0)

  // À travailler
  const goodHabits = data.habits.filter(h => !h.isBad)
  const habitStats = goodHabits.map(habit => {
    let applicable = 0, done = 0
    allDays.forEach(d => {
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
  const bottomHabits = [...habitStats].sort((a, b) => a.pct - b.pct).slice(0, 5).filter(h => h.applicable > 0)

  // Monthly scores for bar chart
  const monthScores = Array.from({ length: 12 }, (_, m) => {
    const monthDays = getDaysOfMonth(year, m)
    const monthScoreList = monthDays.map(d => {
      const ds = formatYMD(d)
      return calcScore(data.habits, data.entries[ds], ds)
    }).filter(s => s !== null) as number[]
    return monthScoreList.length > 0
      ? Math.round(monthScoreList.reduce((a, b) => a + b, 0) / monthScoreList.length)
      : null
  })

  // Heatmap: 7 rows (L/M/M/J/V/S/D) × 53 columns (weeks)
  // Find the Monday of the first week
  const firstDay = new Date(year, 0, 1)
  const firstDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  // Add empty days at start to align to Monday
  const paddedDays: (typeof dayScores[0] | null)[] = [
    ...Array(firstDow).fill(null),
    ...dayScores,
  ]
  // Pad to complete weeks
  while (paddedDays.length % 7 !== 0) paddedDays.push(null)
  const numWeeks = paddedDays.length / 7

  // Transpose: heatmap[row][col] where row=dayOfWeek(0=Mon), col=weekIndex
  const heatmap: (typeof dayScores[0] | null)[][] = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: numWeeks }, (_, col) => paddedDays[col * 7 + row] ?? null)
  )

  const cellSize = Math.min(12, Math.floor((window.innerWidth - 48) / numWeeks))

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">
      <div className="font-bold tracking-widest" style={{ color: '#f5c518' }}>
        ANNEE {year}
      </div>

      {/* Heatmap */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          HEATMAP {year}
        </div>
        <div className="p-3 overflow-x-auto">
          <div className="flex gap-0.5" style={{ minWidth: 'max-content' }}>
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_ABBR_FR.map(d => (
                <div
                  key={d}
                  className="flex items-center text-xs"
                  style={{ color: '#888888', height: cellSize, fontSize: 9, width: 14 }}
                >
                  {d.charAt(0)}
                </div>
              ))}
            </div>
            {/* Grid */}
            {Array.from({ length: numWeeks }, (_, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }, (_, rowIdx) => {
                  const cell = heatmap[rowIdx][colIdx]
                  if (!cell) {
                    return (
                      <div
                        key={rowIdx}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          borderRadius: 2,
                          backgroundColor: 'transparent',
                        }}
                      />
                    )
                  }
                  const score = cell.score
                  let bg = '#1a1a1a'
                  if (score !== null) {
                    if (score >= 70) bg = '#22c55e66'
                    else if (score >= 40) bg = '#f5c51866'
                    else bg = '#ef444466'
                  }
                  const isToday2 = cell.date === today
                  return (
                    <button
                      key={rowIdx}
                      onClick={() => onNavigateToDay(cell.date)}
                      title={`${cell.date}: ${score !== null ? score : 'non tracké'}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: 2,
                        backgroundColor: bg,
                        border: isToday2 ? '1px solid #f5c518' : 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#888888' }}>
            <div className="flex items-center gap-1">
              <div style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: '#22c55e66' }} />
              <span>≥70</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: '#f5c51866' }} />
              <span>≥40</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: '#ef444466' }} />
              <span>&lt;40</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: '#1a1a1a' }} />
              <span>Non tracké</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bilan Annuel */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          BILAN ANNUEL
        </div>
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'SCORE MOY.', value: avgScore !== null ? `${avgScore}` : '—', color: scoreColor(avgScore) },
              { label: 'JOURS', value: `${tracked.length}`, color: '#888888' },
              { label: 'PARFAITS', value: `${perfectDays}`, color: '#f5c518' },
              { label: 'SÉRIE', value: `🔥 ${streak}`, color: '#f5c518' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs" style={{ color: '#888888' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="text-xs mb-3" style={{ color: '#888888' }}>
            Mosquée: <span style={{ color: '#f5c518' }}>{mosqueTotal} ({mosquePct}%)</span>
            {' / '}
            Maison: <span style={{ color: '#22c55e' }}>{homeTotal}</span>
          </div>

          {/* Bad habits */}
          {badHabitStats.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>
                PÉCHÉS
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

      {/* Score par mois */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          SCORE PAR MOIS
        </div>
        <div className="px-4 py-4">
          <div className="flex items-end gap-1.5 h-24">
            {monthScores.map((score, m) => {
              const col = scoreColor(score)
              const pct = score !== null ? score : 0
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-xs" style={{ color: col, fontSize: 9 }}>
                    {score !== null ? score : ''}
                  </span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${Math.max(4, pct)}%`,
                      backgroundColor: col,
                      opacity: score !== null ? 0.8 : 0.2,
                    }}
                  />
                  <span className="text-xs" style={{ color: '#888888', fontSize: 9 }}>
                    {MONTH_NAMES_FR[m].slice(0, 3)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
