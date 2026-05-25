import type { InfoItemData } from '../../../types/content'
import type { InfoItem } from '../../../types/content'
import type { CourseItemHandler } from '../index'
import { renderInlineRichTextHtml } from '../inlineRichText'
import { escapeHtml, getPlainTextFromInlineRichText, renderCircleAlertIcon } from '../shared'

export function renderInfo(data: InfoItemData) {
  return `
    <aside class="course-item-info">
      <h3 class="course-item-info__heading">
        <span class="course-item-info__icon" aria-hidden="true">${renderCircleAlertIcon()}</span>
        <span>${escapeHtml(data.heading)}</span>
      </h3>
      <p class="course-item-info__content">${renderInlineRichTextHtml(data.content)}</p>
    </aside>
  `
}

export const infoCourseItemHandler: CourseItemHandler<InfoItem> = {
  render: (item) => renderInfo(item.data),
  getReadingText: (item) =>
    [item.data.heading, item.data.content]
      .map((part) => getPlainTextFromInlineRichText(part))
      .filter(Boolean)
      .join(' '),
}
