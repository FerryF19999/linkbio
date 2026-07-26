import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import PublicProfileClient, {
  type PublicProfile,
} from "./PublicProfileClient";

export const dynamic = "force-dynamic";

const nemuProfileTitle = "NEMU AI | Marketplace Indonesia";
const nemuProfileDescription = "Temukan marketplace NEMU AI, daftar Official Seller, download aplikasi, dan ikuti Instagram, Threads, X, TikTok, YouTube, serta LinkedIn resmi.";
const cekHargaProfileTitle = "Cek Harga Barang Pakai AI | Cek Harga di Sini";
const cekHargaProfileDescription = "Upload foto barangmu—mobil, motor, gadget, elektronik, dan lainnya. AI kasih estimasi harga pasar Indonesia dalam hitungan detik. Gratis.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = cleanSlug((await params).slug) || "nemu-ai";
  const isCekHarga = slug === "cekhargadisini";
  const title = isCekHarga ? cekHargaProfileTitle : nemuProfileTitle;
  const description = isCekHarga ? cekHargaProfileDescription : nemuProfileDescription;
  const canonical = isCekHarga ? "/cekhargadisini" : "/nemu-ai";
  const image = "/og-nemu-ai.png";

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: isCekHarga
      ? ["cek harga barang", "estimasi harga pasar", "AI cek harga", "harga pasar Indonesia", "NEMU AI"]
      : ["NEMU AI", "marketplace Indonesia", "official seller", "aplikasi NEMU AI", "belanja online Indonesia"],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: isCekHarga ? "Cek Harga di Sini" : "NEMU AI",
      locale: "id_ID",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: isCekHarga ? "Cek Harga Barang Pakai AI untuk Pasar Indonesia" : "NEMU AI Marketplace Generasi Baru Indonesia",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const fallbackProfile: PublicProfile = {
  theme: "classic",
  name: "nemu.ai",
  bio: "Marketplace generasi baru buatan Indonesia 🇮🇩, lebih personal, aman, dan mudah dengan bantuan AI.",
  profileImage: "/favicon.svg",
  links: [
    {
      id: 1,
      title: "Daftar Official Seller NEMU AI",
      url: "https://seller.nemu-ai.com/register",
      icon: "external",
      color: "#704bfd",
      enabled: true,
      image: "/favicon.svg",
    },
    {
      id: 2,
      title: "Download Nemu AI di Play Store",
      url: "https://play.google.com/store/apps/details?id=com.nemump.nemumobile&pcampaignid=web_share",
      icon: "external",
      color: "#704bfd",
      enabled: true,
      image: "/nemu-app-icon.webp",
    },
    {
      id: 3,
      title: "Belanja di Marketplace NEMU AI",
      url: "https://shop.nemu-ai.com/",
      icon: "website",
      color: "#704bfd",
      enabled: true,
      image: "/favicon.svg",
    },
    {
      id: 9,
      title: "Snap List Sell",
      url: "https://cekhargadisini.com/",
      icon: "website",
      color: "#704bfd",
      enabled: true,
      image: "/favicon.svg",
      featured: true,
    },
    {
      id: 4,
      title: "Apply Content Creator",
      url: "mailto:info@nemu-ai.com?subject=Apply%20Content%20Creator%20NEMU%20AI",
      icon: "email",
      color: "#704bfd",
      enabled: true,
    },
    {
      id: 5,
      title: "Instagram @nemuaiofficial",
      url: "https://www.instagram.com/nemuaiofficial?igsh=MXY4ZWdyMXFxbTRsYQ==",
      icon: "instagram",
      color: "#e1306c",
      enabled: true,
    },
    {
      id: 6,
      title: "Threads @nemuaiofficial",
      url: "https://www.threads.com/@nemuaiofficial",
      icon: "threads",
      color: "#111111",
      enabled: true,
    },
    {
      id: 10,
      title: "X @NEMU__AI",
      url: "https://x.com/NEMU__AI",
      icon: "x",
      color: "#111111",
      enabled: true,
    },
    {
      id: 11,
      title: "YouTube @NEMU_AI",
      url: "https://www.youtube.com/@NEMU_AI",
      icon: "youtube",
      color: "#ff0033",
      enabled: true,
    },
    {
      id: 7,
      title: "TikTok @nemu_ai_",
      url: "https://www.tiktok.com/@nemu_ai_",
      icon: "tiktok",
      color: "#111111",
      enabled: true,
    },
    {
      id: 8,
      title: "LinkedIn Nemu AI",
      url: "https://www.linkedin.com/company/nemu-ai/",
      icon: "linkedin",
      color: "#0a66c2",
      enabled: true,
    },
  ],
  products: [],
};

