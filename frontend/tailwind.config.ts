import type { Config } from "tailwindcss"

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"Inter"', "sans-serif"],
        display: ['"Noto Sans Thai"', '"Inter"', "sans-serif"],
        number: ['"Inter"', '"Noto Sans Thai"', "sans-serif"]
      }
    }
  }
}