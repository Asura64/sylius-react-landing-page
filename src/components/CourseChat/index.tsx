import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { ChatTurn } from '../../types/content'
import { ChatAvatar } from '../ChatAvatar'
import { CourseItem } from '../CourseItem'
import type { QuizState } from '../CourseItem/Quiz'
import './style.scss'

type CourseChatProps = {
  courseSlug: string
  onCompletionChange?: (isCompleted: boolean) => void
  onProgressChange?: (progressPercent: number) => void
  turns: ChatTurn[]
}

const typingDelay = 1000
const storageVersion = 2

type StoredCourseChatProgress = {
  answersByTurnId: Record<string, string>
  quizStatesByItemId: Record<string, QuizState>
  revealedTurnCount: number
  version: number
}

type ResponseConditionContext = {
  currentCourseSlug: string
  currentTurnId: string
  answersByTurnId: Record<string, string>
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

function readStoredAnswersByTurnId(courseSlug: string) {
  if (typeof window === 'undefined') {
    return {}
  }

  const rawValue = window.localStorage.getItem(getStorageKey(courseSlug))

  if (!rawValue) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredCourseChatProgress>

    return parsedValue.answersByTurnId ?? {}
  } catch {
    return {}
  }
}

function matchesResponseCondition(responseCondition: string, context: ResponseConditionContext) {
  return responseCondition
    .split('|')
    .map((condition) => condition.trim())
    .filter(Boolean)
    .some((condition) => {
      const segments = condition.split(':')

      if (segments.length === 1) {
        return Object.values(context.answersByTurnId).includes(condition)
      }

      let targetCourseSlug = context.currentCourseSlug
      let targetTurnId = context.currentTurnId
      let targetAnswer = ''

      if (segments.length === 2) {
        targetTurnId = segments[0] || context.currentTurnId
        targetAnswer = segments[1]
      } else {
        targetCourseSlug = segments[0] || context.currentCourseSlug
        targetTurnId = segments[1] || context.currentTurnId
        targetAnswer = segments.slice(2).join(':')
      }

      const targetAnswersByTurnId =
        targetCourseSlug === context.currentCourseSlug
          ? context.answersByTurnId
          : readStoredAnswersByTurnId(targetCourseSlug)

      return targetAnswersByTurnId[targetTurnId] === targetAnswer
    })
}

function getAccessibleTurnItems(
  currentCourseSlug: string,
  turn: ChatTurn,
  answersByTurnId: Record<string, string>,
  confirmedItemIds: Record<string, boolean>,
  quizStatesByItemId: Record<string, QuizState>,
) {
  const accessibleItems: Array<{ item: ChatTurn['content'][number]; itemIndex: number }> = []
  let hasMatchedPreviousConditionalItem = false

  for (const [itemIndex, item] of turn.content.entries()) {
    if (item.responseCondition) {
      if (item.responseCondition === 'finally') {
        if (hasMatchedPreviousConditionalItem) {
          continue
        }
      } else {
        const hasMatchedCurrentCondition = matchesResponseCondition(item.responseCondition, {
          currentCourseSlug,
          currentTurnId: turn.id,
          answersByTurnId,
        })

        if (!hasMatchedCurrentCondition) {
          continue
        }

        hasMatchedPreviousConditionalItem = true
      }
    }

    accessibleItems.push({ item, itemIndex })

    if (item.confirm && !confirmedItemIds[getChatItemId(turn.id, itemIndex)]) {
      break
    }

    if (item.type === 'quiz' && !quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed) {
      break
    }
  }

  return accessibleItems
}

function getAccessibleTurns(currentCourseSlug: string, turns: ChatTurn[], answersByTurnId: Record<string, string>) {
  return turns.filter((turn) => {
    if (!turn.responseCondition) {
      return true
    }

    if (turn.responseCondition === 'finally') {
      return false
    }

    return matchesResponseCondition(turn.responseCondition, {
      currentCourseSlug,
      currentTurnId: turn.id,
      answersByTurnId,
    })
  })
}

