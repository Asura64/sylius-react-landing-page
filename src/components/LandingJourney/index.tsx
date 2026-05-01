import { useEffect, useRef, useState } from 'react'
import type { FeatureGridContent, HeroContent, Module } from '../../types/content'
import { useTimelineProgress } from '../../hooks/useTimelineProgress'
import { courses, getCoursesByModuleId, getFirstCourseByModuleId, publicCourses } from '../../pages/Course/_courses'
import { hasCourseChatProgress, isCourseChatCompleted } from '../CourseChat'
import { FeatureGrid } from '../FeatureGrid'
import { HeroSection } from '../HeroSection'
import { JourneySection } from '../JourneySection'
import { SidebarNav } from '../SidebarNav'
import { getLandingCtaState } from '../../lib/landingCta'

type LandingJourneyProps = {
  featureGrid: FeatureGridContent
  hero: HeroContent
  modules: Module[]
}

export function LandingJourney({ featureGrid, hero, modules }: LandingJourneyProps) {
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])
  const [currentHero, setCurrentHero] = useState(hero)
  const [completedCourseSlugsByModuleId, setCompletedCourseSlugsByModuleId] = useState<
    Record<number, string[]>
  >({})
  const timelineState = useTimelineProgress({
    timelineRef,
    itemRefs,
    itemCount: modules.length,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const ctaState = getLandingCtaState(
      courses,
      publicCourses,
      hero.primaryAction.href,
      {
        hasProgress: hasCourseChatProgress,
        isCompleted: (course) =>
          course.chat.length > 0 && isCourseChatCompleted(course.slug, course.chat),
      },
    )

    setCurrentHero({
      ...hero,
      primaryAction: {
        ...hero.primaryAction,
        href: ctaState.href,
        label: ctaState.hasStarted ? 'Continuer la formation' : hero.primaryAction.label,
      },
    })

    setCompletedCourseSlugsByModuleId(
      Object.fromEntries(
        modules.map((module) => [
          module.id,
          getCoursesByModuleId(module.id)
            .filter(
              (course) => course.chat.length > 0 && isCourseChatCompleted(course.slug, course.chat),
            )
            .map((course) => course.slug),
        ]),
      ),
    )
  }, [hero, modules])

  return (
    <div className="app__layout">
      <SidebarNav modules={modules} activeIndex={timelineState.activeIndex} />
      <div className="app__content">
        <HeroSection hero={currentHero} />
        <JourneySection
          modules={modules}
          getModuleCourses={getCoursesByModuleId}
          getModuleHref={(moduleId) => {
            const course = getFirstCourseByModuleId(moduleId)

            return course ? `/cours/sylius/${course.slug}/` : undefined
          }}
          getCompletedCourseSlugs={(moduleId) => completedCourseSlugsByModuleId[moduleId] ?? []}
          timelineRef={timelineRef}
          itemRefs={itemRefs}
          timelineState={timelineState}
        />
        <FeatureGrid featureGrid={featureGrid} />
      </div>
    </div>
  )
}
