import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import type { Course } from '../../types/content'
import { isCourseChatCompleted } from '../CourseChat'

type CourseTimelineProps = {
  currentCourseSlug: string
  moduleCourses: Course[]
}

export function CourseTimeline({ currentCourseSlug, moduleCourses }: CourseTimelineProps) {
  const activeTimelineItemRef = useRef<HTMLLIElement | null>(null)
  const currentCourseIndex = moduleCourses.findIndex((item) => item.slug === currentCourseSlug)
  const [completedCourseSlugs, setCompletedCourseSlugs] = useState<string[]>([])

  useEffect(() => {
    const activeItem = activeTimelineItemRef.current

    if (!activeItem || window.innerWidth >= 768) {
      return
    }

    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [currentCourseSlug])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setCompletedCourseSlugs(
      moduleCourses
        .filter(
          (moduleCourse) =>
            moduleCourse.chat.length > 0 &&
            isCourseChatCompleted(moduleCourse.slug, moduleCourse.chat),
        )
        .map((moduleCourse) => moduleCourse.slug),
    )
  }, [moduleCourses])

  return (
    <nav className="course-page__timeline course-page__timeline--header" aria-label="Parcours du module">
      <ol className="course-page__timeline-list">
        {moduleCourses.map((moduleCourse, index) => {
          const isCurrent = moduleCourse.slug === currentCourseSlug
          const isReached = index <= currentCourseIndex
          const isCompleted = completedCourseSlugs.includes(moduleCourse.slug)

          return (
            <li
              key={moduleCourse.slug}
              ref={isCurrent ? activeTimelineItemRef : null}
              className={`course-page__timeline-item${isCurrent ? ' course-page__timeline-item--current' : ''}${isReached ? ' course-page__timeline-item--reached' : ''}${isCompleted ? ' course-page__timeline-item--completed' : ''}`}
            >
              <a className="course-page__timeline-link" href={`/cours/sylius/${moduleCourse.slug}/`}>
                <span className="course-page__timeline-marker">
                  <span>{index + 1}</span>
                  {isCompleted ? <Check size={14} strokeWidth={2.8} /> : null}
                </span>
                <span className="course-page__timeline-label">{moduleCourse.title}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