function getQuizCompletionResponse(turn: ChatTurn, accessibleItems: Array<{ item: ChatTurn['content'][number]; itemIndex: number }>) {
  const quizItem = [...accessibleItems].reverse().find(({ item }) => item.type === 'quiz')?.item

  if (!quizItem || quizItem.type !== 'quiz') {
    return undefined
  }

  if (quizItem.data.response === null) {
    return null
  }

  return quizItem.data.response ?? "J'ai terminé"
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
  courseSlug: string,
  turns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  confirmedItemIds: Record<string, boolean>,
  quizStatesByItemId: Record<string, QuizState>,
) {
  const accessibleTurns = getAccessibleTurns(courseSlug, turns, answersByTurnId)

  return Object.fromEntries(
    accessibleTurns
      .slice(0, revealedTurnCount)
      .map((turn) => [
        turn.id,
        getAccessibleTurnItems(courseSlug, turn, answersByTurnId, confirmedItemIds, quizStatesByItemId).length,
      ]),
  )
}

function getInitialConfirmedItemIds(
  courseSlug: string,
  turns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  quizStatesByItemId: Record<string, QuizState>,
) {
  const accessibleTurns = getAccessibleTurns(courseSlug, turns, answersByTurnId)
  const initialConfirmedItemIds: Record<string, boolean> = {}

  for (const [turnIndex, turn] of accessibleTurns.slice(0, revealedTurnCount).entries()) {
    const isTurnCompleted = turnIndex < revealedTurnCount - 1 || Boolean(answersByTurnId[turn.id])

    if (!isTurnCompleted) {
      continue
    }

    let hasPendingConfirmations = true

    while (hasPendingConfirmations) {
      hasPendingConfirmations = false

      const accessibleItems = getAccessibleTurnItems(
        courseSlug,
        turn,
        answersByTurnId,
        initialConfirmedItemIds,
        quizStatesByItemId,
      )

      for (const { item, itemIndex } of accessibleItems) {
        if (item.confirm && !initialConfirmedItemIds[getChatItemId(turn.id, itemIndex)]) {
          initialConfirmedItemIds[getChatItemId(turn.id, itemIndex)] = true
          hasPendingConfirmations = true
        }
      }
    }
  }

  return initialConfirmedItemIds
}

export function isCourseChatCompleted(courseSlug: string, turns: ChatTurn[]) {
  const storedProgress = readStoredProgress(courseSlug, turns)

  if (!storedProgress) {
    return false
  }

  const confirmedItemIds = getInitialConfirmedItemIds(
    courseSlug,
    turns,
    storedProgress.revealedTurnCount,
    storedProgress.answersByTurnId,
    storedProgress.quizStatesByItemId,
  )
  const revealedItemCountByTurnId = getInitialRevealedItemCounts(
    courseSlug,
    turns,
    storedProgress.revealedTurnCount,
    storedProgress.answersByTurnId,
    confirmedItemIds,
    storedProgress.quizStatesByItemId,
  )
  const accessibleTurns = getAccessibleTurns(courseSlug, turns, storedProgress.answersByTurnId)
  const lastRevealedTurn =
    storedProgress.revealedTurnCount > 0 ? accessibleTurns[storedProgress.revealedTurnCount - 1] : undefined
  const lastRevealedTurnAccessibleItems = lastRevealedTurn
    ? getAccessibleTurnItems(
        courseSlug,
        lastRevealedTurn,
        storedProgress.answersByTurnId,
        confirmedItemIds,
        storedProgress.quizStatesByItemId,
      )
    : []
  const isWaitingForAnswer =
    Boolean(lastRevealedTurn?.responses) &&
    lastRevealedTurn &&
    storedProgress.answersByTurnId[lastRevealedTurn.id] == null

  return (
    storedProgress.revealedTurnCount >= accessibleTurns.length &&
    !isWaitingForAnswer &&
    accessibleTurns.every((turn, index) => {
      if (index >= storedProgress.revealedTurnCount) {
        return false
      }

      const accessibleItems = getAccessibleTurnItems(
        courseSlug,
        turn,
        storedProgress.answersByTurnId,
        confirmedItemIds,
        storedProgress.quizStatesByItemId,
      )
      const areItemsFullyRevealed = (revealedItemCountByTurnId[turn.id] ?? 0) >= accessibleItems.length
      const areTurnConfirmationsAcknowledged = accessibleItems.every(
        ({ item, itemIndex }) => !item.confirm || Boolean(confirmedItemIds[getChatItemId(turn.id, itemIndex)]),
      )
      const areTurnQuizzesPassed = accessibleItems.every(({ item, itemIndex }) => {
        if (item.type !== 'quiz') {
          return true
        }

        return Boolean(storedProgress.quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed)
      })

      return areItemsFullyRevealed && areTurnConfirmationsAcknowledged && areTurnQuizzesPassed
    }) &&
    lastRevealedTurnAccessibleItems.every(({ item, itemIndex }) => {
      if (item.type !== 'quiz') {
        return true
      }

      return Boolean(storedProgress.quizStatesByItemId[getChatItemId(lastRevealedTurn!.id, itemIndex)]?.passed)
    })
  )
}

