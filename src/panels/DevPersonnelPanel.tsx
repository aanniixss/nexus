import { useState } from 'react'
import { ExtraData, LangSession, Book, BookSession } from '../types/extra'
import { todayStr, fmtSeconds } from '../utils/dates'
import { useTimer } from '../hooks/useTimer'

const LANGUAGES = [
  { key: 'anglais',  flag: '🇬🇧', label: 'Anglais',  hoursNeeded: 600,  months: 12, levels: ['A1','A2','B1','B2','C1','C2'] },
  { key: 'espagnol', flag: '🇪🇸', label: 'Espagnol', hoursNeeded: 600,  months: 12, levels: ['A1','A2','B1','B2','C1','C2'] },
  { key: 'italien',  flag: '🇮🇹', label: 'Italien',  hoursNeeded: 500,  months: 10, levels: ['A1','A2','B1','B2','C1','C2'] },
  { key: 'allemand', flag: '🇩🇪', label: 'Allemand', hoursNeeded: 800,  months: 16, levels: ['A1','A2','B1','B2','C1','C2'] },
  { key: 'russe',    flag: '🇷🇺', label: 'Russe',    hoursNeeded: 1100, months: 22, levels: ['A1','A2','B1','B2','C1','C2'] },
  { key: 'albanais', flag: '🇦🇱', label: 'Albanais', hoursNeeded: 900,  months: 18, levels: ['A1','A2','B1','B2','C1','C2'] },
]

function getLangStats(sessions: LangSession[], langKey: string) {
  const all = sessions.filter(s => s.language === langKey)
  const totalSecs = all.reduce((s, x) => s + x.durationSeconds, 0)
  const today = todayStr()
  const week = new Date(); week.setDate(week.getDate() - 7)
  const weekSecs = all.filter(s => s.date >= week.toISOString().slice(0, 10)).reduce((s, x) => s + x.durationSeconds, 0)
  return { totalSecs, weekSecs, sessions: all.length }
}

