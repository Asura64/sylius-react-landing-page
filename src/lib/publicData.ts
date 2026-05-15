function getPublicDataPath(fileName: string) {
  return `${process.cwd()}/public/data/${fileName}`
}

export async function loadPublicJson<T>(fileName: string): Promise<T> {
  if (typeof window !== 'undefined') {
    const response = await fetch(`/data/${fileName}`)

    if (!response.ok) {
      throw new Error(`Unable to load /data/${fileName}`)
    }

    return (await response.json()) as T
  }

  const { readFile } = await import('node:fs/promises')
  const rawValue = await readFile(getPublicDataPath(fileName), 'utf8')

  return JSON.parse(rawValue) as T
}
