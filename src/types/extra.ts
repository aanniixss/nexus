// ── SPORT ────────────────────────────────────────────────────────────────────
export interface SportDayEntry {
  seance: boolean
  seanceDuration: number   // seconds
  cardio: boolean
  cardioDuration: number
  etirements: boolean
  etirementsD: number
}

// ── NUTRITION ─────────────────────────────────────────────────────────────────
export interface Meal {
  id: string
  label: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface NutritionDayEntry {
  meals: Meal[]
}

export interface MacroTarget {
  kcal: number
  protein: number
  carbs: number
  fat: number
  phase: number
  weekNum: number
}

// ── DÉVELOPPEMENT PERSONNEL ───────────────────────────────────────────────────
export interface LangSession {
  id: string
  language: string
  date: string           // YYYY-MM-DD
  durationSeconds: number
}

export interface BookSession {
  id: string
  date: string
  pages: number
  durationSeconds: number
}

export interface Book {
  id: string
  title: string
  author: string
  sessions: BookSession[]
  finished: boolean
  startedAt: string
}

// ── EXTRA DATA ROOT ───────────────────────────────────────────────────────────
export interface ExtraData {
  sportEntries: Record<string, SportDayEntry>   // date -> entry
  nutritionEntries: Record<string, NutritionDayEntry>
  weightEntries: Record<string, number>         // date -> kg
  langSessions: LangSession[]
  currentLangIndex: number
  books: Book[]
  currentBookId: string | null
}

export const DEFAULT_EXTRA: ExtraData = {
  sportEntries: {},
  nutritionEntries: {},
  weightEntries: {},
  langSessions: [],
  currentLangIndex: 0,
  books: [],
  currentBookId: null,
}