export function getCourseChatProgressPercent(courseSlug: string, turns: ChatTurn[]) {
  const storedProgress = readStoredProgress(courseSlug, turns)

  if (!storedProgress || turns.length === 0) {
    return 0
  }

  const confirmedItemIds = getInitialConfirmedItemIds(
    courseSlug,
    turns,
    storedProgress.revealedTurnCount,
    storedProgress.answersByTurnId,
    storedProgress.quizStatesByItemId,
  )
  const revealedItemCountByTurnId = getInitialRevealedItemCounts(
    courseSlug,
    turns,
    storedProgress.revealedTurnCount,
    storedProgress.answersByTurnId,
    confirmedItemIds,
    storedProgress.quizStatesByItemId,
  )
  const accessibleTurns = getAccessibleTurns(courseSlug, turns, storedProgress.answersByTurnId)

  if (accessibleTurns.length === 0) {
    return 0
  }

  const totals = accessibleTurns.reduce(
    (accumulator, turn, index) => {
      const accessibleItems = getAccessibleTurnItems(
        courseSlug,
        turn,
        storedProgress.answersByTurnId,
        confirmedItemIds,
        storedProgress.quizStatesByItemId,
      )
      const turnUnits = accessibleItems.length + (turn.responses ? 1 : 0)
      const revealedItems = index < storedProgress.revealedTurnCount ? revealedItemCountByTurnId[turn.id] ?? 0 : 0
      const answerUnit = storedProgress.answersByTurnId[turn.id] ? 1 : 0

      return {
        completedUnits: accumulator.completedUnits + Math.min(revealedItems, accessibleItems.length) + answerUnit,
        totalUnits: accumulator.totalUnits + turnUnits,
      }
    },
    { completedUnits: 0, totalUnits: 0 },
  )

  if (totals.totalUnits === 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((totals.completedUnits / totals.totalUnits) * 100)))
}

function getCurrentProgressPercent(
  courseSlug: string,
  accessibleTurns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  confirmedItemIds: Record<string, boolean>,
  quizStatesByItemId: Record<string, QuizState>,
  revealedItemCountByTurnId: Record<string, number>,
) {
  if (accessibleTurns.length === 0) {
    return 0
  }

  const totals = accessibleTurns.reduce(
    (accumulator, turn, index) => {
      const accessibleItems = getAccessibleTurnItems(
        courseSlug,
        turn,
        answersByTurnId,
        confirmedItemIds,
        quizStatesByItemId,
      )
      const turnUnits = accessibleItems.length + (turn.responses ? 1 : 0)
      const revealedItems = index < revealedTurnCount ? revealedItemCountByTurnId[turn.id] ?? 0 : 0
      const answerUnit = answersByTurnId[turn.id] ? 1 : 0

      return {
        completedUnits: accumulator.completedUnits + Math.min(revealedItems, accessibleItems.length) + answerUnit,
        totalUnits: accumulator.totalUnits + turnUnits,
      }
    },
    { completedUnits: 0, totalUnits: 0 },
  )

  if (totals.totalUnits === 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((totals.completedUnits / totals.totalUnits) * 100)))
}

