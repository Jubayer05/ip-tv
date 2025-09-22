import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import MicrosoftClarity from "@/components/common/MicrosoftClarity";
import ScrollToTop from "@/components/common/ScrollToTop";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserSpendingContextProvider } from "@/contexts/UserSpendingContext";
import { Manrope, Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  fallback: ["Arial", "sans-serif"],
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  fallback: ["Arial", "sans-serif"],
});

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${manrope.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/live.png" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="google-site-verification"
          content="HasIvEgidg_qkrrpsRaTSR2HUUwEnnc8osHzgjibMCw"
        />
      </head>
      <body className="antialiased font-primary">
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AuthContextProvider>
          <UserSpendingContextProvider>
            <LanguageProvider>
              <Navbar />
              <ScrollToTop />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </LanguageProvider>
          </UserSpendingContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
