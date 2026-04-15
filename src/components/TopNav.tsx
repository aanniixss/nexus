import { Tab } from '../types'

interface TopNavProps {
  active: Tab
  onChange: (t: Tab) => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'aujourd_hui', label: "AUJOURD'HUI" },
  { id: 'semaines', label: 'SEMAINES' },
  { id: 'mois', label: 'MOIS' },
  { id: 'annee', label: 'ANNEE' },
  { id: 'objectifs', label: 'OBJECTIFS' },
]

export default function TopNav({ active, onChange }: TopNavProps) {
  return (
    <nav className="flex overflow-x-auto border-b border-border bg-card sticky top-[53px] z-30 scrollbar-hide">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-shrink-0 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors relative whitespace-nowrap ${
            active === tab.id
              ? 'text-gold'
              : 'text-muted hover:text-white'
          }`}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
          )}
        </button>
      ))}
    </nav>
  )
}
