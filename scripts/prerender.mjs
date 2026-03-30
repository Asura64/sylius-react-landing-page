import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const rootDir = resolve(process.cwd())
const clientDir = resolve(rootDir, 'dist')
const serverDir = resolve(rootDir, 'dist-ssr')
const outputDir = resolve(rootDir, 'prerender-dist')
const manifestPath = resolve(clientDir, '.vite/manifest.json')
const serverEntryCandidates = [
  resolve(serverDir, 'entry-prerender.mjs'),
  resolve(serverDir, 'entry-prerender.js'),
]
const serverEntryPath = serverEntryCandidates.find((candidate) => existsSync(candidate))

if (!existsSync(manifestPath)) {
  throw new Error('Client manifest not found. Run the client build before prerendering.')
}

if (!serverEntryPath) {
  throw new Error('Server prerender bundle not found. Run the SSR build before prerendering.')
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const mainEntry = manifest['index.html']

if (!mainEntry?.file) {
  throw new Error('Unable to resolve the main client entry from the Vite manifest.')
}

const bootstrapModule = `./${mainEntry.file}`
const stylesheets = (mainEntry.css ?? []).map((file) => `./${file}`)

rmSync(outputDir, { recursive: true, force: true })
cpSync(clientDir, outputDir, { recursive: true })

const { renderDocument } = await import(pathToFileURL(serverEntryPath).href)
const landingHtml = renderDocument({ bootstrapModule, stylesheets })

writeFileSync(resolve(outputDir, 'index.html'), landingHtml)

const cnameSource = resolve(rootDir, 'public/CNAME')

if (existsSync(cnameSource)) {
  mkdirSync(outputDir, { recursive: true })
  cpSync(cnameSource, resolve(outputDir, 'CNAME'))
}
