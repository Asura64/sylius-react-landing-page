import type { ImageItem } from '../../types/content'
import type { CourseItemHandler } from '../index'
import { escapeHtml, getPlainTextFromInlineRichText, renderExpandIcon } from '../shared'

export function renderImage(src: string, alt: string) {
  return `
    <figure class="course-item-image">
      <img class="course-item-image__media" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />
      <button
        class="course-item-image__fullscreen-trigger"
        type="button"
        aria-label="Afficher l'image en plein écran"
      >
        ${renderExpandIcon()}
      </button>
    </figure>
  `
}

export const imageCourseItemHandler: CourseItemHandler<ImageItem> = {
  render: (item) => renderImage(item.data.src, item.data.alt),
  getReadingText: (item) => getPlainTextFromInlineRichText(item.data.alt),
}
