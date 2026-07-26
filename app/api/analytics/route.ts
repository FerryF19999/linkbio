import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getNemuUser, isAdminUser } from "../../auth";

const trackedProfiles = ["nemu-ai", "cekhargadisini"] as const;

function cleanPublicId(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 96);
}

function cleanSessionId(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 96);
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      publicId?: unknown;
      sessionId?: unknown;
      referrer?: unknown;
    };
    const publicId = cleanPublicId(payload.publicId);
    const sessionId = cleanSessionId(payload.sessionId);

    if (!trackedProfiles.includes(publicId as (typeof trackedProfiles)[number])) {
      return Response.json({ error: "Profile is not tracked." }, { status: 400 });
    }
    if (sessionId.length < 12) {
      return Response.json({ error: "Invalid session." }, { status: 400 });
    }

    const db = createSupabaseAdminClient();
    const { error } = await db.from("profile_views").upsert(
      {
        public_id: publicId,
        session_id: sessionId,
        referrer: cleanText(payload.referrer, 500) || null,
        user_agent: cleanText(request.headers.get("user-agent"), 500) || null,
      },
      {
        onConflict: "public_id,session_id",
        ignoreDuplicates: true,
      },
    );
    if (error) throw error;

    return Response.json(
      { ok: true },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to record view." },
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
    const now = new Date();
    const today = startOfDay(now);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const profiles = Object.fromEntries(
      await Promise.all(
        trackedProfiles.map(async (publicId) => {
          const [totalResult, todayResult, recentResult] = await Promise.all([
            db.from("profile_views").select("id", { count: "exact", head: true }).eq("public_id", publicId),
            db
              .from("profile_views")
              .select("id", { count: "exact", head: true })
              .eq("public_id", publicId)
              .gte("viewed_at", today.toISOString()),
            db
              .from("profile_views")
              .select("viewed_at")
              .eq("public_id", publicId)
              .gte("viewed_at", sevenDaysAgo.toISOString())
              .order("viewed_at", { ascending: true })
              .limit(10000),
          ]);

          if (totalResult.error) throw totalResult.error;
          if (todayResult.error) throw todayResult.error;
          if (recentResult.error) throw recentResult.error;

          const daily = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + index);
            const dateKey = date.toISOString().slice(0, 10);
            return {
              date: dateKey,
              label: date.toLocaleDateString("id-ID", { weekday: "short" }),
              views: (recentResult.data ?? []).filter(
                (entry) => new Date(entry.viewed_at).toISOString().slice(0, 10) === dateKey,
              ).length,
            };
          });

          return [
            publicId,
            {
              total: totalResult.count ?? 0,
              today: todayResult.count ?? 0,
              last7Days: daily.reduce((sum, day) => sum + day.views, 0),
              daily,
            },
          ];
        }),
      ),
    );

    return Response.json(
      { profiles },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load analytics." },
      { status: 500 },
    );
  }
}
