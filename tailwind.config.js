/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-focus": "var(--color-primary-focus)",
        secondary: "var(--color-secondary)",
        "secondary-focus": "var(--color-secondary-focus)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "accent-green": "var(--color-accent-green)",
        "accent-yellow": "var(--color-accent-yellow)",
        "accent-red": "var(--color-accent-red)",
        border: "var(--color-border)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "spin-slow-reverse": "spin-reverse 3s linear infinite",
      },
      keyframes: {
        "spin-reverse": {
          to: {
            transform: "rotate(-360deg)",
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
