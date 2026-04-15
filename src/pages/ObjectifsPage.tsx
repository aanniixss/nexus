import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { AppData, Objectif, VisionArea } from '../types'
import { todayStr } from '../utils/dates'

interface Props {
  data: AppData
  setData: (d: AppData | ((prev: AppData) => AppData)) => void
}

type SubTab = 'day' | 'week' | 'month' | 'year' | 'longterm'

const SUB_TABS: { id: SubTab; label: string; emoji: string }[] = [
  { id: 'day', label: 'JOUR', emoji: '☀️' },
  { id: 'week', label: 'SEMAINE', emoji: '📅' },
  { id: 'month', label: 'MOIS', emoji: '🗓️' },
  { id: 'year', label: 'ANNÉE', emoji: '🎯' },
  { id: 'longterm', label: 'VISION', emoji: '🔭' },
]

function newId() {
  return Math.random().toString(36).slice(2)
}

export default function ObjectifsPage({ data, setData }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('day')
  const [input, setInput] = useState('')

  const objectives = data.objectives.filter(o => o.scope === subTab)

  const addObjectif = () => {
    if (!input.trim()) return
    const obj: Objectif = {
      id: newId(),
      title: input.trim(),
      scope: subTab,
      done: false,
      createdAt: todayStr(),
    }
    setData(prev => ({ ...prev, objectives: [...prev.objectives, obj] }))
    setInput('')
  }

  const toggleObjectif = (id: string) => {
    setData(prev => ({
      ...prev,
      objectives: prev.objectives.map(o => o.id === id ? { ...o, done: !o.done } : o),
    }))
  }

  const deleteObjectif = (id: string) => {
    setData(prev => ({ ...prev, objectives: prev.objectives.filter(o => o.id !== id) }))
  }

  const updateVision = (id: string, text: string) => {
    setData(prev => ({
      ...prev,
      visionAreas: prev.visionAreas.map(v => v.id === id ? { ...v, text } : v),
    }))
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <h1 className="text-3xl font-gotham font-bold text-white tracking-widest mb-4">MES OBJECTIFS</h1>

      {/* Sub tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-gotham font-bold tracking-wider transition-all ${
              subTab === t.id
                ? 'bg-gold text-black'
                : 'bg-card border border-border text-muted hover:text-white'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {subTab === 'longterm' ? (
        /* Vision long terme */
        <div className="space-y-4">
          <p className="text-muted text-sm font-gotham">Écris ta vision à long terme pour chaque domaine de vie.</p>
          {data.visionAreas.map(area => (
            <div key={area.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{area.icon}</span>
                <h3 className="text-white font-gotham font-bold tracking-wider">{area.title.toUpperCase()}</h3>
              </div>
              <textarea
                value={area.text}
                onChange={e => updateVision(area.id, e.target.value)}
                placeholder="Dans 5 ans, je veux..."
                rows={4}
                className="w-full bg-card2 border border-border rounded-lg px-3 py-2 text-white text-sm font-gotham resize-none focus:outline-none focus:border-gold"
              />
            </div>
          ))}
        </div>
      ) : (
        /* Objectives list */
        <div>
          {/* Add input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addObjectif()}
              placeholder="Nouvel objectif..."
              className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-white font-gotham text-sm focus:outline-none focus:border-gold"
            />
            <button
              onClick={addObjectif}
              className="bg-gold text-black px-4 py-3 rounded-lg font-gotham font-bold"
            >
              <Plus size={18} />
            </button>
          </div>

          {objectives.length === 0 ? (
            <div className="text-center text-muted font-gotham py-12">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-sm tracking-wider">Aucun objectif. Ajoute-en un !</div>
            </div>
          ) : (
            <div className="space-y-2">
              {objectives
                .sort((a, b) => Number(a.done) - Number(b.done))
                .map(obj => (
                  <div
                    key={obj.id}
                    className={`flex items-center gap-3 bg-card rounded-xl px-4 py-3 border transition-all ${
                      obj.done ? 'border-green-900/30 opacity-60' : 'border-border'
                    }`}
                  >
                    <button
                      onClick={() => toggleObjectif(obj.id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        obj.done ? 'bg-green-500 border-green-500' : 'border-border bg-transparent'
                      }`}
                    >
                      {obj.done && <Check size={14} className="text-black" />}
                    </button>
                    <span className={`flex-1 font-gotham text-sm ${obj.done ? 'line-through text-muted' : 'text-white'}`}>
                      {obj.title}
                    </span>
                    <button
                      onClick={() => deleteObjectif(obj.id)}
                      className="text-muted hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
