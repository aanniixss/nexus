interface StatBarProps {
  label: string
  value: number
  max: number
  unit?: string
  color?: string
}

export default function StatBar({
  label,
  value,
  max,
  unit = '',
  color = '#f5c518',
}: StatBarProps) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-muted text-xs font-gotham uppercase tracking-wider">
          {label}
        </span>
        <span className="text-white text-xs font-gotham font-semibold">
          {value}
          {unit && <span className="text-muted ml-0.5">/{max}{unit}</span>}
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
