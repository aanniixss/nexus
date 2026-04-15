import { Habit, DailyEntry, AppData } from '../types'
import { dayOfWeekMon0, formatYMD, todayStr, parseDate, addDays } from './dates'
import { format, addDays as dfAddDays } from 'date-fns'

export function getApplicableHabits(habits: Habit[], date: string): Habit[] {
  const d = parseDate(date)
  const dow = dayOfWeekMon0(d)
  return habits.filter(h => {
    if (h.isBad) return false
    if (!h.activeDays || h.activeDays.length === 0) return true
    return h.activeDays.includes(dow)
  })
}

export function habitDone(habit: Habit, entry: DailyEntry | undefined): boolean {
  if (!entry) return false
  const h = entry.habits[habit.id]
  if (!h) return false
  if (habit.type === 'checkbox') return !!h.done
  if (habit.type === 'timer') {
    if (h.done) return true
    if (habit.objectiveMinutes && h.durationSeconds) {
      return h.durationSeconds >= habit.objectiveMinutes * 60
    }
    return !!h.done
  }
  if (habit.type === 'pages') {
    if (h.done) return true
    if (habit.objectivePages && h.pages) {
      return h.pages >= habit.objectivePages
    }
    return !!h.done
  }
  return false
}

export function calcScore(habits: Habit[], entry: DailyEntry | undefined, date: string): number | null {
  const applicable = getApplicableHabits(habits, date)
  if (applicable.length === 0) return null
  const done = applicable.filter(h => habitDone(h, entry)).length
  return Math.round((done / applicable.length) * 100)
}

export function scoreColor(score: number | null): string {
  if (score === null) return '#888888'
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f5c518'
  return '#ef4444'
}

export function scoreLabel(score: number | null): string {
  if (score === null) return '—'
  return `${score}`
}

export function calcStreak(data: AppData): number {
  const today = parseDate(todayStr())
  let streak = 0
  let cur = today
  for (let i = 0; i < 365; i++) {
    const dateStr = formatYMD(cur)
    const entry = data.entries[dateStr]
    const score = calcScore(data.habits, entry, dateStr)
    if (score !== null && score >= 40) {
      streak++
    } else if (i === 0) {
      // today not tracked yet is OK — check yesterday
    } else {
      break
    }
    cur = dfAddDays(cur, -1)
  }
  return streak
}
