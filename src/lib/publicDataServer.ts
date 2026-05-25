import { readFile } from 'node:fs/promises'

function getPublicDataPath(fileName: string) {
  return `${process.cwd()}/public/data/${fileName}`
}

export async function loadPublicJsonFromDisk<T>(fileName: string): Promise<T> {
  const rawValue = await readFile(getPublicDataPath(fileName), 'utf8')

  return JSON.parse(rawValue) as T
}
