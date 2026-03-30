import type { Module } from '../../types/content'
import { ModuleIcon } from '../ModuleIcon'
import './style.scss'

const layoutClassMap = {
  left: 'timeline__item--left',
  right: 'timeline__item--right',
}

type TimelineItemProps = {
  module: Module
  index: number
  isCurrent: boolean
  isReached: boolean
  setRef: (element: HTMLElement | null) => void
}

export function TimelineItem({
  module,
  index,
  isCurrent,
  isReached,
  setRef,
}: TimelineItemProps) {
  const classes = [
    'timeline__item',
    layoutClassMap[module.layout],
    `timeline__item--${module.theme}`,
    isReached ? 'timeline__item--reached' : '',
    isCurrent ? 'timeline__item--current' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article ref={setRef} id={module.slug} className={classes} data-theme={module.theme}>
      <div className="timeline__marker">{index + 1}</div>

      <div className="timeline__card">
        <div className="timeline__heading">
          <div className="timeline__icon" aria-hidden="true">
            <ModuleIcon className="timeline__icon-svg" name={module.icon} strokeWidth={2} />
          </div>
          <h3 className="timeline__title">{module.title}</h3>
        </div>
        <p className="timeline__description">{module.description}</p>
        <div className={`timeline__art timeline__art--${module.art}`} aria-hidden="true"></div>
      </div>
    </article>
  )
}
