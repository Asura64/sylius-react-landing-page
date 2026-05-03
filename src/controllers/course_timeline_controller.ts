import { Controller } from '@hotwired/stimulus'
import type { Course } from '../types/content'
import { courseProgressChangedEventName, isCourseChatCompleted } from '../lib/courseChatState'

export default class extends Controller<HTMLElement> {
  static values = {
    courses: Array,
    currentSlug: String,
  }

  declare readonly coursesValue: Course[]
  declare readonly currentSlugValue: string

  private readonly handleProgressChange = () => {
    this.refreshCompletedState()
  }

  connect() {
    this.refreshCompletedState()
    this.scrollCurrentIntoView()
    window.addEventListener(courseProgressChangedEventName, this.handleProgressChange)
  }

  disconnect() {
    window.removeEventListener(courseProgressChangedEventName, this.handleProgressChange)
  }

  private refreshCompletedState() {
    const completedCourseSlugs = new Set(
      this.coursesValue
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
