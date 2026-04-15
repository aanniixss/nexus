import { useState } from 'react'
import { AppData, DailyEntry, PrayerStatus, Habit } from '../types'
import {
  parseDate, fmtNavDay, prevDay, nextDay, todayStr, formatYMD, fmtSeconds,
} from '../utils/dates'
import { calcScore, scoreColor, getApplicableHabits, habitDone } from '../utils/score'
import { useTimer } from '../hooks/useTimer'

interface Props {
  selectedDate: string
  onDateChange: (d: string) => void
  data: AppData
  updateEntry: (date: string, updater: (e: DailyEntry) => DailyEntry) => void
}

const PRAYER_NAMES: Array<{ key: keyof DailyEntry['prayers']; label: string }> = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
]

const PRAYER_STATUSES: Array<{ value: PrayerStatus; label: string; icon: string }> = [
  { value: 'mosque', label: 'Mosquée', icon: '🕌' },
  { value: 'home', label: 'Maison', icon: '🏠' },
  { value: 'late', label: 'H.Temps', icon: '⏰' },
]

function PrayerRow({
  label,
  value,
  onSet,
}: {
  label: string
  value: PrayerStatus
  onSet: (v: PrayerStatus) => void
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-20 text-sm font-semibold" style={{ color: '#ffffff' }}>{label}</span>
      <div className="flex gap-1 flex-wrap">
        {PRAYER_STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => onSet(value === s.value ? null : s.value)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all"
            style={{
              backgroundColor: value === s.value ? '#f5c518' : '#1a1a1a',
              color: value === s.value ? '#000000' : '#888888',
              border: `1px solid ${value === s.value ? '#f5c518' : '#2a2a2a'}`,
            }}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 py-1 text-sm"
    >
      <span
        className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          backgroundColor: checked ? '#f5c518' : 'transparent',
          borderColor: checked ? '#f5c518' : '#2a2a2a',
        }}
      >
        {checked && <span style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>✓</span>}
      </span>
      <span style={{ color: checked ? '#f5c518' : '#888888' }}>{label}</span>
    </button>
  )
}

function HabitTimerRow({
  habit,
  entry,
  onUpdate,
}: {
  habit: Habit
  entry: DailyEntry | undefined
  onUpdate: (habitId: string, vals: { done?: boolean; durationSeconds?: number; pages?: number }) => void
}) {
  const savedSeconds = entry?.habits[habit.id]?.durationSeconds ?? 0
  const isDone = habitDone(habit, entry)
  const timer = useTimer()

  const handleStart = () => {
    timer.start(savedSeconds)
  }

  const handleStop = () => {
    const elapsed = timer.stop()
    onUpdate(habit.id, { durationSeconds: elapsed, done: habit.objectiveMinutes ? elapsed >= habit.objectiveMinutes * 60 : true })
  }

  const displaySeconds = timer.isRunning ? timer.elapsed : savedSeconds
  const objSeconds = (habit.objectiveMinutes ?? 0) * 60
  const pct = objSeconds > 0 ? Math.min(100, Math.round((displaySeconds / objSeconds) * 100)) : 0

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{
        backgroundColor: isDone ? 'rgba(34,197,94,0.08)' : '#1a1a1a',
        border: `1px solid ${isDone ? '#22c55e33' : '#2a2a2a'}`,
      }}
    >
      <span className="text-xl flex-shrink-0">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: isDone ? '#22c55e' : '#ffffff' }}
          >
            {habit.name}
          </span>
          {isDone && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#22c55e22', color: '#22c55e' }}>
              ✓
            </span>
          )}
        </div>
        {(savedSeconds > 0 || timer.isRunning) && (
          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: '#2a2a2a' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isDone ? '#22c55e' : '#f5c518',
                }}
              />
            </div>
            <span className="text-xs" style={{ color: '#888888' }}>
              {fmtSeconds(displaySeconds)}{habit.objectiveMinutes ? ` / ${habit.objectiveMinutes}m` : ''}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {timer.isRunning ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all"
            style={{ backgroundColor: '#ef4444', color: '#fff' }}
          >
            <span>⏹</span>
            <span>{fmtSeconds(timer.elapsed)}</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all"
            style={{
              backgroundColor: isDone ? '#22c55e22' : '#1a1a1a',
              color: isDone ? '#22c55e' : '#f5c518',
              border: `1px solid ${isDone ? '#22c55e44' : '#f5c518'}`,
            }}
          >
            <span>▶</span>
          </button>
        )}
      </div>
    </div>
  )
}

