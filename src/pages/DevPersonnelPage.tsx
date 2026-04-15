import { useState } from 'react'
import { Plus, Lock, ChevronRight, Check, Trash2 } from 'lucide-react'
import { v4 as uuid } from '../utils/uuid'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { LanguageSession, LanguageConfig, BookEntry } from '../types'
import Timer from '../components/ui/Timer'
import Modal from '../components/ui/Modal'
import StatBar from '../components/ui/StatBar'
import { today, getLast7Days, fmtSeconds } from '../utils/dates'

// ── Language config (sequential challenge) ─────────────────────────────────
const LANGUAGES: LanguageConfig[] = [
  { key: 'anglais', label: 'Anglais 🇬🇧', estimatedMonths: 10, hoursNeeded: 600, order: 1 },
  { key: 'espagnol', label: 'Espagnol 🇪🇸', estimatedMonths: 12, hoursNeeded: 750, order: 2 },
  { key: 'italien', label: 'Italien 🇮🇹', estimatedMonths: 10, hoursNeeded: 600, order: 3 },
  { key: 'allemand', label: 'Allemand 🇩🇪', estimatedMonths: 16, hoursNeeded: 900, order: 4 },
  { key: 'russe', label: 'Russe 🇷🇺', estimatedMonths: 22, hoursNeeded: 1100, order: 5 },
  { key: 'albanais', label: 'Albanais 🇦🇱', estimatedMonths: 18, hoursNeeded: 1000, order: 6 },
]

const MILESTONES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function getMilestone(totalHours: number): number {
  // rough hours per level
  const thresholds = [50, 150, 350, 600, 800, 1000]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalHours >= thresholds[i]) return i + 1
  }
  return 0
}

