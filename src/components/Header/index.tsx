import type { NavigationContent } from '../../types/content'
import logoSrc from '../../assets/logo-header.webp'
import './style.scss'

type HeaderProps = {
  navigation: NavigationContent
}

export function Header({ navigation }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#">
          <span className="brand__mark">
            <img src={logoSrc} alt="" />
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

        <a className="button button--primary button--small" href={navigation.cta.href}>
          {navigation.cta.label}
        </a>
      </div>
    </header>
  )
}
