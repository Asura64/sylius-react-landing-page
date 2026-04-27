import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { YamlItemData, YamlValue } from '../../../types/content'
import './style.scss'

type YamlProps = {
  data: YamlItemData
}

type YamlLine = {
  comment?: string
  indent: string
  key?: string
  prefix?: string
  scalar?: string
}

function getScalarClassName(value: string) {
  const trimmedValue = value.trim()

  if (
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) ||
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"'))
  ) {
    return 'course-item-yaml__scalar course-item-yaml__scalar--string'
  }

  return 'course-item-yaml__scalar course-item-yaml__scalar--plain'
}

function stringifyScalar(value: Exclude<YamlValue, object>) {
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

  return `{${entryKey}: ${stringifyScalar(entryValue)}}`
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
            return [{ indent: '  '.repeat(depth + 1), comment: `# ${stringifyScalar(childValue as Exclude<YamlValue, object>)}` }]
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
          : [{ indent, prefix, key: firstEntryKey, scalar: stringifyScalar(firstEntryValue) }]

      const nestedFirstEntry =
        firstEntryValue != null && typeof firstEntryValue === 'object'
          ? buildYamlLines(firstEntryValue, depth + 2)
          : []

      const remainingLines = entries.slice(1).flatMap(([childKey, childValue]) => {
        if (childKey.startsWith('__comment')) {
          return [{ indent: '  '.repeat(depth + 2), comment: `# ${stringifyScalar(childValue as Exclude<YamlValue, object>)}` }]
        }

        return buildYamlLines(childValue, depth + 2, childKey)
      })

      return [...firstLine, ...nestedFirstEntry, ...remainingLines]
    }

    return entries.flatMap(([childKey, childValue]) => {
      if (childKey.startsWith('__comment')) {
        return [{ indent, comment: `# ${stringifyScalar(childValue as Exclude<YamlValue, object>)}` }]
      }

      return buildYamlLines(childValue, depth, childKey)
    })
  }

  if (key) {
    return [{ indent, key, scalar: stringifyScalar(value) }]
  }

  return [{ indent, prefix, scalar: stringifyScalar(value) }]
}

function renderYamlLine(line: YamlLine, index: number) {
  if (!line.indent && !line.prefix && !line.key && !line.scalar && !line.comment) {
    return (
      <span key={index} className="course-item-yaml__line" aria-hidden="true">
        {'\u00A0'}
      </span>
    )
  }

  const inlineObjectMatch = !line.key && line.scalar ? line.scalar.match(/^\{([^:]+):\s*(.*)\}$/) : null
  const inlineObjectKey = inlineObjectMatch?.[1]
  const inlineObjectValue = inlineObjectMatch?.[2]

  return (
    <span key={index} className="course-item-yaml__line">
      {line.indent ? <span className="course-item-yaml__indent">{line.indent}</span> : null}
      {line.prefix ? <span className="course-item-yaml__prefix">{line.prefix}</span> : null}
      {line.key ? (
        <>
          <span className="course-item-yaml__key">{line.key}</span>
          <span className="course-item-yaml__punctuation">:</span>
          {line.scalar ? (
            <>
              <span> </span>
              <span className={getScalarClassName(line.scalar)}>{line.scalar}</span>
            </>
          ) : null}
        </>
      ) : inlineObjectKey && inlineObjectValue ? (
        <>
          <span className="course-item-yaml__punctuation">{'{'}</span>
          <span> </span>
          <span className="course-item-yaml__key">{inlineObjectKey}</span>
          <span className="course-item-yaml__punctuation">:</span>
          <span> </span>
          <span className={getScalarClassName(inlineObjectValue)}>{inlineObjectValue}</span>
          <span> </span>
          <span className="course-item-yaml__punctuation">{'}'}</span>
        </>
      ) : line.scalar ? (
        <span className={getScalarClassName(line.scalar)}>{line.scalar}</span>
      ) : null}
      {line.comment ? <span className="course-item-yaml__comment">{line.comment}</span> : null}
    </span>
  )
}

export function Yaml({ data }: YamlProps) {
  const lines = [
    ...(data.label ? [{ indent: '', comment: `# ${data.label}` }, { indent: '' }] : []),
    ...buildYamlLines(data.value),
  ]
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const copyable = data.copyable ?? true
  const yamlContent = lines
    .map((line) => {
      const keyPart = line.key ? `${line.key}:${line.scalar ? ` ${line.scalar}` : ''}` : ''
      const scalarPart = !line.key && line.scalar ? line.scalar : ''

      return `${line.indent}${line.prefix ?? ''}${keyPart || scalarPart}${line.comment ?? ''}`
    })
    .join('\n')

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(yamlContent)
      } else {
        return
      }

      setIsCopied(true)

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsCopied(false)
        timeoutRef.current = null
      }, 1600)
    } catch {
      setIsCopied(false)
    }
  }

  return (
    <section className="course-item-yaml" aria-label={data.label ?? 'YAML'}>
      <div className="course-item-yaml__frame">
        {copyable ? (
          <button
            className={`course-item-yaml__copy${isCopied ? ' course-item-yaml__copy--copied' : ''}`}
            type="button"
            onClick={handleCopy}
            aria-label={isCopied ? 'Contenu YAML copié' : 'Copier le contenu YAML'}
            title={isCopied ? 'Copié' : 'Copier'}
          >
            <span className="course-item-yaml__copy-icon" aria-hidden="true">
              {isCopied ? <Check size={15} /> : <Copy size={15} />}
            </span>
            {isCopied ? <span>Copié</span> : ''}
          </button>
        ) : null}
        <pre className="course-item-yaml__panel">
        <code>{lines.map((line, index) => renderYamlLine(line, index))}</code>
        </pre>
      </div>
    </section>
  )
}
