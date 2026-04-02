import type { FooterContent } from '../../types/content'
import './style.scss'

declare global {
  interface Window {
    CookieConsent?: {
      showPreferences: () => void
    }
  }
}

type FooterProps = {
  footer: FooterContent
}

export function Footer({ footer }: FooterProps) {
  const handleOpenCookies = () => {
    if (window.CookieConsent) {
      window.CookieConsent.showPreferences()
    }
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand-group">
          <p className="site-footer__brand">{footer.brand}</p>
          <p className="site-footer__copy">{footer.copy}</p>
        </div>

        <nav className="site-footer__nav" aria-label="Liens secondaires">
          <button
            className="site-footer__link site-footer__link-button"
            type="button"
            onClick={handleOpenCookies}
          >
            🍪 Gérer les cookies
          </button>
          {footer.links.map((link) => (
            <a key={link.label} className="site-footer__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
