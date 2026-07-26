import { createSupabaseAdminClient } from "@/lib/supabase/server";
import PublicProfileClient, {
  type PublicProfile,
} from "./PublicProfileClient";

export const dynamic = "force-dynamic";

const fallbackProfile: PublicProfile = {
  theme: "sunset",
  name: "nemuai",
  bio: "Your story, your links, all in one place.",
  links: [
    {
      id: 1,
      title: "Instagram",
      url: "https://instagram.com/",
      icon: "instagram",
      color: "#e1306c",
      enabled: true,
    },
  ],
  products: [
    {
      id: 3,
      title: "Creator Starter Pack",
      price: "Rp99.000",
      url: "https://example.com",
      enabled: true,
    },
  ],
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
