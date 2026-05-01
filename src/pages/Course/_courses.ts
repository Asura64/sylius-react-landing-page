import coursesJson from '../../data/courses.json'
import type { Course, CourseDto, CourseItem, CourseItemDto } from '../../types/content'

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
    chat: dto.chat ?? [],
    content: (dto.content ?? []).map(mapCourseItemDtoToCourseItem),
  }
}

const courseDtos = coursesJson as CourseDto[]

export const courses: Course[] = courseDtos.map(mapCourseDtoToCourse)

export const publicCourses = courses.filter((course) => !course.private)

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug)
}

export function getCoursesByModuleId(moduleId: number): Course[] {
  return courses.filter((course) => course.moduleId === moduleId)
}

export function getFirstCourseByModuleId(moduleId: number): Course | undefined {
  return publicCourses.find((course) => course.moduleId === moduleId)
}
