import { useEffect, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { ModuleTheme } from '../types/content'

const colorMap = {
  primary: '#1100bc',
  secondary: '#7547ab',
  tertiary: '#005569',
  danger: '#ba1a1a',
}

type RgbColor = {
  r: number
  g: number
  b: number
}

type UseTimelineProgressParams = {
  timelineRef: RefObject<HTMLElement | null>
  itemRefs: MutableRefObject<Array<HTMLElement | null>>
  itemCount: number
}

export type TimelineState = {
  activeIndex: number
  progressPercent: number
  gradient: string
}

function hexToRgb(hex: string): RgbColor {
  const value = hex.replace('#', '')
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function mixColor(from: string, to: string, ratio: number): string {
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  const clamp = Math.max(0, Math.min(1, ratio))

  const r = Math.round(start.r + (end.r - start.r) * clamp)
  const g = Math.round(start.g + (end.g - start.g) * clamp)
  const b = Math.round(start.b + (end.b - start.b) * clamp)

  return `rgb(${r}, ${g}, ${b})`
}

export function useTimelineProgress({
  timelineRef,
  itemRefs,
  itemCount,
}: UseTimelineProgressParams): TimelineState {
  const [state, setState] = useState<TimelineState>({
    activeIndex: 0,
    progressPercent: 0,
    gradient: 'linear-gradient(180deg, #1100bc, #7547ab)',
  })

  useEffect(() => {
    const updateTimeline = () => {
      const timeline = timelineRef.current
      const items = itemRefs.current.slice(0, itemCount)

      if (!timeline || !items.length) {
        return
      }

      const viewportMiddle = window.innerHeight * 0.52
      const timelineRect = timeline.getBoundingClientRect()
      const total = Math.max(timelineRect.height, 1)
      const progress = Math.max(0, Math.min(1, (viewportMiddle - timelineRect.top) / total))

      let activeIndex = 0
      items.forEach((item, index) => {
        if (!item) {
          return
        }

        const rect = item.getBoundingClientRect()
        if (viewportMiddle >= rect.top + rect.height * 0.35) {
          activeIndex = index
        }
      })

      const currentItem = items[activeIndex]
      const nextItem = items[Math.min(activeIndex + 1, items.length - 1)]
      const currentTheme = (currentItem?.dataset.theme as ModuleTheme | undefined) || 'primary'
      const nextTheme = nextItem?.dataset.theme || currentTheme
      const currentColor = colorMap[currentTheme] || colorMap.primary
      const nextColor = colorMap[nextTheme as ModuleTheme] || currentColor
      const currentRect = currentItem?.getBoundingClientRect()
      const localProgress = currentRect
        ? Math.max(0, Math.min(1, (viewportMiddle - currentRect.top) / Math.max(currentRect.height, 1)))
        : 0

      setState({
        activeIndex,
        progressPercent: progress * 100,
        gradient: `linear-gradient(180deg, ${mixColor(currentColor, nextColor, localProgress)}, ${nextColor})`,
      })
    }

    updateTimeline()
    window.addEventListener('scroll', updateTimeline, { passive: true })
    window.addEventListener('resize', updateTimeline)

    return () => {
      window.removeEventListener('scroll', updateTimeline)
      window.removeEventListener('resize', updateTimeline)
    }
  }, [itemCount, itemRefs, timelineRef])

  return state
}
