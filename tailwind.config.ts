import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        vivo: {
          purple: "#660099",
          "purple-dark": "#4D0073",
          "purple-light": "#8000BF",
          orange: "#FF4F00",
          gray: "#F6F6F6",
          text: "#333333",
        },
      },
      borderRadius: {
        'v-card': '16px',
        'v-button': '32px',
      },
      boxShadow: {
        'v-soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'v-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
};
export default config;
