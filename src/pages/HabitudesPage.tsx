import { useState } from 'react'
import { Plus, Check, Pencil, Trash2, MoreVertical, X, BarChart2 } from 'lucide-react'
import { v4 as uuid } from '../utils/uuid'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Habit, HabitTrackingType } from '../types'
import Modal from '../components/ui/Modal'
import Timer from '../components/ui/Timer'
import { today, getLast7Days, fmtSeconds } from '../utils/dates'

// Default habits from the screenshot reference
const DEFAULT_HABITS: Habit[] = [
  { id: uuid(), name: 'Lecture (pages)', createdAt: '', trackingType: 'pages', objectiveValue: 20, entries: {} },
  { id: uuid(), name: 'Journaling', createdAt: '', trackingType: 'checkbox', entries: {} },
  { id: uuid(), name: 'Deep Work', createdAt: '', trackingType: 'timer', objectiveValue: 90, entries: {} },
  { id: uuid(), name: 'Téléphone limité', createdAt: '', trackingType: 'checkbox', entries: {} },
  { id: uuid(), name: 'Méditation', createdAt: '', trackingType: 'timer', objectiveValue: 10, entries: {} },
  { id: uuid(), name: 'Planification lendemain', createdAt: '', trackingType: 'checkbox', entries: {} },
  { id: uuid(), name: 'Gratitude', createdAt: '', trackingType: 'checkbox', entries: {} },
  { id: uuid(), name: 'Visionnage éducatif', createdAt: '', trackingType: 'timer', objectiveValue: 20, entries: {} },
]

