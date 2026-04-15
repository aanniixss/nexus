import { useState } from 'react'
import { ExtraData, Meal } from '../types/extra'
import { getCurrentMacros, sumMeals, TOTAL_WEEKS, START_DATE_STR } from '../utils/nutrition'
import { todayStr } from '../utils/dates'
import { differenceInDays, parseISO } from 'date-fns'

interface Props {
  extra: ExtraData
  setExtra: (fn: (e: ExtraData) => ExtraData) => void
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: '#888888' }}>{label}</span>
        <span style={{ color: '#ffffff' }}>{current}g <span style={{ color: '#555' }}>/ {target}g</span></span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function NutritionPanel({ extra, setExtra }: Props) {
  const today = todayStr()
  const macros = getCurrentMacros()
  const dayEntry = extra.nutritionEntries[today] ?? { meals: [] }
  const totals = sumMeals(dayEntry.meals)

  const days = Math.max(0, differenceInDays(new Date(), parseISO(START_DATE_STR)))
  const weekNum = Math.floor(days / 7) + 1
  const progPct = Math.min(100, Math.round((weekNum / TOTAL_WEEKS) * 100))

  const [form, setForm] = useState({ label: '', kcal: '', protein: '', carbs: '', fat: '' })
  const [showForm, setShowForm] = useState(false)
  const [showWeight, setShowWeight] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const addMeal = () => {
    if (!form.kcal) return
    const meal: Meal = {
      id: Date.now().toString(),
      label: form.label || 'Repas',
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    }
    setExtra(e => ({
      ...e,
      nutritionEntries: {
        ...e.nutritionEntries,
        [today]: { meals: [...(e.nutritionEntries[today]?.meals ?? []), meal] },
      },
    }))
    setForm({ label: '', kcal: '', protein: '', carbs: '', fat: '' })
    setShowForm(false)
  }

  const removeMeal = (id: string) => {
    setExtra(e => ({
      ...e,
      nutritionEntries: {
        ...e.nutritionEntries,
        [today]: { meals: (e.nutritionEntries[today]?.meals ?? []).filter(m => m.id !== id) },
      },
    }))
  }

  const saveWeight = () => {
    const w = parseFloat(weightInput)
    if (!w) return
    setExtra(e => ({ ...e, weightEntries: { ...e.weightEntries, [today]: w } }))
    setShowWeight(false)
    setWeightInput('')
  }

  const kcalPct = Math.min(100, Math.round((totals.kcal / macros.kcal) * 100))
  const currentWeight = extra.weightEntries[today] ?? Object.values(extra.weightEntries).pop() ?? 81

  return (
    <div className="p-4 space-y-4">
      {/* Phase card */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold tracking-widest text-sm uppercase" style={{ color: '#f5c518' }}>
            🥗 PHASE {macros.phase}
          </h3>
          <span className="text-xs" style={{ color: '#888' }}>SEMAINE {weekNum}/{TOTAL_WEEKS}</span>
        </div>
        <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="h-1.5 rounded-full" style={{ width: `${progPct}%`, backgroundColor: '#f5c518' }} />
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'KCAL', value: macros.kcal, unit: '' },
            { label: 'PROT', value: macros.protein, unit: 'g' },
            { label: 'GLUC', value: macros.carbs, unit: 'g' },
            { label: 'LIP', value: macros.fat, unit: 'g' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="text-xs" style={{ color: '#555' }}>{label}</div>
              <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{value}{unit}</div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: '#555' }}>
          81kg skinny-fat → musclé & sec · Début 14/04/2026
        </p>
      </div>

      {/* Today kcal */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold tracking-widest text-xs uppercase" style={{ color: '#888888' }}>
            AUJOURD'HUI
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWeight(!showWeight)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ backgroundColor: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
            >
              ⚖️ {currentWeight}kg
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-xs px-2 py-1 rounded-lg font-bold"
              style={{ backgroundColor: '#f5c51820', color: '#f5c518', border: '1px solid #f5c518' }}
            >
              + Repas
            </button>
          </div>
        </div>

        {showWeight && (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              step="0.1"
              placeholder="Poids en kg"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
            <button onClick={saveWeight} className="px-3 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: '#f5c518', color: '#000' }}>
              OK
            </button>
          </div>
        )}

        {/* Kcal ring */}
        <div className="text-center mb-3">
          <div className="text-3xl font-bold" style={{ color: kcalPct >= 90 ? '#22c55e' : kcalPct >= 50 ? '#f5c518' : '#ef4444' }}>
            {totals.kcal}
          </div>
          <div className="text-xs" style={{ color: '#555' }}>/ {macros.kcal} kcal</div>
          <div className="h-2 rounded-full mt-2" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${kcalPct}%`, backgroundColor: '#f5c518' }} />
          </div>
        </div>

        <div className="space-y-2">
          <MacroBar label="Protéines" current={totals.protein} target={macros.protein} color="#22c55e" />
          <MacroBar label="Glucides" current={totals.carbs} target={macros.carbs} color="#3b82f6" />
          <MacroBar label="Lipides" current={totals.fat} target={macros.fat} color="#f59e0b" />
        </div>
      </div>

      {/* Add meal form */}
      {showForm && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
          <h4 className="font-bold text-xs tracking-wide mb-3" style={{ color: '#f5c518' }}>AJOUTER UN REPAS</h4>
          <div className="space-y-2">
            <input
              placeholder="Nom du repas (optionnel)"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm text-white"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
            <div className="grid grid-cols-2 gap-2">
              {['kcal', 'protein', 'carbs', 'fat'].map(key => (
                <input
                  key={key}
                  type="number"
                  placeholder={key === 'kcal' ? 'Kcal' : key === 'protein' ? 'Protéines (g)' : key === 'carbs' ? 'Glucides (g)' : 'Lipides (g)'}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addMeal} className="flex-1 py-2 rounded-lg font-bold text-sm" style={{ backgroundColor: '#f5c518', color: '#000' }}>
                Ajouter
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meals list */}
      {dayEntry.meals.length > 0 && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
          <h4 className="font-bold text-xs tracking-wide mb-2" style={{ color: '#888' }}>REPAS DU JOUR</h4>
          <div className="space-y-2">
            {dayEntry.meals.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
                <div>
                  <div className="text-sm font-medium text-white">{m.label}</div>
                  <div className="text-xs" style={{ color: '#555' }}>
                    {m.kcal}kcal · P:{m.protein}g · G:{m.carbs}g · L:{m.fat}g
                  </div>
                </div>
                <button onClick={() => removeMeal(m.id)} className="text-xs" style={{ color: '#ef444480' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
