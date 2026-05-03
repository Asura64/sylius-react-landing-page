import globalContent from '../data/global.json'
import type {
  ArchitectureNode,
  CourseItem,
  DumpItemData,
  DumpValue,
  InfoItemData,
  QuizItemData,
  UnorderedListItemData,
  YamlItemData,
  YamlValue,
} from '../types/content'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function resolveGlobalPlaceholder(path: string) {
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

function renderExternalLinkIcon() {
  return `
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 17 17 7"></path>
      <path d="M7 7h10v10"></path>
    </svg>
  `
}

function renderCopyIcon(size = 14) {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `
}

function renderExpandIcon() {
  return `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m15 3 6 6"></path>
      <path d="M21 3h-6v6"></path>
      <path d="m9 21-6-6"></path>
      <path d="M3 21h6v-6"></path>
    </svg>
  `
}

function renderCircleAlertIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 8v4"></path>
      <path d="M12 16h.01"></path>
    </svg>
  `
}

function renderFolderIcon() {
  return `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    </svg>
  `
}

function renderFileIcon() {
  return `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <path d="M14 2v6h6"></path>
    </svg>
  `
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

function renderDump(data: DumpItemData) {
  return `
    <section class="course-item-dump" aria-label="${escapeHtml(data.label ?? 'Dump')}">
      ${data.label ? `<p class="course-item-dump__label">${escapeHtml(data.label)}</p>` : ''}
      <div class="course-item-dump__panel">
        ${renderDumpNode(data.value, undefined, data.expanded ?? true)}
      </div>
    </section>
  `
}

type YamlLine = {
  comment?: string
  indent: string
  key?: string
  prefix?: string
  scalar?: string
}

function getYamlScalarClassName(value: string) {
  const trimmedValue = value.trim()

  if (
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) ||
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"'))
  ) {
    return 'course-item-yaml__scalar course-item-yaml__scalar--string'
  }

  return 'course-item-yaml__scalar course-item-yaml__scalar--plain'
}

function stringifyYamlScalar(value: Exclude<YamlValue, object>) {
  if (typeof value === 'string') {
    return value
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function getInlineObjectScalar(value: YamlValue) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const entries = Object.entries(value)

  if (entries.length !== 1) {
    return undefined
  }

  const [entryKey, entryValue] = entries[0]

  if (entryValue != null && typeof entryValue === 'object') {
    return undefined
  }

  return `{${entryKey}: ${stringifyYamlScalar(entryValue)}}`
}

function buildYamlLines(value: YamlValue, depth = 0, key?: string, prefix = ''): YamlLine[] {
  const indent = '  '.repeat(depth)

  if (Array.isArray(value)) {
    if (key) {
      if (value.length === 0) {
        return [{ indent, key, scalar: '[]' }]
      }

      return [
        { indent, key },
        ...value.flatMap((item) => {
          const inlineObjectScalar = getInlineObjectScalar(item)

          if (inlineObjectScalar) {
            return [{ indent: '  '.repeat(depth + 1), prefix: '- ', scalar: inlineObjectScalar }]
          }

          return buildYamlLines(item, depth + 1, undefined, '- ')
        }),
      ]
    }

    if (value.length === 0) {
      return [{ indent, prefix, scalar: '[]' }]
    }

    return value.flatMap((item) => {
      const inlineObjectScalar = getInlineObjectScalar(item)

      if (inlineObjectScalar) {
        return [{ indent, prefix: '- ', scalar: inlineObjectScalar }]
      }

      return buildYamlLines(item, depth, undefined, '- ')
    })
  }

  if (value != null && typeof value === 'object') {
    const entries = Object.entries(value)

    if (key) {
      if (entries.length === 0) {
        return [{ indent, key, scalar: '{}' }]
      }

      return [
        { indent, key },
        ...entries.flatMap(([childKey, childValue]) => {
          if (childKey.startsWith('__comment')) {
            return [
              {
                indent: '  '.repeat(depth + 1),
                comment: `# ${stringifyYamlScalar(childValue as Exclude<YamlValue, object>)}`,
              },
            ]
          }

          return buildYamlLines(childValue, depth + 1, childKey)
        }),
      ]
    }

    if (entries.length === 0) {
      return [{ indent, prefix, scalar: '{}' }]
    }

    if (prefix) {
      const [firstEntryKey, firstEntryValue] = entries[0]
      const firstLine =
        firstEntryValue != null && typeof firstEntryValue === 'object'
          ? [{ indent, prefix, key: firstEntryKey }]
          : [{ indent, prefix, key: firstEntryKey, scalar: stringifyYamlScalar(firstEntryValue) }]

      const nestedFirstEntry =
        firstEntryValue != null && typeof firstEntryValue === 'object'
          ? buildYamlLines(firstEntryValue, depth + 2)
          : []

      const remainingLines = entries.slice(1).flatMap(([childKey, childValue]) => {
        if (childKey.startsWith('__comment')) {
          return [
            {
              indent: '  '.repeat(depth + 2),
              comment: `# ${stringifyYamlScalar(childValue as Exclude<YamlValue, object>)}`,
            },
          ]
        }

        return buildYamlLines(childValue, depth + 2, childKey)
      })

      return [...firstLine, ...nestedFirstEntry, ...remainingLines]
    }

    return entries.flatMap(([childKey, childValue]) => {
      if (childKey.startsWith('__comment')) {
        return [{ indent, comment: `# ${stringifyYamlScalar(childValue as Exclude<YamlValue, object>)}` }]
      }

      return buildYamlLines(childValue, depth, childKey)
    })
  }

  if (key) {
    return [{ indent, key, scalar: stringifyYamlScalar(value) }]
  }

  return [{ indent, prefix, scalar: stringifyYamlScalar(value) }]
}

function renderYamlLine(line: YamlLine, index: number) {
  if (!line.indent && !line.prefix && !line.key && !line.scalar && !line.comment) {
    return `<span class="course-item-yaml__line" aria-hidden="true">\u00A0</span>`
  }

  const inlineObjectMatch = !line.key && line.scalar ? line.scalar.match(/^\{([^:]+):\s*(.*)\}$/) : null
  const inlineObjectKey = inlineObjectMatch?.[1]
  const inlineObjectValue = inlineObjectMatch?.[2]

  return `
    <span class="course-item-yaml__line" data-line-index="${index}">
      ${line.indent ? `<span class="course-item-yaml__indent">${escapeHtml(line.indent)}</span>` : ''}
      ${line.prefix ? `<span class="course-item-yaml__prefix">${escapeHtml(line.prefix)}</span>` : ''}
      ${
        line.key
          ? `
            <span class="course-item-yaml__key">${escapeHtml(line.key)}</span>
            <span class="course-item-yaml__punctuation">:</span>
            ${
              line.scalar
                ? ` <span class="${getYamlScalarClassName(line.scalar)}">${escapeHtml(line.scalar)}</span>`
                : ''
            }
          `
          : inlineObjectKey && inlineObjectValue
            ? `
              <span class="course-item-yaml__punctuation">{</span>
              <span> </span>
              <span class="course-item-yaml__key">${escapeHtml(inlineObjectKey)}</span>
              <span class="course-item-yaml__punctuation">:</span>
              <span> </span>
              <span class="${getYamlScalarClassName(inlineObjectValue)}">${escapeHtml(inlineObjectValue)}</span>
              <span> </span>
              <span class="course-item-yaml__punctuation">}</span>
            `
            : line.scalar
              ? `<span class="${getYamlScalarClassName(line.scalar)}">${escapeHtml(line.scalar)}</span>`
              : ''
      }
      ${line.comment ? `<span class="course-item-yaml__comment">${escapeHtml(line.comment)}</span>` : ''}
    </span>
  `
}

function renderYaml(data: YamlItemData) {
  const lines = [
    ...(data.label ? [{ indent: '', comment: `# ${data.label}` }, { indent: '' }] : []),
    ...buildYamlLines(data.value),
  ]
  const copyable = data.copyable ?? true

  return `
    <section class="course-item-yaml" aria-label="${escapeHtml(data.label ?? 'YAML')}">
      <div class="course-item-yaml__frame">
        ${
          copyable
            ? `
              <button
                class="course-item-yaml__copy"
                type="button"
                aria-label="Copier le contenu YAML"
                title="Copier"
              >
                <span class="course-item-yaml__copy-icon" aria-hidden="true">${renderCopyIcon(15)}</span>
              </button>
            `
            : ''
        }
        <pre class="course-item-yaml__panel"><code>${lines.map((line, index) => renderYamlLine(line, index)).join('')}</code></pre>
      </div>
    </section>
  `
}

function renderArchitectureTree(tree: ArchitectureNode, level = 0) {
  return `
    <ul class="course-item-architecture__tree${level === 0 ? ' course-item-architecture__tree--root' : ''}">
      ${Object.entries(tree)
        .map(([name, node]) => {
          const isDirectory = node !== null
          const hasChildren = isDirectory && Object.keys(node).length > 0

          return `
            <li class="course-item-architecture__entry">
              <div class="course-item-architecture__row">
                <span class="course-item-architecture__icon${isDirectory ? ' course-item-architecture__icon--directory' : ' course-item-architecture__icon--file'}" aria-hidden="true">
                  ${isDirectory ? renderFolderIcon() : renderFileIcon()}
                </span>
                <span class="course-item-architecture__name">${escapeHtml(name)}</span>
              </div>
              ${hasChildren ? renderArchitectureTree(node, level + 1) : ''}
            </li>
          `
        })
        .join('')}
    </ul>
  `
}

function renderArchitecture(data: ArchitectureNode) {
  return `<div class="course-item-architecture">${renderArchitectureTree(data)}</div>`
}

function renderImage(src: string, alt: string) {
  return `
    <figure class="course-item-image">
      <img class="course-item-image__media" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />
      <button
        class="course-item-image__fullscreen-trigger"
        type="button"
        aria-label="Afficher l'image en plein écran"
      >
        ${renderExpandIcon()}
      </button>
    </figure>
  `
}

function renderInfo(data: InfoItemData) {
  return `
    <aside class="course-item-info">
      <h3 class="course-item-info__heading">
        <span class="course-item-info__icon" aria-hidden="true">${renderCircleAlertIcon()}</span>
        <span>${escapeHtml(data.heading)}</span>
      </h3>
      <p class="course-item-info__content">${renderInlineRichTextHtml(data.content)}</p>
    </aside>
  `
}

function renderUnorderedList(data: UnorderedListItemData) {
  return `
    <div class="course-item-ul">
      ${data.title ? `<p class="course-item-ul__title">${renderInlineRichTextHtml(data.title)}</p>` : ''}
      <ul class="course-item-ul__list">
        ${data.items
          .map((item) => `<li class="course-item-ul__item">${renderInlineRichTextHtml(item)}</li>`)
          .join('')}
      </ul>
    </div>
  `
}

function renderQuizPlaceholder(data: QuizItemData) {
  return `
    <section class="course-item-quiz" aria-label="Quiz">
      <p class="course-item-quiz__question">${escapeHtml(data.question)}</p>
    </section>
  `
}

export function renderCourseItemHtml(item: CourseItem) {
  if (item.type === 'h2') {
    return `<h2 class="course-item-h2">${escapeHtml(item.data)}</h2>`
  }

  if (item.type === 'p') {
    return `<p class="course-item-paragraph">${renderInlineRichTextHtml(item.data)}</p>`
  }

  if (item.type === 'img') {
    return renderImage(item.data.src, item.data.alt)
  }

  if (item.type === 'info') {
    return renderInfo(item.data)
  }

  if (item.type === 'dump') {
    return renderDump(item.data)
  }

  if (item.type === 'yaml') {
    return renderYaml(item.data)
  }

  if (item.type === 'ul') {
    return renderUnorderedList(item.data)
  }

  if (item.type === 'architecture') {
    return renderArchitecture(item.data)
  }

  return renderQuizPlaceholder(item.data)
}
