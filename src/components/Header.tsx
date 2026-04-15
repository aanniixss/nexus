interface HeaderProps {
  year: number
  onYearChange: (y: number) => void
  streak: number
}

export default function Header({ year, onYearChange, streak }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-3 py-2 sticky top-0 z-40"
      style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}
    >
      {/* Left: Logo + title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-2xl flex-shrink-0">🦇</span>
        <div className="leading-tight min-w-0">
          <div
            className="font-bold tracking-widest text-sm uppercase truncate"
            style={{ color: '#f5c518' }}
          >
            GOTHAM DISCIPLINE
          </div>
          <div className="text-xs tracking-wider uppercase" style={{ color: '#888888' }}>
            ANIS · TRACKER DE VIE
          </div>
        </div>
      </div>

      {/* Center: Year navigator */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onYearChange(year - 1)}
          className="px-1 py-1 rounded transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          ◄
        </button>
        <span className="font-bold tracking-widest text-sm px-1" style={{ color: '#ffffff' }}>
          {year}
        </span>
        <button
          onClick={() => onYearChange(year + 1)}
          className="px-1 py-1 rounded transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          ►
        </button>
      </div>

      {/* Right: Streak */}
      <div className="flex items-center flex-shrink-0">
        <div
          className="rounded-full px-3 py-1 flex items-center gap-1"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <span className="text-base">🔥</span>
          <span className="font-bold text-sm tracking-wide" style={{ color: '#f5c518' }}>
            {streak}J
          </span>
        </div>
      </div>
    </header>
  )
}
