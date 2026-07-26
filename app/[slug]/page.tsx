import { createSupabaseAdminClient } from "@/lib/supabase/server";
import PublicProfileClient, {
  type PublicProfile,
} from "./PublicProfileClient";

export const dynamic = "force-dynamic";

const fallbackProfile: PublicProfile = {
  theme: "classic",
  name: "nemu.ai",
  bio: "Marketplace generasi baru Indonesia, lebih personal, aman, dan mudah dengan bantuan AI.",
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
      id: 4,
      title: "Apply Content Creator",
      url: "mailto:info@nemu-ai.com?subject=Apply%20Content%20Creator%20NEMU%20AI",
      icon: "email",
      color: "#704bfd",
      enabled: true,
    },
    {
      id: 5,
      title: "Instagram @nemu_ai_",
      url: "https://www.instagram.com/nemu_ai_/",
      icon: "instagram",
      color: "#e1306c",
      enabled: true,
    },
    {
      id: 6,
      title: "TikTok @nemu_ai_",
      url: "https://www.tiktok.com/@nemu_ai_",
      icon: "tiktok",
      color: "#111111",
      enabled: true,
    },
    {
      id: 7,
      title: "LinkedIn Nemu AI",
      url: "https://www.linkedin.com/company/nemu-ai/",
      icon: "linkedin",
      color: "#0a66c2",
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
  let profile = fallbackProfile;

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
        theme: stored.theme || fallbackProfile.theme,
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
