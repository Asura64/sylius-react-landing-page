import type { DumpItemData, DumpValue } from '../../../types/content'
import './style.scss'

type DumpProps = {
  data: DumpItemData
}

type DumpNodeProps = {
  value: DumpValue
  name?: string
  defaultOpen?: boolean
  depth?: number
}

function getValueKind(value: DumpValue): 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' {
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

function formatScalar(value: DumpValue) {
  if (typeof value === 'string') {
    return `"${value}"`
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function DumpNode({ value, name, defaultOpen = true, depth = 0 }: DumpNodeProps) {
  const kind = getValueKind(value)

  if (kind === 'string' || kind === 'number' || kind === 'boolean' || kind === 'null') {
    return (
      <div className="course-item-dump__row">
        {name ? <span className="course-item-dump__key">{name}</span> : null}
        <span className={`course-item-dump__value course-item-dump__value--${kind}`}>
          {formatScalar(value)}
        </span>
      </div>
    )
  }

  if (kind === 'array') {
    return (
      <details className="course-item-dump__group" open={defaultOpen}>
        <summary className="course-item-dump__summary">
          {name ? <span className="course-item-dump__key">{name}</span> : null}
          <span className="course-item-dump__meta">array:{value.length}</span>
        </summary>
        <div className="course-item-dump__children">
          {value.map((item, index) => (
            <DumpNode
              key={`${depth}-${index}`}
              value={item}
              name={String(index)}
              defaultOpen={depth < 1}
              depth={depth + 1}
            />
          ))}
        </div>
      </details>
    )
  }

  const entries = Object.entries(value)

  return (
    <details className="course-item-dump__group" open={defaultOpen}>
      <summary className="course-item-dump__summary">
        {name ? <span className="course-item-dump__key">{name}</span> : null}
        <span className="course-item-dump__meta">object:{entries.length}</span>
      </summary>
      <div className="course-item-dump__children">
        {entries.map(([entryName, entryValue]) => (
          <DumpNode
            key={`${depth}-${entryName}`}
            value={entryValue}
            name={entryName}
            defaultOpen={depth < 1}
            depth={depth + 1}
          />
        ))}
      </div>
    </details>
  )
}

export function Dump({ data }: DumpProps) {
  return (
    <section className="course-item-dump" aria-label={data.label ?? 'Dump'}>
      {data.label ? <p className="course-item-dump__label">{data.label}</p> : null}
      <div className="course-item-dump__panel">
        <DumpNode value={data.value} defaultOpen={data.expanded ?? true} />
      </div>
    </section>
  )
}
