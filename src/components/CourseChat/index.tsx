import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChatTurn } from '../../types/content'
import { ChatAvatar } from '../ChatAvatar'
import { CourseItem } from '../CourseItem'
import type { QuizState } from '../CourseItem/Quiz'
import './style.scss'

type CourseChatProps = {
  courseSlug: string
  onCompletionChange?: (isCompleted: boolean) => void
  turns: ChatTurn[]
}

const typingDelay = 520
const storageVersion = 2

type StoredCourseChatProgress = {
  answersByTurnId: Record<string, string>
  quizStatesByItemId: Record<string, QuizState>
  revealedTurnCount: number
  version: number
}

function getStorageKey(courseSlug: string) {
  return `course-chat-progress:${courseSlug}`
}

export function hasCourseChatProgress(courseSlug: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(getStorageKey(courseSlug)) != null
}

function getChatItemId(turnId: string, itemIndex: number) {
  return `${turnId}:${itemIndex}`
}

function getAccessibleTurnItems(
  turn: ChatTurn,
  responseHistory: string[],
  quizStatesByItemId: Record<string, QuizState>,
) {
  const accessibleItems: Array<{ item: ChatTurn['content'][number]; itemIndex: number }> = []

  for (const [itemIndex, item] of turn.content.entries()) {
    if (item.responseCondition && !responseHistory.includes(item.responseCondition)) {
      continue
    }

    accessibleItems.push({ item, itemIndex })

    if (item.type === 'quiz' && !quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed) {
      break
    }
  }

  return accessibleItems
}

export function clearCourseChatProgress(courseSlug: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getStorageKey(courseSlug))
}

function readStoredProgress(courseSlug: string, turns: ChatTurn[]): StoredCourseChatProgress | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(getStorageKey(courseSlug))

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredCourseChatProgress

    if (parsedValue.version !== storageVersion) {
      return null
    }

    const validTurnIds = new Set(turns.map((turn) => turn.id))
    const answersByTurnId = Object.fromEntries(
      Object.entries(parsedValue.answersByTurnId ?? {}).filter(([turnId]) => validTurnIds.has(turnId)),
    )
    const validItemIds = new Set(
      turns.flatMap((turn) => turn.content.map((_, itemIndex) => getChatItemId(turn.id, itemIndex))),
    )
    const quizStatesByItemId = Object.fromEntries(
      Object.entries(parsedValue.quizStatesByItemId ?? {}).filter(([itemId]) => validItemIds.has(itemId)),
    )

    return {
      version: storageVersion,
      answersByTurnId,
      quizStatesByItemId,
      revealedTurnCount: Math.max(0, Math.min(parsedValue.revealedTurnCount ?? 0, turns.length)),
    }
  } catch {
    return null
  }
}

function getInitialRevealedItemCounts(
  turns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  quizStatesByItemId: Record<string, QuizState>,
) {
  const responseHistory = turns
    .slice(0, revealedTurnCount)
    .map((turn) => answersByTurnId[turn.id])
    .filter((answerId): answerId is string => Boolean(answerId))

  return Object.fromEntries(
    turns
      .slice(0, revealedTurnCount)
      .map((turn) => [turn.id, getAccessibleTurnItems(turn, responseHistory, quizStatesByItemId).length]),
  )
}

