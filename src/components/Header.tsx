import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeaderProps {
  year: number
  onYearChange: (y: number) => void
  streak: number
}

export default function Header({ year, onYearChange, streak }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-card sticky top-0 z-40">
      {/* Left: Logo + title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🦇</span>
        <div className="leading-tight">
          <div className="text-gold font-bold tracking-widest text-sm uppercase">
            Gotham Discipline
          </div>
          <div className="text-muted text-xs tracking-wider uppercase">
            Anis · Tracker de Vie
          </div>
        </div>
      </div>

      {/* Center: Year navigator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onYearChange(year - 1)}
          className="text-muted hover:text-white transition-colors p-1"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white font-bold tracking-widest text-sm">{year}</span>
        <button
          onClick={() => onYearChange(year + 1)}
          className="text-muted hover:text-white transition-colors p-1"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Right: Streak */}
      <div className="flex items-center">
        <div className="bg-card2 border border-border rounded-full px-3 py-1 flex items-center gap-1">
          <span className="text-base">🔥</span>
          <span className="text-gold font-bold text-sm tracking-wide">{streak}J</span>
        </div>
      </div>
    </header>
  )
}
