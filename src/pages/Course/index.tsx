import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check, EllipsisVertical } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import '../../App.scss'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import {
  CourseChat,
  clearCourseChatProgress,
  getCourseChatProgressPercent,
  hasCourseChatProgress,
  isCourseChatCompleted,
} from '../../components/CourseChat'
import { ModuleIcon } from '../../components/ModuleIcon'
import { landingPage, getModuleById } from '../LandingPage/landingPage'
import { getCourseBySlug, getCoursesByModuleId } from './courses'
import './style.scss'

const themeClassMap = {
  primary: 'course-page--primary',
  secondary: 'course-page--secondary',
  tertiary: 'course-page--tertiary',
  danger: 'course-page--danger',
}

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
  const course = getCourseBySlug(courseSlug)
  const activeTimelineItemRef = useRef<HTMLLIElement | null>(null)
  const skillsRef = useRef<HTMLDivElement | null>(null)
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [chatInstanceKey, setChatInstanceKey] = useState(0)
  const [isChatCompleted, setIsChatCompleted] = useState(false)
  const [hasChatStarted, setHasChatStarted] = useState(false)
  const [chatProgressPercent, setChatProgressPercent] = useState(0)

  if (!course) {
    return <Navigate to="/" replace />
  }

  const module = getModuleById(course.moduleId)

  if (!module) {
    return <Navigate to="/" replace />
  }

  const moduleCourses = getCoursesByModuleId(module.id)
  const currentCourseIndex = moduleCourses.findIndex((item) => item.slug === course.slug)
  const currentModuleIndex = landingPage.modules.findIndex((item) => item.id === module.id)
  const previousCourseInModule = currentCourseIndex > 0 ? moduleCourses[currentCourseIndex - 1] : undefined
  const previousModule = currentModuleIndex > 0 ? landingPage.modules[currentModuleIndex - 1] : undefined
  const nextCourseInModule = currentCourseIndex >= 0 ? moduleCourses[currentCourseIndex + 1] : undefined
  const nextModule = currentModuleIndex >= 0 ? landingPage.modules[currentModuleIndex + 1] : undefined
  const previousCourse = previousCourseInModule ?? (previousModule ? getCoursesByModuleId(previousModule.id).at(-1) : undefined)
  const nextCourse = nextCourseInModule ?? (nextModule ? getCoursesByModuleId(nextModule.id)[0] : undefined)
  const currentCourseGlobalIndex = landingPage.modules
    .flatMap((landingModule) => getCoursesByModuleId(landingModule.id))
    .findIndex((item) => item.slug === course.slug)
  const nextPublicCourse = landingPage.modules
    .flatMap((landingModule) => getCoursesByModuleId(landingModule.id))
    .slice(currentCourseGlobalIndex + 1)
    .find((item) => !item.private)
  const completedCourseSlugs = useMemo(() => {
    if (typeof window === 'undefined') {
      return []
    }

    return moduleCourses
      .filter((moduleCourse) => moduleCourse.chat.length > 0 && isCourseChatCompleted(moduleCourse.slug, moduleCourse.chat))
      .map((moduleCourse) => moduleCourse.slug)
  }, [moduleCourses])
  const themeClass = themeClassMap[module.theme]
  const hasChat = course.chat.length > 0
  const courseNavigation = {
    ...landingPage.navigation,
    links: landingPage.navigation.links.map((link) => ({
      ...link,
      href: `/${link.href}`,
      active: false,
    })),
    cta: {
      ...landingPage.navigation.cta,
      href: `/${landingPage.navigation.cta.href}`,
    },
  }

  useEffect(() => {
    const title = course.metaTitle || course.title
    const description = course.metaDescription || course.description
    const canonicalUrl = `https://patxi.iparaguirre.fr/cours/sylius/${course.slug}/`

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

  useEffect(() => {
    const activeItem = activeTimelineItemRef.current

    if (!activeItem || window.innerWidth >= 768) {
      return
    }

    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [course.slug])

  useEffect(() => {
    setIsChatMenuOpen(false)
    setIsResetModalOpen(false)
    setChatInstanceKey(0)
    setIsChatCompleted(hasChat ? isCourseChatCompleted(course.slug, course.chat) : false)
    setHasChatStarted(hasChat ? hasCourseChatProgress(course.slug) : false)
    setChatProgressPercent(hasChat ? getCourseChatProgressPercent(course.slug, course.chat) : 0)
  }, [course.chat, course.slug, hasChat])

  useEffect(() => {
    if (!isChatCompleted || !skillsRef.current) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      skillsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isChatCompleted])

  const handleConfirmResetChat = () => {
    clearCourseChatProgress(course.slug)
    setChatInstanceKey((currentKey) => currentKey + 1)
    setIsChatMenuOpen(false)
    setIsResetModalOpen(false)
    setHasChatStarted(false)
    setChatProgressPercent(0)
  }

  return (
    <div className={`course-page ${themeClass}`}>
      <Header navigation={courseNavigation} brandHref="/#hero" showCta={false} />

      <main className="app">
        <nav className="course-page__timeline course-page__timeline--header" aria-label="Parcours du module">
          <ol className="course-page__timeline-list">
            {moduleCourses.map((moduleCourse, index) => {
              const isCurrent = moduleCourse.slug === course.slug
              const isReached = index <= currentCourseIndex
              const isCompleted = completedCourseSlugs.includes(moduleCourse.slug)

              return (
                <li
                  key={moduleCourse.slug}
                  ref={isCurrent ? activeTimelineItemRef : null}
                  className={`course-page__timeline-item${isCurrent ? ' course-page__timeline-item--current' : ''}${isReached ? ' course-page__timeline-item--reached' : ''}${isCompleted ? ' course-page__timeline-item--completed' : ''}`}
                >
                  <Link className="course-page__timeline-link" to={`/cours/sylius/${moduleCourse.slug}/`}>
                    <span className="course-page__timeline-marker">
                      <span>{index + 1}</span>
                      {isCompleted ? <Check size={14} strokeWidth={2.8} /> : null}
                    </span>
                    <span className="course-page__timeline-label">{moduleCourse.title}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="course-page__shell">
          <section className="course-page__content" aria-label="Contenu du cours">
            <div className="course-page__eyebrow">
              <span className="course-page__eyebrow-icon" aria-hidden="true">
                <ModuleIcon name={module.icon} strokeWidth={2} />
              </span>
              <span>{module.title}</span>
            </div>
            {hasChat && hasChatStarted ? (
              <div className="course-page__options">
                <button
                  className="course-page__options-trigger"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isChatMenuOpen}
                  aria-label="Options du chat"
                  onClick={() => setIsChatMenuOpen((isOpen) => !isOpen)}
                >
                  <EllipsisVertical size={18} strokeWidth={2.2} />
                </button>

                {isChatMenuOpen ? (
                  <div className="course-page__options-menu" role="menu">
                    <button
                      className="course-page__options-action"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsChatMenuOpen(false)
                        setIsResetModalOpen(true)
                      }}
                    >
                      Recommencer
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            <h1 className="course-page__title">{course.title}</h1>
            <p className="course-page__description">{course.description}</p>

            {course.private ? (
              <div className="course-page__locked">
                <p className="course-page__locked-title">Contenu réservé</p>
                <p className="course-page__locked-copy">
                  Cette page de cours est un support pédagogique réservé à l'accompagnement personnalisé.
                </p>
                {course.skills.length ? (
                  <>
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
                  </>
                ) : null}
                <div className="course-page__locked-actions">
                  {nextPublicCourse ? (
                    <Link className="button button--tertiary" to={`/cours/sylius/${nextPublicCourse.slug}/`}>
                      Cours libre suivant
                    </Link>
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
              <>
                {!hasChatStarted ? (
                  <div className="course-page__message course-page__message--learner">
                    <button
                      className="course-page__start-button"
                      type="button"
                      onClick={() => setHasChatStarted(true)}
                    >
                      Commencer ce cours
                    </button>
                  </div>
                ) : (
                  <CourseChat
                    key={`${course.slug}-${chatInstanceKey}`}
                    courseSlug={course.slug}
                    onCompletionChange={setIsChatCompleted}
                    onProgressChange={setChatProgressPercent}
                    turns={course.chat}
                  />
                )}
                {hasChatStarted ? (
                  <div
                    className={`course-page__chat-progress${isChatCompleted ? ' course-page__chat-progress--completed' : ''}`}
                    style={{ '--course-progress': `${chatProgressPercent}%` } as CSSProperties}
                  >
                    <span className="course-page__chat-progress-ring" aria-hidden="true">
                      <span className="course-page__chat-progress-value">{chatProgressPercent}%</span>
                    </span>
                    <div className="course-page__chat-progress-content">
                      <p className="course-page__chat-progress-title">Progression du cours</p>
                      <p className="course-page__chat-progress-copy">
                        {isChatCompleted
                          ? 'Ce cours est terminé. Vous pouvez le recommencer à tout moment.'
                          : 'Votre avancement se met à jour au fil de la conversation.'}
                      </p>
                      <button
                        className="course-page__chat-progress-reset"
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                      >
                        Recommencer ce cours
                      </button>
                    </div>
                  </div>
                ) : null}
                {course.skills.length && isChatCompleted ? (
                  <>
                    <div ref={skillsRef} className="course-page__skills">
                      <p className="course-page__skills-title">Ce que vous avez appris</p>
                      <ul className="course-page__skills-list">
                        {course.skills.map((skill) => (
                          <li key={skill} className="course-page__skills-item">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {previousCourse || nextCourse ? (
                      <div className="course-page__course-nav">
                        {nextCourse ? (
                          <div className="course-page__course-nav-card course-page__course-nav-card--next">
                            <p className="course-page__course-nav-eyebrow">Cours suivant</p>
                            <p className="course-page__course-nav-title">{nextCourse.title}</p>
                            <Link className="button button--primary" to={`/cours/sylius/${nextCourse.slug}/`}>
                              Continuer
                            </Link>
                          </div>
                        ) : null}
                        {previousCourse ? (
                          <div className="course-page__course-nav-card course-page__course-nav-card--previous">
                            <p className="course-page__course-nav-eyebrow">Cours précédent</p>
                            <p className="course-page__course-nav-title">{previousCourse.title}</p>
                            <Link className="button button--tertiary" to={`/cours/sylius/${previousCourse.slug}/`}>
                              Revenir
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </section>
        </div>
      </main>

      {isResetModalOpen ? (
        <div className="course-page__modal-backdrop" onClick={() => setIsResetModalOpen(false)}>
          <div
            className="course-page__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-reset-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="chat-reset-title" className="course-page__modal-title">
              Réinitialiser la conversation
            </h2>
            <p className="course-page__modal-copy">
              Voulez-vous vraiment effacer votre progression et recommencer cette conversation
              depuis le début ?
            </p>
            <div className="course-page__modal-actions">
              <button
                className="button button--tertiary"
                type="button"
                onClick={() => setIsResetModalOpen(false)}
              >
                Annuler
              </button>
              <button className="button button--primary" type="button" onClick={handleConfirmResetChat}>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer footer={landingPage.footer} />
    </div>
  )
}
