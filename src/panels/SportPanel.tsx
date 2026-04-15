import { useState } from 'react'
import { ExtraData, SportDayEntry } from '../types/extra'
import { todayStr, dayOfWeekMon0, parseDate, fmtSeconds, DAY_ABBR_FR } from '../utils/dates'
import { useTimer } from '../hooks/useTimer'

const TRAIN_DAYS = [1, 3, 4, 6] // Tue, Thu, Fri, Sun (Mon=0)

interface Props {
  extra: ExtraData
  setExtra: (fn: (e: ExtraData) => ExtraData) => void
}

function TimerButton({
  label,
  icon,
  savedSeconds,
  onSave,
}: {
  label: string
  icon: string
  savedSeconds: number
  onSave: (s: number) => void
}) {
  const { isRunning, elapsed, start, stop } = useTimer()

  const handleToggle = () => {
    if (isRunning) {
      const s = stop()
      onSave(savedSeconds + s)
    } else {
      start(0)
    }
  }

  const display = isRunning ? elapsed : savedSeconds

  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold tracking-wide text-white text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {display > 0 && (
          <span className="text-xs font-mono" style={{ color: '#f5c518' }}>
            {fmtSeconds(display)}
          </span>
        )}
        <button
          onClick={handleToggle}
          className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all"
          style={{
            backgroundColor: isRunning ? '#ef444420' : '#f5c51820',
            color: isRunning ? '#ef4444' : '#f5c518',
            border: `1px solid ${isRunning ? '#ef4444' : '#f5c518'}`,
          }}
        >
          {isRunning ? '⏹ STOP' : '▶ START'}
        </button>
      </div>
    </div>
  )
}

export default function SportPanel({ extra, setExtra }: Props) {
  const today = todayStr()
  const dayIdx = dayOfWeekMon0(new Date())
  const isTrainingDay = TRAIN_DAYS.includes(dayIdx)

  const entry: SportDayEntry = extra.sportEntries[today] ?? {
    seance: false, seanceDuration: 0,
    cardio: false, cardioDuration: 0,
    etirements: false, etirementsD: 0,
  }

  const updateEntry = (patch: Partial<SportDayEntry>) => {
    setExtra(e => ({
      ...e,
      sportEntries: {
        ...e.sportEntries,
        [today]: { ...entry, ...patch },
      },
    }))
  }

  // Weekly view
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - dayIdx + i)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const e = extra.sportEntries[ds]
    const isTraining = TRAIN_DAYS.includes(i)
    return { ds, dayName: DAY_ABBR_FR[i], e, isTraining, isToday: ds === today }
  })

  return (
    <div className="p-4 space-y-4">
      {/* Today section */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold tracking-widest text-sm uppercase" style={{ color: '#f5c518' }}>
            💪 AUJOURD'HUI
          </h3>
          {!isTrainingDay && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1a1a1a', color: '#888888' }}>
              REPOS ACTIF
            </span>
          )}
        </div>

        {isTrainingDay && (
          <>
            <TimerButton
              label="Séance faite"
              icon="🏋️"
              savedSeconds={entry.seanceDuration}
              onSave={s => updateEntry({ seanceDuration: s, seance: s > 0 })}
            />
            <TimerButton
              label="Cardio"
              icon="🏃"
              savedSeconds={entry.cardioDuration}
              onSave={s => updateEntry({ cardioDuration: s, cardio: s > 0 })}
            />
          </>
        )}

        <TimerButton
          label="Étirements"
          icon="🧘"
          savedSeconds={entry.etirementsD}
          onSave={s => updateEntry({ etirementsD: s, etirements: s > 0 })}
        />
      </div>

      {/* Weekly grid */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <h3 className="font-bold tracking-widest text-xs uppercase mb-3" style={{ color: '#888888' }}>
          SEMAINE EN COURS
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(({ dayName, e, isTraining, isToday }) => (
            <div key={dayName} className="flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: isToday ? '#f5c518' : '#555555' }}>
                {dayName.slice(0, 1)}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: isToday ? '#f5c51815' : '#1a1a1a',
                  border: `1px solid ${isToday ? '#f5c518' : '#2a2a2a'}`,
                  color: !isTraining ? '#333' : e?.seance || e?.etirements ? '#22c55e' : '#555',
                }}
              >
                {!isTraining ? '—' : e?.seance ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: '#555555' }}>
          <span>🏋️ Séance: Mar/Jeu/Ven/Dim</span>
        </div>
      </div>

      {/* Stats */}
      {(() => {
        const allEntries = Object.values(extra.sportEntries)
        const totalSeances = allEntries.filter(e => e.seance).length
        const totalCardio = allEntries.filter(e => e.cardio).length
        const totalSportTime = allEntries.reduce((s, e) => s + e.seanceDuration + e.cardioDuration, 0)
        return (
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h3 className="font-bold tracking-widest text-xs uppercase mb-3" style={{ color: '#888888' }}>
              STATS GLOBALES
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Séances', value: totalSeances },
                { label: 'Cardios', value: totalCardio },
                { label: 'Temps total', value: fmtSeconds(totalSportTime) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-bold" style={{ color: '#f5c518' }}>{value}</div>
                  <div className="text-xs" style={{ color: '#555555' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
