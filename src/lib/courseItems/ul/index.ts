import type { UnorderedListItemData } from '../../../types/content'
import type { UnorderedListItem } from '../../../types/content'
import type { CourseItemHandler } from '../index'
import { renderInlineRichTextHtml } from '../inlineRichText'
import { getPlainTextFromInlineRichText } from '../shared'

export function renderUnorderedList(data: UnorderedListItemData) {
  return `
    <div class="course-item-ul">
      ${data.title ? `<p class="course-item-ul__title">${renderInlineRichTextHtml(data.title)}</p>` : ''}
      <ul class="course-item-ul__list">
        ${data.items
          .map((item) => `<li class="course-item-ul__item">${renderInlineRichTextHtml(item)}</li>`)
          .join('')}
      </ul>
    </div>
  `
}

export const unorderedListCourseItemHandler: CourseItemHandler<UnorderedListItem> = {
  render: (item) => renderUnorderedList(item.data),
  getReadingText: (item) =>
    [item.data.title, ...item.data.items]
      .filter((part): part is string => Boolean(part))
      .map((part) => getPlainTextFromInlineRichText(part))
      .filter(Boolean)
      .join(' '),
}
