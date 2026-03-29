import {
  Code2,
  GitBranch,
  MessageSquareMore,
  RefreshCcw,
  SlidersHorizontal,
} from 'lucide-react'
import type { FeatureGridContent } from '../../types/content'
import './style.scss'

type FeatureGridProps = {
  featureGrid: FeatureGridContent
}

const iconMap = {
  'Sessions de mentorat': MessageSquareMore,
  'Format flexible': SlidersHorizontal,
  'Méthodologie active': Code2,
  'Flexibilité totale': RefreshCcw,
  'Support GitLab': GitBranch,
}

export function FeatureGrid({ featureGrid }: FeatureGridProps) {
  return (
    <section id="postuler" className="feature-grid">
      <article className="feature-grid__panel">
        <div className="feature-grid__intro">
          <p className="feature-grid__kicker">{featureGrid.kicker}</p>
          <h2 className="feature-grid__title">{featureGrid.title}</h2>
          <p className="feature-grid__copy">{featureGrid.description}</p>

          <div className="feature-grid__actions">
            {featureGrid.actions.map((action) => (
              <a
                key={action.label}
                className={`button ${action.variant === 'light' ? 'button--light' : 'button--outline-light'}`}
                href={action.href}
                target={action.href.startsWith('http') ? '_blank' : undefined}
                rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="feature-grid__highlights">
          {featureGrid.highlights.map((item, index) => {
            const Icon = iconMap[item.title as keyof typeof iconMap] ?? MessageSquareMore

            return (
              <article
                key={item.title}
                className={`feature-grid__highlight feature-grid__highlight--${item.tone}${index === featureGrid.highlights.length - 1 ? ' feature-grid__highlight--wide' : ''}`}
              >
                <div className="feature-grid__highlight-heading">
                  <div className="feature-grid__highlight-icon" aria-hidden="true">
                    <Icon className="feature-grid__highlight-icon-svg" strokeWidth={2} />
                  </div>
                  <h3 className="feature-grid__highlight-title">{item.title}</h3>
                </div>
                <p className="feature-grid__highlight-copy">{item.description}</p>
              </article>
            )
          })}
        </div>
      </article>
    </section>
  )
}
