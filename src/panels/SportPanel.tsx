import { useState } from 'react'
import { ExtraData, SportDayEntry } from '../types/extra'
import { todayStr, dayOfWeekMon0, fmtSeconds, DAY_ABBR_FR } from '../utils/dates'
import { useTimer } from '../hooks/useTimer'

// 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun
const TRAIN_DAYS = [1, 3, 4, 6]

// Programme complet adapté à Anis (posture + skinny fat)
const PROGRAM: Record<number, { label: string; icon: string; exercises: { name: string; sets: string; note?: string }[] }> = {
  1: { // Mardi — PUSH
    label: 'PUSH — Pectoraux · Épaules · Triceps',
    icon: '🏋️',
    exercises: [
      { name: 'Développé couché', sets: '4×8-10', note: 'Pectoraux' },
      { name: 'Développé militaire', sets: '4×8-10', note: 'Épaules' },
      { name: 'Élévations latérales', sets: '4×12-15', note: '⭐ PRIORITÉ — largeur épaules (47→50cm)' },
      { name: 'Extensions triceps', sets: '4×10-12', note: 'Triceps' },
      { name: 'Élévations frontales', sets: '3×12', note: 'Épaules antérieures' },
      { name: 'Gainage latéral', sets: '3×30-45s', note: 'Taille + posture' },
    ],
  },
  3: { // Jeudi — PULL
    label: 'PULL — Dos · Biceps · Posture',
    icon: '🏃',
    exercises: [
      { name: 'Tractions / Tirage vertical', sets: '4×8-10', note: '⭐ PRIORITÉ — dos épais + largeur' },
      { name: 'Rowing haltères', sets: '4×10-12', note: 'Épaisseur du dos' },
      { name: 'Face pulls / Oiseau', sets: '4×12-15', note: '⭐ POSTURE — correction épaules enroulées' },
      { name: 'Curl biceps', sets: '3×10-12', note: 'Bras (31→36cm)' },
      { name: 'Extensions lombaires', sets: '3×15', note: '⭐ POSTURE — correction hyperlordose' },
      { name: 'Chin tucks', sets: '3×10', note: '⭐ POSTURE — forward head' },
    ],
  },
  4: { // Vendredi — LEGS + CORE
    label: 'LEGS + CORE + POSTURE',
    icon: '🦵',
    exercises: [
      { name: 'Squat', sets: '4×10-12', note: 'Jambes + fessiers' },
      { name: 'Fentes', sets: '3×12/jambe', note: 'Équilibre musculaire' },
      { name: 'Romanian Deadlift', sets: '4×10-12', note: '⭐ POSTURE — chaîne postérieure' },
      { name: 'Planche frontale', sets: '4×30-60s', note: '⭐ Gaine + hyperlordose' },
      { name: 'Crunch + relevés de jambes', sets: '4×15-20', note: 'Abdominaux bas du ventre' },
      { name: 'Hip flexor stretch', sets: '3×30s/côté', note: '⭐ POSTURE — hyperlordose' },
    ],
  },
  6: { // Dimanche — UPPER
    label: 'UPPER — Full Upper Body',
    icon: '💪',
    exercises: [
      { name: 'Développé incliné', sets: '4×10', note: 'Haut pectoraux' },
      { name: 'Rowing unilatéral', sets: '4×10/côté', note: 'Dos + équilibre' },
      { name: 'Élévations latérales', sets: '4×15', note: '⭐ PRIORITÉ épaules' },
      { name: 'Face pulls', sets: '3×15', note: 'Posture + rear delts' },
      { name: 'Curl + Extension supersets', sets: '3×12', note: 'Bras complets' },
      { name: 'Gainage + relevés jambes', sets: '3×30-45s', note: 'Core' },
    ],
  },
}

const STRETCHING = [
  { name: 'Chest opener (pectoraux)', duration: '2×30s', note: 'Épaules enroulées ✓' },
  { name: 'Chin tucks', duration: '10×5s', note: 'Forward head ✓' },
  { name: 'Cat-cow', duration: '10 reps', note: 'Hyperlordose ✓' },
  { name: 'Hip flexor stretch', duration: '2×30s/côté', note: 'Hyperlordose + dos ✓' },
  { name: 'Rotation thoracique', duration: '10/côté', note: 'Scoliose légère ✓' },
  { name: 'Étirement dos (Cat stretch)', duration: '2×30s', note: 'Posture générale ✓' },
]

