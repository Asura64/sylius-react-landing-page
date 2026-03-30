import type { MouseEvent } from 'react'
import type { Module } from '../../types/content'
import { ModuleIcon } from '../ModuleIcon'
import './style.scss'

type SidebarNavProps = {
  modules: Module[]
  activeIndex: number
}

export function SidebarNav({ modules, activeIndex }: SidebarNavProps) {
  const animateScrollTo = (targetTop: number, duration = 300) => {
    const startTop = window.scrollY
    const delta = targetTop - startTop
    const startTime = performance.now()

    const easeInOutCubic = (progress: number) => {
      return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
    }

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)

      window.scrollTo(0, startTop + delta * easedProgress)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }

  const handleModuleClick = (event: MouseEvent<HTMLAnchorElement>, moduleSlug: string) => {
    const target = document.getElementById(moduleSlug)

    if (!target) {
      return
    }

    event.preventDefault()
    window.history.pushState(null, '', `#${moduleSlug}`)
    const rect = target.getBoundingClientRect()
    const targetTop = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2

    animateScrollTo(Math.max(0, targetTop))
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__panel">
        <p className="sidebar__title">Modules de formation</p>
        <nav className="sidebar__nav" aria-label="Modules de formation">
          {modules.map((module, index) => (
            <a
              key={module.slug}
              className={`sidebar__link${index === activeIndex ? ' sidebar__link--current' : ''}`}
              href={`#${module.slug}`}
              onClick={(event) => handleModuleClick(event, module.slug)}
            >
              <ModuleIcon className="sidebar__icon" name={module.icon} strokeWidth={2} />
              <span>{module.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
