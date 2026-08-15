import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/cdsi69/' : '/',

    plugins: [
        basicSsl()
    ],

    server: {
        host: true,
        https: true,
        port: 5501
    }
}))