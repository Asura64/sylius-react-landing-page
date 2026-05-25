/// <reference types="astro/client" />

declare const process: {
  cwd(): string
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string
}

declare module 'node:fs/promises' {
  export function readFile(path: string, encoding: string): Promise<string>
}
