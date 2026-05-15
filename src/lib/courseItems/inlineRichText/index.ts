import { loadPublicJsonSync } from '../../publicDataSync'
import { escapeHtml, renderCopyIcon, renderExternalLinkIcon } from '../shared'

function getGlobalContent() {
  return loadPublicJsonSync<Record<string, unknown>>('global.json')
}

function resolveGlobalPlaceholder(path: string) {
  const globalContent = getGlobalContent()
  const resolvedValue = path
    .split('.')
    .reduce<unknown>((currentValue, segment) => {
      if (currentValue == null || typeof currentValue !== 'object' || !(segment in currentValue)) {
        return undefined
      }

      return (currentValue as Record<string, unknown>)[segment]
    }, globalContent)

  return typeof resolvedValue === 'string' || typeof resolvedValue === 'number' ? String(resolvedValue) : undefined
}

function interpolateGlobalContent(content: string) {
  return content.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (fullMatch, path: string) => {
    const resolvedValue = resolveGlobalPlaceholder(path)

    return resolvedValue ?? fullMatch
  })
}

export function renderInlineRichTextHtml(content: string) {
  const resolvedContent = interpolateGlobalContent(content)
  const pattern =
    /(\[copy\]([\s\S]*?)\[\/copy\]|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g

  let lastIndex = 0
  let result = ''
  let match: RegExpExecArray | null

  pattern.lastIndex = 0
  match = pattern.exec(resolvedContent)

  while (match) {
    if (match.index > lastIndex) {
      result += escapeHtml(resolvedContent.slice(lastIndex, match.index))
    }

    const [fullMatch, , copyText, linkLabel, linkHref, codeText, strongText, emText] = match

    if (copyText) {
      result += `
        <button class="course-inline-copy" type="button" aria-label="Copier ${escapeHtml(copyText)}" title="Copier">
          <span class="course-inline-copy__value">${escapeHtml(copyText)}</span>
          <span class="course-inline-copy__status" aria-hidden="true">
            <span class="course-inline-copy__icon">${renderCopyIcon()}</span>
          </span>
        </button>
      `
    } else if (linkLabel && linkHref) {
      result += `
        <a href="${escapeHtml(linkHref)}" target="_blank" rel="noreferrer">
          <span>${escapeHtml(linkLabel)}</span>
          ${renderExternalLinkIcon()}
        </a>
      `
    } else if (codeText) {
      result += `<code class="course-inline-code">${escapeHtml(codeText)}</code>`
    } else if (strongText) {
      result += `<strong>${escapeHtml(strongText)}</strong>`
    } else if (emText) {
      result += `<em>${escapeHtml(emText)}</em>`
    }

    lastIndex = match.index + fullMatch.length
    match = pattern.exec(resolvedContent)
  }

  if (lastIndex < resolvedContent.length) {
    result += escapeHtml(resolvedContent.slice(lastIndex))
  }

  return result
}
