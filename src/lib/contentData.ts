import { loadPublicJson } from './publicData'
import type { Course, CourseDto, CourseItem, CourseItemDto, Module, ModuleDto, TrainingContent } from '../types/content'

type LandingPageBase = Omit<TrainingContent, 'modules'>

function mapCourseItemDtoToCourseItem(item: CourseItemDto): CourseItem {
  return item
}

function mapCourseDtoToCourse(dto: CourseDto): Course {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    private: dto.private,
    slug: dto.slug,
    title: dto.title,
    metaTitle: dto.meta_title,
    description: dto.description,
    metaDescription: dto.meta_description,
    skills: dto.skills,
    github: dto.github,
    chat: dto.chat ?? [],
    content: (dto.content ?? []).map(mapCourseItemDtoToCourseItem),
  }
}

function mapModuleDtoToModule(dto: ModuleDto): Module {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description,
    icon: dto.icon,
    theme: dto.theme,
    layout: dto.layout,
    art: dto.art,
  }
}

let coursesPromise: Promise<Course[]> | null = null
let landingPagePromise: Promise<TrainingContent> | null = null
let modulesPromise: Promise<Module[]> | null = null

function shouldUseCache() {
  if (typeof window !== 'undefined') {
    return true
  }

  return !import.meta.env.DEV
}

export function getCourses() {
  if (!shouldUseCache()) {
    return loadPublicJson<CourseDto[]>('courses.json').then((courseDtos) =>
      courseDtos.map(mapCourseDtoToCourse),
    )
  }

  if (!coursesPromise) {
    coursesPromise = loadPublicJson<CourseDto[]>('courses.json').then((courseDtos) =>
      courseDtos.map(mapCourseDtoToCourse),
    )
  }

  return coursesPromise
}

export function getModules() {
  if (!shouldUseCache()) {
    return loadPublicJson<ModuleDto[]>('modules.json').then((moduleDtos) =>
      moduleDtos.map(mapModuleDtoToModule),
    )
  }

  if (!modulesPromise) {
    modulesPromise = loadPublicJson<ModuleDto[]>('modules.json').then((moduleDtos) =>
      moduleDtos.map(mapModuleDtoToModule),
    )
  }

  return modulesPromise
}

export function getLandingPage() {
  if (!shouldUseCache()) {
    return Promise.all([
      loadPublicJson<LandingPageBase>('global.json'),
      getModules(),
    ]).then(([baseContent, modules]) => ({
      ...baseContent,
      modules,
    }))
  }

  if (!landingPagePromise) {
    landingPagePromise = Promise.all([
      loadPublicJson<LandingPageBase>('global.json'),
      getModules(),
    ]).then(([baseContent, modules]) => ({
      ...baseContent,
      modules,
    }))
  }

  return landingPagePromise
}

export async function getPublicCourses() {
  const courses = await getCourses()

  return courses.filter((course) => !course.private)
}

export async function getCoursesByModuleId(moduleId: number) {
  const courses = await getCourses()

  return courses.filter((course) => course.moduleId === moduleId)
}

export async function getFirstCourseByModuleId(moduleId: number) {
  const publicCourses = await getPublicCourses()

  return publicCourses.find((course) => course.moduleId === moduleId)
}

export async function getCourseBySlug(slug: string) {
  const courses = await getCourses()

  return courses.find((course) => course.slug === slug)
}

export async function getModuleById(moduleId: number) {
  const modules = await getModules()

  return modules.find((module) => module.id === moduleId)
}

export async function getModuleBySlug(slug: string) {
  const modules = await getModules()

  return modules.find((module) => module.slug === slug)
}

export function getOrderedCourses(modules: Module[], courses: Course[]) {
  return modules.flatMap((module) => courses.filter((course) => course.moduleId === module.id))
}

export function getCourseSequenceData(courseSlug: string, modules: Module[], courses: Course[]) {
  const course = courses.find((item) => item.slug === courseSlug)

  if (!course) {
    return undefined
  }

  const module = modules.find((item) => item.id === course.moduleId)

  if (!module) {
    return undefined
  }

  const moduleCourses = courses.filter((item) => item.moduleId === module.id)
  const currentCourseIndex = moduleCourses.findIndex((item) => item.slug === course.slug)
  const currentModuleIndex = modules.findIndex((item) => item.id === module.id)
  const previousCourseInModule =
    currentCourseIndex > 0 ? moduleCourses[currentCourseIndex - 1] : undefined
  const previousModule =
    currentModuleIndex > 0 ? modules[currentModuleIndex - 1] : undefined
  const nextCourseInModule =
    currentCourseIndex >= 0 ? moduleCourses[currentCourseIndex + 1] : undefined
  const nextModule =
    currentModuleIndex >= 0 ? modules[currentModuleIndex + 1] : undefined
  const previousCourse =
    previousCourseInModule ??
    (previousModule ? courses.filter((item) => item.moduleId === previousModule.id).at(-1) : undefined)
  const nextCourse =
    nextCourseInModule ??
    (nextModule ? courses.filter((item) => item.moduleId === nextModule.id)[0] : undefined)

  return {
    course,
    module,
    moduleCourses,
    previousCourse,
    nextCourse,
  }
}
