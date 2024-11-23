// https://nuxt.com/docs/api/configuration/nuxt-config

const rootDirectory = ''
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
  }
})
