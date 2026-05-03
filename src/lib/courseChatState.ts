import type { ChatTurn } from '../types/content'

export type QuizStateValue = {
  selectedIds: string[]
  submitted: boolean
  passed: boolean
}

export type StoredCourseChatProgress = {
  answersByTurnId: Record<string, string>
  quizStatesByItemId: Record<string, QuizStateValue>
  revealedTurnCount: number
  version: number
}

export type ResponseConditionContext = {
  currentCourseSlug: string
  currentTurnId: string
  answersByTurnId: Record<string, string>
}

export const courseChatTypingDelay = 1000
export const courseChatStorageVersion = 2
export const courseProgressChangedEventName = 'course:progress-changed'

export function getCourseChatStorageKey(courseSlug: string) {
  return `course-chat-progress:${courseSlug}`
}

export function getChatItemId(turnId: string, itemIndex: number) {
  return `${turnId}:${itemIndex}`
}

export function hasCourseChatProgress(courseSlug: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(getCourseChatStorageKey(courseSlug)) != null
}

export function clearCourseChatProgress(courseSlug: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getCourseChatStorageKey(courseSlug))
}

export function writeStoredProgress(
  courseSlug: string,
  progress: Omit<StoredCourseChatProgress, 'version'>,
) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    getCourseChatStorageKey(courseSlug),
    JSON.stringify({
      version: courseChatStorageVersion,
      ...progress,
    }),
  )
}

export function readStoredAnswersByTurnId(courseSlug: string) {
  if (typeof window === 'undefined') {
    return {}
  }

  const rawValue = window.localStorage.getItem(getCourseChatStorageKey(courseSlug))

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

export function matchesResponseCondition(responseCondition: string, context: ResponseConditionContext) {
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

export function getAccessibleTurnItems(
  currentCourseSlug: string,
  turn: ChatTurn,
  answersByTurnId: Record<string, string>,
  confirmedItemIds: Record<string, boolean>,
  quizStatesByItemId: Record<string, QuizStateValue>,
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

export function getAccessibleTurns(
  currentCourseSlug: string,
  turns: ChatTurn[],
  answersByTurnId: Record<string, string>,
) {
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

export function getQuizCompletionResponse(
  turn: ChatTurn,
  accessibleItems: Array<{ item: ChatTurn['content'][number]; itemIndex: number }>,
) {
  const quizItem = [...accessibleItems].reverse().find(({ item }) => item.type === 'quiz')?.item

  if (!quizItem || quizItem.type !== 'quiz') {
    return undefined
  }

  if (quizItem.data.response === null) {
    return null
  }

  return quizItem.data.response ?? "J'ai terminé"
}

export function readStoredProgress(courseSlug: string, turns: ChatTurn[]): StoredCourseChatProgress | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(getCourseChatStorageKey(courseSlug))

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredCourseChatProgress

    if (parsedValue.version !== courseChatStorageVersion) {
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
      version: courseChatStorageVersion,
      answersByTurnId,
      quizStatesByItemId,
      revealedTurnCount: Math.max(0, Math.min(parsedValue.revealedTurnCount ?? 0, turns.length)),
    }
  } catch {
    return null
  }
}

export function getInitialConfirmedItemIds(
  courseSlug: string,
  turns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  quizStatesByItemId: Record<string, QuizStateValue>,
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

export function getInitialRevealedItemCounts(
  courseSlug: string,
  turns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  confirmedItemIds: Record<string, boolean>,
  quizStatesByItemId: Record<string, QuizStateValue>,
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

export function getCurrentProgressPercent(
  courseSlug: string,
  accessibleTurns: ChatTurn[],
  revealedTurnCount: number,
  answersByTurnId: Record<string, string>,
  confirmedItemIds: Record<string, boolean>,
  quizStatesByItemId: Record<string, QuizStateValue>,
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
