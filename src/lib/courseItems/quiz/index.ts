import type { QuizItemData } from '../../../types/content'
import type { QuizItem } from '../../../types/content'
import type { CourseItemHandler } from '../index'
import { escapeHtml } from '../shared'

export function renderQuizPlaceholder(data: QuizItemData) {
  return `
    <section class="course-item-quiz" aria-label="Quiz">
      <p class="course-item-quiz__question">${escapeHtml(data.question)}</p>
    </section>
  `
}

export const quizCourseItemHandler: CourseItemHandler<QuizItem> = {
  render: (item) => renderQuizPlaceholder(item.data),
  getReadingText: () => '',
}
