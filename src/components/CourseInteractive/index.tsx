import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { EllipsisVertical } from 'lucide-react'
import type { ChatTurn, Course } from '../../types/content'
import { getCourseBySlug } from '../../pages/Course/_courses'
import {
  CourseChat,
  clearCourseChatProgress,
  getCourseChatProgressPercent,
  hasCourseChatProgress,
  isCourseChatCompleted,
} from '../CourseChat'

type CourseInteractiveProps = {
  courseSlug: string
  nextCourse?: Course
  previousCourse?: Course
  skills: string[]
  turns: ChatTurn[]
}

export function CourseInteractive({
  courseSlug,
  nextCourse,
  previousCourse,
  skills,
  turns,
}: CourseInteractiveProps) {
  const liveCourse = import.meta.env.DEV ? getCourseBySlug(courseSlug) : undefined
  const currentSkills = liveCourse?.skills ?? skills
  const currentTurns = liveCourse?.chat ?? turns
  const skillsRef = useRef<HTMLDivElement | null>(null)
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [chatInstanceKey, setChatInstanceKey] = useState(0)
  const [isChatCompleted, setIsChatCompleted] = useState(false)
  const [hasChatStarted, setHasChatStarted] = useState(false)
  const [chatProgressPercent, setChatProgressPercent] = useState(0)

  useEffect(() => {
    setIsChatMenuOpen(false)
    setIsResetModalOpen(false)
    setChatInstanceKey(0)
    setIsChatCompleted(isCourseChatCompleted(courseSlug, currentTurns))
    setHasChatStarted(hasCourseChatProgress(courseSlug))
    setChatProgressPercent(getCourseChatProgressPercent(courseSlug, currentTurns))
  }, [courseSlug, currentTurns])

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
    clearCourseChatProgress(courseSlug)
    setChatInstanceKey((currentKey) => currentKey + 1)
    setIsChatMenuOpen(false)
    setIsResetModalOpen(false)
    setHasChatStarted(false)
    setChatProgressPercent(0)
    setIsChatCompleted(false)
  }

  return (
    <>
      {hasChatStarted ? (
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
          key={`${courseSlug}-${chatInstanceKey}`}
          courseSlug={courseSlug}
          onCompletionChange={setIsChatCompleted}
          onProgressChange={setChatProgressPercent}
          turns={currentTurns}
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

      {currentSkills.length > 0 && isChatCompleted ? (
        <>
          <div ref={skillsRef} className="course-page__skills">
            <p className="course-page__skills-title">Ce que vous avez appris</p>
            <ul className="course-page__skills-list">
              {currentSkills.map((skill) => (
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
                  <a className="button button--primary" href={`/cours/sylius/${nextCourse.slug}/`}>
                    Continuer
                  </a>
                </div>
              ) : null}
              {previousCourse ? (
                <div className="course-page__course-nav-card course-page__course-nav-card--previous">
                  <p className="course-page__course-nav-eyebrow">Cours précédent</p>
                  <p className="course-page__course-nav-title">{previousCourse.title}</p>
                  <a className="button button--tertiary" href={`/cours/sylius/${previousCourse.slug}/`}>
                    Revenir
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

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
    </>
  )
}
