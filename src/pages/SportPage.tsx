import { useState } from 'react'
import { Check, Dumbbell, Wind, Waves } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { SportEntry } from '../types'
import Timer from '../components/ui/Timer'
import { today, getCurrentWeekDays, isSportDay, fmtSeconds, getDayOfWeek } from '../utils/dates'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const SPORT_DAYS_FR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']

function defaultEntry(date: string): SportEntry {
  return {
    date,
    seanceFaite: false, seanceDuration: 0,
    cardio: false, cardioDuration: 0,
    etirements: false, etirementsD: 0,
  }
}

export default function SportPage() {
  const [entries, setEntries] = useLocalStorage<SportEntry[]>('nexus_sport', [])
  const [view, setView] = useState<'today' | 'week'>('today')

  const todayStr = today()
  const todayEntry = entries.find(e => e.date === todayStr) || defaultEntry(todayStr)

  const upsert = (updated: SportEntry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === updated.date)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [updated, ...prev]
    })
  }

  const toggleField = (field: 'seanceFaite' | 'cardio' | 'etirements') => {
    upsert({ ...todayEntry, [field]: !todayEntry[field] })
  }

  const addDuration = (field: 'seanceDuration' | 'cardioDuration' | 'etirementsD', seconds: number) => {
    upsert({ ...todayEntry, [field]: (todayEntry[field] || 0) + seconds })
  }

  const todayIsTraining = isSportDay(new Date())
  const weekDays = getCurrentWeekDays()

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl tracking-widest uppercase">Sport</h1>
        <div className="flex bg-card border border-border rounded-xl overflow-hidden">
          {(['today', 'week'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                view === v ? 'bg-accent text-black' : 'text-muted hover:text-white'
              }`}
            >
              {v === 'today' ? "Aujourd'hui" : 'Semaine'}
            </button>
          ))}
        </div>
      </div>

      {view === 'today' && (
        <div className="space-y-3">
          {/* Date */}
          <p className="text-muted text-sm capitalize">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>

          {/* Étirements — every day */}
          <ActivityCard
            icon={<Waves size={18} className="text-accent" />}
            label="Étirements"
            done={todayEntry.etirements}
            duration={todayEntry.etirementsD}
            onToggle={() => toggleField('etirements')}
            onTimer={s => addDuration('etirementsD', s)}
          />

          {todayIsTraining ? (
            <>
              <ActivityCard
                icon={<Dumbbell size={18} className="text-accent" />}
                label="Séance faite"
                done={todayEntry.seanceFaite}
                duration={todayEntry.seanceDuration}
                onToggle={() => toggleField('seanceFaite')}
                onTimer={s => addDuration('seanceDuration', s)}
              />
              <ActivityCard
                icon={<Wind size={18} className="text-accent" />}
                label="Cardio"
                done={todayEntry.cardio}
                duration={todayEntry.cardioDuration}
                onToggle={() => toggleField('cardio')}
                onTimer={s => addDuration('cardioDuration', s)}
              />
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-muted text-sm">Jour de repos — Pas d'entraînement aujourd'hui</p>
              <p className="text-accent text-xs mt-1">Prochain entraînement : {getNextTrainingDay()}</p>
            </div>
          )}

          {/* Weekly summary */}
          <WeeklySummary entries={entries} />
        </div>
      )}

      {view === 'week' && (
        <div className="space-y-3">
          <WeekGrid entries={entries} weekDays={weekDays} />
        </div>
      )}
    </div>
  )
}

function ActivityCard({
  icon,
  label,
  done,
  duration,
  onToggle,
  onTimer,
}: {
  icon: React.ReactNode
  label: string
  done: boolean
  duration: number
  onToggle: () => void
  onTimer: (s: number) => void
}) {
  return (
    <div className={`bg-card border rounded-xl px-4 py-4 ${done ? 'border-accent/40' : 'border-border'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            done ? 'bg-accent border-accent' : 'border-muted hover:border-accent'
          }`}
        >
          {done && <Check size={14} className="text-black" strokeWidth={3} />}
        </button>
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <span className={`font-gotham font-semibold ${done ? 'text-accent' : 'text-white'}`}>
            {label}
          </span>
        </div>
        <Timer onStop={onTimer} existingSeconds={duration} />
      </div>
    </div>
  )
}

function WeeklySummary({ entries }: { entries: SportEntry[] }) {
  const weekDays = getCurrentWeekDays()
  const weekEntries = weekDays.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    return entries.find(e => e.date === dateStr) || defaultEntry(dateStr)
  })

  const totalTime = weekEntries.reduce(
    (acc, e) => acc + e.seanceDuration + e.cardioDuration + e.etirementsD,
    0
  )
  const seancesDone = weekEntries.filter(e => e.seanceFaite).length
  const cardioDone = weekEntries.filter(e => e.cardio).length
  const etirementsDone = weekEntries.filter(e => e.etirements).length

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-4">
      <h3 className="text-muted text-xs uppercase tracking-widest mb-3">Résumé de la semaine</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Séances" value={`${seancesDone}/4`} />
        <Stat label="Cardio" value={`${cardioDone}/4`} />
        <Stat label="Étirements" value={`${etirementsDone}/7`} />
        <Stat label="Temps total" value={fmtSeconds(totalTime)} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-card2 rounded-lg p-2">
      <p className="text-accent font-bold text-lg font-gotham">{value}</p>
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
    </div>
  )
}

function WeekGrid({ entries, weekDays }: { entries: SportEntry[]; weekDays: Date[] }) {
  return (
    <div className="space-y-2">
      {weekDays.map(d => {
        const dateStr = format(d, 'yyyy-MM-dd')
        const entry = entries.find(e => e.date === dateStr) || defaultEntry(dateStr)
        const isTrain = isSportDay(d)
        const dayName = SPORT_DAYS_FR[getDayOfWeek(d)]
        const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

        return (
          <div
            key={dateStr}
            className={`bg-card border rounded-xl px-4 py-3 flex items-center gap-3 ${
              isToday ? 'border-accent/40' : 'border-border'
            }`}
          >
            <div className={`w-8 text-center ${isToday ? 'text-accent' : 'text-muted'} text-xs font-bold uppercase`}>
              {dayName}
            </div>
            <div className="flex gap-2 flex-1">
              <Cell done={entry.etirements} label="Étir." />
              {isTrain ? (
                <>
                  <Cell done={entry.seanceFaite} label="Séance" />
                  <Cell done={entry.cardio} label="Cardio" />
                </>
              ) : (
                <span className="text-border text-xs italic">Repos</span>
              )}
            </div>
            {(entry.seanceDuration + entry.cardioDuration + entry.etirementsD) > 0 && (
              <span className="text-muted text-xs">
                {fmtSeconds(entry.seanceDuration + entry.cardioDuration + entry.etirementsD)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Cell({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${done ? 'text-accent' : 'text-border'}`}>
      <div className={`w-5 h-5 rounded flex items-center justify-center border ${done ? 'border-accent bg-accent/10' : 'border-border'}`}>
        {done && <Check size={11} className="text-accent" strokeWidth={3} />}
      </div>
      <span className="text-[9px] uppercase tracking-wide">{label}</span>
    </div>
  )
}

function getNextTrainingDay(): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const todayDow = new Date().getDay()
  // sport days: 0=Sun, 2=Tue, 4=Thu, 5=Fri
  const sportDays = [0, 2, 4, 5]
  for (let i = 1; i <= 7; i++) {
    const next = (todayDow + i) % 7
    if (sportDays.includes(next)) return days[next]
  }
  return 'Bientôt'
}
