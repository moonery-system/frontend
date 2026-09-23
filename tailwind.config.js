/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Night-blue scale. 900 is the exact background of logo_moonery.png,
        // so the logo sits on the sidebar without a visible box.
        ink: {
          950: "#07151f",
          900: "#0b1e2e",
          800: "#102839",
          700: "#16344a",
          600: "#1f4460",
          500: "#2b5776",
        },
        // Warm off-white. Never #fff.
        cream: {
          DEFAULT: "#f4ecdc",
          100: "#f4ecdc",
          200: "#e6dcc8",
        },
        // Primary: vibrant orange from the truck.
        ember: {
          300: "#fbb06d",
          400: "#f79340",
          500: "#f37b1e",
          600: "#d9670f",
        },
        // Secondary: the moon.
        gold: {
          300: "#ffdc85",
          400: "#ffc84b",
          500: "#e99f2d",
        },
        // Semantic pair, desaturated so they sit on the navy without shouting.
        rust: { 400: "#ee7a6d", 500: "#e5604f" },
        moss: { 400: "#7fc79a", 500: "#5fb381" },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "Sora",
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        // Layered: a hairline top highlight plus a tight contact shadow.
        layer:
          "inset 0 1px 0 rgb(244 236 220 / 0.04), 0 1px 2px rgb(0 0 0 / 0.28)",
        float:
          "inset 0 1px 0 rgb(244 236 220 / 0.05), 0 1px 2px rgb(0 0 0 / 0.3), 0 12px 32px -8px rgb(0 0 0 / 0.55)",
      },
      keyframes: {
        rise: {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 240ms ease-out both",
      },
    },
  },
  plugins: [],
};
