import type { DumpItemData, DumpValue } from '../../types/content'
import type { DumpItem } from '../../types/content'
import type { CourseItemHandler } from '../index'
import { escapeHtml } from '../shared'

function getDumpValueKind(value: DumpValue): 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  if (typeof value === 'object') {
    return 'object'
  }

  return typeof value
}

function formatDumpScalar(value: DumpValue) {
  if (typeof value === 'string') {
    return `"${value}"`
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function renderDumpNode(value: DumpValue, name?: string, defaultOpen = true, depth = 0): string {
  const kind = getDumpValueKind(value)

  if (kind === 'string' || kind === 'number' || kind === 'boolean' || kind === 'null') {
    return `
      <div class="course-item-dump__row">
        ${name ? `<span class="course-item-dump__key">${escapeHtml(name)}</span>` : ''}
        <span class="course-item-dump__value course-item-dump__value--${kind}">
          ${escapeHtml(formatDumpScalar(value))}
        </span>
      </div>
    `
  }

  if (kind === 'array') {
    return `
      <details class="course-item-dump__group" ${defaultOpen ? 'open' : ''}>
        <summary class="course-item-dump__summary">
          ${name ? `<span class="course-item-dump__key">${escapeHtml(name)}</span>` : ''}
          <span class="course-item-dump__meta">array:${value.length}</span>
        </summary>
        <div class="course-item-dump__children">
          ${value
            .map((item, index) => renderDumpNode(item, String(index), depth < 1, depth + 1))
            .join('')}
        </div>
      </details>
    `
  }

  const entries = Object.entries(value)

  return `
    <details class="course-item-dump__group" ${defaultOpen ? 'open' : ''}>
      <summary class="course-item-dump__summary">
        ${name ? `<span class="course-item-dump__key">${escapeHtml(name)}</span>` : ''}
        <span class="course-item-dump__meta">object:${entries.length}</span>
      </summary>
      <div class="course-item-dump__children">
        ${entries
          .map(([entryName, entryValue]) => renderDumpNode(entryValue, entryName, depth < 1, depth + 1))
          .join('')}
      </div>
    </details>
  `
}

export function renderDump(data: DumpItemData) {
  return `
    <section class="course-item-dump" aria-label="${escapeHtml(data.label ?? 'Dump')}">
      ${data.label ? `<p class="course-item-dump__label">${escapeHtml(data.label)}</p>` : ''}
      <div class="course-item-dump__panel">
        ${renderDumpNode(data.value, undefined, data.expanded ?? true)}
      </div>
    </section>
  `
}

export const dumpCourseItemHandler: CourseItemHandler<DumpItem> = {
  render: (item) => renderDump(item.data),
  getReadingText: () => '',
}
