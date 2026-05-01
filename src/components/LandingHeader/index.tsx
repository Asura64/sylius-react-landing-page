import { useEffect, useState } from 'react'
import type { NavigationContent } from '../../types/content'
import { getLandingCtaState } from '../../lib/landingCta'
import { courses, publicCourses } from '../../pages/Course/_courses'
import { hasCourseChatProgress, isCourseChatCompleted } from '../CourseChat'
import { Header } from '../Header'

type LandingHeaderProps = {
  navigation: NavigationContent
}

export function LandingHeader({ navigation }: LandingHeaderProps) {
  const [currentNavigation, setCurrentNavigation] = useState(navigation)

  useEffect(() => {
    const ctaState = getLandingCtaState(
      courses,
      publicCourses,
      navigation.cta.href,
      {
        hasProgress: hasCourseChatProgress,
        isCompleted: (course) =>
          course.chat.length > 0 && isCourseChatCompleted(course.slug, course.chat),
      },
    )

    setCurrentNavigation({
      ...navigation,
      cta: {
        ...navigation.cta,
        href: ctaState.href,
        label: ctaState.hasStarted ? 'Continuer' : navigation.cta.label,
      },
    })
  }, [navigation])

  return <Header navigation={currentNavigation} />
}
