import { useState, useEffect } from 'react'
import { ExtraData } from '../types/extra'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_EXTRA } from '../types/extra'
import SportPanel from '../panels/SportPanel'
import NutritionPanel from '../panels/NutritionPanel'
import DevPersonnelPanel from '../panels/DevPersonnelPanel'

type DrawerTab = 'sport' | 'nutrition' | 'dev'

interface Props {
  open: boolean
  onClose: () => void
}

const TABS: { key: DrawerTab; label: string; icon: string }[] = [
  { key: 'sport',     label: 'SPORT',      icon: '💪' },
  { key: 'nutrition', label: 'NUTRITION',   icon: '🥗' },
  { key: 'dev',       label: 'DEV. PERSO', icon: '🧠' },
]

export default function Drawer({ open, onClose }: Props) {
  const [tab, setTab] = useState<DrawerTab>('sport')
  const [extra, setExtra] = useLocalStorage<ExtraData>('nexus_extra', DEFAULT_EXTRA)

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}
      >
        <h2 className="font-bold tracking-widest text-sm uppercase" style={{ color: '#f5c518' }}>
          MES DOMAINES
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
          style={{ color: '#888888', backgroundColor: '#1a1a1a' }}
        >
          ✕
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex flex-shrink-0"
        style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-all"
            style={{
              borderBottom: tab === t.key ? '2px solid #f5c518' : '2px solid transparent',
              color: tab === t.key ? '#f5c518' : '#555555',
            }}
          >
            <span className="text-base">{t.icon}</span>
            <span className="text-xs font-bold tracking-wider">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'sport'     && <SportPanel      extra={extra} setExtra={setExtra} />}
        {tab === 'nutrition' && <NutritionPanel  extra={extra} setExtra={setExtra} />}
        {tab === 'dev'       && <DevPersonnelPanel extra={extra} setExtra={setExtra} />}
      </div>
    </div>
  )
}
