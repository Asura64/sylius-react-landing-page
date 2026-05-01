import type { NavigationContent } from '../../types/content'
import logoSrc from '../../assets/logo-header.webp'
import './style.scss'

const brandMarkSrc = typeof logoSrc === 'string' ? logoSrc : logoSrc.src

type HeaderProps = {
  navigation: NavigationContent
  brandHref?: string
  showCta?: boolean
}

export function Header({ navigation, brandHref = '#', showCta = true }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href={brandHref}>
          <span className="brand__mark">
            <img src={brandMarkSrc} alt="" />
          </span>
          <span className="brand__text">{navigation.brand}</span>
        </a>

        <nav className="site-nav" aria-label="Navigation principale">
          {navigation.links.map((link) => (
            <a
              key={link.label}
              className={`site-nav__link${link.active ? ' site-nav__link--active' : ''}`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {showCta ? (
          <a className="button button--primary button--small" href={navigation.cta.href}>
            {navigation.cta.label}
          </a>
        ) : (
          <span className="site-header__cta-spacer" aria-hidden="true"></span>
        )}
      </div>
    </header>
  )
}
