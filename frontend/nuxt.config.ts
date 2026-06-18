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
  },

  // ✅ Fix HMR บน Windows + Docker Desktop
  // Windows ไม่ส่ง file change events ข้าม Volume Mount ไปให้ Linux container
  // ต้องใช้ polling แทน เพื่อให้ Vite ตรวจสอบไฟล์เองทุกๆ 1 วินาที
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000
      }
    }
  }
})