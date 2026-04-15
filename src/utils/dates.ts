import {
  format,
  parseISO,
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  getDaysInMonth,
  getISOWeek,
  isToday as dfIsToday,
  startOfYear,
  endOfYear,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export const parseDate = (s: string) => parseISO(s)

export const formatYMD = (d: Date) => format(d, 'yyyy-MM-dd')

export const dayOfWeekMon0 = (d: Date): number => {
  const dow = d.getDay() // 0=Sun
  return dow === 0 ? 6 : dow - 1
}

export const fmtDayName = (d: Date) =>
  format(d, 'EEE', { locale: fr }).toUpperCase()

export const fmtDayShort = (d: Date) =>
  format(d, 'd MMM', { locale: fr }).toUpperCase()

export const fmtDayFull = (d: Date) =>
  format(d, 'EEEE d MMM', { locale: fr }).toUpperCase()

export const fmtMonthYear = (d: Date) =>
  format(d, 'MMMM yyyy', { locale: fr }).toUpperCase()

export const fmtMonthName = (d: Date) =>
  format(d, 'MMMM', { locale: fr }).toUpperCase()

export const fmtShortDate = (d: Date) => format(d, 'dd/MM')

export const fmtNavDay = (d: Date) =>
  format(d, 'EEE. d MMM.', { locale: fr }).toUpperCase()

export const isDateToday = (s: string) => dfIsToday(parseISO(s))

export const prevDay = (s: string) => formatYMD(addDays(parseISO(s), -1))
export const nextDay = (s: string) => formatYMD(addDays(parseISO(s), 1))

/** All ISO weeks in a given year (Mon-Sun) */
export function getWeeksOfYear(year: number): { weekNum: number; start: Date; end: Date }[] {
  const jan4 = new Date(year, 0, 4)
  const firstMon = startOfWeek(jan4, { weekStartsOn: 1 })
  const weeks: { weekNum: number; start: Date; end: Date }[] = []
  let cur = firstMon
  while (true) {
    const end = endOfWeek(cur, { weekStartsOn: 1 })
    if (cur.getFullYear() > year) break
    if (cur.getFullYear() === year || end.getFullYear() === year) {
      weeks.push({ weekNum: getISOWeek(cur), start: cur, end })
    }
    cur = addWeeks(cur, 1)
    if (weeks.length > 54) break
  }
  return weeks
}

/** Days in a month as Date array */
export function getDaysOfMonth(year: number, month: number): Date[] {
  const count = getDaysInMonth(new Date(year, month, 1))
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))
}

/** All days in year */
export function getDaysOfYear(year: number): Date[] {
  const start = startOfYear(new Date(year, 0, 1))
  const end = endOfYear(new Date(year, 0, 1))
  const days: Date[] = []
  let cur = start
  while (cur <= end) {
    days.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return days
}

export const fmtSeconds = (s: number): string => {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m < 60) return rem > 0 ? `${m}m ${rem}s` : `${m}m`
  const h = Math.floor(m / 60)
  const mins = m % 60
  return mins > 0 ? `${h}h ${mins}m` : `${h}h`
}

export const MONTH_NAMES_FR = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE',
]

export const DAY_ABBR_FR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']

export { addDays } from 'date-fns'
