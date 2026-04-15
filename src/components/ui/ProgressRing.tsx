interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export default function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 7,
  color = '#f5c518',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(1, max > 0 ? value / max : 0)
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-gotham font-bold text-sm leading-none">
            {value}
          </span>
          {sublabel && (
            <span className="text-muted text-[9px] font-gotham">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-muted text-xs font-gotham text-center">{label}</span>
      )}
    </div>
  )
}
