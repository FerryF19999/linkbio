import { getNemuUser, isAdminUser } from "../../auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function cleanName(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function cleanEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase().slice(0, 254);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name?: unknown; email?: unknown };
    const name = cleanName(payload.name);
    const email = cleanEmail(payload.email);

    if (name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const db = createSupabaseAdminClient();
    const { data: existing, error: existingError } = await db
      .from("waitlist_entries")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingError) throw existingError;

    if (!existing) {
      const { error: insertError } = await db
        .from("waitlist_entries")
        .insert({
          name,
          email,
          source: "landing",
        });
      if (insertError && insertError.code !== "23505") throw insertError;
    }

    const { count: total, error: countError } = await db
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true });
    if (countError) throw countError;

    return Response.json({
      ok: true,
      alreadyJoined: Boolean(existing),
      total: total ?? 0,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to join the waitlist." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getNemuUser();
    if (!isAdminUser(user)) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const db = createSupabaseAdminClient();
    const { data: entries, error } = await db
      .from("waitlist_entries")
      .select("id,name,email,source,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;

    return Response.json({
      entries: (entries ?? []).map((entry) => ({
        id: entry.id,
        name: entry.name,
        email: entry.email,
        source: entry.source,
        createdAt: entry.created_at,
      })),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load the waitlist." },
      { status: 500 },
    );
  }
}
