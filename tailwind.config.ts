// tailwind.config.ts
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        surfaceBorder: "#242424",
        accent: "#10b981",
        foreground: "#f5f5f5",
        muted: "#8a8a8a",
      },
    },
  },
  // tailwind.config.ts — add to plugins
  plugins: [tailwindcssAnimate],
};

export default config;
