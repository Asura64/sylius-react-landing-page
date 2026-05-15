import type { H2Item } from '../../types/content'
import type { CourseItemHandler } from '../index'
import { escapeHtml, getPlainTextFromInlineRichText } from '../shared'

export function renderH2(data: string) {
  return `<h2 class="course-item-h2">${escapeHtml(data)}</h2>`
}

export const h2CourseItemHandler: CourseItemHandler<H2Item> = {
  render: (item) => renderH2(item.data),
  getReadingText: (item) => getPlainTextFromInlineRichText(item.data),
}
