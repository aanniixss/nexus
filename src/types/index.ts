export type PrayerStatus = 'mosque' | 'home' | 'late' | null

export type HabitType = 'checkbox' | 'timer' | 'pages'

export interface Habit {
  id: string
  name: string
  icon: string
  type: HabitType
  isBad: boolean
  objectiveMinutes?: number
  objectivePages?: number
  activeDays?: number[] // 0=Mon..6=Sun, undefined = every day
  order: number
}

export interface PrayerEntry {
  fajr: PrayerStatus
  dhuhr: PrayerStatus
  asr: PrayerStatus
  maghrib: PrayerStatus
  isha: PrayerStatus
  rawatib: boolean
  doha: boolean
  qiyam: boolean
}

export interface HabitEntry {
  done: boolean
  durationSeconds?: number
  pages?: number
}

export interface DailyEntry {
  date: string
  prayers: PrayerEntry
  habits: Record<string, HabitEntry>
  badHabits: Record<string, number>
}

export interface Objectif {
  id: string
  title: string
  scope: 'day' | 'week' | 'month' | 'year' | 'longterm'
  done: boolean
  createdAt: string
}

export interface VisionArea {
  id: string
  icon: string
  title: string
  text: string
}

export interface AppData {
  habits: Habit[]
  entries: Record<string, DailyEntry>
  objectives: Objectif[]
  visionAreas: VisionArea[]
  userName: string
}

export type Tab = 'aujourd_hui' | 'semaines' | 'mois' | 'annee' | 'objectifs'
