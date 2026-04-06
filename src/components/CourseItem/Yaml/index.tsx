import type { YamlItemData } from '../../../types/content'
import './style.scss'

type YamlProps = {
  data: YamlItemData
}

function getScalarClassName(value: string) {
  const trimmedValue = value.trim()

  if (
    trimmedValue === 'true' ||
    trimmedValue === 'false' ||
    trimmedValue === 'null' ||
    /^-?\d+(\.\d+)?$/.test(trimmedValue)
  ) {
    return 'course-item-yaml__scalar course-item-yaml__scalar--accent'
  }

  if (
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) ||
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    trimmedValue.includes('%env(') ||
    trimmedValue.includes('%kernel.')
  ) {
    return 'course-item-yaml__scalar course-item-yaml__scalar--string'
  }

  return 'course-item-yaml__scalar'
}

function renderYamlLine(line: string, index: number) {
  if (!line.trim()) {
    return <span key={index} className="course-item-yaml__line" aria-hidden="true"></span>
  }

  const commentIndex = line.indexOf('#')
  const content = commentIndex >= 0 ? line.slice(0, commentIndex) : line
  const comment = commentIndex >= 0 ? line.slice(commentIndex) : ''
  const keyValueMatch = content.match(/^(\s*-?\s*)([^:#\n][^:\n]*?):\s*(.*)$/)

  if (keyValueMatch) {
    const [, prefix, key, value] = keyValueMatch

    return (
      <span key={index} className="course-item-yaml__line">
        <span className="course-item-yaml__indent">{prefix}</span>
        <span className="course-item-yaml__key">{key}</span>
        <span className="course-item-yaml__punctuation">:</span>
        {value ? (
          <>
            <span> </span>
            <span className={getScalarClassName(value)}>{value}</span>
          </>
        ) : null}
        {comment ? <span className="course-item-yaml__comment">{comment}</span> : null}
      </span>
    )
  }

  if (comment) {
    return (
      <span key={index} className="course-item-yaml__line">
        <span>{content}</span>
        <span className="course-item-yaml__comment">{comment}</span>
      </span>
    )
  }

  return (
    <span key={index} className="course-item-yaml__line">
      {line}
    </span>
  )
}

export function Yaml({ data }: YamlProps) {
  const lines = data.value.split('\n')

  return (
    <section className="course-item-yaml" aria-label={data.label ?? 'YAML'}>
      {data.label ? <p className="course-item-yaml__label">{data.label}</p> : null}
      <pre className="course-item-yaml__panel">
        <code>
          {lines.map((line, index) => renderYamlLine(line, index))}
        </code>
      </pre>
    </section>
  )
}
