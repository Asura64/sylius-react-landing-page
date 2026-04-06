import type { MutableRefObject, RefObject } from 'react'
import { TimelineItem } from '../TimelineItem'
import type { Module } from '../../types/content'
import type { TimelineState } from '../../hooks/useTimelineProgress'
import './style.scss'

type JourneySectionProps = {
  modules: Module[]
  getModuleHref: (moduleId: number) => string | undefined
  timelineRef: RefObject<HTMLDivElement | null>
  itemRefs: MutableRefObject<Array<HTMLElement | null>>
  timelineState: TimelineState
}

export function JourneySection({
  modules,
  getModuleHref,
  timelineRef,
  itemRefs,
  timelineState,
}: JourneySectionProps) {
  const { progressPercent, gradient, activeIndex } = timelineState

  return (
    <section id="modules" className="journey">
      <div className="section-heading section-heading--centered">
        <p className="section-heading__kicker">Le Parcours</p>
        <h2 className="section-heading__title">Le parcours d'apprentissage</h2>
        <p className="section-heading__description">
          Un programme de formation Sylius 2 structuré pour passer de l&apos;installation à la
          mise en production d&apos;une boutique e-commerce personnalisée.
        </p>
      </div>

      <div ref={timelineRef} className="timeline" aria-label="Programme de formation">
        <div className="timeline__line" aria-hidden="true">
          <div
            className="timeline__line-fill"
            style={{ height: `${progressPercent}%`, background: gradient }}
          ></div>
        </div>

        {modules.map((module, index) => (
          <TimelineItem
            key={module.slug}
            module={module}
            href={getModuleHref(module.id)}
            index={index}
            isCurrent={index === activeIndex}
            isReached={index <= activeIndex}
            setRef={(element) => {
              itemRefs.current[index] = element
            }}
          />
        ))}
      </div>
    </section>
  )
}
