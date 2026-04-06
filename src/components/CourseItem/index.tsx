import type {
  CourseItem as CourseItemData,
  DumpItem,
  H2Item,
  ImageItem,
  InfoItem,
  ParagraphItem,
  QuizItem,
  UnorderedListItem,
  YamlItem,
} from '../../types/content'
import { Dump } from './Dump'
import { H2 } from './H2'
import { ImageItem as ImageCourseItem } from './Img'
import { Info } from './Info'
import { Paragraph } from './P'
import { Quiz, type QuizState } from './Quiz'
import { UnorderedList } from './Ul'
import { Yaml } from './Yaml'

type CourseItemProps = {
  item: CourseItemData
  onQuizStateChange?: (state: QuizState) => void
  quizState?: QuizState
}

const courseItemMap = {
  h2: (item: H2Item) => <H2 content={item.data} />,
  p: (item: ParagraphItem) => <Paragraph content={item.data} />,
  img: (item: ImageItem) => <ImageCourseItem image={item.data} />,
  info: (item: InfoItem) => <Info data={item.data} />,
  dump: (item: DumpItem) => <Dump data={item.data} />,
  yaml: (item: YamlItem) => <Yaml data={item.data} />,
  ul: (item: UnorderedListItem) => <UnorderedList data={item.data} />,
} as const

export function CourseItem({ item, onQuizStateChange, quizState }: CourseItemProps) {
  if (item.type === 'h2') {
    return courseItemMap.h2(item)
  }

  if (item.type === 'p') {
    return courseItemMap.p(item)
  }

  if (item.type === 'img') {
    return courseItemMap.img(item)
  }

  if (item.type === 'dump') {
    return courseItemMap.dump(item)
  }

  if (item.type === 'yaml') {
    return courseItemMap.yaml(item)
  }

  if (item.type === 'quiz') {
    return <Quiz data={item.data} state={quizState} onStateChange={onQuizStateChange} />
  }

  if (item.type === 'ul') {
    return courseItemMap.ul(item)
  }

  return courseItemMap.info(item)
}
