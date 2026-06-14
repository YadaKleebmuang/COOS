// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "app/",

  css: [
    "~/assets/css/main.css"
  ],

  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxtjs/tailwindcss"
  ],

  devServer: {
    host: "0.0.0.0",
    port: 8888
  },

  devtools: {
    enabled: true
  },

  routeRules: {
    "/": { prerender: true }
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs"
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000/api/v1"
    }
  }
})