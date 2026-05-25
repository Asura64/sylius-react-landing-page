export async function loadPublicJson<T>(fileName: string): Promise<T> {
  if (import.meta.env.SSR) {
    const { loadPublicJsonFromDisk } = await import('./publicDataServer')

    return loadPublicJsonFromDisk<T>(fileName)
  }

  const response = await fetch(`/data/${fileName}`)

  if (!response.ok) {
    throw new Error(`Unable to load /data/${fileName}`)
  }

  return (await response.json()) as T
}
