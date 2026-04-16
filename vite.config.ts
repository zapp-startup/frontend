import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  publicDir: 'private',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
  },
  preview: {
    host: '127.0.0.1',
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }

          if (id.includes('/@mui/') || id.includes('/@emotion/')) {
            return 'mui-vendor'
          }

          if (id.includes('/recharts/') || id.includes('/d3-')) {
            return 'charts-vendor'
          }

          if (
            id.includes('/@radix-ui/') ||
            id.includes('/lucide-react/') ||
            id.includes('/motion/') ||
            id.includes('/embla-carousel-react/') ||
            id.includes('/react-day-picker/')
          ) {
            return 'ui-vendor'
          }
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
