import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
import pkg from './package.json'

let gitCommit = ''
let gitCount = ''
try {
  gitCommit = execSync('git rev-parse --short HEAD').toString().trim()
  gitCount = execSync('git rev-list --count HEAD').toString().trim()
} catch (e) {
  gitCommit = 'dev'
  gitCount = '0'
}

const buildDate = new Date().toISOString().split('T')[0]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_COMMIT__: JSON.stringify(gitCommit),
    __GIT_COUNT__: JSON.stringify(gitCount),
    __BUILD_DATE__: JSON.stringify(buildDate),
  }
})
