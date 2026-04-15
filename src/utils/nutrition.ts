import { MacroTarget } from '../types'
import { weeksSince } from './dates'

// Start date of the nutrition plan
export const NUTRITION_START = '2026-04-14'

// Progressive macro phases
// Phase 1 (weeks 1-4):  slight deficit to reduce fat
// Phase 2 (weeks 5-8):  maintenance to let body adapt
// Phase 3 (weeks 9+):   lean bulk to build muscle
export const getTargetMacros = (weekNumber: number): MacroTarget => {
  if (weekNumber <= 4) {
    return { kcal: 2200, protein: 185, carbs: 220, fat: 65 }
  } else if (weekNumber <= 8) {
    return { kcal: 2350, protein: 190, carbs: 245, fat: 67 }
  } else {
    return { kcal: 2500, protein: 195, carbs: 270, fat: 70 }
  }
}

export const getCurrentMacroTarget = (): MacroTarget & { week: number; phase: number } => {
  const week = Math.max(1, weeksSince(NUTRITION_START) + 1)
  const macros = getTargetMacros(week)
  const phase = week <= 4 ? 1 : week <= 8 ? 2 : 3
  return { ...macros, week, phase }
}

export const TOTAL_WEEKS = 26

export const getPhaseLabel = (phase: number): string => {
  switch (phase) {
    case 1: return 'Déficit — Perte de graisse'
    case 2: return 'Maintenance — Adaptation'
    case 3: return 'Lean Bulk — Prise de muscle'
    default: return ''
  }
}

export const macroCalories = (protein: number, carbs: number, fat: number) =>
  protein * 4 + carbs * 4 + fat * 9
