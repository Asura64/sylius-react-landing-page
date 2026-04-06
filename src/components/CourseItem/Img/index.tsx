import type { ImageItemData } from '../../../types/content'
import './style.scss'

type ImageItemProps = {
  image: ImageItemData
}

export function ImageItem({ image }: ImageItemProps) {
  return (
    <figure className="course-item-image">
      <img className="course-item-image__media" src={image.src} alt={image.alt} loading="lazy" />
    </figure>
  )
}
