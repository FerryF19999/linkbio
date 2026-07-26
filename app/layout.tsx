import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://linkbio.nemu-ai.com"),
  applicationName: "NEMU Link Bio",
  title: {
    default: "NEMU Link Bio | Semua Link dalam Satu Tempat",
    template: "%s | NEMU Link Bio",
  },
  description: "Buat dan bagikan halaman link bio untuk sosial media, marketplace, produk, dan komunitas bersama NEMU AI.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NEMU Link Bio | Semua Link dalam Satu Tempat",
    description: "Satu halaman untuk sosial media, marketplace, produk, dan komunitas bersama NEMU AI.",
    url: "/",
    siteName: "NEMU Link Bio",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-nemu-ai.png",
        width: 1200,
        height: 630,
        alt: "NEMU Link Bio Buatan Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEMU Link Bio | Semua Link dalam Satu Tempat",
    description: "Satu halaman untuk sosial media, marketplace, produk, dan komunitas bersama NEMU AI.",
    images: ["/og-nemu-ai.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=nemu-brand-2", sizes: "any", type: "image/svg+xml" },
      { url: "/nemu-ai-favicon.ico?v=nemu-brand-2", sizes: "256x256", type: "image/x-icon" },
    ],
    shortcut: "/nemu-ai-favicon.ico?v=nemu-brand-2",
    apple: [
      { url: "/apple-touch-icon.png?v=nemu-brand-2", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f7f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
