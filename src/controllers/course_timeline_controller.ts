import { Controller } from '@hotwired/stimulus'
import type { Course } from '../types/content'
import { courseProgressChangedEventName, isCourseChatCompleted } from '../lib/courseChatState'
import { getCourses } from '../lib/contentData'

export default class extends Controller<HTMLElement> {
  static values = {
    currentSlug: String,
  }

  declare readonly currentSlugValue: string
  private courses: Course[] = []

  private readonly handleProgressChange = () => {
    this.refreshCompletedState()
  }

  connect() {
    this.scrollCurrentIntoView()
    window.addEventListener(courseProgressChangedEventName, this.handleProgressChange)
    void this.loadCourses()
  }

  disconnect() {
    window.removeEventListener(courseProgressChangedEventName, this.handleProgressChange)
  }

  private async loadCourses() {
    this.courses = await getCourses()

    if (!this.element.isConnected) {
      return
    }

    this.refreshCompletedState()
  }

  private refreshCompletedState() {
    if (!this.courses.length) {
      return
    }

    const visibleCourseSlugs = new Set(
      Array.from(this.element.querySelectorAll<HTMLElement>('[data-course-slug]'))
        .map((item) => item.dataset.courseSlug)
        .filter((slug): slug is string => Boolean(slug)),
    )
    const completedCourseSlugs = new Set(
      this.courses
        .filter((course) => visibleCourseSlugs.has(course.slug))
        .filter((course) => course.chat.length > 0 && isCourseChatCompleted(course.slug, course.chat))
        .map((course) => course.slug),
    )

    this.element.querySelectorAll<HTMLElement>('[data-course-slug]').forEach((item) => {
      const slug = item.dataset.courseSlug
      const isCompleted = slug ? completedCourseSlugs.has(slug) : false

      item.classList.toggle('course-page__timeline-item--completed', isCompleted)

      const check = item.querySelector<HTMLElement>('[data-course-completed-check]')

      if (check) {
        check.hidden = !isCompleted
      }
    })
  }

  private scrollCurrentIntoView() {
    if (window.innerWidth >= 768) {
      return
    }

    const currentItem = this.element.querySelector<HTMLElement>(
      `[data-course-slug="${this.currentSlugValue}"]`,
    )

    currentItem?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}
