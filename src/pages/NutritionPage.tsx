import { useState } from 'react'
import { Plus, Scale, Trash2 } from 'lucide-react'
import { v4 as uuid } from '../utils/uuid'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MealLog, WeightEntry } from '../types'
import Modal from '../components/ui/Modal'
import ProgressRing from '../components/ui/ProgressRing'
import StatBar from '../components/ui/StatBar'
import { getCurrentMacroTarget, getPhaseLabel, TOTAL_WEEKS, NUTRITION_START } from '../utils/nutrition'
import { today, formatDate, weeksSince } from '../utils/dates'

export default function NutritionPage() {
  const [meals, setMeals] = useLocalStorage<MealLog[]>('nexus_meals', [])
  const [weights, setWeights] = useLocalStorage<WeightEntry[]>('nexus_weights', [{ date: NUTRITION_START, weight: 81 }])
  const [mealModal, setMealModal] = useState(false)
  const [weightModal, setWeightModal] = useState(false)
  const [newMeal, setNewMeal] = useState({ label: '', kcal: '', protein: '', carbs: '', fat: '' })
  const [newWeight, setNewWeight] = useState('')

  const { kcal, protein, carbs, fat, week, phase } = getCurrentMacroTarget()
  const todayStr = today()
  const todayMeals = meals.filter(m => m.date === todayStr)

  const consumed = todayMeals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const addMeal = () => {
    const meal: MealLog = {
      id: uuid(),
      date: todayStr,
      label: newMeal.label || 'Repas',
      kcal: Number(newMeal.kcal) || 0,
      protein: Number(newMeal.protein) || 0,
      carbs: Number(newMeal.carbs) || 0,
      fat: Number(newMeal.fat) || 0,
    }
    setMeals(prev => [...prev, meal])
    setNewMeal({ label: '', kcal: '', protein: '', carbs: '', fat: '' })
    setMealModal(false)
  }

  const removeMeal = (id: string) => setMeals(prev => prev.filter(m => m.id !== id))

  const logWeight = () => {
    const w = Number(newWeight)
    if (!w) return
    setWeights(prev => {
      const filtered = prev.filter(e => e.date !== todayStr)
      return [...filtered, { date: todayStr, weight: w }].sort((a, b) => a.date.localeCompare(b.date))
    })
    setNewWeight('')
    setWeightModal(false)
  }

  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : 81
  const startWeight = weights[0]?.weight || 81
  const weightDiff = latestWeight - startWeight
  const weeksElapsed = Math.max(1, weeksSince(NUTRITION_START) + 1)
  const progressPct = Math.min(100, (weeksElapsed / TOTAL_WEEKS) * 100)

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl tracking-widest uppercase">Nutrition</h1>
        <button
          onClick={() => setWeightModal(true)}
          className="flex items-center gap-2 bg-card border border-border text-white font-gotham text-sm px-3 py-2 rounded-xl hover:border-accent transition-colors"
        >
          <Scale size={14} />
          Peser
        </button>
      </div>

      {/* Phase banner */}
      <div className="bg-card border border-accent/30 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-accent text-xs font-bold uppercase tracking-widest">
            Phase {phase} — Semaine {week}/{TOTAL_WEEKS}
          </span>
          <span className="text-muted text-xs">{getPhaseLabel(phase)}</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Weight card */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Poids actuel</p>
          <p className="text-white font-bold text-2xl font-gotham">{latestWeight} <span className="text-muted text-sm">kg</span></p>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs uppercase tracking-wider">Depuis le début</p>
          <p className={`font-bold text-xl font-gotham ${weightDiff < 0 ? 'text-green-400' : weightDiff > 0 ? 'text-red-400' : 'text-muted'}`}>
            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Daily macro rings */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Macros du jour</h2>
        <div className="flex justify-around">
          <ProgressRing value={consumed.kcal} max={kcal} size={72} label="kcal" sublabel={`/${kcal}`} color="#f5c518" />
          <ProgressRing value={consumed.protein} max={protein} size={72} label="Prot." sublabel={`/${protein}g`} color="#60a5fa" />
          <ProgressRing value={consumed.carbs} max={carbs} size={72} label="Gluc." sublabel={`/${carbs}g`} color="#34d399" />
          <ProgressRing value={consumed.fat} max={fat} size={72} label="Lip." sublabel={`/${fat}g`} color="#f97316" />
        </div>
        <div className="space-y-2 mt-4">
          <StatBar label="Protéines" value={consumed.protein} max={protein} unit="g" color="#60a5fa" />
          <StatBar label="Glucides" value={consumed.carbs} max={carbs} unit="g" color="#34d399" />
          <StatBar label="Lipides" value={consumed.fat} max={fat} unit="g" color="#f97316" />
        </div>
      </div>

      {/* Today meals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-muted text-xs uppercase tracking-widest">Repas du jour</h2>
          <button
            onClick={() => setMealModal(true)}
            className="flex items-center gap-1 text-accent text-xs font-bold uppercase tracking-wider"
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>
        {todayMeals.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-4 text-center text-muted text-sm">
            Aucun repas enregistré
          </div>
        ) : (
          <div className="space-y-2">
            {todayMeals.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-gotham font-semibold">{m.label}</p>
                  <p className="text-muted text-xs">
                    {m.kcal} kcal · P:{m.protein}g · G:{m.carbs}g · L:{m.fat}g
                  </p>
                </div>
                <button onClick={() => removeMeal(m.id)} className="text-border hover:text-danger transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight history */}
      {weights.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-muted text-xs uppercase tracking-widest mb-3">Historique du poids</h2>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[...weights].reverse().map(w => (
              <div key={w.date} className="flex justify-between text-sm">
                <span className="text-muted">{formatDate(w.date)}</span>
                <span className="text-white font-gotham font-semibold">{w.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add meal modal */}
      <Modal isOpen={mealModal} onClose={() => setMealModal(false)} title="Ajouter un repas">
        <div className="space-y-3">
          {[
            { key: 'label', label: 'Nom du repas', placeholder: 'Ex: Déjeuner', type: 'text' },
            { key: 'kcal', label: 'Calories (kcal)', placeholder: '0', type: 'number' },
            { key: 'protein', label: 'Protéines (g)', placeholder: '0', type: 'number' },
            { key: 'carbs', label: 'Glucides (g)', placeholder: '0', type: 'number' },
            { key: 'fat', label: 'Lipides (g)', placeholder: '0', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-muted text-xs uppercase tracking-wider mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={newMeal[f.key as keyof typeof newMeal]}
                onChange={e => setNewMeal(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white font-gotham placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
          <button
            onClick={addMeal}
            className="w-full bg-accent text-black font-bold font-gotham uppercase tracking-wider py-3 rounded-xl hover:bg-accent-hover transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </Modal>

      {/* Weight modal */}
      <Modal isOpen={weightModal} onClose={() => setWeightModal(false)} title="Peser aujourd'hui">
        <div className="space-y-4">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider mb-1 block">Poids (kg)</label>
            <input
              autoFocus
              type="number"
              step="0.1"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && logWeight()}
              placeholder="Ex: 80.5"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white font-gotham placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={logWeight}
            disabled={!newWeight}
            className="w-full bg-accent text-black font-bold font-gotham uppercase tracking-wider py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </Modal>
    </div>
  )
}
