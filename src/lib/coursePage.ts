import { siteUrl } from './site'
import { landingPage, getModuleById } from '../pages/LandingPage/_landingPage'
import { getCourseBySlug, getCoursesByModuleId } from '../pages/Course/_courses'

export const themeClassMap = {
  primary: 'course-page--primary',
  secondary: 'course-page--secondary',
  tertiary: 'course-page--tertiary',
  danger: 'course-page--danger',
}

export function getCoursePageData(courseSlug: string) {
  const course = getCourseBySlug(courseSlug)

  if (!course) {
    return undefined
  }

  const module = getModuleById(course.moduleId)

  if (!module) {
    return undefined
  }

  const moduleCourses = getCoursesByModuleId(module.id)
  const currentCourseIndex = moduleCourses.findIndex((item) => item.slug === course.slug)
  const currentModuleIndex = landingPage.modules.findIndex((item) => item.id === module.id)
  const previousCourseInModule =
    currentCourseIndex > 0 ? moduleCourses[currentCourseIndex - 1] : undefined
  const previousModule =
    currentModuleIndex > 0 ? landingPage.modules[currentModuleIndex - 1] : undefined
  const nextCourseInModule =
    currentCourseIndex >= 0 ? moduleCourses[currentCourseIndex + 1] : undefined
  const nextModule =
    currentModuleIndex >= 0 ? landingPage.modules[currentModuleIndex + 1] : undefined
  const previousCourse =
    previousCourseInModule ??
    (previousModule ? getCoursesByModuleId(previousModule.id).at(-1) : undefined)
  const nextCourse =
    nextCourseInModule ?? (nextModule ? getCoursesByModuleId(nextModule.id)[0] : undefined)
  const currentCourseGlobalIndex = landingPage.modules
    .flatMap((landingModule) => getCoursesByModuleId(landingModule.id))
    .findIndex((item) => item.slug === course.slug)
  const nextPublicCourse = landingPage.modules
    .flatMap((landingModule) => getCoursesByModuleId(landingModule.id))
    .slice(currentCourseGlobalIndex + 1)
    .find((item) => !item.private)
  const themeClass = themeClassMap[module.theme]
  const hasChat = course.chat.length > 0
  const courseNavigation = {
    ...landingPage.navigation,
    links: landingPage.navigation.links.map((link) => ({
      ...link,
      href: `${siteUrl}${link.href}`,
      active: false,
    })),
    cta: {
      ...landingPage.navigation.cta,
      href: `/${landingPage.navigation.cta.href}`,
    },
  }

  return {
    course,
    module,
    moduleCourses,
    previousCourse,
    nextCourse,
    nextPublicCourse,
    hasChat,
    themeClass,
    courseNavigation,
  }
}
