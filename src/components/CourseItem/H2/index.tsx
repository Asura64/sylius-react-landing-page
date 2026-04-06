import './style.scss'

type H2Props = {
  content: string
}

export function H2({ content }: H2Props) {
  return <h2 className="course-item-h2">{content}</h2>
}
