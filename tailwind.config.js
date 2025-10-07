/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Optimize CSS purging
  safelist: [
    // Add any dynamic classes that might be purged
    "animate-pulse",
    "bg-gray-800",
    "rounded-lg",
    "transition-transform",
    "duration-300",
    "group-hover:scale-110",
    "object-cover",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--font-rajdhani)", "Rajdhani", "sans-serif"],
        secondary: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
      colors: {
        primary: "#44dcf3",
        secondary: "#0e0e11",
        body: "#ffffff",
        button: "#0b0e13",
        border: {
          primary: "#44dcf3",
          secondary: "#212121",
        },
        background: {
          primary: "#44dcf3",
          secondary: "#0e0e11",
        },
      },
      maxWidth: {
        container: "1400px",
      },
    },
  },
  plugins: [],
  // Add CSS optimization
  corePlugins: {
    preflight: true,
  },
};
