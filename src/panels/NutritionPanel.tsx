import { useState } from 'react'
import { ExtraData, Meal } from '../types/extra'
import {
  getCurrentMacros, sumMeals, MEAL_PLAN, MILESTONES,
  TOTAL_WEEKS, START_DATE_STR, GOAL_DATE, PROFILE,
} from '../utils/nutrition'
import { todayStr } from '../utils/dates'
import { differenceInDays, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  extra: ExtraData
  setExtra: (fn: (e: ExtraData) => ExtraData) => void
}

type SubTab = 'aujourd_hui' | 'plan' | 'stats'

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: '#888' }}>{label}</span>
        <span style={{ color: '#fff' }}>{current}g <span style={{ color: '#444' }}>/ {target}g</span></span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function NutritionPanel({ extra, setExtra }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('aujourd_hui')
  const today = todayStr()
  const macros = getCurrentMacros()
  const dayEntry = extra.nutritionEntries[today] ?? { meals: [] }
  const totals = sumMeals(dayEntry.meals)

  const days = Math.max(0, differenceInDays(new Date(), parseISO(START_DATE_STR)))
  const weekNum = Math.floor(days / 7) + 1
  const progPct = Math.min(100, Math.round((weekNum / TOTAL_WEEKS) * 100))
  const daysLeft = Math.max(0, differenceInDays(parseISO(GOAL_DATE), new Date()))

  const [form, setForm] = useState({ label: '', kcal: '', protein: '', carbs: '', fat: '' })
  const [showForm, setShowForm] = useState(false)
  const [showWeight, setShowWeight] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const currentWeight = (() => {
    const entries = Object.entries(extra.weightEntries).sort((a, b) => b[0].localeCompare(a[0]))
    return entries.length > 0 ? entries[0][1] : PROFILE.startWeight
  })()

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
  const kcalLeft = Math.max(0, macros.kcal - totals.kcal)

  const SUBTABS: { key: SubTab; label: string }[] = [
    { key: 'aujourd_hui', label: 'AUJOURD\'HUI' },
    { key: 'plan', label: 'MON PLAN' },
    { key: 'stats', label: 'STATS' },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Sub-tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
        {SUBTABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className="flex-1 py-2 text-xs font-bold tracking-wider uppercase transition-all"
            style={{
              backgroundColor: subTab === t.key ? '#f5c518' : '#111111',
              color: subTab === t.key ? '#000' : '#888',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── AUJOURD'HUI ── */}
      {subTab === 'aujourd_hui' && (
        <>
          {/* Phase banner */}
          <div className="rounded-xl p-3" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold tracking-widest" style={{ color: '#f5c518' }}>
                PHASE {macros.phase} · {macros.label}
              </span>
              <span className="text-xs" style={{ color: '#555' }}>S{weekNum}/{TOTAL_WEEKS}</span>
            </div>
            <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="h-1.5 rounded-full" style={{ width: `${progPct}%`, backgroundColor: '#f5c518' }} />
            </div>
            <div className="text-xs text-center" style={{ color: '#555' }}>
              🏆 Objectif : 14 déc. 2026 · encore {daysLeft} jours
            </div>
          </div>

          {/* Kcal tracker */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#888' }}>
                CALORIES DU JOUR
              </span>
              <div className="flex gap-2">
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
                  type="number" step="0.1" placeholder="Poids en kg"
                  value={weightInput} onChange={e => setWeightInput(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <button onClick={saveWeight} className="px-3 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: '#f5c518', color: '#000' }}>
                  OK
                </button>
              </div>
            )}

            <div className="flex items-end justify-center gap-2 mb-3">
              <span className="text-5xl font-black" style={{ color: kcalPct >= 90 ? '#22c55e' : kcalPct >= 60 ? '#f5c518' : '#ef4444' }}>
                {totals.kcal}
              </span>
              <span className="text-sm mb-1" style={{ color: '#555' }}>/ {macros.kcal} kcal</span>
            </div>
            <div className="text-center text-xs mb-3" style={{ color: '#555' }}>
              {kcalLeft > 0 ? `Encore ${kcalLeft} kcal à consommer` : '✓ Objectif atteint !'}
            </div>
            <div className="h-2.5 rounded-full mb-4" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="h-2.5 rounded-full transition-all" style={{ width: `${kcalPct}%`, backgroundColor: kcalPct >= 90 ? '#22c55e' : '#f5c518' }} />
            </div>

            <div className="space-y-3">
              <MacroBar label="Protéines" current={totals.protein} target={macros.protein} color="#22c55e" />
              <MacroBar label="Glucides"  current={totals.carbs}   target={macros.carbs}   color="#3b82f6" />
              <MacroBar label="Lipides"   current={totals.fat}     target={macros.fat}     color="#f59e0b" />
            </div>
          </div>

          {/* Add meal form */}
          {showForm && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
              <h4 className="font-bold text-xs tracking-wide mb-3" style={{ color: '#f5c518' }}>AJOUTER UN REPAS</h4>
              <div className="space-y-2">
                <input
                  placeholder="Nom du repas"
                  value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <div className="grid grid-cols-2 gap-2">
                  {[['kcal','Kcal'],['protein','Protéines (g)'],['carbs','Glucides (g)'],['fat','Lipides (g)']].map(([k, ph]) => (
                    <input
                      key={k} type="number" placeholder={ph}
                      value={form[k as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
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
              <h4 className="font-bold text-xs tracking-wide mb-2" style={{ color: '#888' }}>REPAS ENREGISTRÉS</h4>
              {dayEntry.meals.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
                  <div>
                    <div className="text-sm font-medium text-white">{m.label}</div>
                    <div className="text-xs" style={{ color: '#555' }}>
                      {m.kcal}kcal · P:{m.protein}g · G:{m.carbs}g · L:{m.fat}g
                    </div>
                  </div>
                  <button onClick={() => removeMeal(m.id)} className="text-xs px-2" style={{ color: '#ef444460' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MON PLAN ── */}
      {subTab === 'plan' && (
        <>
          {/* Profile card */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💪</span>
              <div>
                <div className="font-bold text-white tracking-wide">ANIS · 21 ANS</div>
                <div className="text-xs" style={{ color: '#f5c518' }}>183cm · 83kg · Skinny Fat → Musclé & Sec</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="text-lg font-bold" style={{ color: '#ef4444' }}>22%</div>
                <div className="text-xs" style={{ color: '#555' }}>Masse grasse actuelle</div>
              </div>
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="text-lg font-bold" style={{ color: '#22c55e' }}>12%</div>
                <div className="text-xs" style={{ color: '#555' }}>Objectif (abdos visibles)</div>
              </div>
            </div>
            <div className="mt-3 p-2 rounded-lg text-center" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="text-xs" style={{ color: '#f5c518' }}>🏆 OBJECTIF : 14 DÉCEMBRE 2026</div>
              <div className="text-xs mt-0.5" style={{ color: '#555' }}>83kg SEC & MUSCLÉ · Abdos visibles · Silhouette en V</div>
            </div>
          </div>

          {/* Macros cibles */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h4 className="font-bold text-xs tracking-wide mb-3 uppercase" style={{ color: '#f5c518' }}>
              PHASE {macros.phase} — MACROS CIBLES
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              {[
                { l: 'KCAL', v: `${macros.kcal}`, u: '' },
                { l: 'PROT', v: `${macros.protein}`, u: 'g' },
                { l: 'GLUC', v: `${macros.carbs}`, u: 'g' },
                { l: 'LIP',  v: `${macros.fat}`, u: 'g' },
              ].map(({ l, v, u }) => (
                <div key={l} className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                  <div className="text-xs" style={{ color: '#555' }}>{l}</div>
                  <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{v}{u}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs" style={{ color: '#555' }}>
              <div>· Phase 1 (S1-8) : 2200 kcal — déficit pour brûler le gras</div>
              <div>· Phase 2 (S9-16) : 2400 kcal — recomposition</div>
              <div>· Phase 3 (S17+) : 2650 kcal — lean bulk</div>
            </div>
          </div>

          {/* Plan repas type */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h4 className="font-bold text-xs tracking-wide mb-3 uppercase" style={{ color: '#888' }}>
              PLAN REPAS TYPE — ALGÉRIE (BUDGET)
            </h4>
            <div className="space-y-3">
              {MEAL_PLAN.map((meal, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b" style={{ borderColor: '#1a1a1a' }}>
                  <div className="flex-shrink-0 text-center">
                    <div className="text-lg">{meal.icon}</div>
                    <div className="text-xs font-bold" style={{ color: '#f5c518' }}>{meal.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white">{meal.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#aaa' }}>{meal.description}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#f5c518' }}>
                      {meal.kcal}kcal · P:{meal.protein}g · G:{meal.carbs}g · L:{meal.fat}g
                    </div>
                    <div className="text-xs mt-1 italic" style={{ color: '#555' }}>💡 {meal.tip}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg text-center" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="text-xs font-bold" style={{ color: '#f5c518' }}>ALIMENTS INTERDITS TEMPORAIREMENT</div>
              <div className="text-xs mt-1" style={{ color: '#888' }}>Produits laitiers en excès (acné/cortisol) · Sucres rapides · Alcool · Fast food</div>
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h4 className="font-bold text-xs tracking-wide mb-3 uppercase" style={{ color: '#888' }}>
              TIMELINE TRANSFORMATION
            </h4>
            <div className="space-y-2">
              {MILESTONES.map((m) => {
                const passed = weekNum >= m.month * 4
                const isCurrent = !passed && weekNum >= (m.month - 1) * 4
                return (
                  <div key={m.month} className="flex gap-3 items-start">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: passed ? '#22c55e20' : isCurrent ? '#f5c51820' : '#1a1a1a',
                        border: `1px solid ${passed ? '#22c55e' : isCurrent ? '#f5c518' : '#2a2a2a'}`,
                        color: passed ? '#22c55e' : isCurrent ? '#f5c518' : '#444',
                      }}
                    >
                      {passed ? '✓' : `M${m.month}`}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: passed ? '#22c55e' : isCurrent ? '#f5c518' : '#fff' }}>
                        {m.label}
                      </div>
                      <div className="text-xs" style={{ color: '#555' }}>{m.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── STATS ── */}
      {subTab === 'stats' && (
        <>
          {/* Weight history */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h4 className="font-bold text-xs tracking-wide mb-3 uppercase" style={{ color: '#888' }}>SUIVI DU POIDS</h4>
            {Object.keys(extra.weightEntries).length === 0 ? (
              <p className="text-xs text-center" style={{ color: '#444' }}>Aucun poids enregistré. Utilise le bouton ⚖️ dans l'onglet Aujourd'hui.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(extra.weightEntries)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .slice(0, 10)
                  .map(([date, weight]) => {
                    const diff = weight - PROFILE.startWeight
                    return (
                      <div key={date} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: '#1a1a1a' }}>
                        <span className="text-sm text-white">{date}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{weight}kg</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{
                            backgroundColor: diff <= 0 ? '#22c55e20' : '#ef444420',
                            color: diff <= 0 ? '#22c55e' : '#ef4444',
                          }}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Kcal stats */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h4 className="font-bold text-xs tracking-wide mb-3 uppercase" style={{ color: '#888' }}>ADHERENCE NUTRITIONNELLE</h4>
            {Object.keys(extra.nutritionEntries).length === 0 ? (
              <p className="text-xs text-center" style={{ color: '#444' }}>Commence à logger tes repas pour voir les stats.</p>
            ) : (
              (() => {
                const entries = Object.entries(extra.nutritionEntries)
                const tracked = entries.length
                const avgKcal = Math.round(entries.reduce((s, [, e]) => s + sumMeals(e.meals).kcal, 0) / tracked)
                const avgProt = Math.round(entries.reduce((s, [, e]) => s + sumMeals(e.meals).protein, 0) / tracked)
                return (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Jours trackés', value: tracked },
                      { label: 'Kcal moy.', value: avgKcal },
                      { label: 'Prot moy.', value: `${avgProt}g` },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                        <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{value}</div>
                        <div className="text-xs" style={{ color: '#555' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )
              })()
            )}
          </div>
        </>
      )}
    </div>
  )
}
