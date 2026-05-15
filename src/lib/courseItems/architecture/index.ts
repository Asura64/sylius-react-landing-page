import type { ArchitectureNode } from '../../types/content'
import type { ArchitectureItem } from '../../types/content'
import type { CourseItemHandler } from '../index'
import { escapeHtml, renderFileIcon, renderFolderIcon } from '../shared'

function renderArchitectureTree(tree: ArchitectureNode, level = 0) {
  return `
    <ul class="course-item-architecture__tree${level === 0 ? ' course-item-architecture__tree--root' : ''}">
      ${Object.entries(tree)
        .map(([name, node]) => {
          const isDirectory = node !== null
          const hasChildren = isDirectory && Object.keys(node).length > 0

          return `
            <li class="course-item-architecture__entry">
              <div class="course-item-architecture__row">
                <span class="course-item-architecture__icon${isDirectory ? ' course-item-architecture__icon--directory' : ' course-item-architecture__icon--file'}" aria-hidden="true">
                  ${isDirectory ? renderFolderIcon() : renderFileIcon()}
                </span>
                <span class="course-item-architecture__name">${escapeHtml(name)}</span>
              </div>
              ${hasChildren ? renderArchitectureTree(node, level + 1) : ''}
            </li>
          `
        })
        .join('')}
    </ul>
  `
}

export function renderArchitecture(data: ArchitectureNode) {
  return `<div class="course-item-architecture">${renderArchitectureTree(data)}</div>`
}

export const architectureCourseItemHandler: CourseItemHandler<ArchitectureItem> = {
  render: (item) => renderArchitecture(item.data),
  getReadingText: () => '',
}
