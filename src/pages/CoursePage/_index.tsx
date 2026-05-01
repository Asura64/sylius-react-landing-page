import { Link, useParams } from 'react-router-dom'
import content from '../../data/trainingContent.json'
import type { TrainingContent } from '../../types/content'
import './style.scss'

export function CoursePage() {
  const { courseId } = useParams()
  const { modules } = content as TrainingContent
  const module = modules.find((item) => item.id === courseId)

  if (!module) {
    return (
      <main className="course-page">
        <div className="course-page__shell">
          <p className="course-page__eyebrow">Cours introuvable</p>
          <h1 className="course-page__title">Ce module n&apos;existe pas.</h1>
          <Link className="course-page__link" to="/">
            Retour a la formation
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="course-page">
      <div className="course-page__shell">
        <p className="course-page__eyebrow">Page de cours</p>
        <h1 className="course-page__title">{module.title}</h1>
        <p className="course-page__description">{module.description}</p>
        <p className="course-page__note">
          Cette route est prete pour accueillir le contenu detaille du module.
        </p>
        <div className="course-page__actions">
          <Link className="course-page__link course-page__link--primary" to="/">
            Retour a la landing
          </Link>
          <Link className="course-page__link" to={`/#${module.id}`}>
            Revenir au module
          </Link>
        </div>
      </div>
    </main>
  )
}
