import { Controller } from '@hotwired/stimulus'
import type { ChatTurn, Course } from '../types/content'
import { getCourseSequenceData, getCourses, getModules } from '../lib/contentData'
import {
  clearCourseChatProgress,
  courseChatTypingDelay,
  courseProgressChangedEventName,
  getAccessibleTurnItems,
  getAccessibleTurns,
  getChatItemId,
  getCurrentProgressPercent,
  getInitialConfirmedItemIds,
  getInitialRevealedItemCounts,
  getCourseItemTypingDelay,
  getMinimumCourseItemTypingDelay,
  getQuizCompletionResponse,
  hasCourseChatProgress,
  isCourseChatCompleted,
  readStoredProgress,
  writeStoredProgress,
  type QuizStateValue,
} from '../lib/courseChatState'

type CourseLink = Pick<Course, 'slug' | 'title'> | null

type State = {
  answersByTurnId: Record<string, string>
  confirmedItemIds: Record<string, boolean>
  hasStarted: boolean
  isMenuOpen: boolean
  isResetModalOpen: boolean
  isTyping: boolean
  quizStatesByItemId: Record<string, QuizStateValue>
  revealedItemCountByTurnId: Record<string, number>
  revealedTurnCount: number
}

function escapeHtml(value: string | undefined): string {
  value = value ? value : ''
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderCheckIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"></path>
    </svg>
  `
}

function renderCopyIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `
}

function renderCrossIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m18 6-12 12"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `
}

function renderExpandIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m15 3 6 6"></path>
      <path d="M21 3h-6v6"></path>
      <path d="m9 21-6-6"></path>
      <path d="M3 21h6v-6"></path>
    </svg>
  `
}

function renderExternalLinkIcon() {
  return `
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 17 17 7"></path>
      <path d="M7 7h10v10"></path>
    </svg>
  `
}

function renderEllipsisIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="1.4"></circle>
      <circle cx="12" cy="12" r="1.4"></circle>
      <circle cx="12" cy="19" r="1.4"></circle>
    </svg>
  `
}

export default class extends Controller<HTMLElement> {
  static targets = ['mount']

  static values = {
    courseSlug: String,
  }

  declare readonly courseSlugValue: string
  declare readonly mountTarget: HTMLElement

