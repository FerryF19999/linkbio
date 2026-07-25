import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

function cleanPublicId(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 96);
}

async function hashToken(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const publicId = cleanPublicId(url.searchParams.get("id"));
    if (publicId.length < 24) return Response.json({ error: "invalid profile id" }, { status: 400 });
    const db = getDb();
    const [profile] = await db.select().from(profiles).where(eq(profiles.publicId, publicId)).limit(1);
    if (!profile) return Response.json({ profile: null }, { status: 404 });
    const stored = JSON.parse(profile.data) as {
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
    return Response.json({ profile: publicProfile, updatedAt: profile.updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { publicId?: string; profile?: unknown };
    const publicId = cleanPublicId(payload.publicId);
    const authorization = request.headers.get("authorization") ?? "";
    const editToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (publicId.length < 24 || editToken.length < 48) {
      return Response.json({ error: "valid profile credentials are required" }, { status: 401 });
    }
    if (!payload.profile || typeof payload.profile !== "object") {
      return Response.json({ error: "profile is required" }, { status: 400 });
    }
    const data = JSON.stringify(payload.profile);
    if (data.length > 3_000_000) {
      return Response.json({ error: "profile is too large" }, { status: 413 });
    }
    const db = getDb();
    const editTokenHash = await hashToken(editToken);
    const [existing] = await db.select({ editTokenHash: profiles.editTokenHash }).from(profiles).where(eq(profiles.publicId, publicId)).limit(1);
    if (existing && existing.editTokenHash !== editTokenHash) {
      return Response.json({ error: "profile credentials do not match" }, { status: 403 });
    }
    const updatedAt = new Date();
    await db.insert(profiles).values({ publicId, editTokenHash, data, updatedAt }).onConflictDoUpdate({
      target: profiles.publicId,
      set: { data, updatedAt },
    });
    return Response.json({ ok: true, publicId });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save profile" }, { status: 500 });
  }
}
