import type { CourseItem } from '../../types/content'
import { getPlainTextFromInlineRichText } from './shared'

export function getCourseItemReadingText(item: CourseItem) {
  if (item.type === 'h2' || item.type === 'p') {
    return getPlainTextFromInlineRichText(item.data)
  }

  if (item.type === 'img') {
    return getPlainTextFromInlineRichText(item.data.alt)
  }

  if (item.type === 'info') {
    return [item.data.heading, item.data.content]
      .map((part) => getPlainTextFromInlineRichText(part))
      .filter(Boolean)
      .join(' ')
  }

  if (item.type === 'ul') {
    return [item.data.title, ...item.data.items]
      .filter((part): part is string => Boolean(part))
      .map((part) => getPlainTextFromInlineRichText(part))
      .filter(Boolean)
      .join(' ')
  }

  return ''
}
