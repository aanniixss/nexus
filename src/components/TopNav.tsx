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
    <nav
      className="flex overflow-x-auto sticky top-[53px] z-30"
      style={{
        backgroundColor: '#111111',
        borderBottom: '1px solid #2a2a2a',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex-shrink-0 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors relative whitespace-nowrap"
          style={{
            color: active === tab.id ? '#f5c518' : '#888888',
          }}
          onMouseEnter={e => {
            if (active !== tab.id) (e.currentTarget as HTMLElement).style.color = '#ffffff'
          }}
          onMouseLeave={e => {
            if (active !== tab.id) (e.currentTarget as HTMLElement).style.color = '#888888'
          }}
        >
          {tab.label}
          {active === tab.id && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: '#f5c518' }}
            />
          )}
        </button>
      ))}
    </nav>
  )
}
