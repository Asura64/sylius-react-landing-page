import { Controller } from '@hotwired/stimulus'
import type { Course } from '../types/content'
import { courseProgressChangedEventName, hasCourseChatProgress, isCourseChatCompleted } from '../lib/courseChatState'
import { getLandingCtaState } from '../lib/landingCta'

const colorMap: Record<string, string> = {
  primary: '#1100bc',
  secondary: '#7547ab',
  tertiary: '#005569',
  danger: '#ba1a1a',
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function mixColor(from: string, to: string, ratio: number) {
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  const clamp = Math.max(0, Math.min(1, ratio))

  const r = Math.round(start.r + (end.r - start.r) * clamp)
  const g = Math.round(start.g + (end.g - start.g) * clamp)
  const b = Math.round(start.b + (end.b - start.b) * clamp)

  return `rgb(${r}, ${g}, ${b})`
}

function animateScrollTo(targetTop: number, duration = 300) {
  const startTop = window.scrollY
  const delta = targetTop - startTop
  const startTime = performance.now()

  const easeInOutCubic = (progress: number) =>
    progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeInOutCubic(progress)

    window.scrollTo(0, startTop + delta * easedProgress)

    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }

  window.requestAnimationFrame(step)
}

export default class extends Controller<HTMLElement> {
  static values = {
    courses: Array,
    fallbackHref: String,
    publicCourses: Array,
  }

  declare readonly coursesValue: Course[]
  declare readonly fallbackHrefValue: string
  declare readonly publicCoursesValue: Course[]
  private frameId: number | null = null

  private readonly handleWindowUpdate = () => {
    if (this.frameId != null) {
      return
    }

    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = null
      this.updateLandingCtas()
      this.updateLandingCompletedCourses()
      this.updateLandingTimeline()
    })
  }

  connect() {
    this.updateLandingCtas()
    this.updateLandingCompletedCourses()
    this.updateLandingTimeline()
    window.addEventListener('scroll', this.handleWindowUpdate, { passive: true })
    window.addEventListener('resize', this.handleWindowUpdate)
    window.addEventListener(courseProgressChangedEventName, this.handleWindowUpdate)
  }

  disconnect() {
    if (this.frameId != null) {
      window.cancelAnimationFrame(this.frameId)
      this.frameId = null
    }

    window.removeEventListener('scroll', this.handleWindowUpdate)
    window.removeEventListener('resize', this.handleWindowUpdate)
    window.removeEventListener(courseProgressChangedEventName, this.handleWindowUpdate)
  }

  handleClick(event: Event) {
    const target = event.target instanceof Element ? event.target : null

    if (!target) {
      return
    }

    const link = target.closest<HTMLAnchorElement>('.sidebar__link')
    const href = link?.getAttribute('href')

    if (!link || !href || !href.startsWith('#')) {
      return
    }

    const section = document.querySelector<HTMLElement>(href)

    if (!section) {
      return
    }

    event.preventDefault()
    window.history.pushState(null, '', href)
    const rect = section.getBoundingClientRect()
    const targetTop = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2

    animateScrollTo(Math.max(0, targetTop))
  }

  private updateLandingCtas() {
    const ctaState = getLandingCtaState(
      this.coursesValue,
      this.publicCoursesValue,
      this.fallbackHrefValue,
      {
        hasProgress: hasCourseChatProgress,
        isCompleted: (course) => isCourseChatCompleted(course.slug, course.chat),
      },
    )
    const headerCta = this.element.querySelector<HTMLAnchorElement>('.site-header .button--primary')
    const heroCta = this.element.querySelector<HTMLAnchorElement>('.hero__actions .button--primary')

    if (headerCta) {
      headerCta.setAttribute('href', ctaState.href)
      headerCta.textContent = ctaState.hasStarted ? 'Continuer' : 'Commencer'
    }

    if (heroCta) {
      heroCta.setAttribute('href', ctaState.href)
      heroCta.textContent = ctaState.hasStarted ? 'Continuer la formation' : 'Commencer maintenant'
    }
  }

  private updateLandingCompletedCourses() {
    const completedSlugs = new Set(
      this.publicCoursesValue
        .filter((course) => course.chat.length > 0 && isCourseChatCompleted(course.slug, course.chat))
        .map((course) => course.slug),
    )

    this.element.querySelectorAll<HTMLElement>('.timeline__courses-item[data-course-slug]').forEach((item) => {
      const slug = item.dataset.courseSlug
      const check = item.querySelector<HTMLElement>('.timeline__courses-check')

      if (!slug || !check) {
        return
      }

      check.hidden = !completedSlugs.has(slug)
    })
  }

  private updateLandingTimeline() {
    const timeline = this.element.querySelector<HTMLElement>('.timeline')
    const items = Array.from(this.element.querySelectorAll<HTMLElement>('.timeline__item'))
    const sidebarLinks = Array.from(document.querySelectorAll<HTMLElement>('.sidebar__link'))
    const lineFill = this.element.querySelector<HTMLElement>('.timeline__line-fill')

    if (!timeline || !items.length || !lineFill) {
      return
    }

    const viewportMiddle = window.innerHeight * 0.52
    const timelineRect = timeline.getBoundingClientRect()
    const total = Math.max(timelineRect.height, 1)
    const progress = Math.max(0, Math.min(1, (viewportMiddle - timelineRect.top) / total))

    let activeIndex = 0

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect()

      if (viewportMiddle >= rect.top + rect.height * 0.35) {
        activeIndex = index
      }
    })

    const currentItem = items[activeIndex]
    const nextItem = items[Math.min(activeIndex + 1, items.length - 1)]
    const currentTheme = currentItem?.dataset.theme || 'primary'
    const nextTheme = nextItem?.dataset.theme || currentTheme
    const currentColor = colorMap[currentTheme] || colorMap.primary
    const nextColor = colorMap[nextTheme] || currentColor
    const currentRect = currentItem?.getBoundingClientRect()
    const localProgress = currentRect
      ? Math.max(0, Math.min(1, (viewportMiddle - currentRect.top) / Math.max(currentRect.height, 1)))
      : 0

    lineFill.style.height = `${progress * 100}%`
    lineFill.style.background = `linear-gradient(180deg, ${mixColor(currentColor, nextColor, localProgress)}, ${nextColor})`

    items.forEach((item, index) => {
      item.classList.toggle('timeline__item--current', index === activeIndex)
      item.classList.toggle('timeline__item--reached', index <= activeIndex)
    })

    sidebarLinks.forEach((link, index) => {
      link.classList.toggle('sidebar__link--current', index === activeIndex)
    })
  }
}
