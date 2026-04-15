import { Play, Square } from 'lucide-react'
import { useTimer } from '../../hooks/useTimer'
import { fmtSeconds } from '../../utils/dates'

interface TimerProps {
  onStop: (seconds: number) => void
  label?: string
  existingSeconds?: number
}

export default function Timer({ onStop, label, existingSeconds = 0 }: TimerProps) {
  const { isRunning, elapsed, start, stop, reset } = useTimer()

  const handleStop = () => {
    const s = stop()
    if (s > 0) {
      onStop(s)
      reset()
    }
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-muted text-sm font-gotham">{label}</span>}
      {existingSeconds > 0 && !isRunning && (
        <span className="text-accent text-sm font-gotham font-semibold">
          {fmtSeconds(existingSeconds)}
        </span>
      )}
      {isRunning && (
        <span className="text-accent font-gotham font-bold text-sm tabular-nums min-w-[48px]">
          {fmtSeconds(elapsed)}
        </span>
      )}
      {!isRunning ? (
        <button
          onClick={start}
          className="flex items-center gap-1 bg-accent/10 border border-accent/40 text-accent hover:bg-accent hover:text-black transition-all rounded-lg px-3 py-1.5 text-xs font-gotham font-bold tracking-wider uppercase"
        >
          <Play size={12} fill="currentColor" />
          {existingSeconds > 0 ? 'Reprendre' : 'Démarrer'}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="flex items-center gap-1 bg-danger/10 border border-danger/50 text-danger hover:bg-danger hover:text-white transition-all rounded-lg px-3 py-1.5 text-xs font-gotham font-bold tracking-wider uppercase"
        >
          <Square size={12} fill="currentColor" />
          Arrêter
        </button>
      )}
    </div>
  )
}
