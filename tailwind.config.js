/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "#e5e7eb",
        background: "#ffffff",
        foreground: "#0f172a",

        primary: "#2563eb",
        "primary-foreground": "#ffffff",

        muted: "#f1f5f9",
        "muted-foreground": "#64748b",

        destructive: "#ef4444",
      }
    }
  },
  plugins: []
};