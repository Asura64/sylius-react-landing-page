import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Course, Module } from '../../types/content'
import { isCourseChatCompleted } from '../CourseChat'
import { ModuleIcon } from '../ModuleIcon'
import './style.scss'

const layoutClassMap = {
  left: 'timeline__item--left',
  right: 'timeline__item--right',
}

type TimelineItemProps = {
  courses: Course[]
  module: Module
  index: number
  isCurrent: boolean
  isReached: boolean
  setRef: (element: HTMLElement | null) => void
  href?: string
}

export function TimelineItem({
  courses,
  module,
  index,
  isCurrent,
  isReached,
  setRef,
  href,
}: TimelineItemProps) {
  const [completedCourseSlugs, setCompletedCourseSlugs] = useState<string[]>([])
  const classes = [
    'timeline__item',
    layoutClassMap[module.layout],
    `timeline__item--${module.theme}`,
    isReached ? 'timeline__item--reached' : '',
    isCurrent ? 'timeline__item--current' : '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setCompletedCourseSlugs(
      courses.filter((course) => course.chat.length > 0 && isCourseChatCompleted(course.slug, course.chat)).map((course) => course.slug),
    )
  }, [courses])

  const renderCourseList = (isMobile = false) => (
    <div className={`timeline__courses${isMobile ? ' timeline__courses--mobile' : ''}`}>
      <ul className="timeline__courses-list">
        {courses.map((course) => (
          <li key={course.slug} className="timeline__courses-item">
            <a className="timeline__courses-link" href={`/cours/sylius/${course.slug}/`}>
              <span className="timeline__courses-name">{course.title}</span>
              {completedCourseSlugs.includes(course.slug) ? (
                <span className="timeline__courses-check" aria-label="Cours terminé">
                  <Check size={16} strokeWidth={2.5} />
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )

  const cardContent = (
    <>
      <div className="timeline__heading">
        <div className="timeline__icon" aria-hidden="true">
          <ModuleIcon className="timeline__icon-svg" name={module.icon} strokeWidth={2} />
        </div>
        <h3 className="timeline__title">{module.title}</h3>
      </div>
      <p className="timeline__description">{module.description}</p>
      <div className={`timeline__art timeline__art--${module.art}`} aria-hidden="true"></div>
    </>
  )

  return (
    <article ref={setRef} id={module.slug} className={classes} data-theme={module.theme}>
      {courses.length ? (
        <div className="timeline__courses-shell timeline__courses-shell--desktop">
          {renderCourseList()}
        </div>
      ) : null}

      <div className="timeline__marker">{index + 1}</div>

      {href ? (
        <a className="timeline__card timeline__card--interactive" href={href}>
          {cardContent}
        </a>
      ) : (
        <div className="timeline__card">{cardContent}</div>
      )}

      {courses.length ? (
        <details className="timeline__courses-shell timeline__courses-shell--mobile">
          <summary className="timeline__courses-summary">Voir les cours disponibles</summary>
          {renderCourseList(true)}
        </details>
      ) : null}
    </article>
  )
}
