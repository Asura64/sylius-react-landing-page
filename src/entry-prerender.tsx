import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Document } from './Document'
import { LandingPage } from './pages/LandingPage'
import { landingPage } from './pages/LandingPage/landingPage'
import { CoursePageContent } from './pages/Course'
import { courses } from './pages/Course/courses'

type RenderDocumentParams = {
  assetBase: string
  bootstrapModule: string
  canonicalUrl: string
  description: string
  path: string
  stylesheets: string[]
  title: string
  children: ReactNode
}

type RenderStaticPageParams = {
  assetBase: string
  bootstrapModule: string
  canonicalUrl: string
  path: string
  stylesheets: string[]
}

function renderDocument({
  assetBase,
  bootstrapModule,
  canonicalUrl,
  children,
  description,
  path,
  stylesheets,
  title,
}: RenderDocumentParams): string {
  return `<!doctype html>${renderToStaticMarkup(
    <Document
      assetBase={assetBase}
      bootstrapModule={bootstrapModule}
      canonicalUrl={canonicalUrl}
      description={description}
      stylesheets={stylesheets}
      title={title}
    >
      <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
    </Document>,
  )}`
}

export function renderLandingDocument({
  assetBase,
  bootstrapModule,
  canonicalUrl,
  path,
  stylesheets,
}: RenderStaticPageParams): string {
  const { hero } = landingPage

  return renderDocument({
    assetBase,
    bootstrapModule,
    canonicalUrl,
    children: <LandingPage />,
    description: hero.description,
    path,
    stylesheets,
    title: 'Formation Sylius 2 pour les devs : architecture, personnalisation et mentorat expert',
  })
}

export function renderCourseDocument({
  assetBase,
  bootstrapModule,
  canonicalUrl,
  path,
  stylesheets,
}: RenderStaticPageParams): string {
  const courseSlug = path.split('/').filter(Boolean).at(-1)
  const course = courseSlug ? courses.find((item) => item.slug === courseSlug) : undefined

  if (!course) {
    throw new Error(`Unknown course for prerender path: ${path}`)
  }

  return renderDocument({
    assetBase,
    bootstrapModule,
    canonicalUrl,
    children: <CoursePageContent courseSlug={course.slug} />,
    description: course.metaDescription || course.description,
    path,
    stylesheets,
    title: course.metaTitle || course.title,
  })
}
