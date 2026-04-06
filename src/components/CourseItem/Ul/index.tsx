import type { UnorderedListItemData } from '../../../types/content'
import { InlineRichText } from '../InlineRichText'
import './style.scss'

type UnorderedListProps = {
  data: UnorderedListItemData
}

export function UnorderedList({ data }: UnorderedListProps) {
  return (
    <div className="course-item-ul">
      {data.title ? (
        <p className="course-item-ul__title">
          <InlineRichText content={data.title} />
        </p>
      ) : null}
      <ul className="course-item-ul__list">
        {data.items.map((item, index) => (
          <li key={`${index}-${item}`} className="course-item-ul__item">
            <InlineRichText content={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}
