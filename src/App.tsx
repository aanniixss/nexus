import { useState } from 'react'
import Layout, { TabId } from './components/Layout'
import ObjectifsPage from './pages/ObjectifsPage'
import SportPage from './pages/SportPage'
import NutritionPage from './pages/NutritionPage'
import ReligionPage from './pages/ReligionPage'
import DevPersonnelPage from './pages/DevPersonnelPage'
import HabitudesPage from './pages/HabitudesPage'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('objectifs')

  const renderPage = () => {
    switch (activeTab) {
      case 'objectifs': return <ObjectifsPage />
      case 'sport':     return <SportPage />
      case 'nutrition': return <NutritionPage />
      case 'religion':  return <ReligionPage />
      case 'dev':       return <DevPersonnelPage />
      case 'habitudes': return <HabitudesPage />
    }
  }

  return (
    <Layout active={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </Layout>
  )
}
