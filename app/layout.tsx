import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEMU Link Bio — Powered by NEMU AI",
  description: "Create a beautiful NEMU Link Bio page, share everything you make, and grow your audience.",
  openGraph: {
    title: "NEMU Link Bio — Powered by NEMU AI",
    description: "One beautiful link for everything you create.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NEMU Link Bio — Powered by NEMU AI",
    description: "One beautiful link for everything you create.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
