import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function httpsOrigin(value, setting, apiPath = false) {
  let url
  try { url = new URL(value) } catch { throw new Error('Set ' + setting + ' to an HTTPS URL') }
  const allowedPaths = apiPath ? ['/api', '/api/'] : ['/']
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      !allowedPaths.includes(url.pathname)) {
    throw new Error('Invalid ' + setting + (apiPath ? '. Expected https://host/api' : '. Expected https://host'))
  }
  return url.origin
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  const onVercel = env.VERCEL === '1'
  let apiOrigin
  if (env.NETLIFY === 'true') {
    apiOrigin = env.API_ORIGIN
      ? httpsOrigin(env.API_ORIGIN, 'API_ORIGIN')
      : httpsOrigin(env.VITE_API_URL, 'API_ORIGIN or VITE_API_URL', true)
  }
  const siteUrl = env.SITE_URL || (env.NETLIFY === 'true' && env.URL) ||
    (onVercel && env.VERCEL_PROJECT_PRODUCTION_URL && 'https://' + env.VERCEL_PROJECT_PRODUCTION_URL)
  const siteOrigin = siteUrl && httpsOrigin(siteUrl, 'SITE_URL')
  return {
    define: onVercel || (apiOrigin && env.API_ORIGIN) ? { 'import.meta.env.VITE_API_URL': JSON.stringify('/api') } : {},
    plugins: [react(), {
      name: 'deployment-files',
      generateBundle() {
        const rules = []
        if (apiOrigin) {
          rules.push('/api/* ' + apiOrigin + '/api/:splat 200!',
            '/uploads/* ' + apiOrigin + '/uploads/:splat 200!')
        }
        rules.push('/* /index.html 200')
        this.emitFile({ type: 'asset', fileName: '_redirects', source: rules.join('\n') + '\n' })
        const preview = (env.NETLIFY === 'true' && env.CONTEXT && env.CONTEXT !== 'production') ||
          (onVercel && env.VERCEL_ENV !== 'production')
        const robots = preview ? 'User-agent: *\nDisallow: /\n' :
          'User-agent: *\nAllow: /\n' + ['/api/', '/admin/', '/hod/', '/faculty-portal/', '/student-portal/', '/reset-password/']
            .map(path => 'Disallow: ' + path + '\n').join('')
        if (siteOrigin && !preview) {
          const routes = ['/', '/departments', '/faculty', '/notices', '/gtu-circulars', '/timetable', '/events', '/calendar', '/syllabi']
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source:
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            routes.map(path => '<url><loc>' + siteOrigin + path + '</loc></url>').join('\n') + '\n</urlset>\n' })
        }
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source:
          robots + (siteOrigin && !preview ? 'Sitemap: ' + siteOrigin + '/sitemap.xml\n' : '') })
      },
    }],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'react-icons', 'react-hot-toast']
          }
        }
      }
    }
  }
})
