import { Check, CircleX } from 'lucide-react'
import { useId, useState } from 'react'
import type { QuizChoice, QuizItemData } from '../../../types/content'
import './style.scss'

export type QuizState = {
  selectedIds: string[]
  submitted: boolean
  passed: boolean
}

type QuizProps = {
  data: QuizItemData
  onStateChange?: (state: QuizState) => void
  state?: QuizState
}

function isChoiceSelectionCorrect(choice: QuizChoice, selectedIds: string[]) {
  const isSelected = selectedIds.includes(choice.id)

  return choice.answer ? isSelected : !isSelected
}

function isQuizPassed(choices: QuizChoice[], selectedIds: string[]) {
  return choices.every((choice) => isChoiceSelectionCorrect(choice, selectedIds))
}

export function Quiz({ data, onStateChange, state }: QuizProps) {
  const groupId = useId()
  const [localState, setLocalState] = useState<QuizState>({
    selectedIds: [],
    submitted: false,
    passed: false,
  })
  const isMultiple = data.mode === 'checkbox'
  const currentState = state ?? localState
  const selectedIds = currentState.selectedIds
  const isSubmitted = currentState.submitted
  const isPassed = currentState.passed

  const updateState = (nextState: QuizState) => {
    if (state == null) {
      setLocalState(nextState)
    }

    onStateChange?.(nextState)
  }

  const handleChange = (choiceId: string) => {
    if (isPassed) {
      return
    }

    let nextSelectedIds: string[]

    if (!isMultiple) {
      nextSelectedIds = [choiceId]
    } else {
      nextSelectedIds = selectedIds.includes(choiceId)
        ? selectedIds.filter((currentId) => currentId !== choiceId)
        : [...selectedIds, choiceId]
    }

    updateState({
      selectedIds: nextSelectedIds,
      submitted: false,
      passed: false,
    })
  }

  const handleSubmit = () => {
    const passed = isQuizPassed(data.choices, selectedIds)

    updateState({
      selectedIds,
      submitted: true,
      passed,
    })
  }

  return (
    <section className="course-item-quiz" aria-label="Quiz">
      <p className="course-item-quiz__question">{data.question}</p>

      <div className="course-item-quiz__choices" role="group" aria-labelledby={groupId}>
        <span id={groupId} className="course-item-quiz__mode">
          {isMultiple ? 'Plusieurs réponses possibles' : 'Une seule réponse possible'}
        </span>

        {data.choices.map((choice) => {
          const isSelected = selectedIds.includes(choice.id)
          const isCorrect = isSubmitted && (isMultiple ? isChoiceSelectionCorrect(choice, selectedIds) : isSelected && choice.answer)
          const hasError = isSubmitted && (isMultiple ? !isChoiceSelectionCorrect(choice, selectedIds) : isSelected && !choice.answer)

          return (
            <div
              key={choice.id}
              className={`course-item-quiz__choice${isSelected ? ' course-item-quiz__choice--selected' : ''}${isCorrect ? ' course-item-quiz__choice--correct' : ''}${hasError ? ' course-item-quiz__choice--error' : ''}`}
            >
              {isCorrect || hasError ? (
                <span className="course-item-quiz__result-icon" aria-hidden="true">
                  {isCorrect ? <Check size={16} /> : <CircleX size={16} />}
                </span>
              ) : null}
              <label className="course-item-quiz__choice-main">
                <input
                  className="course-item-quiz__input"
                  type={isMultiple ? 'checkbox' : 'radio'}
                  name={isMultiple ? undefined : groupId}
                  checked={isSelected}
                  disabled={isPassed}
                  onChange={() => handleChange(choice.id)}
                />
                <span className="course-item-quiz__control" aria-hidden="true"></span>
                <span className="course-item-quiz__label">{choice.label}</span>
              </label>
              {hasError ? <p className="course-item-quiz__error">{choice.onError}</p> : null}
            </div>
          )
        })}
      </div>

      <div className="course-item-quiz__footer">
        {!isPassed ? (
          <button className="course-item-quiz__submit button button--primary" type="button" onClick={handleSubmit}>
            Valider
          </button>
        ) : null}
        {isSubmitted && isPassed ? <p className="course-item-quiz__success">Quiz validé.</p> : null}
      </div>
    </section>
  )
}
