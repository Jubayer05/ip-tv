import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Manrope, Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope", 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "IPTV - Premium Streaming Services",
  description:
    "High-quality IPTV streaming services with premium channels and content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.variable} ${manrope.variable} antialiased font-primary`}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
