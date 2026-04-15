import { useState } from 'react'
import { Tab, AppData, DailyEntry } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { DEFAULT_DATA } from './data/defaults'
import { todayStr } from './utils/dates'
import { calcStreak } from './utils/score'
import Header from './components/Header'
import TopNav from './components/TopNav'
import AujourdhuiPage from './pages/AujourdhuiPage'
import SemainesPage from './pages/SemainesPage'
import MoisPage from './pages/MoisPage'
import AnneePage from './pages/AnneePage'
import ObjectifsPage from './pages/ObjectifsPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('aujourd_hui')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useLocalStorage<AppData>('nexus_v2', DEFAULT_DATA)

  const updateEntry = (date: string, updater: (e: DailyEntry) => DailyEntry) => {
    setData(prev => {
      const existing: DailyEntry = prev.entries[date] ?? {
        date,
        prayers: {
          fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null,
          rawatib: false, doha: false, qiyam: false,
        },
        habits: {},
        badHabits: {},
      }
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [date]: updater(existing),
        },
      }
    })
  }

  const navigateToDay = (date: string) => {
    setSelectedDate(date)
    setTab('aujourd_hui')
  }

  const streak = calcStreak(data)

  const renderPage = () => {
    switch (tab) {
      case 'aujourd_hui':
        return (
          <AujourdhuiPage
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            data={data}
            updateEntry={updateEntry}
          />
        )
      case 'semaines':
        return (
          <SemainesPage
            year={year}
            data={data}
            onNavigateToDay={navigateToDay}
          />
        )
      case 'mois':
        return (
          <MoisPage
            year={year}
            data={data}
            onNavigateToDay={navigateToDay}
          />
        )
      case 'annee':
        return (
          <AnneePage
            year={year}
            data={data}
            onNavigateToDay={navigateToDay}
          />
        )
      case 'objectifs':
        return (
          <ObjectifsPage
            data={data}
            setData={setData}
          />
        )
    }
  }

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      <Header year={year} onYearChange={setYear} streak={streak} />
      <TopNav active={tab} onChange={setTab} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  )
}
