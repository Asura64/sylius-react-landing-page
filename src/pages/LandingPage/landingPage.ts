import modulesJson from '../../data/modules.json'
import globalJson from '../../data/global.json'
import type { Module, ModuleDto, TrainingContent } from '../../types/content'

type LandingPageBase = Omit<TrainingContent, 'modules'>

function mapModuleDtoToModule(dto: ModuleDto): Module {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description,
    icon: dto.icon,
    theme: dto.theme,
    layout: dto.layout,
    art: dto.art,
  }
}

const baseContent = globalJson as LandingPageBase
const moduleDtos = modulesJson as ModuleDto[]

export const landingPage: TrainingContent = {
  ...baseContent,
  modules: moduleDtos.map(mapModuleDtoToModule),
}
