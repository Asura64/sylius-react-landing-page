import type { ArchitectureItem, CourseItem, DumpItem, H2Item, ImageItem, InfoItem, ParagraphItem, QuizItem, UnorderedListItem, YamlItem } from '../../types/content'
import { architectureCourseItemHandler } from './architecture'
import { dumpCourseItemHandler } from './dump'
import { h2CourseItemHandler } from './h2'
import { imageCourseItemHandler } from './img'
import { infoCourseItemHandler } from './info'
import { paragraphCourseItemHandler } from './p'
import { quizCourseItemHandler } from './quiz'
import { unorderedListCourseItemHandler } from './ul'
import { yamlCourseItemHandler } from './yaml'

export { renderInlineRichTextHtml } from './inlineRichText'

export type CourseItemHandler<T extends CourseItem = CourseItem> = {
  getReadingText: (item: T) => string
  render: (item: T) => string
}

export const courseItemHandlers = {
  architecture: architectureCourseItemHandler,
  dump: dumpCourseItemHandler,
  h2: h2CourseItemHandler,
  img: imageCourseItemHandler,
  info: infoCourseItemHandler,
  p: paragraphCourseItemHandler,
  quiz: quizCourseItemHandler,
  ul: unorderedListCourseItemHandler,
  yaml: yamlCourseItemHandler,
} satisfies {
  architecture: CourseItemHandler<ArchitectureItem>
  dump: CourseItemHandler<DumpItem>
  h2: CourseItemHandler<H2Item>
  img: CourseItemHandler<ImageItem>
  info: CourseItemHandler<InfoItem>
  p: CourseItemHandler<ParagraphItem>
  quiz: CourseItemHandler<QuizItem>
  ul: CourseItemHandler<UnorderedListItem>
  yaml: CourseItemHandler<YamlItem>
}

export function getCourseItemHandler<T extends CourseItem>(item: T): CourseItemHandler<T> {
  return courseItemHandlers[item.type] as CourseItemHandler<T>
}

export function renderCourseItemHtml(item: CourseItem) {
  return getCourseItemHandler(item).render(item)
}
