import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import dynamic from "next/dynamic";
import { Manrope, Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Lazy load non-critical components for code splitting
const GoogleAnalytics = dynamic(() =>
  import("@/components/common/GoogleAnalytics")
);
const TawkTo = dynamic(() => import("@/components/common/TawkTo"));
const ScrollToTop = dynamic(() => import("@/components/common/ScrollToTop"));
const RegisterServiceWorker = dynamic(() => import("./register-sw"));
const Footer = dynamic(() => import("@/components/layout/Footer"));
const OrganizationSchema = dynamic(() =>
  import("@/components/common/OrganizationSchema")
);

// Navbar - render placeholder during load
const NavbarSkeleton = () => <nav className="h-[70px] bg-transparent" />;
const Navbar = dynamic(() => import("@/components/layout/Navbar"), {
  loading: () => <NavbarSkeleton />,
});

// Critical components - loaded immediately
import MaintenanceWrapper from "@/components/common/MaintenanceWrapper";
import MainWrapper from "@/components/layout/MainWrapper";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { UserSpendingContextProvider } from "@/contexts/UserSpendingContext";
import QueryProvider from "@/providers/QueryProvider";

// Optimize fonts - reduce weights and use display: optional for non-blocking
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"], // Removed 600 - use 400 or 700
  variable: "--font-rajdhani",
  fallback: ["Arial", "sans-serif"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-manrope",
  fallback: ["Arial", "sans-serif"],
  display: "swap",
  preload: false, // Don't preload secondary font
  adjustFontFallback: true,
});

// Cache favicon to avoid DB calls on every page load
let cachedFavicon = null;
let faviconCacheTime = 0;
const FAVICON_CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

export async function generateMetadata() {
  let faviconUrl = "/favicon.ico";

  // Use cached favicon if available and not expired
  const now = Date.now();
  if (cachedFavicon && now - faviconCacheTime < FAVICON_CACHE_TTL) {
    faviconUrl = cachedFavicon;
  } else {
    try {
      await connectToDatabase();
      const settings = await Settings.getSettings();
      if (settings.logos?.favicon) {
        faviconUrl = settings.logos.favicon;
        cachedFavicon = faviconUrl;
        faviconCacheTime = now;
      }
    } catch (error) {
      console.error("Error fetching favicon:", error);
    }
  }

  return {
    title: {
      default: "Cheap Stream TV: Watch Live TV and Movies Without Paying a Lot",
      template: "%s | Cheap Stream TV",
    },
    description:
      "Watch live TV, sports, and movies on any device. Cheap Stream gives you thousands of channels for less than what cable companies charge. Try it today.",
    keywords:
      "IPTV service, live TV streaming, cord cutting, cable alternative, stream movies, watch sports online",
    authors: [{ name: "Cheap Stream" }],
    creator: "Cheap Stream",
    publisher: "Cheap Stream",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com"
    ),
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: "/icons/live.png",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      siteName: "Cheap Stream TV",
      title: "Cheap Stream TV: Watch Live TV and Movies Without Paying a Lot",
      description:
        "Watch live TV, sports, and movies on any device. Cheap Stream gives you thousands of channels for less than what cable companies charge. Try it today.",
      images: [
        {
          url: "/icons/live.png",
          width: 1200,
          height: 630,
          alt: "Cheap Stream - Stream Live TV and Movies",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@cheapstreamtv",
      creator: "@cheapstreamtv",
      title: "Cheap Stream TV: Watch Live TV and Movies Without Paying a Lot",
      description:
        "Watch live TV, sports, and movies on any device. Cheap Stream gives you thousands of channels for less than what cable companies charge. Try it today.",
      images: ["/icons/live.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme and other meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="cryptomus" content="b1d66f7f" />

        {/* Preload LCP image - using pre-optimized images (58KB desktop, 21KB mobile) */}
        <link
          rel="preload"
          as="image"
          href="/background/banner_bg_mobile.webp"
          type="image/webp"
          fetchPriority="high"
          media="(max-width: 640px)"
        />
        <link
          rel="preload"
          as="image"
          href="/background/banner_bg_optimized.webp"
          type="image/webp"
          fetchPriority="high"
          media="(min-width: 641px)"
        />

        {/* Inline critical CSS - includes all above-the-fold styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html{scroll-behavior:smooth}body{font-family:var(--font-rajdhani),"Rajdhani",Arial,sans-serif;line-height:1.6;color:#fff;background-color:#0e0e11;margin:0}*{box-sizing:border-box}button{cursor:pointer}nav{height:70px}.polygon_container{position:relative;z-index:10;clip-path:polygon(0 0,34% 0,38% 10%,62% 10%,66% 0,100% 0,100% 100%,66% 100%,62% 90%,38% 90%,34% 100%,0 100%)}.polygon{clip-path:polygon(0.1% 0.3%,33.8% 0.3%,37.8% 10.3%,62.2% 10.3%,66.2% 0.3%,99.9% 0.3%,99.9% 99.8%,66.1% 99.8%,62.2% 89.8%,37.8% 89.8%,33.9% 99.8%,0.1% 99.8%);width:100%;height:100%;z-index:1}.h-polygon{height:450px}.polygon_heading{color:#fff;font-size:24px;font-weight:700;margin-bottom:.75rem;line-height:1}.polygon_paragraph{color:#fff;font-size:12px;font-weight:500;margin-bottom:1.5rem;line-height:1.5}@media(min-width:768px){.polygon_heading{font-size:2.5rem}.polygon_paragraph{font-size:14px}.h-polygon{height:550px}}@media(max-width:768px){.polygon_container{clip-path:polygon(0 0,25% 0,32% 6.5%,68% 6.5%,75% 0,100% 0,100% 100%,75% 100%,68% 93.5%,32% 93.5%,25% 100%,0 100%)}.polygon{clip-path:polygon(0.2% 0.2%,24.3% 0.2%,31.5% 6.7%,68.5% 6.7%,75.8% 0.2%,99.8% 0.2%,99.8% 99.8%,75.5% 99.8%,68.8% 93.4%,31% 93.4%,24.4% 99.8%,0.2% 99.8%)}}`,
          }}
        />

        {/* Preconnect to Firebase FIRST - critical for auth (saves 310ms per report) */}
        <link
          rel="preconnect"
          href="https://cheapstreamtv.firebaseapp.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://identitytoolkit.googleapis.com"
          crossOrigin="anonymous"
        />

        {/* Preconnect to Google fonts to reduce network dependency chain */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Other preconnects */}
        <link
          rel="preconnect"
          href="https://www.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://apis.google.com" />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased font-primary" suppressHydrationWarning>
        {/* Translation scripts - lazy loaded for better performance */}
        <Script
          id="lang-config"
          src="/assets/lang-config.js"
          strategy="lazyOnload"
        />
        <Script
          id="translation"
          src="/assets/translation.js"
          strategy="lazyOnload"
        />
        <Script
          id="google-translate"
          src="//translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="lazyOnload"
        />

        <PaymentProvider>
          <QueryProvider>
            <AuthContextProvider>
              <LanguageProvider>
                <UserSpendingContextProvider>
                  <MaintenanceWrapper>
                    <OrganizationSchema />
                    <RegisterServiceWorker />
                    <GoogleAnalytics />
                    <TawkTo />
                    <ScrollToTop />
                    <MainWrapper>
                      <Navbar />
                      {children}
                      <Footer />
                    </MainWrapper>
                  </MaintenanceWrapper>
                </UserSpendingContextProvider>
              </LanguageProvider>
            </AuthContextProvider>
          </QueryProvider>
        </PaymentProvider>
      </body>
    </html>
  );
}
