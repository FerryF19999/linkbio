import { count, desc, eq } from "drizzle-orm";
import { getChatGPTUser, isAdminUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { waitlistEntries } from "../../../db/schema";

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

    const db = getDb();
    const [existing] = await db
      .select({ id: waitlistEntries.id })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.email, email))
      .limit(1);
    const createdAt = new Date();
    if (!existing) {
      await db
        .insert(waitlistEntries)
        .values({
          id: crypto.randomUUID(),
          name,
          email,
          source: "landing",
          createdAt,
        })
        .onConflictDoNothing({ target: waitlistEntries.email });
    }
    const [total] = await db.select({ value: count() }).from(waitlistEntries);

    return Response.json({
      ok: true,
      alreadyJoined: Boolean(existing),
      total: total?.value ?? 0,
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
    const user = await getChatGPTUser();
    if (!isAdminUser(user)) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const db = getDb();
    const entries = await db
      .select()
      .from(waitlistEntries)
      .orderBy(desc(waitlistEntries.createdAt))
      .limit(1000);

    return Response.json({
      entries: entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load the waitlist." },
      { status: 500 },
    );
  }
}