export default function DevPersonnelPage() {
  const [sessions, setSessions] = useLocalStorage<LanguageSession[]>('nexus_lang_sessions', [])
  const [books, setBooks] = useLocalStorage<BookEntry[]>('nexus_books', [])
  const [activeTab, setActiveTab] = useState<'langues' | 'livres'>('langues')
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [bookModal, setBookModal] = useState(false)
  const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: '' })
  const [bookPagesInput, setBookPagesInput] = useState<Record<string, string>>({})

  const todayStr = today()

  // Total hours per language
  const hoursPerLang = (key: string) => {
    const total = sessions.filter(s => s.language === key).reduce((a, s) => a + s.duration, 0)
    return total / 3600
  }

  // Determine current active language (first not mastered)
  const getActiveLang = () => {
    for (const lang of LANGUAGES) {
      const hours = hoursPerLang(lang.key)
      if (hours < lang.hoursNeeded) return lang.key
    }
    return LANGUAGES[LANGUAGES.length - 1].key
  }
  const activeLangKey = getActiveLang()

  const addSession = (language: string, seconds: number) => {
    setSessions(prev => [
      ...prev,
      { id: uuid(), language, date: todayStr, duration: seconds },
    ])
  }

  // Book helpers
  const addBook = () => {
    if (!newBook.title.trim()) return
    const book: BookEntry = {
      id: uuid(),
      title: newBook.title,
      author: newBook.author,
      totalPages: Number(newBook.totalPages) || 0,
      sessions: [],
      finished: false,
      startedAt: todayStr,
    }
    setBooks(prev => [...prev, book])
    setNewBook({ title: '', author: '', totalPages: '' })
    setBookModal(false)
  }

  const addBookSession = (bookId: string, pages: number, duration: number) => {
    setBooks(prev =>
      prev.map(b =>
        b.id === bookId
          ? { ...b, sessions: [...b.sessions, { date: todayStr, pages, duration }] }
          : b
      )
    )
    setBookPagesInput(prev => ({ ...prev, [bookId]: '' }))
  }

  const markBookFinished = (bookId: string) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, finished: !b.finished } : b))
  }

  const removeBook = (bookId: string) => setBooks(prev => prev.filter(b => b.id !== bookId))

  // Stats
  const last7 = getLast7Days()

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-2xl tracking-widest uppercase">Dev. Personnel</h1>
      </div>

      {/* Tab switch */}
      <div className="flex bg-card border border-border rounded-xl overflow-hidden">
        {([['langues', '🌐 Langues'], ['livres', '📚 Livres']] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setActiveTab(v)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === v ? 'bg-accent text-black' : 'text-muted hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'langues' && (
        <div className="space-y-4">
          {/* Challenge overview */}
          <div className="bg-card border border-accent/30 rounded-xl p-4">
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-1">
              Le Défi des 6 Langues
            </p>
            <p className="text-muted text-xs">
              Maîtrise complète (parler · écrire · comprendre) — une langue à la fois
            </p>
          </div>

          {/* Language list */}
          <div className="space-y-3">
            {LANGUAGES.map((lang, idx) => {
              const hours = hoursPerLang(lang.key)
              const milestone = getMilestone(hours)
              const pct = Math.min(100, (hours / lang.hoursNeeded) * 100)
              const isActive = lang.key === activeLangKey
              const isLocked = LANGUAGES.findIndex(l => l.key === activeLangKey) < idx
              const isDone = hours >= lang.hoursNeeded

              return (
                <div
                  key={lang.key}
                  className={`bg-card border rounded-xl overflow-hidden transition-all ${
                    isActive ? 'border-accent/50' : isDone ? 'border-green-600/40' : 'border-border'
                  }`}
                >
                  {/* Header */}
                  <button
                    onClick={() => !isLocked && setSelectedLang(selectedLang === lang.key ? null : lang.key)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-gotham border ${
                      isDone ? 'bg-green-600 border-green-600 text-white' :
                      isActive ? 'bg-accent border-accent text-black' :
                      isLocked ? 'bg-card2 border-border text-border' :
                      'bg-card2 border-border text-muted'
                    }`}>
                      {isDone ? <Check size={13} strokeWidth={3} /> : isLocked ? <Lock size={11} /> : lang.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-gotham font-semibold text-sm ${isLocked ? 'text-muted' : 'text-white'}`}>
                          {lang.label}
                        </p>
                        {isActive && <span className="bg-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Actif</span>}
                      </div>
                      {!isLocked && (
                        <p className="text-muted text-xs mt-0.5">
                          {milestone > 0 ? MILESTONES[milestone - 1] : 'Débutant'} → {MILESTONES[Math.min(5, milestone)]}
                          {' · '}{Math.round(hours)}h / {lang.hoursNeeded}h
                        </p>
                      )}
                    </div>
                    {!isLocked && (
                      <ChevronRight
                        size={16}
                        className={`text-muted transition-transform ${selectedLang === lang.key ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>

                  {/* Progress bar */}
                  {!isLocked && (
                    <div className="px-4 pb-3">
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isDone ? 'bg-green-500' : isActive ? 'bg-accent' : 'bg-muted'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {/* Milestone markers */}
                      <div className="flex justify-between mt-1">
                        {MILESTONES.map(m => (
                          <span key={m} className={`text-[9px] font-gotham ${
                            getMilestone(hours) >= MILESTONES.indexOf(m) + 1 ? 'text-accent' : 'text-border'
                          }`}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded detail */}
                  {selectedLang === lang.key && !isLocked && (
                    <div className="border-t border-border px-4 py-4 space-y-3">
                      {/* Timer */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted text-sm">Session du jour</span>
                        <Timer
                          onStop={s => addSession(lang.key, s)}
                          existingSeconds={sessions
                            .filter(s => s.language === lang.key && s.date === todayStr)
                            .reduce((a, s) => a + s.duration, 0)}
                        />
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <MiniStat
                          label="Cette sem."
                          value={fmtSeconds(
                            sessions.filter(s => s.language === lang.key && last7.includes(s.date))
                              .reduce((a, s) => a + s.duration, 0)
                          )}
                        />
                        <MiniStat label="Total" value={`${Math.round(hours)}h`} />
                        <MiniStat
                          label="Restant"
                          value={`${Math.max(0, Math.round(lang.hoursNeeded - hours))}h`}
                        />
                      </div>
                      <StatBar
                        label="Progression"
                        value={Math.round(hours)}
                        max={lang.hoursNeeded}
                        unit="h"
                        color="#f5c518"
                      />
                      {/* Estimated finish */}
                      <p className="text-muted text-xs text-center">
                        Objectif: maîtrise complète (parler · écrire · comprendre) en ~{lang.estimatedMonths} mois
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'livres' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-muted text-xs uppercase tracking-widest">
              {books.filter(b => !b.finished).length} en cours · {books.filter(b => b.finished).length} terminé(s)
            </h2>
            <button
              onClick={() => setBookModal(true)}
              className="flex items-center gap-1 text-accent text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={14} />
              Ajouter
            </button>
          </div>

          {books.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm">
              Aucun livre — Commence ta liste !
            </div>
          ) : (
            <div className="space-y-3">
              {books.map(book => {
                const totalPages = book.sessions.reduce((a, s) => a + s.pages, 0)
                const totalDuration = book.sessions.reduce((a, s) => a + s.duration, 0)
                const weekPages = book.sessions
                  .filter(s => last7.includes(s.date))
                  .reduce((a, s) => a + s.pages, 0)
                const pct = book.totalPages > 0 ? Math.min(100, (totalPages / book.totalPages) * 100) : 0

                return (
                  <div
                    key={book.id}
                    className={`bg-card border rounded-xl overflow-hidden ${book.finished ? 'border-green-600/40' : 'border-border'}`}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-gotham font-semibold ${book.finished ? 'text-green-400 line-through' : 'text-white'}`}>
                            {book.title}
                          </p>
                          {book.author && <p className="text-muted text-xs">{book.author}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => markBookFinished(book.id)} title="Marquer terminé">
                            <Check size={16} className={book.finished ? 'text-green-400' : 'text-muted hover:text-white'} />
                          </button>
                          <button onClick={() => removeBook(book.id)}>
                            <Trash2 size={15} className="text-border hover:text-danger transition-colors" />
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      {book.totalPages > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted mb-1">
                            <span>{totalPages} / {book.totalPages} pages</span>
                            <span>{Math.round(pct)}%</span>
                          </div>
                          <div className="h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${book.finished ? 'bg-green-500' : 'bg-accent'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="flex gap-3 mt-2 text-xs text-muted">
                        <span>Cette sem: <span className="text-white">{weekPages}p</span></span>
                        <span>Total: <span className="text-white">{totalPages}p</span></span>
                        <span>Temps: <span className="text-white">{fmtSeconds(totalDuration)}</span></span>
                      </div>

                      {/* Add pages + timer */}
                      {!book.finished && (
                        <div className="mt-3 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={bookPagesInput[book.id] || ''}
                              onChange={e => setBookPagesInput(prev => ({ ...prev, [book.id]: e.target.value }))}
                              placeholder="Pages lues"
                              className="flex-1 bg-card2 border border-border rounded-xl px-3 py-2 text-white font-gotham text-sm placeholder-muted focus:outline-none focus:border-accent"
                            />
                            <button
                              onClick={() => {
                                const p = Number(bookPagesInput[book.id])
                                if (p > 0) addBookSession(book.id, p, 0)
                              }}
                              className="bg-accent text-black font-bold px-4 rounded-xl text-sm uppercase tracking-wider"
                            >
                              +
                            </button>
                          </div>
                          <Timer
                            onStop={s => {
                              const p = Number(bookPagesInput[book.id]) || 0
                              addBookSession(book.id, p, s)
                              setBookPagesInput(prev => ({ ...prev, [book.id]: '' }))
                            }}
                            existingSeconds={totalDuration}
                            label="Chrono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Add book modal */}
      <Modal isOpen={bookModal} onClose={() => setBookModal(false)} title="Nouveau livre">
        <div className="space-y-3">
          {[
            { key: 'title', label: 'Titre', placeholder: 'Ex: Atomic Habits' },
            { key: 'author', label: 'Auteur', placeholder: 'Ex: James Clear' },
            { key: 'totalPages', label: 'Nombre de pages', placeholder: '0' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-muted text-xs uppercase tracking-wider mb-1 block">{f.label}</label>
              <input
                type={f.key === 'totalPages' ? 'number' : 'text'}
                value={newBook[f.key as keyof typeof newBook]}
                onChange={e => setNewBook(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white font-gotham placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
          ))}
          <button
            onClick={addBook}
            disabled={!newBook.title.trim()}
            className="w-full bg-accent text-black font-bold font-gotham uppercase tracking-wider py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            Ajouter le livre
          </button>
        </div>
      </Modal>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-card rounded-lg p-2 border border-border">
      <p className="text-accent font-bold text-sm font-gotham">{value}</p>
      <p className="text-muted text-[10px] uppercase tracking-wide">{label}</p>
    </div>
  )
}
