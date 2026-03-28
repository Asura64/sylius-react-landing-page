import { useRef } from 'react'
import './App.scss'
import content from './data/trainingContent.json'
import { Header } from './components/Header'
import { SidebarNav } from './components/SidebarNav'
import { HeroSection } from './components/HeroSection'
import { JourneySection } from './components/JourneySection'
import { FeatureGrid } from './components/FeatureGrid'
import { Footer } from './components/Footer'
import { useTimelineProgress } from './hooks/useTimelineProgress'
import type { TrainingContent } from './types/content'

function App() {
  const { navigation, hero, modules, featureGrid, footer } = content as TrainingContent
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])
  const timelineState = useTimelineProgress({
    timelineRef,
    itemRefs,
    itemCount: modules.length,
  })

  return (
    <>
      <Header navigation={navigation} />
      <main className="app">
        <div className="app__layout">
          <SidebarNav modules={modules} activeIndex={timelineState.activeIndex} />
          <div className="app__content">
            <HeroSection hero={hero} />
            <JourneySection
              modules={modules}
              timelineRef={timelineRef}
              itemRefs={itemRefs}
              timelineState={timelineState}
            />
            <FeatureGrid featureGrid={featureGrid} />
          </div>
        </div>
      </main>
      <Footer footer={footer} />
    </>
  )
}

export default App
