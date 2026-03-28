import type { HeroContent } from '../../types/content'
import './style.scss'

type HeroSectionProps = {
  hero: HeroContent
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section id="hero" className="hero">
      <div className="hero__orb hero__orb--primary"></div>
      <div className="hero__orb hero__orb--secondary"></div>

      <div className="hero__grid">
        <div className="hero__content">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot"></span>
            {hero.eyebrow}
          </p>
          <h1 className="hero__title">
            {hero.titlePrefix} <span>{hero.titleHighlight}</span>.
          </h1>
          <p className="hero__text">{hero.description}</p>

          <div className="hero__actions">
            <a className="button button--primary" href={hero.primaryAction.href}>
              {hero.primaryAction.label}
            </a>
            <a className="button button--tertiary" href={hero.secondaryAction.href}>
              {hero.secondaryAction.label}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__screen hero__screen--main">
            <div className="hero__code-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="hero__screen hero__screen--panel">
            <div className="hero__metric-pill">{hero.visualLabel}</div>
            <div className="hero__metric-grid">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="hero__glow"></div>
        </div>
      </div>
    </section>
  )
}
