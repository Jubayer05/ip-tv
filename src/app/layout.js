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
  title: "IPTV - Premium Streaming Services",
  description:
    "High-quality IPTV streaming services with premium channels and content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${manrope.variable}`}>
      <body className="antialiased font-primary">
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
