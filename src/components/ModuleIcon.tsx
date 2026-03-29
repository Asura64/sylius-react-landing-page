import type { SVGProps } from 'react'
import {
  Blocks,
  CheckCheck,
  Grid2x2,
  PackageOpen,
  PuzzleIcon,
  Settings2,
  Workflow,
  Webhook,
} from 'lucide-react'

const iconMap = {
  package: PackageOpen,
  settings: Settings2,
  blocks: Blocks,
  grid: Grid2x2,
  webhook: Webhook,
  workflow: Workflow,
  check: CheckCheck,
  component: PuzzleIcon,
}

export type ModuleIconName = keyof typeof iconMap

type ModuleIconProps = SVGProps<SVGSVGElement> & {
  name: string
}

export function ModuleIcon({ name, ...props }: ModuleIconProps) {
  const Icon = iconMap[name as ModuleIconName] ?? PackageOpen

  return <Icon {...props} />
}
