// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxtjs/tailwindcss",
  ],

  appDir: "app",

  devServer: {
    port: 8888,
  },

  devtools: {
    enabled: true,
  },

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  // ⭐ เพิ่มตรงนี้
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000/api/v1",
    },
  },
});
