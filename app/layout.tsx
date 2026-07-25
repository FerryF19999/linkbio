import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkSpark — Your story, one link",
  description: "Create a beautiful link-in-bio page, share everything you make, and grow your audience.",
  openGraph: {
    title: "LinkSpark — Your story, one link",
    description: "Create a beautiful link-in-bio page and share everything you make.",
    type: "website",
    images: [{ url: "/og.png", width: 1730, height: 917, alt: "LinkSpark link-in-bio builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkSpark — Your story, one link",
    description: "Create a beautiful link-in-bio page and share everything you make.",
    images: ["/og.png"],
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
