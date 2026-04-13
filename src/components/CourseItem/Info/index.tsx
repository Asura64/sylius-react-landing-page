import { CircleAlert } from 'lucide-react'
import type { InfoItemData } from '../../../types/content'
import { InlineRichText } from '../InlineRichText'
import './style.scss'

type InfoProps = {
  data: InfoItemData
}

export function Info({ data }: InfoProps) {
  return (
    <aside className="course-item-info">
      <h3 className="course-item-info__heading">
        <span className="course-item-info__icon" aria-hidden="true">
          <CircleAlert size={20} strokeWidth={2} />
        </span>
        <span>{data.heading}</span>
      </h3>
      <p className="course-item-info__content">
        <InlineRichText content={data.content} />
      </p>
    </aside>
  )
}
