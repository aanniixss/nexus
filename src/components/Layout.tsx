import { Target, Dumbbell, Utensils, Moon, BookOpen, Zap, LucideIcon } from 'lucide-react'

export type TabId = 'objectifs' | 'sport' | 'nutrition' | 'religion' | 'dev' | 'habitudes'

interface Tab {
  id: TabId
  label: string
  Icon: LucideIcon
}

const TABS: Tab[] = [
  { id: 'objectifs', label: 'Objectifs', Icon: Target },
  { id: 'sport', label: 'Sport', Icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', Icon: Utensils },
  { id: 'religion', label: 'Religion', Icon: Moon },
  { id: 'dev', label: 'Dev', Icon: BookOpen },
  { id: 'habitudes', label: 'Habitudes', Icon: Zap },
]

interface LayoutProps {
  active: TabId
  onTabChange: (tab: TabId) => void
  children: React.ReactNode
}

export default function Layout({ active, onTabChange, children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-primary font-gotham">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
        <span className="text-accent font-bold text-2xl tracking-[0.3em] uppercase select-none">
          NEXUS
        </span>
        <span className="text-muted text-xs tracking-widest uppercase">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`
                  flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-all
                  ${isActive ? 'text-accent' : 'text-muted hover:text-white'}
                `}
              >
                <div className={`relative pb-0.5 ${isActive ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent after:rounded-full' : ''}`}>
                  <Icon size={20} className={isActive ? 'drop-shadow-[0_0_6px_rgba(245,197,24,0.6)]' : ''} />
                </div>
                <span className={`text-[9px] tracking-widest uppercase font-semibold ${isActive ? 'text-accent' : ''}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
