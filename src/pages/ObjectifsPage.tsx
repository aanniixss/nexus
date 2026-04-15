import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { v4 as uuid } from '../utils/uuid'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Objectif, ObjectifScope } from '../types'
import Modal from '../components/ui/Modal'
import Calendar from '../components/ui/Calendar'
import {
  today,
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  formatDate,
} from '../utils/dates'
import { format } from 'date-fns'

const SCOPES: { id: ObjectifScope; label: string; emoji: string }[] = [
  { id: 'day', label: "Aujourd'hui", emoji: '☀️' },
  { id: 'week', label: 'Cette semaine', emoji: '📅' },
  { id: 'month', label: 'Ce mois', emoji: '🗓️' },
  { id: 'year', label: "Cette année", emoji: '🎯' },
]

function deriveScope(deadline: string): ObjectifScope {
  if (isToday(deadline)) return 'day'
  if (isThisWeek(deadline)) return 'week'
  if (isThisMonth(deadline)) return 'month'
  return 'year'
}

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = useLocalStorage<Objectif[]>('nexus_objectifs', [])
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState(today())

  const addObjectif = () => {
    if (!title.trim()) return
    const scope = deriveScope(deadline)
    const obj: Objectif = {
      id: uuid(),
      title: title.trim(),
      deadline,
      scope,
      done: false,
      createdAt: new Date().toISOString(),
    }
    setObjectifs(prev => [obj, ...prev])
    setTitle('')
    setDeadline(today())
    setModalOpen(false)
  }

  const toggle = (id: string) => {
    setObjectifs(prev =>
      prev.map(o => (o.id === id ? { ...o, done: !o.done } : o))
    )
  }

  const remove = (id: string) => {
    setObjectifs(prev => prev.filter(o => o.id !== id))
  }

  const filterByScope = (scope: ObjectifScope) => {
    return objectifs.filter(o => {
      switch (scope) {
        case 'day': return isToday(o.deadline)
        case 'week': return isThisWeek(o.deadline) && !isToday(o.deadline)
        case 'month': return isThisMonth(o.deadline) && !isThisWeek(o.deadline)
        case 'year': return isThisYear(o.deadline) && !isThisMonth(o.deadline)
      }
    })
  }

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl tracking-widest uppercase">
          Objectifs
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-black font-bold font-gotham text-sm px-4 py-2 rounded-xl tracking-wider uppercase hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Sections */}
      {SCOPES.map(({ id, label, emoji }) => {
        const items = filterByScope(id)
        const sorted = [...items].sort((a, b) =>
          a.done === b.done ? 0 : a.done ? 1 : -1
        )
        return (
          <section key={id}>
            <h2 className="text-muted text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>{emoji}</span>
              {label}
              {items.length > 0 && (
                <span className="bg-border text-muted rounded-full px-2 py-0.5 text-[10px]">
                  {items.filter(i => !i.done).length}/{items.length}
                </span>
              )}
            </h2>

            {sorted.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-4 text-center text-muted text-sm">
                Aucun objectif
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map(obj => (
                  <div
                    key={obj.id}
                    className={`
                      flex items-center gap-3 bg-card border rounded-xl px-4 py-3
                      ${obj.done ? 'border-border opacity-60' : 'border-border hover:border-accent/30 transition-colors'}
                    `}
                  >
                    <button
                      onClick={() => toggle(obj.id)}
                      className={`
                        flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                        ${obj.done ? 'bg-accent border-accent' : 'border-muted hover:border-accent'}
                      `}
                    >
                      {obj.done && <Check size={13} className="text-black" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-gotham font-semibold ${obj.done ? 'line-through text-muted' : 'text-white'}`}>
                        {obj.title}
                      </p>
                      <p className="text-muted text-[11px]">
                        Échéance : {formatDate(obj.deadline)}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(obj.id)}
                      className="text-border hover:text-danger transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      {/* Add modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouvel objectif">
        <div className="space-y-4">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider mb-1 block">
              Objectif
            </label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addObjectif()}
              placeholder="Ex: Terminer le projet..."
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white font-gotham placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider mb-2 block">
              Échéance
            </label>
            <Calendar
              selected={deadline}
              onSelect={setDeadline}
              minDate={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-accent text-xs mt-2 text-center">
              → Scope: {deriveScope(deadline) === 'day' ? "Aujourd'hui" : deriveScope(deadline) === 'week' ? 'Cette semaine' : deriveScope(deadline) === 'month' ? 'Ce mois' : 'Cette année'}
            </p>
          </div>
          <button
            onClick={addObjectif}
            disabled={!title.trim()}
            className="w-full bg-accent text-black font-bold font-gotham uppercase tracking-wider py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Créer l'objectif
          </button>
        </div>
      </Modal>
    </div>
  )
}
