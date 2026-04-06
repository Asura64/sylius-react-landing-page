import { Link } from 'react-router-dom'
import './style.scss'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-page__shell">
        <p className="not-found-page__eyebrow">404</p>
        <h1 className="not-found-page__title">Page introuvable</h1>
        <p className="not-found-page__description">
          La page demandee n&apos;existe pas ou n&apos;est pas encore publiee.
        </p>
        <Link className="not-found-page__link" to="/">
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