const cekHargaFallbackProfile: PublicProfile = {
  theme: "classic",
  name: "cekhargadisini",
  bio: "Foto barangnya, AI yang cek harganya. Estimasi harga pasar Indonesia dalam hitungan detik, gratis.",
  profileImage: "/favicon.svg",
  links: [
    {
      id: 101,
      title: "Cek Harga Barang Sekarang",
      url: "https://cekhargadisini.com/",
      icon: "website",
      color: "#704bfd",
      enabled: true,
      image: "/favicon.svg",
      featured: true,
    },
    {
      id: 102,
      title: "Lainnya dari NEMU AI",
      url: "",
      icon: "external",
      color: "#704bfd",
      enabled: true,
      kind: "collection",
    },
    {
      id: 103,
      title: "Lihat Lebih Banyak di NEMU",
      url: "https://shop.nemu-ai.com/products?utm_source=cekhargadisini&utm_medium=referral&utm_campaign=spill_section",
      icon: "website",
      color: "#704bfd",
      enabled: true,
      image: "/favicon.svg",
    },
    {
      id: 104,
      title: "Download NEMU AI di Google Play",
      url: "https://play.google.com/store/apps/details?id=com.nemump.nemumobile&pcampaignid=web_share",
      icon: "external",
      color: "#704bfd",
      enabled: true,
      image: "/nemu-app-icon.webp",
    },
    {
      id: 105,
      title: "NEMU AI Link Bio",
      url: "https://linkbio.nemu-ai.com/nemu-ai",
      icon: "external",
      color: "#704bfd",
      enabled: true,
      image: "/favicon.svg",
    },
    {
      id: 106,
      title: "Ikuti Cek Harga di Sini",
      url: "",
      icon: "external",
      color: "#704bfd",
      enabled: true,
      kind: "collection",
    },
    {
      id: 107,
      title: "Instagram @cekhargadisini",
      url: "https://www.instagram.com/cekhargadisini/",
      icon: "instagram",
      color: "#e1306c",
      enabled: true,
    },
    {
      id: 108,
      title: "X @cekhargadisini",
      url: "https://x.com/cekhargadisini",
      icon: "x",
      color: "#111111",
      enabled: true,
    },
  ],
  products: [],
};

function cleanSlug(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 96);
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = cleanSlug((await params).slug) || "nemu-ai";
  const routeFallback = slug === "cekhargadisini" ? cekHargaFallbackProfile : fallbackProfile;
  let profile = routeFallback;

  try {
    const db = createSupabaseAdminClient();
    const { data, error } = await db
      .from("profiles")
      .select("data")
      .eq("public_id", slug)
      .maybeSingle();

    if (error) throw error;
    if (data?.data && typeof data.data === "object") {
      const stored = data.data as Partial<PublicProfile>;
      profile = {
        theme: stored.theme || routeFallback.theme,
        links: Array.isArray(stored.links) ? stored.links : [],
        name: stored.name || slug,
        bio: stored.bio || "",
        profileImage: stored.profileImage,
        products: Array.isArray(stored.products) ? stored.products : [],
        emailCapture: Boolean(stored.emailCapture),
      };
    }
  } catch {
    // Keep the public page available if the database is temporarily unavailable.
  }

  return <PublicProfileClient initialProfile={profile} slug={slug} />;
}