function calcStreak(habit: Habit): number {
  let streak = 0
  let d = new Date()
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (habit.entries[key]?.done) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function HabitudesPage() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('nexus_habits', DEFAULT_HABITS)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState<Habit | null>(null)
  const [statsModal, setStatsModal] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [newHabit, setNewHabit] = useState<{
    name: string; trackingType: HabitTrackingType; objectiveValue: string
  }>({ name: '', trackingType: 'checkbox', objectiveValue: '' })
  const [editForm, setEditForm] = useState<{
    name: string; trackingType: HabitTrackingType; objectiveValue: string
  }>({ name: '', trackingType: 'checkbox', objectiveValue: '' })
  const [pageInputs, setPageInputs] = useState<Record<string, string>>({})

  const todayStr = today()
  const last7 = getLast7Days()

  const upsertEntry = (id: string, changes: Partial<{ done: boolean; duration: number; pages: number }>) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h
        const existing = h.entries[todayStr] || { done: false, duration: 0 }
        return {
          ...h,
          entries: {
            ...h.entries,
            [todayStr]: { ...existing, ...changes },
          },
        }
      })
    )
  }

  const addHabit = () => {
    if (!newHabit.name.trim()) return
    const habit: Habit = {
      id: uuid(),
      name: newHabit.name.trim(),
      createdAt: new Date().toISOString(),
      trackingType: newHabit.trackingType,
      objectiveValue: newHabit.objectiveValue ? Number(newHabit.objectiveValue) : undefined,
      entries: {},
    }
    setHabits(prev => [...prev, habit])
    setNewHabit({ name: '', trackingType: 'checkbox', objectiveValue: '' })
    setAddModal(false)
  }

  const saveEdit = () => {
    if (!editModal || !editForm.name.trim()) return
    setHabits(prev =>
      prev.map(h =>
        h.id === editModal.id
          ? {
              ...h,
              name: editForm.name.trim(),
              trackingType: editForm.trackingType,
              objectiveValue: editForm.objectiveValue ? Number(editForm.objectiveValue) : undefined,
            }
          : h
      )
    )
    setEditModal(null)
  }

  const removeHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    setOpenMenu(null)
  }

  const openEdit = (habit: Habit) => {
    setEditForm({
      name: habit.name,
      trackingType: habit.trackingType,
      objectiveValue: habit.objectiveValue?.toString() || '',
    })
    setEditModal(habit)
    setOpenMenu(null)
  }

  // Total time this week across all habits
  const totalWeekTime = habits.reduce((acc, h) => {
    return acc + last7.reduce((a, d) => a + (h.entries[d]?.duration || 0), 0)
  }, 0)

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl tracking-widest uppercase">Habitudes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setStatsModal(true)}
            className="bg-card border border-border text-muted hover:text-white p-2 rounded-xl transition-colors"
          >
            <BarChart2 size={16} />
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 bg-accent text-black font-bold font-gotham text-sm px-4 py-2 rounded-xl tracking-wider uppercase hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Habit list */}
      {habits.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted">
          Aucune habitude — Crée-en une !
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(habit => {
            const entry = habit.entries[todayStr] || { done: false, duration: 0, pages: 0 }
            const streak = calcStreak(habit)
            const isMenuOpen = openMenu === habit.id

            return (
              <div
                key={habit.id}
                className={`
                  relative bg-card border rounded-xl px-4 py-3 flex items-center gap-3
                  border-l-4 transition-all
                  ${entry.done ? 'border-l-accent border-r-border border-t-border border-b-border' : 'border-l-border border-border'}
                `}
              >
                {/* Checkbox */}
                <button
                  onClick={() => upsertEntry(habit.id, { done: !entry.done })}
                  className={`
                    flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                    ${entry.done ? 'bg-accent border-accent' : 'border-muted hover:border-accent'}
                  `}
                >
                  {entry.done && <Check size={13} className="text-black" strokeWidth={3} />}
                </button>

                {/* Name + objective */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-gotham font-semibold text-sm ${entry.done ? 'text-accent' : 'text-white'}`}>
                      {habit.name}
                    </span>
                    {habit.objectiveValue && (
                      <span className="text-muted text-xs font-gotham">
                        obj:{habit.objectiveValue}{habit.trackingType === 'pages' ? 'p' : 'min'}
                      </span>
                    )}
                  </div>
                  {/* Timer / pages tracking */}
                  {habit.trackingType === 'timer' && (
                    <div className="mt-1">
                      <Timer
                        onStop={s => upsertEntry(habit.id, { duration: entry.duration + s, done: true })}
                        existingSeconds={entry.duration}
                      />
                    </div>
                  )}
                  {habit.trackingType === 'pages' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-muted text-xs">
                        {entry.pages || 0}p aujourd'hui
                      </span>
                      <input
                        type="number"
                        value={pageInputs[habit.id] || ''}
                        onChange={e => setPageInputs(prev => ({ ...prev, [habit.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const p = Number(pageInputs[habit.id])
                            if (p > 0) {
                              upsertEntry(habit.id, { pages: (entry.pages || 0) + p, done: true })
                              setPageInputs(prev => ({ ...prev, [habit.id]: '' }))
                            }
                          }
                        }}
                        placeholder="+pages"
                        className="w-20 bg-card2 border border-border rounded-lg px-2 py-1 text-white text-xs font-gotham focus:outline-none focus:border-accent"
                      />
                      <button
                        onClick={() => {
                          const p = Number(pageInputs[habit.id])
                          if (p > 0) {
                            upsertEntry(habit.id, { pages: (entry.pages || 0) + p, done: true })
                            setPageInputs(prev => ({ ...prev, [habit.id]: '' }))
                          }
                        }}
                        className="text-accent text-xs font-bold bg-accent/10 border border-accent/30 px-2 py-1 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Streak */}
                {streak > 0 && (
                  <span className="text-accent font-gotham font-bold text-sm flex-shrink-0">
                    ×{streak}
                  </span>
                )}

                {/* Menu button */}
                <button
                  onClick={() => setOpenMenu(isMenuOpen ? null : habit.id)}
                  className="text-muted hover:text-white transition-colors flex-shrink-0 p-1"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className="absolute right-2 top-12 z-20 bg-card2 border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                    <button
                      onClick={() => openEdit(habit)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-card transition-colors text-left"
                    >
                      <Pencil size={14} className="text-accent" />
                      Modifier
                    </button>
                    <button
                      onClick={() => removeHabit(habit.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-card transition-colors text-left border-t border-border"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Close menus on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}

      {/* ADD MODAL */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Nouvelle habitude">
        <HabitForm
          values={newHabit}
          onChange={setNewHabit}
          onSubmit={addHabit}
          submitLabel="Créer l'habitude"
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Modifier l'habitude">
        <HabitForm
          values={editForm}
          onChange={setEditForm}
          onSubmit={saveEdit}
          submitLabel="Enregistrer"
        />
      </Modal>

      {/* STATS MODAL */}
      <Modal isOpen={statsModal} onClose={() => setStatsModal(false)} title="Stats des habitudes">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <p className="text-muted text-xs">
            Temps total cette semaine : <span className="text-accent font-bold">{fmtSeconds(totalWeekTime)}</span>
          </p>
          {habits
            .filter(h => h.trackingType === 'timer')
            .map(h => {
              const weekTime = last7.reduce((a, d) => a + (h.entries[d]?.duration || 0), 0)
              const maxTime = habits
                .filter(hh => hh.trackingType === 'timer')
                .map(hh => last7.reduce((a, d) => a + (hh.entries[d]?.duration || 0), 0))
                .reduce((a, b) => Math.max(a, b), 1)

              return (
                <div key={h.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-gotham">{h.name}</span>
                    <span className="text-accent font-gotham font-semibold">{fmtSeconds(weekTime)}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(weekTime / maxTime) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-muted text-xs uppercase tracking-widest">Streaks</p>
            {habits.map(h => {
              const streak = calcStreak(h)
              return (
                <div key={h.id} className="flex justify-between text-sm">
                  <span className="text-muted font-gotham">{h.name}</span>
                  <span className="text-accent font-gotham font-bold">×{streak}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Shared form for add/edit
function HabitForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
}: {
  values: { name: string; trackingType: HabitTrackingType; objectiveValue: string }
  onChange: (v: { name: string; trackingType: HabitTrackingType; objectiveValue: string }) => void
  onSubmit: () => void
  submitLabel: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-muted text-xs uppercase tracking-wider mb-1 block">Nom</label>
        <input
          autoFocus
          value={values.name}
          onChange={e => onChange({ ...values, name: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="Ex: Méditation"
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white font-gotham placeholder-muted focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-muted text-xs uppercase tracking-wider mb-2 block">Type de tracking</label>
        <div className="flex gap-2">
          {([
            ['checkbox', '✓ Simple'],
            ['timer', '⏱ Timer'],
            ['pages', '📄 Pages'],
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => onChange({ ...values, trackingType: t })}
              className={`flex-1 py-2 rounded-xl border text-xs font-bold font-gotham uppercase tracking-wider transition-all ${
                values.trackingType === t
                  ? 'bg-accent text-black border-accent'
                  : 'border-border text-muted hover:border-accent hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {values.trackingType !== 'checkbox' && (
        <div>
          <label className="text-muted text-xs uppercase tracking-wider mb-1 block">
            Objectif ({values.trackingType === 'pages' ? 'pages' : 'minutes'})
          </label>
          <input
            type="number"
            value={values.objectiveValue}
            onChange={e => onChange({ ...values, objectiveValue: e.target.value })}
            placeholder="Ex: 30"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white font-gotham placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>
      )}
      <button
        onClick={onSubmit}
        disabled={!values.name.trim()}
        className="w-full bg-accent text-black font-bold font-gotham uppercase tracking-wider py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </div>
  )
}
