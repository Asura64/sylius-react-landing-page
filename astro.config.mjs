import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  site: 'https://patxi.iparaguirre.fr',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
})
