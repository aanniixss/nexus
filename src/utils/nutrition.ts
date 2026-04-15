import { differenceInDays, parseISO } from 'date-fns'
import { MacroTarget } from '../types/extra'

const START_DATE = '2026-04-14'

const PHASES = [
  { maxWeek: 4,        kcal: 2200, protein: 185, carbs: 220, fat: 65 },
  { maxWeek: 8,        kcal: 2350, protein: 190, carbs: 245, fat: 67 },
  { maxWeek: Infinity, kcal: 2500, protein: 195, carbs: 270, fat: 70 },
]

export function getCurrentMacros(): MacroTarget {
  const start = parseISO(START_DATE)
  const today = new Date()
  const days = Math.max(0, differenceInDays(today, start))
  const week = Math.floor(days / 7) + 1

  const phase = PHASES.findIndex(p => week <= p.maxWeek)
  const idx = phase === -1 ? PHASES.length - 1 : phase
  const p = PHASES[idx]

  return { kcal: p.kcal, protein: p.protein, carbs: p.carbs, fat: p.fat, phase: idx + 1, weekNum: week }
}

export function sumMeals(meals: { kcal: number; protein: number; carbs: number; fat: number }[]) {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export const TOTAL_WEEKS = 26   // 6-month programme
export const START_DATE_STR = START_DATE
