import { useEffect, useRef } from 'react'
import '../../App.scss'
import { landingPage } from './_landingPage'
import { Header } from '../../components/Header'
import { SidebarNav } from '../../components/SidebarNav'
import { HeroSection } from '../../components/HeroSection'
import { JourneySection } from '../../components/JourneySection'
import { FeatureGrid } from '../../components/FeatureGrid'
import { Footer } from '../../components/Footer'
import { useTimelineProgress } from '../../hooks/useTimelineProgress'
import { getCoursesByModuleId, getFirstCourseByModuleId } from '../Course/_courses'

export function LandingPage() {
  const { navigation, hero, modules, featureGrid, footer } = landingPage
  const firstModule = modules[0]
  const firstCourseHref = firstModule ? getFirstCourseByModuleId(firstModule.id) : undefined
  const startHref = firstCourseHref ? `/cours/sylius/${firstCourseHref.slug}/` : navigation.cta.href
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

  useEffect(() => {
    document.title = 'Formation Sylius 2 pour les devs : architecture, personnalisation et mentorat expert'

    let metaDescription = document.querySelector('meta[name="description"]')

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }

    metaDescription.setAttribute('content', hero.description)

    let canonicalLink = document.querySelector('link[rel="canonical"]')

    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }

    canonicalLink.setAttribute('href', 'https://patxi.iparaguirre.fr')
  }, [hero.description])

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
              getModuleCourses={getCoursesByModuleId}
              getModuleHref={(moduleId) => {
                const course = getFirstCourseByModuleId(moduleId)

                return course ? `/cours/sylius/${course.slug}/` : undefined
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
