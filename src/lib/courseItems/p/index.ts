import type { ParagraphItem } from '../../types/content'
import type { CourseItemHandler } from '../index'
import { renderInlineRichTextHtml } from '../inlineRichText'
import { getPlainTextFromInlineRichText } from '../shared'

export function renderParagraph(data: string) {
  return `<p class="course-item-paragraph">${renderInlineRichTextHtml(data)}</p>`
}

export const paragraphCourseItemHandler: CourseItemHandler<ParagraphItem> = {
  render: (item) => renderParagraph(item.data),
  getReadingText: (item) => getPlainTextFromInlineRichText(item.data),
}
