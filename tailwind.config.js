/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Optimize CSS purging - minimal safelist for better tree-shaking
  safelist: [],
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
  // Disable unused core plugins to reduce CSS size
  corePlugins: {
    preflight: true,
    // Disable unused utilities
    float: false,
    clear: false,
    skew: false,
    caretColor: false,
    sepia: false,
    // Backdrop filters - not used
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    // Filter utilities - not used (except brightness in one place)
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    // Form accent - not used
    accentColor: false,
    // Scroll behavior handled in CSS
    scrollMargin: false,
    scrollPadding: false,
    // Touch action - not used
    touchAction: false,
    // Will change - rarely needed
    willChange: false,
    // Content - not used
    content: false,
  },
};
