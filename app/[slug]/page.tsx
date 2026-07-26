import { createSupabaseAdminClient } from "@/lib/supabase/server";
import PublicProfileClient, {
  type PublicProfile,
} from "./PublicProfileClient";

export const dynamic = "force-dynamic";

const fallbackProfile: PublicProfile = {
  theme: "sunset",
  name: "nemu.ai",
  bio: "Marketplace generasi baru Indonesia—lebih personal, aman, dan mudah dengan bantuan AI.",
  profileImage: "/favicon.svg",
  links: [
    {
      id: 1,
      title: "Website Resmi",
      url: "https://nemu-ai.com/",
      icon: "website",
      color: "#704bfd",
      enabled: true,
    },
    {
      id: 2,
      title: "Instagram",
      url: "https://www.instagram.com/nemu_ai_/",
      icon: "instagram",
      color: "#e1306c",
      enabled: true,
    },
    {
      id: 3,
      title: "TikTok",
      url: "https://www.tiktok.com/@nemu_ai_",
      icon: "tiktok",
      color: "#111111",
      enabled: true,
    },
    {
      id: 4,
      title: "LinkedIn",
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
