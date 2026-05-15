import type { YamlItemData, YamlValue } from '../../types/content'
import type { YamlItem } from '../../types/content'
import type { CourseItemHandler } from '../index'
import { escapeHtml, renderCopyIcon } from '../shared'

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
          ? buildYamlLines(firstEntryValue, depth + 1)
          : []

      const remainingLines = entries.slice(1).flatMap(([childKey, childValue]) => {
        if (childKey.startsWith('__comment')) {
          return [
            {
              indent: '  '.repeat(depth + 1),
              comment: `# ${stringifyYamlScalar(childValue as Exclude<YamlValue, object>)}`,
            },
          ]
        }

        return buildYamlLines(childValue, depth + 1, childKey)
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
  let content = ''

  if (line.indent) {
    content += `<span class="course-item-yaml__indent">${escapeHtml(line.indent)}</span>`
  }

  if (line.prefix) {
    content += `<span class="course-item-yaml__prefix">${escapeHtml(line.prefix)}</span>`
  }

  if (line.key) {
    content += `<span class="course-item-yaml__key">${escapeHtml(line.key)}</span><span class="course-item-yaml__punctuation">:</span>`

    if (line.scalar) {
      content += ` <span class="${getYamlScalarClassName(line.scalar)}">${escapeHtml(line.scalar)}</span>`
    }
  } else if (inlineObjectKey && inlineObjectValue) {
    content += `<span class="course-item-yaml__punctuation">{</span> <span class="course-item-yaml__key">${escapeHtml(inlineObjectKey)}</span><span class="course-item-yaml__punctuation">:</span> <span class="${getYamlScalarClassName(inlineObjectValue)}">${escapeHtml(inlineObjectValue)}</span> <span class="course-item-yaml__punctuation">}</span>`
  } else if (line.scalar) {
    content += `<span class="${getYamlScalarClassName(line.scalar)}">${escapeHtml(line.scalar)}</span>`
  }

  if (line.comment) {
    content += `<span class="course-item-yaml__comment">${escapeHtml(line.comment)}</span>`
  }

  return `<span class="course-item-yaml__line" data-line-index="${index}">${content}</span>`
}

function renderYamlTextLine(line: YamlLine) {
  if (!line.indent && !line.prefix && !line.key && !line.scalar && !line.comment) {
    return ''
  }

  let content = ''

  if (line.comment) {
    return line.comment
  }

  content += line.indent ?? ''
  content += line.prefix ?? ''

  if (line.key) {
    content += `${line.key}:`

    if (line.scalar) {
      content += ` ${line.scalar}`
    }

    return content
  }

  if (line.scalar) {
    content += line.scalar
  }

  return content
}

export function renderYaml(data: YamlItemData) {
  const lines = [
    ...(data.label ? [{ indent: '', comment: `# ${data.label}` }, { indent: '' }] : []),
    ...buildYamlLines(data.value),
  ]
  const copyable = data.copyable ?? true
  const yamlText = lines.map(renderYamlTextLine).join('\n')

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
        <pre class="course-item-yaml__panel" data-copy-text="${escapeHtml(yamlText)}"><code>${lines.map((line, index) => renderYamlLine(line, index)).join('')}</code></pre>
      </div>
    </section>
  `
}

export const yamlCourseItemHandler: CourseItemHandler<YamlItem> = {
  render: (item) => renderYaml(item.data),
  getReadingText: () => '',
}
