
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss()
    ],

    server: {
        proxy: {
            '/api': {
                target: 'https://gundam-api.pages.dev',
                changeOrigin: true,
                secure: true
            }
        }
    }
})
