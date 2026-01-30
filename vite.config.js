import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/GamerList/', // GitHub Pages base path
  server: {
    proxy: {
      '/api/twitch': {
        target: 'https://id.twitch.tv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twitch/, '/oauth2')
      },
      '/api/igdb': {
        target: 'https://api.igdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/igdb/, '/v4')
      }
    }
  }
})
