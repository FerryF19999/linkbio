import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getNemuUser, isAdminUser } from "../../auth";

function cleanPublicId(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 96);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const publicId = cleanPublicId(url.searchParams.get("id"));
    if (publicId.length < 3) return Response.json({ error: "invalid profile id" }, { status: 400 });
    const db = createSupabaseAdminClient();
    const { data: profile, error } = await db
      .from("profiles")
      .select("data,updated_at")
      .eq("public_id", publicId)
      .maybeSingle();
    if (error) throw error;
    if (!profile) return Response.json({ profile: null }, { status: 404 });
    const stored = profile.data as {
      theme?: string;
      links?: unknown[];
      name?: string;
      bio?: string;
      profileImage?: string;
      products?: unknown[];
      emailCapture?: boolean;
    };
    const publicProfile = {
      theme: stored.theme,
      links: stored.links ?? [],
      name: stored.name,
      bio: stored.bio,
      profileImage: stored.profileImage,
      products: stored.products ?? [],
      emailCapture: Boolean(stored.emailCapture),
    };
    return Response.json({ profile: publicProfile, updatedAt: profile.updated_at });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getNemuUser();
    if (!isAdminUser(user)) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as { publicId?: string; profile?: unknown };
    const publicId = cleanPublicId(payload.publicId);
    if (publicId.length < 3) {
      return Response.json({ error: "valid profile id is required" }, { status: 400 });
    }
    if (!payload.profile || typeof payload.profile !== "object") {
      return Response.json({ error: "profile is required" }, { status: 400 });
    }
    const serialized = JSON.stringify(payload.profile);
    if (serialized.length > 3_000_000) {
      return Response.json({ error: "profile is too large" }, { status: 413 });
    }
    const db = createSupabaseAdminClient();
    const updatedAt = new Date().toISOString();
    const { error: upsertError } = await db.from("profiles").upsert({
      public_id: publicId,
      edit_token_hash: "supabase-admin",
      data: payload.profile,
      updated_at: updatedAt,
    }, {
      onConflict: "public_id",
    });
    if (upsertError) throw upsertError;
    return Response.json({ ok: true, publicId });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save profile" }, { status: 500 });
  }
}
