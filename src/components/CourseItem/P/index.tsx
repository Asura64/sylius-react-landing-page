import { InlineRichText } from '../InlineRichText'
import './style.scss'

type ParagraphProps = {
  content: string
}

export function Paragraph({ content }: ParagraphProps) {
  return (
    <p className="course-item-paragraph">
      <InlineRichText content={content} />
    </p>
  )
}
