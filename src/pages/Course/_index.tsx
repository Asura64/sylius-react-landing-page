import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import '../../App.scss'
import { CourseInteractive } from '../../components/CourseInteractive'
import { CourseTimeline } from '../../components/CourseTimeline'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { getCoursePageData } from '../../lib/coursePage'
import { siteUrl } from '../../lib/site'
import { ModuleIcon } from '../../components/ModuleIcon'
import { landingPage } from '../LandingPage/_landingPage'
import './style.scss'

export function CoursePage() {
  const { courseSlug } = useParams()

  if (!courseSlug) {
    return <Navigate to="/" replace />
  }

  return <CoursePageContent courseSlug={courseSlug} />
}

type CoursePageContentProps = {
  courseSlug: string
}

export function CoursePageContent({ courseSlug }: CoursePageContentProps) {
  const pageData = getCoursePageData(courseSlug)

  if (!pageData) {
    return <Navigate to="/" replace />
  }

  const {
    course,
    module,
    moduleCourses,
    previousCourse,
    nextCourse,
    nextPublicCourse,
    hasChat,
    themeClass,
    courseNavigation,
  } = pageData

  useEffect(() => {
    const title = course.metaTitle || course.title
    const description = course.metaDescription || course.description
    const canonicalUrl = `${siteUrl}/cours/sylius/${course.slug}/`

    document.title = title

    let metaDescription = document.querySelector('meta[name="description"]')

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }

    metaDescription.setAttribute('content', description)

    let canonicalLink = document.querySelector('link[rel="canonical"]')

    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }

    canonicalLink.setAttribute('href', canonicalUrl)
  }, [course.description, course.metaDescription, course.metaTitle, course.slug, course.title])

  return (
    <div className={`course-page ${themeClass}`}>
      <Header navigation={courseNavigation} brandHref="/#hero" showCta={false} />

      <main className="app">
        <CourseTimeline currentCourseSlug={course.slug} moduleCourses={moduleCourses} />

        <div className="course-page__shell">
          <section className="course-page__content" aria-label="Contenu du cours">
            <div className="course-page__eyebrow">
              <span className="course-page__eyebrow-icon" aria-hidden="true">
                <ModuleIcon name={module.icon} strokeWidth={2} />
              </span>
              <span>{module.title}</span>
            </div>
            <h1 className="course-page__title">{course.title}</h1>
            <p className="course-page__description">{course.description}</p>

            {course.private ? (
              <div className="course-page__locked">
                <p className="course-page__locked-title">Contenu réservé</p>
                <p className="course-page__locked-copy">
                  Cette page de cours est un support pédagogique réservé à l'accompagnement
                  personnalisé.
                </p>
                {course.skills.length ? (
                  <div>
                    <p className="course-page__skills-title">Ce que ce cours vous apprend</p>
                    <ul className="course-page__skills-list">
                      {course.skills.map((skill) => (
                        <li key={skill} className="course-page__skills-item">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="course-page__locked-actions">
                  {nextPublicCourse ? (
                    <a className="button button--tertiary" href={`/cours/sylius/${nextPublicCourse.slug}/`}>
                      Cours libre suivant
                    </a>
                  ) : null}
                  <a className="button button--primary" href="/#postuler">
                    Découvrir l&apos;accompagnement
                  </a>
                </div>
              </div>
            ) : !hasChat ? (
              <div className="course-page__locked">
                <p className="course-page__locked-title">Bientôt disponible gratuitement</p>
                <p className="course-page__locked-copy">
                  Cette page est en cours de rédaction et sera bientôt disponible en accès libre.
                </p>
                {course.skills.length ? (
                  <div>
                    <p className="course-page__skills-title">Ce que ce cours vous apprend</p>
                    <ul className="course-page__skills-list">
                      {course.skills.map((skill) => (
                        <li key={skill} className="course-page__skills-item">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <CourseInteractive
                courseSlug={course.slug}
                nextCourse={nextCourse}
                previousCourse={previousCourse}
                skills={course.skills}
                turns={course.chat}
              />
            )}
          </section>
        </div>
      </main>

      <Footer footer={landingPage.footer} />
    </div>
  )
}
