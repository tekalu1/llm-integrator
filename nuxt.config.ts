// https://nuxt.com/docs/api/configuration/nuxt-config
import { execSync } from 'child_process'

const rootDirectory = '/'
export default defineNuxtConfig({
  ssr: true,
  app:{
    baseURL: rootDirectory,
  },
  modules: ['@nuxtjs/tailwindcss','@pinia/nuxt','nuxt-monaco-editor'],
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '@vue-flow/core/dist/style.css',
    '@vue-flow/core/dist/theme-default.css'
  ],
  build: {
    transpile: [
    '@fortawesome/vue-fontawesome',
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/free-regular-svg-icons',
    '@fortawesome/free-brands-svg-icons',
    ]
  },
  imports:{
    dirs:[
      'composables/**'
    ]
  },
  nitro: {
    hooks: {
      close: () => {
        const platform = process.platform
  
        if (platform === 'win32') {
          // Windows環境向けコマンド
          // node_modulesを一時ディレクトリ(node_modules_temp)へコピー
          execSync('robocopy .output\\server\\node_modules .output\\server\\node_modules_temp *.* /E || exit 0', { stdio: 'inherit' });
          // 元のnode_modulesを削除
          execSync('rmdir /S /Q .output\\server\\node_modules || exit 0', { stdio: 'inherit' });
          // 一時ディレクトリをnode_modulesにリネーム
          execSync('move .output\\server\\node_modules_temp .output\\server\\node_modules || exit 0', { stdio: 'inherit' });
        } else if (platform === 'linux') {
          // Linux(Ubuntu)環境向けコマンド
          // node_modulesを一時ディレクトリ(node_modules_temp)へコピー
          execSync('cp -rL .output/server/node_modules/ .output/server/node_modules_temp/ || exit 0', { stdio: 'inherit' })
          // 元のnode_modulesを削除
          execSync('rm -rf .output/server/node_modules/ || exit 0', { stdio: 'inherit' })
          // 一時ディレクトリをnode_modulesにリネーム
          execSync('mv .output/server/node_modules_temp/ .output/server/node_modules/ || exit 0', { stdio: 'inherit' })
        }
      }
    }
  }
})
