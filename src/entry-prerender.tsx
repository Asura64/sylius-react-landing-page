import { renderToStaticMarkup } from 'react-dom/server'
import { Document } from './Document'
import content from './data/trainingContent.json'
import { LandingPage } from './pages/LandingPage'
import type { TrainingContent } from './types/content'

type RenderDocumentParams = {
  bootstrapModule: string
  stylesheets: string[]
}

export function renderDocument({ bootstrapModule, stylesheets }: RenderDocumentParams): string {
  const { hero } = content as TrainingContent

  return `<!doctype html>${renderToStaticMarkup(
    <Document
      assetBase="./"
      bootstrapModule={bootstrapModule}
      canonicalUrl="https://patxi.iparaguirre.fr/"
      description={hero.description}
      stylesheets={stylesheets}
      title="Formation Sylius 2 pour les devs : architecture, personnalisation et mentorat expert"
    >
      <LandingPage />
    </Document>,
  )}`
}
