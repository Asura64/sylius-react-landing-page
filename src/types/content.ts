export type NavigationLink = {
  label: string
  href: string
  active: boolean
}

export type NavigationContent = {
  brand: string
  links: NavigationLink[]
  cta: {
    label: string
    href: string
  }
}

export type HeroContent = {
  eyebrow: string
  titlePrefix: string
  titleHighlight: string
  description: string
  primaryAction: {
    label: string
    href: string
  }
  secondaryAction: {
    label: string
    href: string
  }
  visualLabel: string
}

export type ModuleTheme = 'primary' | 'secondary' | 'tertiary' | 'danger'
export type ModuleLayout = 'left' | 'right'

export type ModuleDto = {
  id: number
  slug: string
  title: string
  description: string
  icon: string
  theme: ModuleTheme
  layout: ModuleLayout
  art: string
}

export type Module = {
  id: number
  slug: string
  title: string
  description: string
  icon: string
  theme: ModuleTheme
  layout: ModuleLayout
  art: string
}

export type FeatureAction = {
  label: string
  href: string
  variant: 'light' | 'outline'
}

export type FeatureHighlight = {
  title: string
  description: string
  icon: string
  tone: 'primary' | 'secondary' | 'tertiary'
}

export type FeatureGridContent = {
  kicker: string
  title: string
  description: string
  actions: FeatureAction[]
  highlights: FeatureHighlight[]
}

export type FooterLink = {
  label: string
  href: string
}

export type FooterContent = {
  brand: string
  copy: string
  links: FooterLink[]
}

export type TrainingContent = {
  navigation: NavigationContent
  hero: HeroContent
  modules: Module[]
  featureGrid: FeatureGridContent
  footer: FooterContent
}

export type CourseItemType = 'h2' | 'p' | 'img' | 'info' | 'dump' | 'yaml' | 'quiz' | 'ul'

export type BaseCourseItem = {
  typingDelay?: number
}

export type H2Item = BaseCourseItem & {
  type: 'h2'
  data: string
}

export type ParagraphItem = BaseCourseItem & {
  type: 'p'
  data: string
}

export type ImageItemData = {
  src: string
  alt: string
}

export type ImageItem = BaseCourseItem & {
  type: 'img'
  data: ImageItemData
}

export type InfoItemData = {
  heading: string
  content: string
}

export type InfoItem = BaseCourseItem & {
  type: 'info'
  data: InfoItemData
}

export type DumpScalar = string | number | boolean | null
export type DumpValue = DumpScalar | DumpObject | DumpArray
export type DumpObject = {
  [key: string]: DumpValue
}
export type DumpArray = DumpValue[]

export type DumpItemData = {
  label?: string
  value: DumpValue
  expanded?: boolean
}

export type DumpItem = BaseCourseItem & {
  type: 'dump'
  data: DumpItemData
}

export type YamlItemData = {
  label?: string
  value: string
}

export type YamlItem = BaseCourseItem & {
  type: 'yaml'
  data: YamlItemData
}

export type QuizChoice = {
  id: string
  label: string
  answer: boolean
  onError: string
}

export type QuizItemData = {
  question: string
  mode: 'radio' | 'checkbox'
  choices: QuizChoice[]
}

export type QuizItem = BaseCourseItem & {
  type: 'quiz'
  data: QuizItemData
}

export type UnorderedListItemData = {
  title?: string
  items: string[]
}

export type UnorderedListItem = BaseCourseItem & {
  type: 'ul'
  data: UnorderedListItemData
}

export type ChatCourseItem = CourseItem & {
  responseCondition?: string
}

export type ChatTurnDto = {
  id: string
  author: string
  content: ChatCourseItem[]
  responses?: Record<string, string>
}

export type ChatTurn = ChatTurnDto

export type CourseItemDto =
  | H2Item
  | ParagraphItem
  | ImageItem
  | InfoItem
  | DumpItem
  | YamlItem
  | QuizItem
  | UnorderedListItem
export type CourseItem = CourseItemDto

export type CourseDto = {
  id: number
  module_id: number
  private: boolean
  slug: string
  title: string
  meta_title: string
  description: string
  meta_description: string
  skills: string[]
  chat?: ChatTurnDto[]
  content: CourseItemDto[]
}

export type Course = {
  id: number
  moduleId: number
  private: boolean
  slug: string
  title: string
  metaTitle: string
  description: string
  metaDescription: string
  skills: string[]
  chat?: ChatTurn[]
  content: CourseItem[]
}
