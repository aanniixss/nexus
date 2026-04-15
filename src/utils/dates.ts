import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
  differenceInWeeks,
  addDays,
  isSameDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export const today = () => format(new Date(), 'yyyy-MM-dd')

export const formatDate = (date: string) =>
  format(parseISO(date), 'd MMM yyyy', { locale: fr })

export const formatDateShort = (date: string) =>
  format(parseISO(date), 'dd/MM', { locale: fr })

export const getDayName = (date: Date) =>
  format(date, 'EEEE', { locale: fr })

export const isToday = (date: string) => isSameDay(parseISO(date), new Date())

export const isThisWeek = (date: string) =>
  isWithinInterval(parseISO(date), {
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  })

export const isThisMonth = (date: string) =>
  isWithinInterval(parseISO(date), {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

export const isThisYear = (date: string) =>
  isWithinInterval(parseISO(date), {
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  })

export const weeksSince = (startDate: string): number =>
  differenceInWeeks(new Date(), parseISO(startDate))

// Returns the 7 days of the current week (Mon-Sun)
export const getCurrentWeekDays = (): Date[] => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const getDayOfWeek = (date: Date = new Date()) => date.getDay()

// Sport training days: Tue=2, Thu=4, Fri=5, Sun=0
export const SPORT_DAYS = [2, 4, 5, 0]
export const isSportDay = (date: Date = new Date()) =>
  SPORT_DAYS.includes(getDayOfWeek(date))

export const fmtSeconds = (s: number): string => {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m < 60) return rem > 0 ? `${m}m ${rem}s` : `${m}m`
  const h = Math.floor(m / 60)
  const mins = m % 60
  return mins > 0 ? `${h}h ${mins}m` : `${h}h`
}

export const fmtSecondsToHHMM = (s: number): string => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const getLast7Days = (): string[] =>
  Array.from({ length: 7 }, (_, i) =>
    format(addDays(new Date(), -6 + i), 'yyyy-MM-dd')
  )

export const getLast30Days = (): string[] =>
  Array.from({ length: 30 }, (_, i) =>
    format(addDays(new Date(), -29 + i), 'yyyy-MM-dd')
  )
