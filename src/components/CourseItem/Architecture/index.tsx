import { FileText, FolderOpen } from 'lucide-react'
import type { ArchitectureNode } from '../../../types/content'
import './style.scss'

type ArchitectureProps = {
  data: ArchitectureNode
}

type TreeProps = {
  level?: number
  tree: ArchitectureNode
}

function isDirectory(node: ArchitectureNode | null): node is ArchitectureNode {
  return node !== null
}

function Tree({ tree, level = 0 }: TreeProps) {
  const entries = Object.entries(tree)

  return (
    <ul className={`course-item-architecture__tree${level === 0 ? ' course-item-architecture__tree--root' : ''}`}>
      {entries.map(([name, node]) => (
        <li key={`${level}-${name}`} className="course-item-architecture__entry">
          <div className="course-item-architecture__row">
            <span
              className={`course-item-architecture__icon${isDirectory(node) ? ' course-item-architecture__icon--directory' : ' course-item-architecture__icon--file'}`}
              aria-hidden="true"
            >
              {isDirectory(node) ? <FolderOpen size={16} strokeWidth={2} /> : <FileText size={16} strokeWidth={2} />}
            </span>
            <span className="course-item-architecture__name">{name}</span>
          </div>

          {isDirectory(node) && Object.keys(node).length > 0 ? <Tree tree={node} level={level + 1} /> : null}
        </li>
      ))}
    </ul>
  )
}

export function Architecture({ data }: ArchitectureProps) {
  return (
    <div className="course-item-architecture">
      <Tree tree={data} />
    </div>
  )
}
