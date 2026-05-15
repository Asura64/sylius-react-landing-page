import { defineConfig } from 'astro/config'
import path from 'node:path'

function publicDataWatchPlugin() {
  const publicDataDir = path.resolve('public/data')

  return {
    name: 'public-data-watch',
    configureServer(server) {
      server.watcher.add(publicDataDir)

      server.watcher.on('change', (filePath) => {
        if (!filePath.startsWith(publicDataDir) || !filePath.endsWith('.json')) {
          return
        }

        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

export default defineConfig({
  site: 'https://patxi.iparaguirre.fr',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [publicDataWatchPlugin()],
  },
})
