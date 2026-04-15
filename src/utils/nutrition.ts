import { differenceInDays, parseISO } from 'date-fns'
import { MacroTarget } from '../types/extra'

// ── PROFIL ANIS ───────────────────────────────────────────────────────────────
export const PROFILE = {
  name: 'Anis',
  age: 21,
  height: 183,       // cm
  startWeight: 83,   // kg
  goalWeight: 83,    // kg (recomposition — même poids mais sec & musclé)
  bodyFatStart: 22,  // % estimé (skinny fat)
  bodyFatGoal: 12,   // % (abdos visibles)
}

// BMR Mifflin-St Jeor (homme)
// 10×83 + 6.25×183 - 5×21 + 5 = 1874 kcal
// TDEE (4j sport/sem × 1.55) = 2904 kcal
export const TDEE = 2904

export const START_DATE = '2026-04-14'
export const GOAL_DATE  = '2026-12-14'  // 8 mois → résultat final

// ── PHASES NUTRITIONNELLES ────────────────────────────────────────────────────
// Phase 1 (S1-8)  : Déficit ~700kcal → brûle le gras skinny fat
// Phase 2 (S9-16) : Déficit ~500kcal → recomposition
// Phase 3 (S17+)  : Léger surplus   → lean bulk

const PHASES = [
  { maxWeek: 8,        kcal: 2200, protein: 185, carbs: 215, fat: 65, label: 'RECOMPOSITION — DÉFICIT' },
  { maxWeek: 16,       kcal: 2400, protein: 190, carbs: 250, fat: 68, label: 'RECOMPOSITION — MAINTENANCE' },
  { maxWeek: Infinity, kcal: 2650, protein: 195, carbs: 285, fat: 73, label: 'LEAN BULK' },
]

export function getCurrentMacros(): MacroTarget & { label: string } {
  const days = Math.max(0, differenceInDays(new Date(), parseISO(START_DATE)))
  const week  = Math.floor(days / 7) + 1
  const idx   = PHASES.findIndex(p => week <= p.maxWeek)
  const p     = PHASES[idx === -1 ? PHASES.length - 1 : idx]
  return { ...p, phase: (idx === -1 ? PHASES.length : idx) + 1, weekNum: week }
}

export function sumMeals(meals: { kcal: number; protein: number; carbs: number; fat: number }[]) {
  return meals.reduce(
    (a, m) => ({ kcal: a.kcal + m.kcal, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

// ── PLAN REPAS TYPE (Algérie, budget, entraînement le matin après Fajr) ──────
export const MEAL_PLAN = [
  {
    time: '05h00',
    name: 'Pré-workout',
    icon: '⚡',
    description: '1 banane OU 2 dattes + café noir',
    kcal: 150, protein: 2, carbs: 35, fat: 1,
    tip: "Léger — ne pas s'entraîner à jeun complet",
  },
  {
    time: '07h00',
    name: 'Post-workout (PRIORITÉ)',
    icon: '💪',
    description: '4-5 œufs brouillés + 2 tranches pain + 1 fromage triangle + 1 banane',
    kcal: 640, protein: 38, carbs: 52, fat: 22,
    tip: 'Fenêtre anabolique — manger dans les 45 min après l\'entraînement',
  },
  {
    time: '12h30',
    name: 'Déjeuner',
    icon: '🍗',
    description: '250g poulet grillé + 180g riz cuit + tomate + concombre + 1 c. huile d\'olive',
    kcal: 700, protein: 52, carbs: 72, fat: 18,
    tip: 'Plus gros repas de la journée — ne pas sauter',
  },
  {
    time: '16h30',
    name: 'Collation',
    icon: '🥫',
    description: '1 boite thon (140g) égoutté + 1 yaourt nature + 1 pomme OU orange',
    kcal: 310, protein: 34, carbs: 28, fat: 6,
    tip: 'Éviter les féculents l\'après-midi si pas d\'entraînement',
  },
  {
    time: '19h30',
    name: 'Dîner',
    icon: '🍽️',
    description: '200g viande rouge maigre OU 3 œufs + lentilles 150g cuits + légumes (courgettes/carottes/poivrons)',
    kcal: 590, protein: 46, carbs: 48, fat: 20,
    tip: 'Éviter le pain le soir — privilégier légumes + protéines',
  },
]

// Totaux du plan: ~2390 kcal / 172g prot / 235g gluc / 67g lip (Phase 1 ≈ ok)

// ── MILESTONES TRANSFORMATION ─────────────────────────────────────────────────
export const MILESTONES = [
  { month: 1, label: 'Adaptation musculaire', desc: 'Muscles se densifient, énergie augmente' },
  { month: 2, label: 'Gras commence à fondre', desc: 'Ceinture -1cm, ventre un peu plus plat' },
  { month: 3, label: 'Transformation visible', desc: 'Muscles qui ressortent, épaules plus larges' },
  { month: 4, label: 'Corps se dessine', desc: 'Taille plus fine, V-shape commence' },
  { month: 5, label: 'Abdos qui apparaissent', desc: 'Ligne médiane visible, bras plus définis' },
  { month: 6, label: 'Résultat impressionnant', desc: '83kg sec & musclé — objectif presque atteint' },
  { month: 8, label: '🏆 OBJECTIF ATTEINT', desc: 'Abdos visibles, silhouette en V, glow up complet' },
]

export const TOTAL_WEEKS = 32 // 8 mois
export const START_DATE_STR = START_DATE
