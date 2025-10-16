import ScrollToTop from "@/components/common/ScrollToTop";
import TawkTo from "@/components/common/TawkTo";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { UserSpendingContextProvider } from "@/contexts/UserSpendingContext";
import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import QueryProvider from "@/providers/QueryProvider";
import { Manrope, Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-rajdhani",
  fallback: ["Arial", "sans-serif"],
  display: "swap",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-manrope",
  fallback: ["Arial", "sans-serif"],
  display: "swap",
  preload: true,
});

export async function generateMetadata() {
  let faviconUrl = "/favicon.ico";

  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();
    if (settings.logos?.favicon) {
      faviconUrl = settings.logos.favicon;
    }
  } catch (error) {
    console.error("Error fetching favicon:", error);
  }

  return {
    title: {
      default: "Cheap Stream - Premium IPTV Streaming Service",
      template: "%s | Cheap Stream",
    },
    description:
      "Get premium IPTV streaming service with HD channels, multiple devices support, and reliable streaming. Affordable packages starting from $5. Order now!",
    keywords:
      "IPTV, streaming service, premium channels, HD streaming, IPTV subscription, Cheap Stream",
    authors: [{ name: "Cheap Stream" }],
    creator: "Cheap Stream",
    publisher: "Cheap Stream",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://cheapstream.com"
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
      siteName: "Cheap Stream",
      title: "Cheap Stream - Premium IPTV Streaming Service",
      description:
        "Get premium IPTV streaming service with HD channels, multiple devices support, and reliable streaming. Affordable packages starting from $5. Order now!",
      images: [
        {
          url: "/icons/live.png",
          width: 1200,
          height: 630,
          alt: "Cheap Stream IPTV Service",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@cheapstream",
      creator: "@cheapstream",
      title: "Cheap Stream - Premium IPTV Streaming Service",
      description:
        "Get premium IPTV streaming service with HD channels, multiple devices support, and reliable streaming. Affordable packages starting from $5. Order now!",
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
    <html lang="en" className={`${rajdhani.variable} ${manrope.variable}`}>
      <head>
        {/* Theme and other meta tags */}
        <meta name="theme-color" content="#000000" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/background/banner_bg.webp"
          as="image"
          fetchPriority="high"
        />

        {/* Preconnect to external domains */}
        <link
          rel="preconnect"
          href="https://ip-tv-weberspoint.firebaseapp.com"
        />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />

        {/* DNS prefetch for CDNs */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="antialiased font-primary">
        <PaymentProvider>
          <QueryProvider>
            <AuthContextProvider>
              <LanguageProvider>
                <UserSpendingContextProvider>
                  <TawkTo />
                  <Navbar />
                  <ScrollToTop />
                  <main className="min-h-screen">{children}</main>
                  <Footer />
                </UserSpendingContextProvider>
              </LanguageProvider>
            </AuthContextProvider>
          </QueryProvider>
        </PaymentProvider>
      </body>
    </html>
  );
}