function HabitPagesRow({
  habit,
  entry,
  onUpdate,
}: {
  habit: Habit
  entry: DailyEntry | undefined
  onUpdate: (habitId: string, vals: { done?: boolean; durationSeconds?: number; pages?: number }) => void
}) {
  const pages = entry?.habits[habit.id]?.pages ?? 0
  const isDone = habitDone(habit, entry)
  const obj = habit.objectivePages ?? 1

  const setPages = (val: number) => {
    const p = Math.max(0, val)
    onUpdate(habit.id, { pages: p, done: p >= obj })
  }

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{
        backgroundColor: isDone ? 'rgba(34,197,94,0.08)' : '#1a1a1a',
        border: `1px solid ${isDone ? '#22c55e33' : '#2a2a2a'}`,
      }}
    >
      <span className="text-xl flex-shrink-0">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <span
          className="text-sm font-semibold"
          style={{ color: isDone ? '#22c55e' : '#ffffff' }}
        >
          {habit.name}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: '#2a2a2a' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((pages / obj) * 100))}%`,
                backgroundColor: isDone ? '#22c55e' : '#f5c518',
              }}
            />
          </div>
          <span className="text-xs" style={{ color: '#888888' }}>
            {pages}/{obj}p
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPages(pages - 1)}
          className="w-7 h-7 rounded flex items-center justify-center text-lg font-bold transition-colors"
          style={{ backgroundColor: '#2a2a2a', color: '#888888' }}
        >
          −
        </button>
        <input
          type="number"
          value={pages}
          onChange={e => setPages(parseInt(e.target.value) || 0)}
          className="w-10 text-center text-sm font-bold rounded py-1"
          style={{ backgroundColor: '#0a0a0a', color: '#ffffff', border: '1px solid #2a2a2a' }}
          min={0}
        />
        <button
          onClick={() => setPages(pages + 1)}
          className="w-7 h-7 rounded flex items-center justify-center text-lg font-bold transition-colors"
          style={{ backgroundColor: '#f5c518', color: '#000' }}
        >
          +
        </button>
      </div>
    </div>
  )
}

function HabitCheckboxRow({
  habit,
  entry,
  onUpdate,
}: {
  habit: Habit
  entry: DailyEntry | undefined
  onUpdate: (habitId: string, vals: { done?: boolean }) => void
}) {
  const isDone = habitDone(habit, entry)

  return (
    <button
      onClick={() => onUpdate(habit.id, { done: !isDone })}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all"
      style={{
        backgroundColor: isDone ? 'rgba(34,197,94,0.08)' : '#1a1a1a',
        border: `1px solid ${isDone ? '#22c55e33' : '#2a2a2a'}`,
      }}
    >
      <span className="text-xl flex-shrink-0">{habit.icon}</span>
      <span
        className="flex-1 text-sm font-semibold text-left"
        style={{ color: isDone ? '#22c55e' : '#ffffff' }}
      >
        {habit.name}
      </span>
      <span
        className="w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          backgroundColor: isDone ? '#22c55e' : 'transparent',
          borderColor: isDone ? '#22c55e' : '#2a2a2a',
        }}
      >
        {isDone && <span style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>✓</span>}
      </span>
    </button>
  )
}

export default function AujourdhuiPage({ selectedDate, onDateChange, data, updateEntry }: Props) {
  const entry = data.entries[selectedDate]
  const habits = data.habits
  const goodHabits = habits.filter(h => !h.isBad).sort((a, b) => a.order - b.order)
  const badHabits = habits.filter(h => h.isBad).sort((a, b) => a.order - b.order)
  const applicable = getApplicableHabits(habits, selectedDate)
  const score = calcScore(habits, entry, selectedDate)
  const color = scoreColor(score)

  const today = todayStr()
  const dateObj = parseDate(selectedDate)
  const isToday = selectedDate === today

  const prayers = entry?.prayers ?? {
    fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null,
    rawatib: false, doha: false, qiyam: false,
  }

  const setPrayer = (key: keyof DailyEntry['prayers'], value: PrayerStatus | boolean) => {
    updateEntry(selectedDate, e => ({
      ...e,
      prayers: { ...e.prayers, [key]: value },
    }))
  }

  const updateHabitEntry = (habitId: string, vals: { done?: boolean; durationSeconds?: number; pages?: number }) => {
    updateEntry(selectedDate, e => ({
      ...e,
      habits: {
        ...e.habits,
        [habitId]: { ...(e.habits[habitId] ?? { done: false }), ...vals },
      },
    }))
  }

  const updateBadHabit = (habitId: string, delta: number) => {
    updateEntry(selectedDate, e => {
      const cur = e.badHabits[habitId] ?? 0
      const next = Math.max(0, cur + delta)
      return { ...e, badHabits: { ...e.badHabits, [habitId]: next } }
    })
  }

  const goTo = (dir: -1 | 1) => {
    const next = dir === -1 ? prevDay(selectedDate) : nextDay(selectedDate)
    onDateChange(next)
  }

  const isFuture = selectedDate > today

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
      {/* Day Navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goTo(-1)}
          className="p-2 rounded transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          ←
        </button>
        <div className="text-center">
          <div className="font-bold tracking-widest text-sm" style={{ color: isToday ? '#f5c518' : '#ffffff' }}>
            {fmtNavDay(dateObj)}
          </div>
          {isToday && (
            <div className="text-xs" style={{ color: '#888888' }}>AUJOURD'HUI</div>
          )}
        </div>
        <button
          onClick={() => goTo(1)}
          disabled={isFuture}
          className="p-2 rounded transition-colors"
          style={{ color: isFuture ? '#2a2a2a' : '#888888' }}
          onMouseEnter={e => { if (!isFuture) (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
          onMouseLeave={e => { if (!isFuture) (e.currentTarget as HTMLElement).style.color = '#888888' }}
        >
          →
        </button>
      </div>

      {/* Score Card */}
      <div
        className="rounded-xl p-5 text-center"
        style={{ backgroundColor: '#111111', border: `2px solid ${color}33` }}
      >
        <div className="text-xs tracking-widest mb-2" style={{ color: '#888888' }}>SCORE DU JOUR</div>
        <div className="text-7xl font-bold mb-1" style={{ color }}>
          {score !== null ? score : '—'}
        </div>
        <div className="text-xs" style={{ color: '#888888' }}>
          {applicable.filter(h => habitDone(h, entry)).length}/{applicable.length} habitudes
        </div>
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${score ?? 0}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* PRIÈRES */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          🕌 PRIÈRES
        </div>
        <div className="px-4 py-3 space-y-1">
          {PRAYER_NAMES.map(p => (
            <PrayerRow
              key={p.key}
              label={p.label}
              value={prayers[p.key] as PrayerStatus}
              onSet={v => setPrayer(p.key, v)}
            />
          ))}
          <div
            className="pt-3 mt-3 flex flex-wrap gap-4"
            style={{ borderTop: '1px solid #2a2a2a' }}
          >
            <CheckboxRow
              label="Rawatib"
              checked={!!prayers.rawatib}
              onToggle={() => setPrayer('rawatib', !prayers.rawatib)}
            />
            <CheckboxRow
              label="Doha"
              checked={!!prayers.doha}
              onToggle={() => setPrayer('doha', !prayers.doha)}
            />
            <CheckboxRow
              label="Qiyam"
              checked={!!prayers.qiyam}
              onToggle={() => setPrayer('qiyam', !prayers.qiyam)}
            />
          </div>
        </div>
      </div>

      {/* HABITUDES */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#f5c518', borderBottom: '1px solid #2a2a2a' }}
        >
          ⚡ HABITUDES
        </div>
        <div className="px-4 py-3 space-y-2">
          {goodHabits.map(habit => {
            const isApplicable = !habit.activeDays || habit.activeDays.length === 0
              ? true
              : habit.activeDays.includes(
                  parseDate(selectedDate).getDay() === 0 ? 6 : parseDate(selectedDate).getDay() - 1
                )
            if (!isApplicable) {
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-30"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  <span className="text-xl flex-shrink-0">{habit.icon}</span>
                  <span className="flex-1 text-sm" style={{ color: '#888888' }}>{habit.name}</span>
                  <span className="text-xs" style={{ color: '#888888' }}>Non actif</span>
                </div>
              )
            }
            if (habit.type === 'timer') {
              return (
                <HabitTimerRow
                  key={habit.id}
                  habit={habit}
                  entry={entry}
                  onUpdate={updateHabitEntry}
                />
              )
            }
            if (habit.type === 'pages') {
              return (
                <HabitPagesRow
                  key={habit.id}
                  habit={habit}
                  entry={entry}
                  onUpdate={updateHabitEntry}
                />
              )
            }
            return (
              <HabitCheckboxRow
                key={habit.id}
                habit={habit}
                entry={entry}
                onUpdate={updateHabitEntry}
              />
            )
          })}
        </div>
      </div>

      {/* MAUVAISES HABITUDES */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div
          className="px-4 py-3 text-xs font-bold tracking-widest"
          style={{ backgroundColor: '#1a1a1a', color: '#ef4444', borderBottom: '1px solid #2a2a2a' }}
        >
          ⚠️ MAUVAISES HABITUDES
        </div>
        <div className="px-4 py-3 space-y-2">
          {badHabits.map(habit => {
            const count = entry?.badHabits[habit.id] ?? 0
            const hasFallen = count > 0
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{
                  backgroundColor: hasFallen ? 'rgba(239,68,68,0.08)' : '#1a1a1a',
                  border: `1px solid ${hasFallen ? '#ef444433' : '#2a2a2a'}`,
                }}
              >
                <span className="text-xl flex-shrink-0">{habit.icon}</span>
                <span
                  className="flex-1 text-sm font-semibold"
                  style={{ color: hasFallen ? '#ef4444' : '#ffffff' }}
                >
                  {habit.name}
                </span>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#ef444422', color: '#ef4444' }}
                    >
                      {count}x
                    </span>
                  )}
                  <button
                    onClick={() => updateBadHabit(habit.id, -1)}
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#2a2a2a', color: '#888888' }}
                  >
                    −
                  </button>
                  <button
                    onClick={() => updateBadHabit(habit.id, 1)}
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: '#ef444422', color: '#ef4444', border: '1px solid #ef444433' }}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
