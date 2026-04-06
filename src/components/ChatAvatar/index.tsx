import './style.scss'

type ChatAvatarProps = {
  imageSrc: string
  name: string
}

export function ChatAvatar({ imageSrc, name }: ChatAvatarProps) {
  return (
    <div className="chat-avatar">
      <img className="chat-avatar__image" src={imageSrc} alt="" />
      <span className="chat-avatar__name">{name}</span>
    </div>
  )
}