  private fullscreenImage: { alt: string; src: string } | null = null
  private hasPendingTypingScroll = false
  private hasPriorityNextTypingDelay = false
  private hasLoadError = false
  private isReady = false
  private githubEndUrl: string | null = null
  private nextCourseLink: CourseLink = null
  private previousCompletionState = false
  private previousCourseLink: CourseLink = null
  private skills: string[] = []
  private state: State = {
    answersByTurnId: {},
    confirmedItemIds: {},
    hasStarted: false,
    isMenuOpen: false,
    isResetModalOpen: false,
    isTyping: false,
    quizStatesByItemId: {},
    revealedItemCountByTurnId: {},
    revealedTurnCount: 0,
  }
  private turns: ChatTurn[] = []
  private typingTimeout: number | null = null
  private readonly handleWindowKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.fullscreenImage) {
        this.fullscreenImage = null
        this.render()
        return
      }

      if (this.state.isResetModalOpen) {
        this.state.isResetModalOpen = false
        this.render()
      }
    }
  }

  connect() {
    window.addEventListener('keydown', this.handleWindowKeydown)
    void this.loadCourse()
  }

  disconnect() {
    if (this.typingTimeout) {
      window.clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    window.removeEventListener('keydown', this.handleWindowKeydown)
  }

  handleClick(event: Event) {
    if (!this.isReady) {
      return
    }

    const target = event.target instanceof Element ? event.target : null

    if (!target) {
      return
    }

    const toggleMenu = target.closest<HTMLElement>('[data-course-chat-action="toggle-menu"]')

    if (toggleMenu) {
      this.state.isMenuOpen = !this.state.isMenuOpen
      this.render()
      return
    }

    const openReset = target.closest<HTMLElement>('[data-course-chat-action="open-reset"]')

    if (openReset) {
      this.state.isMenuOpen = false
      this.state.isResetModalOpen = true
      this.render()
      return
    }

    const closeReset = target.closest<HTMLElement>('[data-course-chat-action="close-reset"]')

    if (closeReset) {
      this.state.isResetModalOpen = false
      this.render()
      return
    }

    const closeResetBackdrop = target.closest<HTMLElement>('[data-course-chat-action="close-reset-backdrop"]')

    if (closeResetBackdrop && target === closeResetBackdrop) {
      this.state.isResetModalOpen = false
      this.render()
      return
    }

    const confirmReset = target.closest<HTMLElement>('[data-course-chat-action="confirm-reset"]')

    if (confirmReset) {
      clearCourseChatProgress(this.courseSlugValue)
      this.fullscreenImage = null
      this.state = {
        answersByTurnId: {},
        confirmedItemIds: {},
        hasStarted: false,
        isMenuOpen: false,
        isResetModalOpen: false,
        isTyping: false,
        quizStatesByItemId: {},
        revealedItemCountByTurnId: {},
        revealedTurnCount: 0,
      }
      this.previousCompletionState = false
      this.dispatchProgressChanged()
      this.render()
      return
    }

    const startCourse = target.closest<HTMLElement>('[data-course-chat-action="start-course"]')

    if (startCourse) {
      this.state.hasStarted = true
      this.persistState()
      this.render()
      this.scheduleNextStep()
      return
    }

    const answerButton = target.closest<HTMLElement>('[data-course-chat-action="answer"]')

    if (answerButton) {
      const turnId = answerButton.dataset.turnId
      const responseId = answerButton.dataset.responseId

      if (!turnId || !responseId || this.state.answersByTurnId[turnId]) {
        return
      }

      this.hasPendingTypingScroll = true
      this.hasPriorityNextTypingDelay = true
      this.state.answersByTurnId = {
        ...this.state.answersByTurnId,
        [turnId]: responseId,
      }
      this.persistState()
      this.render()
      this.scheduleNextStep()
      return
    }

    const confirmButton = target.closest<HTMLElement>('[data-course-chat-action="confirm-item"]')

    if (confirmButton) {
      const itemId = confirmButton.dataset.itemId

      if (!itemId || this.state.confirmedItemIds[itemId]) {
        return
      }

      this.hasPendingTypingScroll = true
      this.hasPriorityNextTypingDelay = true
      this.state.confirmedItemIds = {
        ...this.state.confirmedItemIds,
        [itemId]: true,
      }
      this.render()
      this.scheduleNextStep()
      return
    }

    const quizSubmit = target.closest<HTMLElement>('[data-course-chat-action="submit-quiz"]')

    if (quizSubmit) {
      const itemId = quizSubmit.dataset.itemId

      if (!itemId) {
        return
      }

      const item = this.findItemById(itemId)

      if (!item || item.type !== 'quiz') {
        return
      }

      const currentState = this.state.quizStatesByItemId[itemId] ?? {
        selectedIds: [],
        submitted: false,
        passed: false,
      }
      const passed = item.data.choices.every((choice) => {
        const isSelected = currentState.selectedIds.includes(choice.id)

        return choice.answer ? isSelected : !isSelected
      })
      const nextState: QuizStateValue = {
        selectedIds: currentState.selectedIds,
        submitted: true,
        passed,
      }

      if (passed && !currentState.passed) {
        this.hasPendingTypingScroll = true
      }

      this.state.quizStatesByItemId = {
        ...this.state.quizStatesByItemId,
        [itemId]: nextState,
      }
      this.persistState()
      this.render()
      this.scheduleNextStep()
      return
    }

    const inlineCopy = target.closest<HTMLElement>('.course-inline-copy')

    if (inlineCopy) {
      const text = inlineCopy.querySelector<HTMLElement>('.course-inline-copy__value')?.textContent?.trim()

      if (text) {
        void this.copyText(text, inlineCopy, 'course-inline-copy--copied', 'Copié')
      }

      return
    }

    const yamlCopy = target.closest<HTMLElement>('.course-item-yaml__copy')

    if (yamlCopy) {
      const yamlPanel = yamlCopy
        .closest('.course-item-yaml')
        ?.querySelector<HTMLElement>('.course-item-yaml__panel')
      const text = yamlPanel?.getAttribute('data-copy-text') ?? ''

      if (text.trim()) {
        void this.copyText(text, yamlCopy, 'course-item-yaml__copy--copied', 'Copié')
      }

      return
    }

    const fullscreenTrigger = target.closest<HTMLElement>('.course-item-image__fullscreen-trigger')

    if (fullscreenTrigger) {
      const image = fullscreenTrigger
        .closest('.course-item-image')
        ?.querySelector<HTMLImageElement>('.course-item-image__media')

      if (image) {
        this.fullscreenImage = {
          alt: image.alt,
          src: image.src,
        }
        this.render()
      }

      return
    }

    const closeFullscreen = target.closest<HTMLElement>('[data-course-chat-action="close-fullscreen"]')

    if (closeFullscreen) {
      this.fullscreenImage = null
      this.render()
      return
    }

    const fullscreenBackdrop = target.closest<HTMLElement>('[data-course-chat-action="close-fullscreen-backdrop"]')

    if (fullscreenBackdrop && target === fullscreenBackdrop) {
      this.fullscreenImage = null
      this.render()
    }
  }

  handleChange(event: Event) {
    if (!this.isReady) {
      return
    }

    const target = event.target instanceof HTMLInputElement ? event.target : null

    if (!target || target.dataset.courseChatAction !== 'toggle-quiz-choice') {
      return
    }

    const itemId = target.dataset.itemId
    const choiceId = target.dataset.choiceId

    if (!itemId || !choiceId) {
      return
    }

    const item = this.findItemById(itemId)

    if (!item || item.type !== 'quiz') {
      return
    }

    const currentState = this.state.quizStatesByItemId[itemId] ?? {
      selectedIds: [],
      submitted: false,
      passed: false,
    }

    if (currentState.passed) {
      return
    }

    let nextSelectedIds: string[]

    if (item.data.mode === 'radio') {
      nextSelectedIds = [choiceId]
    } else {
      nextSelectedIds = currentState.selectedIds.includes(choiceId)
        ? currentState.selectedIds.filter((currentId) => currentId !== choiceId)
        : [...currentState.selectedIds, choiceId]
    }

    this.state.quizStatesByItemId = {
      ...this.state.quizStatesByItemId,
      [itemId]: {
        selectedIds: nextSelectedIds,
        submitted: false,
        passed: false,
      },
    }
    this.persistState()
    this.render()
  }

  private async loadCourse() {
    try {
      const [modules, courses] = await Promise.all([getModules(), getCourses()])
      const courseSequence = getCourseSequenceData(this.courseSlugValue, modules, courses)

      if (!courseSequence || !this.element.isConnected) {
        return
      }

      this.turns = courseSequence.course.chat
      this.skills = courseSequence.course.skills
      this.githubEndUrl = courseSequence.course.github?.end ?? null
      this.previousCourseLink = courseSequence.previousCourse
        ? {
            slug: courseSequence.previousCourse.slug,
            title: courseSequence.previousCourse.title,
          }
        : null
      this.nextCourseLink = courseSequence.nextCourse
        ? {
            slug: courseSequence.nextCourse.slug,
            title: courseSequence.nextCourse.title,
          }
        : null
      this.restoreStateFromStorage()
      this.isReady = true
      this.render()
      this.scheduleNextStep()
    } catch {
      if (!this.element.isConnected) {
        return
      }

      this.hasLoadError = true
      this.render()
    }
  }

  private get accessibleTurns() {
    return getAccessibleTurns(this.courseSlugValue, this.turns, this.state.answersByTurnId)
  }

  private restoreStateFromStorage() {
    const storedProgress = readStoredProgress(this.courseSlugValue, this.turns)

    if (!storedProgress) {
      this.state.hasStarted = hasCourseChatProgress(this.courseSlugValue)
      return
    }

    const confirmedItemIds = getInitialConfirmedItemIds(
      this.courseSlugValue,
      this.turns,
      storedProgress.revealedTurnCount,
      storedProgress.answersByTurnId,
      storedProgress.quizStatesByItemId,
    )

    this.state = {
      answersByTurnId: storedProgress.answersByTurnId,
      confirmedItemIds,
      hasStarted: true,
      isMenuOpen: false,
      isResetModalOpen: false,
      isTyping: false,
      quizStatesByItemId: storedProgress.quizStatesByItemId,
      revealedItemCountByTurnId: getInitialRevealedItemCounts(
        this.courseSlugValue,
        this.turns,
        storedProgress.revealedTurnCount,
        storedProgress.answersByTurnId,
        confirmedItemIds,
        storedProgress.quizStatesByItemId,
      ),
      revealedTurnCount: storedProgress.revealedTurnCount,
    }
    this.previousCompletionState = isCourseChatCompleted(this.courseSlugValue, this.turns)
  }

  private scheduleNextStep() {
    if (this.typingTimeout) {
      window.clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    if (!this.state.hasStarted) {
      this.state.isTyping = false
      return
    }

    const accessibleTurns = this.accessibleTurns

    if (accessibleTurns.length === 0) {
      this.state.isTyping = false
      this.render()
      return
    }

    if (this.state.revealedTurnCount === 0) {
      const firstTurn = accessibleTurns[0]
      if (!firstTurn) {
        this.state.isTyping = false
        this.render()
        return
      }
      const firstAccessibleItem = getAccessibleTurnItems(
        this.courseSlugValue,
        firstTurn,
        this.state.answersByTurnId,
        this.state.confirmedItemIds,
        this.state.quizStatesByItemId,
      )[0]?.item
      const initialTypingDelay = firstAccessibleItem?.typingDelay ?? courseChatTypingDelay

      this.state.isTyping = true
      this.render()
      this.typingTimeout = window.setTimeout(() => {
        this.state.revealedTurnCount = 1
        this.state.revealedItemCountByTurnId = {
          [firstTurn.id]: 1,
        }
        this.state.isTyping = false
        this.persistState()
        this.render()
        this.scheduleNextStep()
      }, initialTypingDelay)
      return
    }

    const lastRevealedTurn = accessibleTurns[this.state.revealedTurnCount - 1]

    if (!lastRevealedTurn) {
      this.state.isTyping = false
      this.render()
      return
    }

    const accessibleItems = getAccessibleTurnItems(
      this.courseSlugValue,
      lastRevealedTurn,
      this.state.answersByTurnId,
      this.state.confirmedItemIds,
      this.state.quizStatesByItemId,
    )
    const revealedItemCount = this.state.revealedItemCountByTurnId[lastRevealedTurn.id] ?? 0
    const consumeNextTypingDelay = (defaultDelay: number) => {
      if (!this.hasPriorityNextTypingDelay) {
        return defaultDelay
      }

      this.hasPriorityNextTypingDelay = false

      return getMinimumCourseItemTypingDelay()
    }

    if (revealedItemCount < accessibleItems.length) {
      const previousItem = revealedItemCount > 0 ? accessibleItems[revealedItemCount - 1]?.item : undefined
      const nextItem = accessibleItems[revealedItemCount]?.item
      const nextItemTypingDelay = consumeNextTypingDelay(
        nextItem?.typingDelay ?? getCourseItemTypingDelay(previousItem),
      )

      this.state.isTyping = true
      this.render()
      this.typingTimeout = window.setTimeout(() => {
        this.state.revealedItemCountByTurnId = {
          ...this.state.revealedItemCountByTurnId,
          [lastRevealedTurn.id]: (this.state.revealedItemCountByTurnId[lastRevealedTurn.id] ?? 0) + 1,
        }
        this.state.isTyping = false
        this.persistState()
        this.render()
        this.scheduleNextStep()
      }, nextItemTypingDelay)
      return
    }

    const hasBlockingConfirm = accessibleItems.some(
      ({ item, itemIndex }) =>
        item.confirm && !this.state.confirmedItemIds[getChatItemId(lastRevealedTurn.id, itemIndex)],
    )
    const hasBlockingQuiz = accessibleItems.some(
      ({ item, itemIndex }) =>
        item.type === 'quiz' &&
        !this.state.quizStatesByItemId[getChatItemId(lastRevealedTurn.id, itemIndex)]?.passed,
    )
    const isWaitingForAnswer =
      Boolean(lastRevealedTurn.responses) &&
      this.state.answersByTurnId[lastRevealedTurn.id] == null

    if (
      hasBlockingConfirm ||
      hasBlockingQuiz ||
      isWaitingForAnswer ||
      this.state.revealedTurnCount >= accessibleTurns.length
    ) {
      this.state.isTyping = false
      this.render()
      return
    }

    const nextTurn = accessibleTurns[this.state.revealedTurnCount]
    const nextTurnFirstItem = nextTurn
      ? getAccessibleTurnItems(
          this.courseSlugValue,
          nextTurn,
          this.state.answersByTurnId,
          this.state.confirmedItemIds,
          this.state.quizStatesByItemId,
        )[0]?.item
      : undefined
    const previousItem = accessibleItems.at(-1)?.item
    const nextTurnTypingDelay = consumeNextTypingDelay(
      nextTurnFirstItem?.typingDelay ?? getCourseItemTypingDelay(previousItem),
    )

    if (!nextTurn) {
      this.state.isTyping = false
      this.render()
      return
    }

    this.state.isTyping = true
    this.render()
    this.typingTimeout = window.setTimeout(() => {
      this.state.revealedTurnCount += 1
      this.state.revealedItemCountByTurnId = {
        ...this.state.revealedItemCountByTurnId,
        [nextTurn.id]: 1,
      }
      this.state.isTyping = false
      this.persistState()
      this.render()
      this.scheduleNextStep()
    }, nextTurnTypingDelay)
  }

  private persistState() {
    if (!this.state.hasStarted || typeof window === 'undefined') {
      return
    }

    writeStoredProgress(this.courseSlugValue, {
      answersByTurnId: this.state.answersByTurnId,
      quizStatesByItemId: this.state.quizStatesByItemId,
      revealedTurnCount: this.state.revealedTurnCount,
    })
    this.dispatchProgressChanged()
  }

  private dispatchProgressChanged() {
    window.dispatchEvent(new CustomEvent(courseProgressChangedEventName))
  }

  private render() {
    this.mountTarget.replaceChildren()

    if (this.hasLoadError) {
      this.mountTarget.appendChild(this.createFragment(`
        <div class="course-page__locked">
          <p class="course-page__locked-title">Chargement impossible</p>
          <p class="course-page__locked-copy">
            Les données du cours n'ont pas pu être récupérées.
          </p>
        </div>
      `))
      return
    }

    if (!this.isReady) {
      return
    }

    if (this.state.hasStarted) {
      this.mountTarget.appendChild(this.buildOptions())
    }

    if (!this.state.hasStarted) {
      this.mountTarget.appendChild(this.createFragment(`
        <div class="course-page__message course-page__message--learner">
          <button class="course-page__start-button" type="button" data-course-chat-action="start-course">
            Rejoindre la conversation
          </button>
        </div>
      `))
      return
    }

    const transcript = document.createElement('section')
    transcript.className = 'course-chat'
    transcript.setAttribute('aria-label', 'Conversation de cours')

    const transcriptInner = document.createElement('div')
    transcriptInner.className = 'course-chat__transcript'
    transcript.appendChild(transcriptInner)

    this.renderTurns(transcriptInner)

    if (this.state.isTyping) {
      transcriptInner.appendChild(
        this.createFragment(`
          <div class="course-chat__message course-chat__message--mentor" data-course-chat-typing>
            <div class="course-chat__meta">
              ${this.renderAvatar('Patxi')}
            </div>
            <div class="course-chat__bubble course-chat__bubble--mentor course-chat__bubble--typing">
              <span class="course-chat__typing-dot"></span>
              <span class="course-chat__typing-dot"></span>
              <span class="course-chat__typing-dot"></span>
            </div>
          </div>
        `),
      )
    }

    this.mountTarget.appendChild(transcript)
    this.mountTarget.appendChild(this.buildProgressBlock())

    if (this.isChatCompleted()) {
      if (this.skills.length > 0) {
        this.mountTarget.appendChild(this.buildSkillsBlock())
      }

      if (this.githubEndUrl) {
        this.mountTarget.appendChild(this.buildGithubEndBlock())
      }

      const courseNav = this.buildCourseNav()

      if (courseNav) {
        this.mountTarget.appendChild(courseNav)
      }
    }

    if (this.state.isResetModalOpen) {
      this.mountTarget.appendChild(this.buildResetModal())
    }

    if (this.fullscreenImage) {
      this.mountTarget.appendChild(this.buildFullscreenModal())
    }

    this.afterRender()
  }

  private afterRender() {
    const transcript = this.mountTarget.querySelector<HTMLElement>('.course-chat__transcript')

    if (transcript) {
      transcript.scrollTo({
        top: transcript.scrollHeight,
        behavior: 'smooth',
      })
    }

    if (this.state.isTyping && this.hasPendingTypingScroll) {
      const typingMessage = this.mountTarget.querySelector<HTMLElement>('[data-course-chat-typing]')

      if (typingMessage) {
        window.requestAnimationFrame(() => {
          typingMessage.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          this.hasPendingTypingScroll = false
        })
      }
    }

    const isCompleted = this.isChatCompleted()

    if (isCompleted && !this.previousCompletionState) {
      const skillsBlock = this.mountTarget.querySelector<HTMLElement>('.course-page__skills')

      if (skillsBlock) {
        window.requestAnimationFrame(() => {
          skillsBlock.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        })
      }
    }

    this.previousCompletionState = isCompleted
  }

  private renderTurns(container: HTMLElement) {
    const accessibleTurns = this.accessibleTurns

    accessibleTurns.slice(0, this.state.revealedTurnCount).forEach((turn, turnIndex) => {
      const turnNode = document.createElement('div')
      turnNode.className = 'course-chat__turn'
      const previousTurn = turnIndex > 0 ? accessibleTurns[turnIndex - 1] : undefined
      const previousTurnAnswerId = previousTurn ? this.state.answersByTurnId[previousTurn.id] : undefined
      const previousTurnAccessibleItems = previousTurn
        ? getAccessibleTurnItems(
            this.courseSlugValue,
            previousTurn,
            this.state.answersByTurnId,
            this.state.confirmedItemIds,
            this.state.quizStatesByItemId,
          )
        : []
      const previousTurnShowedItemConfirmation = previousTurnAccessibleItems.some(
        ({ item, itemIndex }) =>
          item.confirm && Boolean(this.state.confirmedItemIds[getChatItemId(previousTurn!.id, itemIndex)]),
      )
      const previousTurnQuizPassed = previousTurnAccessibleItems.every(({ item, itemIndex }) => {
        if (item.type !== 'quiz') {
          return true
        }

        return Boolean(this.state.quizStatesByItemId[getChatItemId(previousTurn!.id, itemIndex)]?.passed)
      })
      const previousTurnShowedQuizCompletion =
        previousTurn !== undefined &&
        !previousTurnAnswerId &&
        previousTurnQuizPassed &&
        getQuizCompletionResponse(previousTurn, previousTurnAccessibleItems) != null
      const shouldShowMentorAvatar =
        !previousTurn ||
        previousTurn.author !== turn.author ||
        Boolean(previousTurnAnswerId) ||
        previousTurnShowedItemConfirmation ||
        previousTurnShowedQuizCompletion

      const answerId = this.state.answersByTurnId[turn.id]
      const answerLabel = answerId ? turn.responses?.[answerId] : undefined
      const accessibleItems = getAccessibleTurnItems(
        this.courseSlugValue,
        turn,
        this.state.answersByTurnId,
        this.state.confirmedItemIds,
        this.state.quizStatesByItemId,
      )
      const revealedItems = accessibleItems.slice(0, this.state.revealedItemCountByTurnId[turn.id] ?? 0)
      const isTurnFullyRevealed = revealedItems.length >= accessibleItems.length
      const isTurnConfirmationsAcknowledged = accessibleItems.every(
        ({ item, itemIndex }) =>
          !item.confirm || Boolean(this.state.confirmedItemIds[getChatItemId(turn.id, itemIndex)]),
      )
      const isTurnQuizPassed = accessibleItems.every(({ item, itemIndex }) => {
        if (item.type !== 'quiz') {
          return true
        }

        return Boolean(this.state.quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed)
      })
      const shouldShowQuizCompletion =
        !answerLabel &&
        isTurnFullyRevealed &&
        isTurnQuizPassed &&
        accessibleItems.some(({ item }) => item.type === 'quiz')
      const quizCompletionResponse = shouldShowQuizCompletion
        ? getQuizCompletionResponse(turn, accessibleItems)
        : undefined

      revealedItems.forEach(({ item, itemIndex }, revealedItemIndex) => {
        const message = document.createElement('div')
        message.className = 'course-chat__message course-chat__message--mentor'

        if (revealedItemIndex === 0 && shouldShowMentorAvatar) {
          message.appendChild(
            this.createFragment(`
              <div class="course-chat__meta">
                ${this.renderAvatar(turn.author)}
              </div>
            `),
          )
        }

        const bubble = document.createElement('div')
        bubble.className = 'course-chat__bubble course-chat__bubble--mentor'
        bubble.appendChild(this.buildCourseItemNode(turn.id, itemIndex, item))
        message.appendChild(bubble)
        turnNode.appendChild(message)

        if (item.confirm) {
          const itemId = getChatItemId(turn.id, itemIndex)

          if (this.state.confirmedItemIds[itemId]) {
            turnNode.appendChild(
              this.createFragment(`
                <div class="course-chat__message course-chat__message--learner">
                  <div class="course-chat__bubble course-chat__bubble--learner">
                    <p class="course-chat__answer">${escapeHtml(item.confirm)}</p>
                  </div>
                </div>
              `),
            )
          } else if (revealedItemIndex === revealedItems.length - 1) {
            turnNode.appendChild(
              this.createFragment(`
                <div class="course-chat__responses" aria-label="Confirmation">
                  <button
                    class="course-chat__response-button"
                    type="button"
                    data-course-chat-action="confirm-item"
                    data-item-id="${escapeHtml(itemId)}"
                  >
                    ${escapeHtml(item.confirm)}
                  </button>
                </div>
              `),
            )
          }
        }
      })

      if (answerLabel) {
        turnNode.appendChild(
          this.createFragment(`
            <div class="course-chat__message course-chat__message--learner">
              <div class="course-chat__bubble course-chat__bubble--learner">
                <p class="course-chat__answer">${escapeHtml(answerLabel)}</p>
              </div>
            </div>
          `),
        )
      } else if (shouldShowQuizCompletion && quizCompletionResponse != null) {
        turnNode.appendChild(
          this.createFragment(`
            <div class="course-chat__message course-chat__message--learner">
              <div class="course-chat__bubble course-chat__bubble--learner">
                <p class="course-chat__answer">${escapeHtml(quizCompletionResponse)}</p>
              </div>
            </div>
          `),
        )
      }

      if (turn.responses && !answerLabel && isTurnFullyRevealed && isTurnConfirmationsAcknowledged && isTurnQuizPassed) {
        const responses = Object.entries(turn.responses)
          .map(
            ([responseId, responseLabel]) => `
              <button
                class="course-chat__response-button"
                type="button"
                data-course-chat-action="answer"
                data-turn-id="${escapeHtml(turn.id)}"
                data-response-id="${escapeHtml(responseId)}"
              >
                ${escapeHtml(responseLabel)}
              </button>
            `,
          )
          .join('')

        turnNode.appendChild(
          this.createFragment(`
            <div class="course-chat__responses" aria-label="Réponses proposées">
              ${responses}
            </div>
          `),
        )
      }

      container.appendChild(turnNode)
    })
  }

  private buildCourseItemNode(turnId: string, itemIndex: number, item: ChatTurn['content'][number]) {
    if (item.type === 'quiz') {
      return this.createFragment(this.renderQuiz(item.data, getChatItemId(turnId, itemIndex)))
    }

    const template = document.getElementById(`course-item-template-${turnId}-${itemIndex}`) as HTMLTemplateElement | null

    if (!template) {
      return document.createTextNode('')
    }

    return template.content.cloneNode(true)
  }

  private renderQuiz(item: Extract<ChatTurn['content'][number], { type: 'quiz' }>['data'], itemId: string) {
    const currentState = this.state.quizStatesByItemId[itemId] ?? {
      selectedIds: [],
      submitted: false,
      passed: false,
    }
    const isMultiple = item.mode === 'checkbox'
    const choices = item.choices
      .map((choice, index) => {
        const isSelected = currentState.selectedIds.includes(choice.id)
        const isCorrect =
          currentState.submitted &&
          (isMultiple ? (choice.answer ? isSelected : !isSelected) : isSelected && choice.answer)
        const hasError =
          currentState.submitted &&
          (isMultiple ? (choice.answer ? !isSelected : isSelected) : isSelected && !choice.answer)

        return `
          <div class="course-item-quiz__choice${isSelected ? ' course-item-quiz__choice--selected' : ''}${isCorrect ? ' course-item-quiz__choice--correct' : ''}${hasError ? ' course-item-quiz__choice--error' : ''}">
            ${
              isCorrect || hasError
                ? `<span class="course-item-quiz__result-icon" aria-hidden="true">${isCorrect ? renderCheckIcon() : renderCrossIcon()}</span>`
                : ''
            }
            <label class="course-item-quiz__choice-main">
              <input
                class="course-item-quiz__input"
                type="${isMultiple ? 'checkbox' : 'radio'}"
                name="${isMultiple ? '' : `quiz-${escapeHtml(itemId)}`}"
                ${isSelected ? 'checked' : ''}
                ${currentState.passed ? 'disabled' : ''}
                data-course-chat-action="toggle-quiz-choice"
                data-item-id="${escapeHtml(itemId)}"
                data-choice-id="${escapeHtml(choice.id)}"
              />
              <span class="course-item-quiz__control" aria-hidden="true"></span>
              <span class="course-item-quiz__label">${escapeHtml(choice.label)}</span>
            </label>
            ${hasError ? `<p class="course-item-quiz__error">${escapeHtml(choice.onError)}</p>` : ''}
          </div>
        `
      })
      .join('')

    return `
      <section class="course-item-quiz" aria-label="Quiz">
        <p class="course-item-quiz__question">${escapeHtml(item.question)}</p>
        <div class="course-item-quiz__choices" role="group">
          <span class="course-item-quiz__mode">
            ${isMultiple ? 'Plusieurs réponses possibles' : 'Une seule réponse possible'}
          </span>
          ${choices}
        </div>
        <div class="course-item-quiz__footer">
          ${
            !currentState.passed
              ? `<button class="course-item-quiz__submit button button--primary" type="button" data-course-chat-action="submit-quiz" data-item-id="${escapeHtml(itemId)}">Valider</button>`
              : ''
          }
          ${currentState.submitted && currentState.passed ? '<p class="course-item-quiz__success">Quiz validé.</p>' : ''}
        </div>
      </section>
    `
  }

  private buildOptions() {
    return this.createFragment(`
      <div class="course-page__options">
        <button
          class="course-page__options-trigger"
          type="button"
          aria-haspopup="menu"
          aria-expanded="${this.state.isMenuOpen ? 'true' : 'false'}"
          aria-label="Options du chat"
          data-course-chat-action="toggle-menu"
        >
          ${renderEllipsisIcon()}
        </button>
        ${
          this.state.isMenuOpen
            ? `
              <div class="course-page__options-menu" role="menu">
                <button
                  class="course-page__options-action"
                  type="button"
                  role="menuitem"
                  data-course-chat-action="open-reset"
                >
                  Recommencer
                </button>
              </div>
            `
            : ''
        }
      </div>
    `)
  }

  private buildProgressBlock() {
    const progressPercent = getCurrentProgressPercent(
      this.courseSlugValue,
      this.accessibleTurns,
      this.state.revealedTurnCount,
      this.state.answersByTurnId,
      this.state.confirmedItemIds,
      this.state.quizStatesByItemId,
      this.state.revealedItemCountByTurnId,
    )
    const isCompleted = this.isChatCompleted()

    return this.createFragment(`
      <div
        class="course-page__chat-progress${isCompleted ? ' course-page__chat-progress--completed' : ''}"
        style="--course-progress: ${progressPercent}%"
      >
        <span class="course-page__chat-progress-ring" aria-hidden="true">
          <span class="course-page__chat-progress-value">${progressPercent}%</span>
        </span>
        <div class="course-page__chat-progress-content">
          <p class="course-page__chat-progress-title">Progression du cours</p>
          <p class="course-page__chat-progress-copy">
            ${
              isCompleted
                ? 'Ce cours est terminé. Vous pouvez le recommencer à tout moment.'
                : 'Votre avancement se met à jour au fil de la conversation.'
            }
          </p>
          <button
            class="course-page__chat-progress-reset"
            type="button"
            data-course-chat-action="open-reset"
          >
            Recommencer ce cours
          </button>
        </div>
      </div>
    `)
  }

  private buildSkillsBlock() {
    const skills = this.skills
      .map((skill) => `<li class="course-page__skills-item">${escapeHtml(skill)}</li>`)
      .join('')

    return this.createFragment(`
      <div class="course-page__skills">
        <p class="course-page__skills-title">Ce que vous avez appris</p>
        <ul class="course-page__skills-list">${skills}</ul>
      </div>
    `)
  }

  private buildGithubEndBlock() {
    if (!this.githubEndUrl) {
      return document.createDocumentFragment()
    }

    return this.createFragment(`
      <div class="course-page__github-note">
        <p class="course-page__github-note-title">&lt Code final &gt</p>
        <p class="course-page__github-note-copy">
          <a href="${escapeHtml(this.githubEndUrl)}" target="_blank" rel="noreferrer">
            <span>Lien GitHub</span>
            ${renderExternalLinkIcon()}
          </a>
        </p>
      </div>
    `)
  }

  private buildCourseNav() {
    if (!this.previousCourseLink && !this.nextCourseLink) {
      return null
    }

    return this.createFragment(`
      <div class="course-page__course-nav">
        ${
          this.nextCourseLink
            ? `
              <div class="course-page__course-nav-card course-page__course-nav-card--next">
                <p class="course-page__course-nav-eyebrow">Cours suivant</p>
                <p class="course-page__course-nav-title">${escapeHtml(this.nextCourseLink.title)}</p>
                <a class="button button--primary" href="/cours/sylius/${escapeHtml(this.nextCourseLink.slug)}/">
                  Continuer
                </a>
              </div>
            `
            : ''
        }
        ${
          this.previousCourseLink
            ? `
              <div class="course-page__course-nav-card course-page__course-nav-card--previous">
                <p class="course-page__course-nav-eyebrow">Cours précédent</p>
                <p class="course-page__course-nav-title">${escapeHtml(this.previousCourseLink.title)}</p>
                <a class="button button--tertiary" href="/cours/sylius/${escapeHtml(this.previousCourseLink.slug)}/">
                  Revenir
                </a>
              </div>
            `
            : ''
        }
      </div>
    `)
  }

  private buildResetModal() {
    return this.createFragment(`
      <div class="course-page__modal-backdrop" data-course-chat-action="close-reset-backdrop">
        <div class="course-page__modal" role="dialog" aria-modal="true" aria-labelledby="chat-reset-title">
          <h2 id="chat-reset-title" class="course-page__modal-title">Réinitialiser la conversation</h2>
          <p class="course-page__modal-copy">
            Voulez-vous vraiment effacer votre progression et recommencer cette conversation
            depuis le début ?
          </p>
          <div class="course-page__modal-actions">
            <button class="button button--tertiary" type="button" data-course-chat-action="close-reset">
              Annuler
            </button>
            <button class="button button--primary" type="button" data-course-chat-action="confirm-reset">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    `)
  }

  private buildFullscreenModal() {
    if (!this.fullscreenImage) {
      return document.createDocumentFragment()
    }

    return this.createFragment(`
      <div class="course-item-image__fullscreen" data-course-chat-action="close-fullscreen-backdrop">
        <div class="course-item-image__fullscreen-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(this.fullscreenImage.alt)}">
          <button
            class="course-item-image__fullscreen-close"
            type="button"
            aria-label="Fermer l'image en plein écran"
            data-course-chat-action="close-fullscreen"
          >
            ${renderCrossIcon()}
          </button>
          <img class="course-item-image__fullscreen-media" src="${escapeHtml(this.fullscreenImage.src)}" alt="${escapeHtml(this.fullscreenImage.alt)}" />
        </div>
      </div>
    `)
  }

  private renderAvatar(name: string) {
    return `
      <div class="chat-avatar">
        <img class="chat-avatar__image" src="/resource/avatar/patxi.png" alt="" />
        <span class="chat-avatar__name">${escapeHtml(name)}</span>
      </div>
    `
  }

  private isChatCompleted() {
    const accessibleTurns = this.accessibleTurns
    const lastRevealedTurn =
      this.state.revealedTurnCount > 0 ? accessibleTurns[this.state.revealedTurnCount - 1] : undefined
    const lastRevealedTurnAccessibleItems = lastRevealedTurn
      ? getAccessibleTurnItems(
          this.courseSlugValue,
          lastRevealedTurn,
          this.state.answersByTurnId,
          this.state.confirmedItemIds,
          this.state.quizStatesByItemId,
        )
      : []
    const isWaitingForAnswer =
      Boolean(lastRevealedTurn?.responses) &&
      lastRevealedTurn &&
      this.state.answersByTurnId[lastRevealedTurn.id] == null

    return (
      this.state.revealedTurnCount >= accessibleTurns.length &&
      !this.state.isTyping &&
      !isWaitingForAnswer &&
      accessibleTurns.every((turn, index) => {
        if (index >= this.state.revealedTurnCount) {
          return false
        }

        const accessibleItems = getAccessibleTurnItems(
          this.courseSlugValue,
          turn,
          this.state.answersByTurnId,
          this.state.confirmedItemIds,
          this.state.quizStatesByItemId,
        )
        const areItemsFullyRevealed =
          (this.state.revealedItemCountByTurnId[turn.id] ?? 0) >= accessibleItems.length
        const areTurnConfirmationsAcknowledged = accessibleItems.every(
          ({ item, itemIndex }) =>
            !item.confirm || Boolean(this.state.confirmedItemIds[getChatItemId(turn.id, itemIndex)]),
        )
        const areTurnQuizzesPassed = accessibleItems.every(({ item, itemIndex }) => {
          if (item.type !== 'quiz') {
            return true
          }

          return Boolean(this.state.quizStatesByItemId[getChatItemId(turn.id, itemIndex)]?.passed)
        })

        return areItemsFullyRevealed && areTurnConfirmationsAcknowledged && areTurnQuizzesPassed
      }) &&
      lastRevealedTurnAccessibleItems.every(({ item, itemIndex }) => {
        if (item.type !== 'quiz') {
          return true
        }

        return Boolean(this.state.quizStatesByItemId[getChatItemId(lastRevealedTurn!.id, itemIndex)]?.passed)
      })
    )
  }

  private findItemById(itemId: string) {
    for (const turn of this.turns) {
      for (const [itemIndex, item] of turn.content.entries()) {
        if (getChatItemId(turn.id, itemIndex) === itemId) {
          return item
        }
      }
    }

    return undefined
  }

  private createFragment(html: string) {
    const template = document.createElement('template')
    template.innerHTML = html.trim()

    return template.content.cloneNode(true)
  }

  private async copyText(text: string, button: HTMLElement, copiedClassName: string, feedback: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      button.classList.add(copiedClassName)
      let cleanup: (() => void) | null = null

      if (button.classList.contains('course-inline-copy')) {
        let feedbackNode = button.querySelector<HTMLElement>('.course-inline-copy__feedback')

        if (!feedbackNode) {
          const status = button.querySelector<HTMLElement>('.course-inline-copy__status')

          if (status) {
            feedbackNode = document.createElement('span')
            feedbackNode.className = 'course-inline-copy__feedback'
            feedbackNode.textContent = feedback
            status.appendChild(feedbackNode)
          }
        }

        if (feedbackNode) {
          feedbackNode.textContent = feedback
        }
      } else if (button.classList.contains('course-item-yaml__copy')) {
        let feedbackNode = button.querySelector<HTMLElement>('.course-item-yaml__copy-feedback')

        if (!feedbackNode) {
          feedbackNode = document.createElement('span')
          feedbackNode.className = 'course-item-yaml__copy-feedback'
          feedbackNode.textContent = feedback
          button.appendChild(feedbackNode)
          cleanup = () => feedbackNode?.remove()
        } else {
          feedbackNode.textContent = feedback
        }
      }

      window.setTimeout(() => {
        button.classList.remove(copiedClassName)
        cleanup?.()
      }, 1600)
    } catch {
      button.classList.remove(copiedClassName)
    }
  }
}
