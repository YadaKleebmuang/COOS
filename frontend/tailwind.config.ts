import type { Config } from "tailwindcss";

export default {
  content: [
    "./app.vue",
    "./app/pages/**/*.{vue,js,ts}",
    "./app/components/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