export function CourseChat({ courseSlug, onCompletionChange, onProgressChange, turns }: CourseChatProps) {
  const [storedProgress, setStoredProgress] = useState<StoredCourseChatProgress | null>(null)
  const [hasInitializedFromStorage, setHasInitializedFromStorage] = useState(false)
  const initialConfirmedItemIds = useMemo(
    () =>
      getInitialConfirmedItemIds(
        courseSlug,
        turns,
        storedProgress?.revealedTurnCount ?? 0,
        storedProgress?.answersByTurnId ?? {},
        storedProgress?.quizStatesByItemId ?? {},
      ),
    [courseSlug, storedProgress, turns],
  )
  const [revealedTurnCount, setRevealedTurnCount] = useState(storedProgress?.revealedTurnCount ?? 0)
  const [isTyping, setIsTyping] = useState(false)
  const [answersByTurnId, setAnswersByTurnId] = useState<Record<string, string>>(
    storedProgress?.answersByTurnId ?? {},
  )
  const [confirmedItemIds, setConfirmedItemIds] = useState<Record<string, boolean>>(initialConfirmedItemIds)
  const [quizStatesByItemId, setQuizStatesByItemId] = useState<Record<string, QuizState>>(
    storedProgress?.quizStatesByItemId ?? {},
  )
  const [revealedItemCountByTurnId, setRevealedItemCountByTurnId] = useState<Record<string, number>>(
    getInitialRevealedItemCounts(
      courseSlug,
      turns,
      storedProgress?.revealedTurnCount ?? 0,
      storedProgress?.answersByTurnId ?? {},
      initialConfirmedItemIds,
      storedProgress?.quizStatesByItemId ?? {},
    ),
  )
  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const typingMessageRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToTypingRef = useRef(false)
  const accessibleTurns = useMemo(
    () => getAccessibleTurns(courseSlug, turns, answersByTurnId),
    [answersByTurnId, courseSlug, turns],
  )

  const lastRevealedTurn = revealedTurnCount > 0 ? accessibleTurns[revealedTurnCount - 1] : undefined
  const lastRevealedTurnAccessibleItems = lastRevealedTurn
    ? getAccessibleTurnItems(courseSlug, lastRevealedTurn, answersByTurnId, confirmedItemIds, quizStatesByItemId)
    : []
  const hasBlockingConfirm = lastRevealedTurnAccessibleItems.some(
    ({ item, itemIndex }) => item.confirm && !confirmedItemIds[getChatItemId(lastRevealedTurn!.id, itemIndex)],
  )
  const hasBlockingQuiz = lastRevealedTurnAccessibleItems.some(
    ({ item, itemIndex }) =>
      item.type === 'quiz' && !quizStatesByItemId[getChatItemId(lastRevealedTurn!.id, itemIndex)]?.passed,
  )
  const isWaitingForAnswer =
    Boolean(lastRevealedTurn?.responses) &&
    lastRevealedTurn &&
    answersByTurnId[lastRevealedTurn.id] == null
  const isChatCompleted =
    revealedTurnCount >= accessibleTurns.length &&
    !isTyping &&
    !isWaitingForAnswer &&
    accessibleTurns.every((turn, index) => {
      if (index >= revealedTurnCount) {
        return false
      }

      const accessibleItems = getAccessibleTurnItems(
        courseSlug,
        turn,
        answersByTurnId,
        confirmedItemIds,
        quizStatesByItemId,
      )
      const areItemsFullyRevealed = (revealedItemCountByTurnId[turn.id] ?? 0) >= accessibleItems.length
      const areTurnConfirmationsAcknowledged = accessibleItems.every(
        ({ item, itemIndex }) => !item.confirm || Boolean(confirmedItemIds[getChatItemId(turn.id, itemIndex)]),
      )
      const areTurnQuizzesPassed = accessibleItems.every(({ item, itemIndex }) => {
        if (item.type !== 'quiz') {
          return true
        }

        return Boolean(quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed)
      })

      return areItemsFullyRevealed && areTurnConfirmationsAcknowledged && areTurnQuizzesPassed
    })
  const currentProgressPercent = useMemo(
    () =>
      getCurrentProgressPercent(
        courseSlug,
        accessibleTurns,
        revealedTurnCount,
        answersByTurnId,
        confirmedItemIds,
        quizStatesByItemId,
        revealedItemCountByTurnId,
      ),
    [
      accessibleTurns,
      answersByTurnId,
      confirmedItemIds,
      courseSlug,
      quizStatesByItemId,
      revealedItemCountByTurnId,
      revealedTurnCount,
    ],
  )

  useEffect(() => {
    setStoredProgress(readStoredProgress(courseSlug, turns))
    setHasInitializedFromStorage(false)
  }, [courseSlug, turns])

  useEffect(() => {
    setRevealedTurnCount(storedProgress?.revealedTurnCount ?? 0)
    setAnswersByTurnId(storedProgress?.answersByTurnId ?? {})
    setConfirmedItemIds(initialConfirmedItemIds)
    setQuizStatesByItemId(storedProgress?.quizStatesByItemId ?? {})
    setRevealedItemCountByTurnId(
      getInitialRevealedItemCounts(
        courseSlug,
        turns,
        storedProgress?.revealedTurnCount ?? 0,
        storedProgress?.answersByTurnId ?? {},
        initialConfirmedItemIds,
        storedProgress?.quizStatesByItemId ?? {},
      ),
    )
    setHasInitializedFromStorage(true)
  }, [courseSlug, initialConfirmedItemIds, storedProgress, turns])

  useEffect(() => {
    if (!hasInitializedFromStorage) {
      return
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    if (accessibleTurns.length === 0) {
      setIsTyping(false)
      return
    }

    if (revealedTurnCount === 0) {
      setIsTyping(true)

      typingTimeoutRef.current = window.setTimeout(() => {
        const firstTurn = accessibleTurns[0]

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

    const accessibleItems = getAccessibleTurnItems(
      courseSlug,
      lastRevealedTurn,
      answersByTurnId,
      confirmedItemIds,
      quizStatesByItemId,
    )
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

    if (hasBlockingConfirm || hasBlockingQuiz || isWaitingForAnswer || revealedTurnCount >= accessibleTurns.length) {
      setIsTyping(false)
      return
    }

    const nextTurn = accessibleTurns[revealedTurnCount]

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
    hasBlockingConfirm,
    hasBlockingQuiz,
    accessibleTurns,
    confirmedItemIds,
    courseSlug,
    isWaitingForAnswer,
    lastRevealedTurn,
    quizStatesByItemId,
    answersByTurnId,
    revealedItemCountByTurnId,
    revealedTurnCount,
    hasInitializedFromStorage,
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
    if (!hasInitializedFromStorage || typeof window === 'undefined') {
      return
    }

    const payload: StoredCourseChatProgress = {
      version: storageVersion,
      answersByTurnId,
      quizStatesByItemId,
      revealedTurnCount,
    }

    window.localStorage.setItem(getStorageKey(courseSlug), JSON.stringify(payload))
  }, [answersByTurnId, courseSlug, hasInitializedFromStorage, quizStatesByItemId, revealedTurnCount])

  useEffect(() => {
    onCompletionChange?.(isChatCompleted)
  }, [isChatCompleted, onCompletionChange])

  useEffect(() => {
    onProgressChange?.(currentProgressPercent)
  }, [currentProgressPercent, onProgressChange])

  const handleAnswer = (turnId: string, responseId: string) => {
    shouldScrollToTypingRef.current = true
    const isLastTurnAnswer =
      lastRevealedTurn?.id === turnId &&
      revealedTurnCount >= accessibleTurns.length &&
      (revealedItemCountByTurnId[turnId] ?? 0) >= lastRevealedTurnAccessibleItems.length

    setAnswersByTurnId((currentAnswers) => {
      if (currentAnswers[turnId]) {
        return currentAnswers
      }

      return {
        ...currentAnswers,
        [turnId]: responseId,
      }
    })

    if (isLastTurnAnswer) {
      window.requestAnimationFrame(() => {
        onCompletionChange?.(true)
      })
    }
  }

  const handleQuizStateChange = (itemId: string, state: QuizState) => {
    setQuizStatesByItemId((currentStates) => {
      const previousState = currentStates[itemId]

      if (state.passed && !previousState?.passed) {
        shouldScrollToTypingRef.current = true
      }

      return {
        ...currentStates,
        [itemId]: state,
      }
    })
  }

  const handleItemConfirmation = (itemId: string) => {
    shouldScrollToTypingRef.current = true

    setConfirmedItemIds((currentItemIds) => {
      if (currentItemIds[itemId]) {
        return currentItemIds
      }

      return {
        ...currentItemIds,
        [itemId]: true,
      }
    })
  }

  return (
    <section className="course-chat" aria-label="Conversation de cours">
      <div ref={transcriptRef} className="course-chat__transcript">
        {accessibleTurns.slice(0, revealedTurnCount).map((turn, turnIndex) => {
          const previousTurn = turnIndex > 0 ? accessibleTurns[turnIndex - 1] : undefined
          const previousTurnAnswerId = previousTurn ? answersByTurnId[previousTurn.id] : undefined
          const previousTurnAccessibleItems = previousTurn
            ? getAccessibleTurnItems(courseSlug, previousTurn, answersByTurnId, confirmedItemIds, quizStatesByItemId)
            : []
          const previousTurnShowedItemConfirmation = previousTurnAccessibleItems.some(
            ({ item, itemIndex }) => item.confirm && Boolean(confirmedItemIds[getChatItemId(previousTurn!.id, itemIndex)]),
          )
          const previousTurnQuizPassed = previousTurnAccessibleItems.every(({ item, itemIndex }) => {
            if (item.type !== 'quiz') {
              return true
            }

            return Boolean(quizStatesByItemId[getChatItemId(previousTurn!.id, itemIndex)]?.passed)
          })
          const previousTurnShowedQuizCompletion =
            Boolean(previousTurn) &&
            !previousTurnAnswerId &&
            previousTurnQuizPassed &&
            getQuizCompletionResponse(previousTurn, previousTurnAccessibleItems) != null
          const shouldShowMentorAvatar =
            !previousTurn ||
            previousTurn.author !== turn.author ||
            Boolean(previousTurnAnswerId) ||
            previousTurnShowedItemConfirmation ||
            previousTurnShowedQuizCompletion

          const answerId = answersByTurnId[turn.id]
          const answerLabel = answerId ? turn.responses?.[answerId] : undefined
          const accessibleItems = getAccessibleTurnItems(
            courseSlug,
            turn,
            answersByTurnId,
            confirmedItemIds,
            quizStatesByItemId,
          )
          const revealedItems = accessibleItems.slice(0, revealedItemCountByTurnId[turn.id] ?? 0)
          const isTurnFullyRevealed = revealedItems.length >= accessibleItems.length
          const isTurnConfirmationsAcknowledged = accessibleItems.every(
            ({ item, itemIndex }) => !item.confirm || Boolean(confirmedItemIds[getChatItemId(turn.id, itemIndex)]),
          )
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
          const quizCompletionResponse = shouldShowQuizCompletion
            ? getQuizCompletionResponse(turn, accessibleItems)
            : undefined

          return (
            <div key={`${turn.author}-${turnIndex}`} className="course-chat__turn">
              {revealedItems.map(({ item, itemIndex }, revealedItemIndex) => (
                <Fragment key={`${turnIndex}-${item.type}-${itemIndex}`}>
                  <div
                    className="course-chat__message course-chat__message--mentor"
                  >
                    {revealedItemIndex === 0 && shouldShowMentorAvatar ? (
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
                  {item.confirm ? (
                    confirmedItemIds[getChatItemId(turn.id, itemIndex)] ? (
                      <div className="course-chat__message course-chat__message--learner">
                        <div className="course-chat__bubble course-chat__bubble--learner">
                          <p className="course-chat__answer">{item.confirm}</p>
                        </div>
                      </div>
                    ) : revealedItemIndex === revealedItems.length - 1 ? (
                      <div className="course-chat__responses" aria-label="Confirmation">
                        <button
                          className="course-chat__response-button"
                          type="button"
                          onClick={() => handleItemConfirmation(getChatItemId(turn.id, itemIndex))}
                        >
                          {item.confirm}
                        </button>
                      </div>
                    ) : null
                  ) : null}
                </Fragment>
              ))}

              {answerLabel ? (
                <div className="course-chat__message course-chat__message--learner">
                  <div className="course-chat__bubble course-chat__bubble--learner">
                    <p className="course-chat__answer">{answerLabel}</p>
                  </div>
                </div>
              ) : shouldShowQuizCompletion && quizCompletionResponse != null ? (
                <div className="course-chat__message course-chat__message--learner">
                  <div className="course-chat__bubble course-chat__bubble--learner">
                    <p className="course-chat__answer">{quizCompletionResponse}</p>
                  </div>
                </div>
              ) : null}

              {turn.responses && !answerLabel && isTurnFullyRevealed && isTurnConfirmationsAcknowledged && isTurnQuizPassed ? (
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
