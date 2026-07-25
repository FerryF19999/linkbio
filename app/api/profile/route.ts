import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

function cleanSlug(value: unknown) {
  return String(value ?? "nemuai")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32) || "nemuai";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = cleanSlug(url.searchParams.get("slug"));
    const db = getDb();
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug)).limit(1);
    if (!profile) return Response.json({ profile: null }, { status: 404 });
    return Response.json({ profile: JSON.parse(profile.data), updatedAt: profile.updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { slug?: string; profile?: unknown };
    const slug = cleanSlug(payload.slug);
    if (!payload.profile || typeof payload.profile !== "object") {
      return Response.json({ error: "profile is required" }, { status: 400 });
    }
    const data = JSON.stringify(payload.profile);
    if (data.length > 3_000_000) {
      return Response.json({ error: "profile is too large" }, { status: 413 });
    }
    const db = getDb();
    const updatedAt = new Date();
    await db.insert(profiles).values({ slug, data, updatedAt }).onConflictDoUpdate({
      target: profiles.slug,
      set: { data, updatedAt },
    });
    return Response.json({ ok: true, slug });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save profile" }, { status: 500 });
  }
}