function TimerButton({ label, icon, savedSeconds, onSave }: { label: string; icon: string; savedSeconds: number; onSave: (s: number) => void }) {
  const { isRunning, elapsed, start, stop } = useTimer()
  const handleToggle = () => {
    if (isRunning) { const s = stop(); onSave(savedSeconds + s) } else start(0)
  }
  const display = isRunning ? elapsed : savedSeconds
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold text-white text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {display > 0 && <span className="text-xs font-mono" style={{ color: '#f5c518' }}>{fmtSeconds(display)}</span>}
        <button
          onClick={handleToggle}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
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
  const [showProgram, setShowProgram] = useState(false)
  const [showStretching, setShowStretching] = useState(false)
  const today = todayStr()
  const dayIdx = dayOfWeekMon0(new Date())
  const isTrainingDay = TRAIN_DAYS.includes(dayIdx)
  const todayProgram = PROGRAM[dayIdx]

  const entry: SportDayEntry = extra.sportEntries[today] ?? {
    seance: false, seanceDuration: 0,
    cardio: false, cardioDuration: 0,
    etirements: false, etirementsD: 0,
  }

  const updateEntry = (patch: Partial<SportDayEntry>) => {
    setExtra(e => ({
      ...e,
      sportEntries: { ...e.sportEntries, [today]: { ...entry, ...patch } },
    }))
  }

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
      {/* Goal banner */}
      <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
        <div className="text-xs font-bold tracking-widest" style={{ color: '#f5c518' }}>🏆 OBJECTIF : 14 DÉCEMBRE 2026</div>
        <div className="text-xs mt-0.5" style={{ color: '#555' }}>83kg sec & musclé · Abdos visibles · Silhouette en V</div>
      </div>

      {/* Today */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold tracking-widest text-sm uppercase" style={{ color: '#f5c518' }}>
            💪 AUJOURD'HUI
          </h3>
          {isTrainingDay && todayProgram && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#f5c51820', color: '#f5c518', border: '1px solid #f5c51840' }}>
              {todayProgram.icon} {todayProgram.label.split('—')[0].trim()}
            </span>
          )}
          {!isTrainingDay && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
              REPOS ACTIF
            </span>
          )}
        </div>

        {isTrainingDay && (
          <>
            <TimerButton label="Séance" icon="🏋️" savedSeconds={entry.seanceDuration} onSave={s => updateEntry({ seanceDuration: s, seance: s > 0 })} />
            <TimerButton label="Cardio" icon="🏃" savedSeconds={entry.cardioDuration} onSave={s => updateEntry({ cardioDuration: s, cardio: s > 0 })} />
          </>
        )}
        <TimerButton label="Étirements (posture)" icon="🧘" savedSeconds={entry.etirementsD} onSave={s => updateEntry({ etirementsD: s, etirements: s > 0 })} />
      </div>

      {/* Programme du jour */}
      {isTrainingDay && todayProgram && (
        <div className="rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
          <button
            onClick={() => setShowProgram(!showProgram)}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-bold text-sm uppercase tracking-wide" style={{ color: '#888' }}>
              {todayProgram.icon} PROGRAMME DU JOUR
            </span>
            <span style={{ color: '#555' }}>{showProgram ? '▲' : '▼'}</span>
          </button>
          {showProgram && (
            <div className="px-4 pb-4">
              <div className="text-xs font-bold mb-3" style={{ color: '#f5c518' }}>{todayProgram.label}</div>
              <div className="space-y-2">
                {todayProgram.exercises.map((ex, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
                    <span className="text-xs font-mono w-5 text-center flex-shrink-0 mt-0.5" style={{ color: '#555' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{ex.name}</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f5c51820', color: '#f5c518' }}>{ex.sets}</span>
                      </div>
                      {ex.note && (
                        <div className="text-xs mt-0.5" style={{ color: ex.note.includes('⭐') ? '#f5c51890' : '#555' }}>{ex.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Étirements posture */}
      <div className="rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <button
          onClick={() => setShowStretching(!showStretching)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="font-bold text-sm uppercase tracking-wide" style={{ color: '#888' }}>
            🧘 ÉTIREMENTS POSTURE QUOTIDIENS
          </span>
          <span style={{ color: '#555' }}>{showStretching ? '▲' : '▼'}</span>
        </button>
        {showStretching && (
          <div className="px-4 pb-4 space-y-2">
            <div className="text-xs mb-2 p-2 rounded-lg" style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
              ⚠️ Hyperlordose · Épaules enroulées · Forward head · Scoliose légère
            </div>
            {STRETCHING.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
                <div>
                  <div className="text-sm text-white">{s.name}</div>
                  <div className="text-xs" style={{ color: '#22c55e' }}>{s.note}</div>
                </div>
                <span className="text-xs font-bold" style={{ color: '#f5c518' }}>{s.duration}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly grid */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
        <h3 className="font-bold tracking-widest text-xs uppercase mb-3" style={{ color: '#888' }}>SEMAINE EN COURS</h3>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(({ dayName, e, isTraining, isToday }) => (
            <div key={dayName} className="flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: isToday ? '#f5c518' : '#444' }}>{dayName.slice(0, 1)}</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: isToday ? '#f5c51815' : '#1a1a1a',
                  border: `1px solid ${isToday ? '#f5c518' : '#2a2a2a'}`,
                  color: !isTraining ? '#2a2a2a' : e?.seance ? '#22c55e' : e?.etirements ? '#f59e0b' : '#444',
                }}
              >
                {!isTraining ? '—' : e?.seance ? '✓' : e?.etirements ? '~' : '○'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2 text-xs" style={{ color: '#444' }}>
          <span style={{ color: '#22c55e' }}>✓ Séance</span>
          <span style={{ color: '#f59e0b' }}>~ Étirements</span>
          <span>○ Pas encore</span>
        </div>
      </div>

      {/* Stats globales */}
      {(() => {
        const all = Object.values(extra.sportEntries)
        return (
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h3 className="font-bold tracking-widest text-xs uppercase mb-3" style={{ color: '#888' }}>STATS GLOBALES</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Séances', value: all.filter(e => e.seance).length },
                { label: 'Cardios', value: all.filter(e => e.cardio).length },
                { label: 'Étirements', value: all.filter(e => e.etirements).length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                  <div className="text-xl font-bold" style={{ color: '#f5c518' }}>{value}</div>
                  <div className="text-xs" style={{ color: '#555' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

interface Props {
  extra: ExtraData
  setExtra: (fn: (e: ExtraData) => ExtraData) => void
}
