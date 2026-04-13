import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import './InlineRichText.scss'

type InlineRichTextProps = {
  content: string
}

const inlineTokenPattern =
  /(\[copy\]([\s\S]*?)\[\/copy\]|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g

function CopyInline({ content }: { content: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

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
        await navigator.clipboard.writeText(content)
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
    <button
      className={`course-inline-copy${isCopied ? ' course-inline-copy--copied' : ''}`}
      type="button"
      onClick={handleCopy}
      aria-label={isCopied ? 'Contenu copié' : `Copier ${content}`}
      title={isCopied ? 'Copié' : 'Copier'}
    >
      <span className="course-inline-copy__value">{content}</span>
      <span className="course-inline-copy__status" aria-hidden="true">
        <span className="course-inline-copy__icon">{isCopied ? <Check size={14} /> : <Copy size={14} />}</span>
        {isCopied ? <span className="course-inline-copy__feedback">Copié</span> : null}
      </span>
    </button>
  )
}

export function InlineRichText({ content }: InlineRichTextProps) {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  match = inlineTokenPattern.exec(content)

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index))
    }

    const [fullMatch, , copyText, linkLabel, linkHref, strongText, emText] = match
    const key = `${match.index}-${fullMatch}`

    if (copyText) {
      nodes.push(<CopyInline key={key} content={copyText} />)
    } else if (linkLabel && linkHref) {
      nodes.push(
        <a key={key} href={linkHref} target="_blank" rel="noreferrer">
          <span>{linkLabel}</span>
          <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
        </a>,
      )
    } else if (strongText) {
      nodes.push(<strong key={key}>{strongText}</strong>)
    } else if (emText) {
      nodes.push(<em key={key}>{emText}</em>)
    }

    lastIndex = match.index + fullMatch.length
    match = inlineTokenPattern.exec(content)
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex))
  }

  return <>{nodes}</>
}
