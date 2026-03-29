import type { ModuleContent } from '../../types/content'
import { ModuleIcon } from '../ModuleIcon'
import './style.scss'

type SidebarNavProps = {
  modules: ModuleContent[]
  activeIndex: number
}

export function SidebarNav({ modules, activeIndex }: SidebarNavProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__panel">
        <p className="sidebar__title">Modules de formation</p>
        <nav className="sidebar__nav" aria-label="Modules de formation">
          {modules.map((module, index) => (
            <a
              key={module.id}
              className={`sidebar__link${index === activeIndex ? ' sidebar__link--current' : ''}`}
              href={`#${module.id}`}
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
