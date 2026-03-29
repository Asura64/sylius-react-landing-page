import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import { Document } from './Document'
import content from './data/trainingContent.json'
import type { TrainingContent } from './types/content'

type RenderDocumentParams = {
  bootstrapModule: string
  stylesheets: string[]
}

export function renderDocument({ bootstrapModule, stylesheets }: RenderDocumentParams): string {
  const { hero } = content as TrainingContent

  return `<!doctype html>${renderToStaticMarkup(
    <Document
      bootstrapModule={bootstrapModule}
      description={hero.description}
      stylesheets={stylesheets}
    >
      <App />
    </Document>,
  )}`
}
