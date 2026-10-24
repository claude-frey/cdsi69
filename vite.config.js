import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import fs from 'node:fs'
import path from 'node:path'

function copierJsPrincipalVersDist() {
    return {
        name: 'cdsi69-copier-js-principal',
        apply: 'build',

        closeBundle() {
            const dossierSource = path.resolve(process.cwd(), 'js')
            const dossierDestination = path.resolve(
                process.cwd(),
                'dist',
                'js'
            )

            fs.rmSync(dossierDestination, {
                recursive: true,
                force: true
            })

            fs.cpSync(dossierSource, dossierDestination, {
                recursive: true
            })

            console.log(
                'CDSI69 : fichiers js copiés dans dist/js.'
            )
        }
    }
}

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/cdsi69/' : '/',

    plugins: [
        basicSsl(),
        copierJsPrincipalVersDist()
    ],
    
preview: {
        https: false
    },

    server: {
        host: true,
        https: true,
        port: 5501
    }
}))