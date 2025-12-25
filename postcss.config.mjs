const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Optimize CSS for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Safe optimizations
          reduceIdents: false,
          zindex: false,
          discardUnused: false, // Keep false to avoid breaking dynamic classes
          mergeIdents: false,
        }],
      },
    }),
  },
};

export default config;
