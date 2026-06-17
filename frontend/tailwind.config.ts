/**
 * tailwind.config.ts — extend theme với design system colors
 *
 * Cách dùng trong JSX:
 *   bg-primary-500        → #005DDC
 *   text-neutral-600      → #515151
 *   border-error-200      → #FACCCC
 *   bg-success-100        → #EEFFFD
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
     fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      colors: {

        // ── Primary ───
        primary: {
          50:  "#EEF5FF",
          100: "#DECCFF",
          200: "#80CDFF",
          300: "#6EA8FF",
          400: "#3E8FFF",
          500: "#005DDC",   // ← Brand default
          600: "#004E67",
          700: "#003E93",
          800: "#063B82",
          900: "#002F6E",
          DEFAULT: "#005DDC",
        },

        // ── Neutral ───
        neutral: {
          50:  "#F8F8F8",
          100: "#F4F4F4",
          200: "#EDEDED",
          300: "#CBCBCB",
          400: "#A5A5A5",
          500: "#757575",
          600: "#515151",
          700: "#353535",
          800: "#282828",
        },

        // ── Error ─────
        error: {
          100: "#FFEEEE",
          200: "#FACCCC",
          500: "#DC0000",
          800: "#840000",
          DEFAULT: "#DC0000",
        },

        // ── Success ───
        success: {
          100: "#EEFFFD",
          200: "#CCFACC",
          500: "#009E00",
          800: "#034203",
          DEFAULT: "#009E00",
        },

        // ── Warning ───
        warning: {
          100: "#FFEBB2",
          500: "#F09E00",
          800: "#805E00",
          DEFAULT: "#F09E00",
        },

        // ── Info ──────
        info: {
          100: "#E4FFF9",
          200: "#B8F2F2",
          500: "#00AEAC",
          800: "#044747",
          DEFAULT: "#00AEAC",
        },
      },
    },
  },
  plugins: [],
};

export default config;