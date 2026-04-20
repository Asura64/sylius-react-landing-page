import { useEffect, useState } from 'react'
import { Expand, X } from 'lucide-react'
import type { ImageItemData } from '../../../types/content'
import './style.scss'

type ImageItemProps = {
  image: ImageItemData
}

export function ImageItem({ image }: ImageItemProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

  useEffect(() => {
    if (!isFullscreenOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreenOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreenOpen])

  return (
    <>
      <figure className="course-item-image">
        <img className="course-item-image__media" src={image.src} alt={image.alt} loading="lazy" />
        <button
          className="course-item-image__fullscreen-trigger"
          type="button"
          aria-label="Afficher l'image en plein écran"
          onClick={() => setIsFullscreenOpen(true)}
        >
          <Expand size={18} strokeWidth={2.2} />
        </button>
      </figure>

      {isFullscreenOpen ? (
        <div className="course-item-image__fullscreen" onClick={() => setIsFullscreenOpen(false)}>
          <div
            className="course-item-image__fullscreen-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={image.alt}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="course-item-image__fullscreen-close"
              type="button"
              aria-label="Fermer l'image en plein écran"
              onClick={() => setIsFullscreenOpen(false)}
            >
              <X size={20} strokeWidth={2.2} />
            </button>
            <img className="course-item-image__fullscreen-media" src={image.src} alt={image.alt} />
          </div>
        </div>
      ) : null}
    </>
  )
}
