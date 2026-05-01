import type { Course } from '../types/content'

type LandingCtaStatus = {
  hasProgress: (courseSlug: string) => boolean
  isCompleted: (course: Course) => boolean
}

export type LandingCtaState = {
  hasStarted: boolean
  href: string
}

export function getDefaultLandingStartHref(
  publicCourses: Course[],
  fallbackHref: string,
) {
  return publicCourses[0] ? `/cours/sylius/${publicCourses[0].slug}/` : fallbackHref
}

export function getLandingCtaState(
  allCourses: Course[],
  publicCourses: Course[],
  fallbackHref: string,
  status: LandingCtaStatus,
): LandingCtaState {
  const hasStarted = allCourses.some((course) => status.hasProgress(course.slug))
  const nextCourse = publicCourses.find((course) => !status.isCompleted(course))
  const fallbackCourse = publicCourses.at(-1)
  const targetCourse = nextCourse ?? fallbackCourse

  return {
    hasStarted,
    href: targetCourse ? `/cours/sylius/${targetCourse.slug}/` : fallbackHref,
  }
}
