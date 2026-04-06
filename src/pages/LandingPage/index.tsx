import { useRef } from 'react'
import '../../App.scss'
import { landingPage } from './landingPage'
import { Header } from '../../components/Header'
import { SidebarNav } from '../../components/SidebarNav'
import { HeroSection } from '../../components/HeroSection'
import { JourneySection } from '../../components/JourneySection'
import { FeatureGrid } from '../../components/FeatureGrid'
import { Footer } from '../../components/Footer'
import { useTimelineProgress } from '../../hooks/useTimelineProgress'
import { getFirstCourseByModuleId } from '../Course/courses'

export function LandingPage() {
  const { navigation, hero, modules, featureGrid, footer } = landingPage
  const firstModule = modules[0]
  const firstCourseHref = firstModule ? getFirstCourseByModuleId(firstModule.id) : undefined
  const startHref = firstCourseHref ? `/cours/sylius/${firstCourseHref.slug}` : navigation.cta.href
  const landingNavigation = {
    ...navigation,
    cta: {
      ...navigation.cta,
      href: startHref,
    },
  }
  const landingHero = {
    ...hero,
    primaryAction: {
      ...hero.primaryAction,
      href: startHref,
    },
  }
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])
  const timelineState = useTimelineProgress({
    timelineRef,
    itemRefs,
    itemCount: modules.length,
  })

  return (
    <>
      <Header navigation={landingNavigation} />
      <main className="app">
        <div className="app__layout">
          <SidebarNav modules={modules} activeIndex={timelineState.activeIndex} />
          <div className="app__content">
            <HeroSection hero={landingHero} />
            <JourneySection
              modules={modules}
              getModuleHref={(moduleId) => {
                const course = getFirstCourseByModuleId(moduleId)

                return course ? `/cours/sylius/${course.slug}` : undefined
              }}
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
