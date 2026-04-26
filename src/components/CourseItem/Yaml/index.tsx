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

function buildYamlLines(value: YamlValue, depth = 0, key?: string, prefix = ''): YamlLine[] {
  const indent = '  '.repeat(depth)

  if (Array.isArray(value)) {
    if (key) {
      if (value.length === 0) {
        return [{ indent, key, scalar: '[]' }]
      }

      return [
        { indent, key },
        ...value.flatMap((item) => buildYamlLines(item, depth + 1, undefined, '- ')),
      ]
    }

    if (value.length === 0) {
      return [{ indent, prefix, scalar: '[]' }]
    }

    return value.flatMap((item) => buildYamlLines(item, depth, undefined, '- '))
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
            <span>{isCopied ? 'Copié' : 'Copier'}</span>
          </button>
        ) : null}
        <pre className="course-item-yaml__panel">
        <code>{lines.map((line, index) => renderYamlLine(line, index))}</code>
        </pre>
      </div>
    </section>
  )
}
