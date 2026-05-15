import { siteUrl } from './site'
import { getCourseSequenceData, getCourses, getLandingPage, getOrderedCourses } from './contentData'

export const themeClassMap = {
  primary: 'course-page--primary',
  secondary: 'course-page--secondary',
  tertiary: 'course-page--tertiary',
  danger: 'course-page--danger',
}

export async function getCoursePageData(courseSlug: string) {
  const landingPage = await getLandingPage()
  const courses = await getCourses()
  const courseSequence = getCourseSequenceData(courseSlug, landingPage.modules, courses)

  if (!courseSequence) {
    return undefined
  }

  const { course, module, moduleCourses, previousCourse, nextCourse } = courseSequence
  const allCourses = getOrderedCourses(landingPage.modules, courses)
  const currentCourseGlobalIndex = allCourses.findIndex((item) => item.slug === course.slug)
  const nextPublicCourse = allCourses
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
