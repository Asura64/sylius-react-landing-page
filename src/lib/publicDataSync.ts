import { readFileSync } from 'node:fs'

function getPublicDataPath(fileName: string) {
  return `${process.cwd()}/public/data/${fileName}`
}

export function loadPublicJsonSync<T>(fileName: string): T {
  if (typeof window !== 'undefined') {
    throw new Error(`loadPublicJsonSync(${fileName}) cannot run in the browser`)
  }

  const rawValue = readFileSync(getPublicDataPath(fileName), 'utf8')

  return JSON.parse(rawValue) as T
}