export function CourseChat({ courseSlug, onCompletionChange, turns }: CourseChatProps) {
  const storedProgress = useMemo(() => readStoredProgress(courseSlug, turns), [courseSlug, turns])
  const [revealedTurnCount, setRevealedTurnCount] = useState(storedProgress?.revealedTurnCount ?? 0)
  const [isTyping, setIsTyping] = useState(false)
  const [answersByTurnId, setAnswersByTurnId] = useState<Record<string, string>>(
    storedProgress?.answersByTurnId ?? {},
  )
  const [quizStatesByItemId, setQuizStatesByItemId] = useState<Record<string, QuizState>>(
    storedProgress?.quizStatesByItemId ?? {},
  )
  const [revealedItemCountByTurnId, setRevealedItemCountByTurnId] = useState<Record<string, number>>(
    getInitialRevealedItemCounts(
      turns,
      storedProgress?.revealedTurnCount ?? 0,
      storedProgress?.answersByTurnId ?? {},
      storedProgress?.quizStatesByItemId ?? {},
    ),
  )
  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const typingMessageRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToTypingRef = useRef(false)

  const responseHistory = useMemo(() => Object.values(answersByTurnId), [answersByTurnId])

  const lastRevealedTurn = revealedTurnCount > 0 ? turns[revealedTurnCount - 1] : undefined
  const lastRevealedTurnAccessibleItems = lastRevealedTurn
    ? getAccessibleTurnItems(lastRevealedTurn, responseHistory, quizStatesByItemId)
    : []
  const hasBlockingQuiz = lastRevealedTurnAccessibleItems.some(
    ({ item, itemIndex }) =>
      item.type === 'quiz' && !quizStatesByItemId[getChatItemId(lastRevealedTurn!.id, itemIndex)]?.passed,
  )
  const isWaitingForAnswer =
    Boolean(lastRevealedTurn?.responses) &&
    lastRevealedTurn &&
    answersByTurnId[lastRevealedTurn.id] == null
  const isChatCompleted =
    revealedTurnCount >= turns.length &&
    !isTyping &&
    !isWaitingForAnswer &&
    turns.every((turn, index) => {
      if (index >= revealedTurnCount) {
        return false
      }

      const accessibleItems = getAccessibleTurnItems(turn, responseHistory, quizStatesByItemId)
      const areItemsFullyRevealed = (revealedItemCountByTurnId[turn.id] ?? 0) >= accessibleItems.length
      const areTurnQuizzesPassed = accessibleItems.every(({ item, itemIndex }) => {
        if (item.type !== 'quiz') {
          return true
        }

        return Boolean(quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed)
      })

      return areItemsFullyRevealed && areTurnQuizzesPassed
    })

  useEffect(() => {
    setRevealedTurnCount(storedProgress?.revealedTurnCount ?? 0)
    setAnswersByTurnId(storedProgress?.answersByTurnId ?? {})
    setQuizStatesByItemId(storedProgress?.quizStatesByItemId ?? {})
    setRevealedItemCountByTurnId(
      getInitialRevealedItemCounts(
        turns,
        storedProgress?.revealedTurnCount ?? 0,
        storedProgress?.answersByTurnId ?? {},
        storedProgress?.quizStatesByItemId ?? {},
      ),
    )
  }, [storedProgress, turns])

  useEffect(() => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    if (turns.length === 0) {
      setIsTyping(false)
      return
    }

    if (revealedTurnCount === 0) {
      setIsTyping(true)

      typingTimeoutRef.current = window.setTimeout(() => {
        const firstTurn = turns[0]

        setRevealedTurnCount(1)
        setRevealedItemCountByTurnId({
          [firstTurn.id]: 1,
        })
        setIsTyping(false)
        typingTimeoutRef.current = null
      }, typingDelay)

      return () => {
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
      }
    }

    if (!lastRevealedTurn) {
      setIsTyping(false)
      return
    }

    const accessibleItems = getAccessibleTurnItems(lastRevealedTurn, responseHistory, quizStatesByItemId)
    const revealedItemCount = revealedItemCountByTurnId[lastRevealedTurn.id] ?? 0

    if (revealedItemCount < accessibleItems.length) {
      const nextItem = accessibleItems[revealedItemCount]?.item
      const nextItemTypingDelay = nextItem?.typingDelay ?? typingDelay

      setIsTyping(true)

      typingTimeoutRef.current = window.setTimeout(() => {
        setRevealedItemCountByTurnId((currentCounts) => ({
          ...currentCounts,
          [lastRevealedTurn.id]: (currentCounts[lastRevealedTurn.id] ?? 0) + 1,
        }))
        setIsTyping(false)
        typingTimeoutRef.current = null
      }, nextItemTypingDelay)

      return () => {
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
      }
    }

    if (hasBlockingQuiz || isWaitingForAnswer || revealedTurnCount >= turns.length) {
      setIsTyping(false)
      return
    }

    const nextTurn = turns[revealedTurnCount]

    if (!nextTurn) {
      setIsTyping(false)
      return
    }

    setIsTyping(true)

    typingTimeoutRef.current = window.setTimeout(() => {
      setRevealedTurnCount((currentCount) => currentCount + 1)
      setRevealedItemCountByTurnId((currentCounts) => ({
        ...currentCounts,
        [nextTurn.id]: 1,
      }))
      setIsTyping(false)
      typingTimeoutRef.current = null
    }, typingDelay)

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }, [
    hasBlockingQuiz,
    isWaitingForAnswer,
    lastRevealedTurn,
    quizStatesByItemId,
    responseHistory,
    revealedItemCountByTurnId,
    revealedTurnCount,
    turns,
  ])

  useEffect(() => {
    const transcript = transcriptRef.current

    if (!transcript) {
      return
    }

    transcript.scrollTo({
      top: transcript.scrollHeight,
      behavior: 'smooth',
    })
  }, [answersByTurnId, isTyping, revealedItemCountByTurnId, revealedTurnCount])

  useEffect(() => {
    if (!isTyping || !shouldScrollToTypingRef.current) {
      return
    }

    const typingMessage = typingMessageRef.current

    if (!typingMessage) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      typingMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      shouldScrollToTypingRef.current = false
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isTyping])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const payload: StoredCourseChatProgress = {
      version: storageVersion,
      answersByTurnId,
      quizStatesByItemId,
      revealedTurnCount,
    }

    window.localStorage.setItem(getStorageKey(courseSlug), JSON.stringify(payload))
  }, [answersByTurnId, courseSlug, quizStatesByItemId, revealedTurnCount])

  useEffect(() => {
    onCompletionChange?.(isChatCompleted)
  }, [isChatCompleted, onCompletionChange])

  const handleAnswer = (turnId: string, responseId: string) => {
    shouldScrollToTypingRef.current = true

    setAnswersByTurnId((currentAnswers) => {
      if (currentAnswers[turnId]) {
        return currentAnswers
      }

      return {
        ...currentAnswers,
        [turnId]: responseId,
      }
    })
  }

  const handleQuizStateChange = (itemId: string, state: QuizState) => {
    setQuizStatesByItemId((currentStates) => ({
      ...currentStates,
      [itemId]: state,
    }))
  }

  return (
    <section className="course-chat" aria-label="Conversation de cours">
      <div ref={transcriptRef} className="course-chat__transcript">
        {turns.slice(0, revealedTurnCount).map((turn, turnIndex) => {
          const answerId = answersByTurnId[turn.id]
          const answerLabel = answerId ? turn.responses?.[answerId] : undefined
          const accessibleItems = getAccessibleTurnItems(turn, responseHistory, quizStatesByItemId)
          const revealedItems = accessibleItems.slice(0, revealedItemCountByTurnId[turn.id] ?? 0)
          const isTurnFullyRevealed = revealedItems.length >= accessibleItems.length
          const isTurnQuizPassed = accessibleItems.every(({ item, itemIndex }) => {
            if (item.type !== 'quiz') {
              return true
            }

            return Boolean(quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed)
          })
          const shouldShowQuizCompletion =
            !answerLabel &&
            isTurnFullyRevealed &&
            isTurnQuizPassed &&
            accessibleItems.some(({ item }) => item.type === 'quiz')

          return (
            <div key={`${turn.author}-${turnIndex}`} className="course-chat__turn">
              {revealedItems.map(({ item, itemIndex }, revealedItemIndex) => (
                <div
                  key={`${turnIndex}-${item.type}-${itemIndex}`}
                  className="course-chat__message course-chat__message--mentor"
                >
                  {revealedItemIndex === 0 ? (
                    <div className="course-chat__meta">
                      <ChatAvatar imageSrc="/resource/avatar/patxi.png" name={turn.author} />
                    </div>
                  ) : null}
                  <div className="course-chat__bubble course-chat__bubble--mentor">
                    <CourseItem
                      item={item}
                      onQuizStateChange={
                        item.type === 'quiz'
                          ? (state) => handleQuizStateChange(getChatItemId(turn.id, itemIndex), state)
                          : undefined
                      }
                      quizState={
                        item.type === 'quiz' ? quizStatesByItemId[getChatItemId(turn.id, itemIndex)] : undefined
                      }
                    />
                  </div>
                </div>
              ))}

              {answerLabel ? (
                <div className="course-chat__message course-chat__message--learner">
                  <div className="course-chat__bubble course-chat__bubble--learner">
                    <p className="course-chat__answer">{answerLabel}</p>
                  </div>
                </div>
              ) : shouldShowQuizCompletion ? (
                <div className="course-chat__message course-chat__message--learner">
                  <div className="course-chat__bubble course-chat__bubble--learner">
                    <p className="course-chat__answer">J&apos;ai terminé</p>
                  </div>
                </div>
              ) : null}

              {turn.responses && !answerLabel && isTurnFullyRevealed && isTurnQuizPassed ? (
                <div className="course-chat__responses" aria-label="Réponses proposées">
                  {Object.entries(turn.responses).map(([responseId, responseLabel]) => (
                    <button
                      key={responseId}
                      className="course-chat__response-button"
                      type="button"
                      onClick={() => handleAnswer(turn.id, responseId)}
                    >
                      {responseLabel}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}

        {isTyping ? (
          <div ref={typingMessageRef} className="course-chat__message course-chat__message--mentor">
            <div className="course-chat__meta">
              <ChatAvatar imageSrc="/resource/avatar/patxi.png" name="Patxi" />
            </div>
            <div className="course-chat__bubble course-chat__bubble--mentor course-chat__bubble--typing">
              <span className="course-chat__typing-dot"></span>
              <span className="course-chat__typing-dot"></span>
              <span className="course-chat__typing-dot"></span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
