import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: '#2a2a2a' }}
          >
            <span className="font-bold text-lg tracking-widest" style={{ color: '#f5c518' }}>
              {title}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              style={{ color: '#888888' }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