function LangTimer({ langKey, onSave }: { langKey: string; onSave: (s: number, date: string) => void }) {
  const { isRunning, elapsed, start, stop } = useTimer()

  const handleToggle = () => {
    if (isRunning) {
      const s = stop()
      if (s > 10) onSave(s, todayStr())
    } else {
      start(0)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
      style={{
        backgroundColor: isRunning ? '#ef444420' : '#f5c51820',
        color: isRunning ? '#ef4444' : '#f5c518',
        border: `1px solid ${isRunning ? '#ef4444' : '#f5c518'}`,
      }}
    >
      {isRunning ? `⏹ ${fmtSeconds(elapsed)}` : '▶ Commencer session'}
    </button>
  )
}

function BookTimer({ onSave }: { onSave: (s: number) => void }) {
  const { isRunning, elapsed, start, stop } = useTimer()
  const handleToggle = () => {
    if (isRunning) { const s = stop(); if (s > 10) onSave(s) } else start(0)
  }
  return (
    <button
      onClick={handleToggle}
      className="px-3 py-1.5 rounded-lg text-xs font-bold"
      style={{
        backgroundColor: isRunning ? '#ef444420' : '#f5c51820',
        color: isRunning ? '#ef4444' : '#f5c518',
        border: `1px solid ${isRunning ? '#ef4444' : '#f5c518'}`,
      }}
    >
      {isRunning ? `⏹ ${fmtSeconds(elapsed)}` : '▶ Timer'}
    </button>
  )
}

interface Props {
  extra: ExtraData
  setExtra: (fn: (e: ExtraData) => ExtraData) => void
}

export default function DevPersonnelPanel({ extra, setExtra }: Props) {
  const [subTab, setSubTab] = useState<'langues' | 'lecture'>('langues')
  const [pagesInput, setPagesInput] = useState('')
  const [bookForm, setBookForm] = useState({ title: '', author: '' })
  const [showBookForm, setShowBookForm] = useState(false)

  const activeLang = LANGUAGES[extra.currentLangIndex]

  const addLangSession = (langKey: string, durationSeconds: number, date: string) => {
    const session: LangSession = { id: Date.now().toString(), language: langKey, date, durationSeconds }
    setExtra(e => ({ ...e, langSessions: [...e.langSessions, session] }))
  }

  const unlockNextLang = () => {
    if (extra.currentLangIndex < LANGUAGES.length - 1) {
      setExtra(e => ({ ...e, currentLangIndex: e.currentLangIndex + 1 }))
    }
  }

  const currentBook = extra.books.find(b => b.id === extra.currentBookId && !b.finished)

  const addBookSession = (durationSeconds: number) => {
    const pages = parseInt(pagesInput) || 0
    if (!currentBook || pages <= 0) return
    const session: BookSession = { id: Date.now().toString(), date: todayStr(), pages, durationSeconds }
    setExtra(e => ({
      ...e,
      books: e.books.map(b => b.id === currentBook.id ? { ...b, sessions: [...b.sessions, session] } : b),
    }))
    setPagesInput('')
  }

  const finishBook = () => {
    if (!currentBook) return
    setExtra(e => ({
      ...e,
      books: e.books.map(b => b.id === currentBook.id ? { ...b, finished: true } : b),
      currentBookId: null,
    }))
  }

  const addBook = () => {
    if (!bookForm.title) return
    const book: Book = {
      id: Date.now().toString(),
      title: bookForm.title,
      author: bookForm.author,
      sessions: [],
      finished: false,
      startedAt: todayStr(),
    }
    setExtra(e => ({ ...e, books: [...e.books, book], currentBookId: book.id }))
    setBookForm({ title: '', author: '' })
    setShowBookForm(false)
  }

  const bookTotalPages = currentBook?.sessions.reduce((s, x) => s + x.pages, 0) ?? 0
  const bookTodayPages = currentBook?.sessions.filter(s => s.date === todayStr()).reduce((s, x) => s + x.pages, 0) ?? 0

  return (
    <div className="p-4 space-y-4">
      {/* Sub-tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
        {(['langues', 'lecture'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className="flex-1 py-2 text-xs font-bold tracking-widest uppercase transition-all"
            style={{
              backgroundColor: subTab === t ? '#f5c518' : '#111111',
              color: subTab === t ? '#000000' : '#888888',
            }}
          >
            {t === 'langues' ? '🌍 LANGUES' : '📚 LECTURE'}
          </button>
        ))}
      </div>

      {subTab === 'langues' && (
        <>
          {/* Active language challenge */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeLang.flag}</span>
              <div>
                <div className="font-bold tracking-wide text-white">{activeLang.label}</div>
                <div className="text-xs" style={{ color: '#f5c518' }}>
                  DÉFI {extra.currentLangIndex + 1}/6 · ACTIF
                </div>
              </div>
            </div>

            {(() => {
              const stats = getLangStats(extra.langSessions, activeLang.key)
              const hoursTotal = stats.totalSecs / 3600
              const pct = Math.min(100, Math.round((hoursTotal / activeLang.hoursNeeded) * 100))
              const hoursLeft = Math.max(0, activeLang.hoursNeeded - hoursTotal)
              return (
                <>
                  <div className="my-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#555' }}>{Math.round(hoursTotal)}h / {activeLang.hoursNeeded}h</span>
                      <span style={{ color: '#f5c518' }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#f5c518' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{fmtSeconds(stats.weekSecs)}</div>
                      <div className="text-xs" style={{ color: '#555' }}>Cette semaine</div>
                    </div>
                    <div className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{stats.sessions}</div>
                      <div className="text-xs" style={{ color: '#555' }}>Sessions</div>
                    </div>
                    <div className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="font-bold text-sm" style={{ color: '#22c55e' }}>{Math.round(hoursLeft)}h</div>
                      <div className="text-xs" style={{ color: '#555' }}>Restantes</div>
                    </div>
                  </div>
                  <div className="text-xs mb-3 p-2 rounded-lg" style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
                    🎯 Objectif : {activeLang.months} mois · ~1h/jour · Maîtrise totale (A1→C2)
                  </div>
                  <div className="flex gap-2">
                    <LangTimer langKey={activeLang.key} onSave={(s, date) => addLangSession(activeLang.key, s, date)} />
                    {extra.currentLangIndex < LANGUAGES.length - 1 && hoursTotal >= activeLang.hoursNeeded * 0.8 && (
                      <button
                        onClick={unlockNextLang}
                        className="px-3 py-2 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e' }}
                      >
                        ✓ Maîtrisé → {LANGUAGES[extra.currentLangIndex + 1].flag}
                      </button>
                    )}
                  </div>
                </>
              )
            })()}
          </div>

          {/* All languages list */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <h4 className="font-bold text-xs tracking-wide mb-3" style={{ color: '#888' }}>PARCOURS COMPLET</h4>
            <div className="space-y-2">
              {LANGUAGES.map((lang, i) => {
                const stats = getLangStats(extra.langSessions, lang.key)
                const pct = Math.min(100, Math.round((stats.totalSecs / 3600 / lang.hoursNeeded) * 100))
                const isActive = i === extra.currentLangIndex
                const isDone = i < extra.currentLangIndex
                return (
                  <div key={lang.key} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: '#1a1a1a', opacity: i > extra.currentLangIndex ? 0.4 : 1 }}>
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: isActive ? '#f5c518' : isDone ? '#22c55e' : '#fff' }}>
                          {lang.label}
                        </span>
                        {isDone && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>✓</span>}
                        {isActive && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#f5c51820', color: '#f5c518' }}>ACTIF</span>}
                      </div>
                      <div className="h-1 rounded-full mt-1" style={{ backgroundColor: '#1a1a1a' }}>
                        <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: isDone ? '#22c55e' : '#f5c518' }} />
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: '#555' }}>{lang.months}m</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {subTab === 'lecture' && (
        <>
          {/* Current book */}
          {currentBook ? (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
              <div className="mb-2">
                <div className="font-bold text-white">{currentBook.title}</div>
                <div className="text-xs" style={{ color: '#888' }}>{currentBook.author}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                  <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{bookTotalPages}</div>
                  <div className="text-xs" style={{ color: '#555' }}>Pages totales</div>
                </div>
                <div className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                  <div className="font-bold text-sm" style={{ color: '#22c55e' }}>{bookTodayPages}</div>
                  <div className="text-xs" style={{ color: '#555' }}>Aujourd'hui</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Pages lues"
                  value={pagesInput}
                  onChange={e => setPagesInput(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <BookTimer onSave={addBookSession} />
              </div>
              <button
                onClick={finishBook}
                className="w-full py-2 rounded-lg text-xs font-bold"
                style={{ backgroundColor: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e' }}
              >
                ✓ Livre terminé
              </button>
            </div>
          ) : (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
              <p className="text-sm mb-3" style={{ color: '#555' }}>Aucun livre en cours</p>
              <button
                onClick={() => setShowBookForm(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ backgroundColor: '#f5c51820', color: '#f5c518', border: '1px solid #f5c518' }}
              >
                + Commencer un livre
              </button>
            </div>
          )}

          {showBookForm && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #f5c51840' }}>
              <h4 className="font-bold text-xs tracking-wide mb-3" style={{ color: '#f5c518' }}>NOUVEAU LIVRE</h4>
              <div className="space-y-2">
                <input
                  placeholder="Titre"
                  value={bookForm.title}
                  onChange={e => setBookForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <input
                  placeholder="Auteur (optionnel)"
                  value={bookForm.author}
                  onChange={e => setBookForm(f => ({ ...f, author: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <div className="flex gap-2">
                  <button onClick={addBook} className="flex-1 py-2 rounded-lg font-bold text-sm" style={{ backgroundColor: '#f5c518', color: '#000' }}>
                    Commencer
                  </button>
                  <button onClick={() => setShowBookForm(false)} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Books history */}
          {extra.books.filter(b => b.finished).length > 0 && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
              <h4 className="font-bold text-xs tracking-wide mb-2" style={{ color: '#888' }}>LIVRES TERMINÉS ✓</h4>
              {extra.books.filter(b => b.finished).map(b => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
                  <div>
                    <div className="text-sm text-white">{b.title}</div>
                    <div className="text-xs" style={{ color: '#555' }}>
                      {b.sessions.reduce((s, x) => s + x.pages, 0)} pages
                    </div>
                  </div>
                  <span style={{ color: '#22c55e' }}>✓</span>
                </div>
              ))}
            </div>
          )}

          {/* Reading stats */}
          {extra.books.length > 0 && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
              <h4 className="font-bold text-xs tracking-wide mb-3" style={{ color: '#888' }}>STATS LECTURE</h4>
              {(() => {
                const allSessions = extra.books.flatMap(b => b.sessions)
                const totalPages = allSessions.reduce((s, x) => s + x.pages, 0)
                const totalTime = allSessions.reduce((s, x) => s + x.durationSeconds, 0)
                const today = todayStr()
                const week = new Date(); week.setDate(week.getDate() - 7)
                const weekPages = allSessions.filter(s => s.date >= week.toISOString().slice(0, 10)).reduce((s, x) => s + x.pages, 0)
                return (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Total pages', value: totalPages },
                      { label: 'Cette semaine', value: `${weekPages}p` },
                      { label: 'Temps', value: fmtSeconds(totalTime) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg p-2" style={{ backgroundColor: '#1a1a1a' }}>
                        <div className="font-bold text-sm" style={{ color: '#f5c518' }}>{value}</div>
                        <div className="text-xs" style={{ color: '#555' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </>
      )}
    </div>
  )
}
