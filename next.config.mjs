/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const nextConfig = {
  // Move serverComponentsExternalPackages to root level (not in experimental)
  serverExternalPackages: ["mongoose"],

  // Output standalone for Docker
  output: "standalone",

  // Transpile packages to modern JavaScript (removes legacy polyfills)
  transpilePackages: [
    'react-slick',
    'slick-carousel',
    'react-country-flag',
  ],

  // Enable experimental features for better performance
  experimental: {
    // Optimize imports for heavy packages - tree shaking
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "react-slick",
      "antd",
      "recharts",
      "firebase",
      "firebase/app",
      "firebase/auth",
      "@tanstack/react-query",
      "@tanstack/react-table",
      "react-select",
      "react-datepicker",
      "sweetalert2",
      "react-hook-form",
      "react-country-flag",
      "axios",
      "qrcode.react",
      "react-countup",
      "react-phone-number-input",
      "react-masonry-css",
      "react-modal",
    ],
    // Enable CSS optimization and inlining for critical CSS
    optimizeCss: true,
    // Optimize font loading
    optimizeServerReact: true,
    // Enable partial prerendering for better performance
    ppr: false,
  },

  // Image optimization - aggressive for mobile performance
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Prioritize modern formats for smaller file sizes (AVIF is ~30% smaller than WebP)
    formats: ["image/avif", "image/webp"],
    // Device sizes optimized for mobile-first - smaller sizes loaded on mobile
    deviceSizes: [320, 420, 640, 768, 1024, 1280],
    // Image sizes for fixed-width images (logo, icons, thumbnails)
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256],
    minimumCacheTTL: 60 * 60 * 24 * 90, // 90 days for better caching
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    // Remove React properties in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
    // Remove data-testid attributes in production
    reactRemoveProperties: process.env.NODE_ENV === "production" && {
      properties: ['^data-testid$'],
    },
  },

  // Production source maps for debugging (smaller than dev maps)
  productionBrowserSourceMaps: false,

  // Optimize runtime chunk
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Compression and headers
  compress: true,
  poweredByHeader: false,

  // Webpack optimizations
  webpack: (config, { dev, isServer, webpack }) => {
    // Optimize bundle splitting for production client builds
    if (!dev && !isServer) {
      // Set target to modern browsers (ES2022) to avoid legacy polyfills
      // ES2022 includes Array.at, Object.hasOwn which eliminates those polyfills
      config.target = ['web', 'es2022'];

      // Enable performance hints
      config.performance = {
        hints: 'warning',
        maxAssetSize: 244000, // 244KB
        maxEntrypointSize: 512000, // 512KB
      };

      // Add aggressive tree-shaking
      config.optimization.providedExports = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      config.optimization.innerGraph = true;
      config.optimization.concatenateModules = true;

      // Minify and compress aggressively
      config.optimization.minimize = true;

      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          // Core React framework - always loaded
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "framework",
            priority: 50,
            chunks: "all",
            enforce: true,
          },
          // Firebase - separate chunk (used by auth)
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: "firebase",
            priority: 45,
            chunks: "all",
            enforce: true,
          },
          // SweetAlert2 - separate chunk for modals/alerts
          sweetalert: {
            test: /[\\/]node_modules[\\/]sweetalert2[\\/]/,
            name: "sweetalert",
            chunks: "async",
            priority: 40,
            enforce: true,
          },
          // React Slick - separate chunk for carousels
          slick: {
            test: /[\\/]node_modules[\\/](react-slick|slick-carousel)[\\/]/,
            name: "slick",
            chunks: "async",
            priority: 38,
            enforce: true,
          },
          // Recharts - separate chunk for charts (admin only)
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-.*|victory-vendor)[\\/]/,
            name: "recharts",
            chunks: "async",
            priority: 37,
            enforce: true,
          },
          // Ant Design - separate chunk (admin only)
          antd: {
            test: /[\\/]node_modules[\\/](antd|@ant-design|rc-.*)[\\/]/,
            name: "antd",
            chunks: "async",
            priority: 36,
            enforce: true,
          },
          // TanStack Query/Table - separate chunk
          tanstack: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: "tanstack",
            chunks: "async",
            priority: 35,
            enforce: true,
          },
          // Large vendor libraries (>100KB) - separate chunks
          lib: {
            test(module) {
              return (
                module.size() > 100000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const packageNameMatch = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              const packageName = packageNameMatch ? packageNameMatch[1] : 'vendor';
              return `lib-${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            chunks: "async",
            reuseExistingChunk: true,
          },
          // Shared vendor code - higher minChunks to reduce commons size
          commons: {
            name: 'commons',
            minChunks: 3,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };

      // Add ignore plugins for unused modules
      config.plugins.push(
        // Ignore moment.js locales (not used, moment is only transitive dep)
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        }),
        // Ignore unused Firebase modules
        new webpack.IgnorePlugin({
          resourceRegExp: /^(firebase\/analytics|firebase\/messaging|firebase\/functions|firebase\/storage|firebase\/firestore|firebase\/database|firebase\/remote-config|firebase\/performance)$/,
        }),
        // Ignore source maps in production for smaller bundles
        new webpack.IgnorePlugin({
          resourceRegExp: /\.map$/,
        })
      );

      // Replace Next.js polyfill module with empty module to save ~11KB
      // Modern browsers (Chrome 92+, Firefox 90+, Safari 15.4+) don't need these polyfills
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /polyfill-module\.js$/,
          path.resolve(__dirname, 'src/lib/empty-polyfill.js')
        )
      );
    }

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/background/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/movies/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/ads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // 1 day for ads
          },
        ],
      },
      // Cache JS and CSS files with immutable for long-term caching
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache fonts
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache icons
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
