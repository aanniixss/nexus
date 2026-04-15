// ─── OBJECTIFS ───────────────────────────────────────────────────────────────
export type ObjectifScope = 'day' | 'week' | 'month' | 'year'

export interface Objectif {
  id: string
  title: string
  deadline: string // ISO date YYYY-MM-DD
  scope: ObjectifScope
  done: boolean
  createdAt: string
}

// ─── SPORT ────────────────────────────────────────────────────────────────────
export interface SportEntry {
  date: string // YYYY-MM-DD
  seanceFaite: boolean
  seanceDuration: number // seconds
  cardio: boolean
  cardioDuration: number
  etirements: boolean
  etirementsD: number
}

// ─── NUTRITION ────────────────────────────────────────────────────────────────
export interface MacroTarget {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface MealLog {
  id: string
  date: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  label: string
}

export interface WeightEntry {
  date: string
  weight: number
}

// ─── RELIGION ─────────────────────────────────────────────────────────────────
export type PrayerStatus = 'mosque' | 'home' | 'late' | null

export interface PrayerEntry {
  date: string
  fajr: PrayerStatus
  dhuhr: PrayerStatus
  asr: PrayerStatus
  maghrib: PrayerStatus
  isha: PrayerStatus
}

export interface RawatibEntry {
  date: string
  done: boolean
  duration: number // seconds
}

export interface QiyamEntry {
  date: string
  done: boolean
  duration: number
}

export interface CoranEntry {
  date: string
  pages: number
  duration: number
}

// ─── DÉVELOPPEMENT PERSONNEL ──────────────────────────────────────────────────
export interface LanguageSession {
  id: string
  language: string
  date: string
  duration: number // seconds
}

export interface LanguageConfig {
  key: string
  label: string
  estimatedMonths: number
  hoursNeeded: number // total hours to mastery
  order: number
}

export interface BookEntry {
  id: string
  title: string
  author: string
  totalPages: number
  sessions: { date: string; pages: number; duration: number }[]
  finished: boolean
  startedAt: string
}

// ─── HABITUDES ────────────────────────────────────────────────────────────────
export type HabitTrackingType = 'checkbox' | 'timer' | 'pages'

export interface HabitDayEntry {
  done: boolean
  duration: number // seconds
  pages?: number
}

export interface Habit {
  id: string
  name: string
  createdAt: string
  trackingType: HabitTrackingType
  objectiveValue?: number // minutes or pages
  entries: Record<string, HabitDayEntry> // key: YYYY-MM-DD
}
