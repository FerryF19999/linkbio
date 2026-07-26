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

function cleanIdentifier(value: unknown) {
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
      event?: unknown;
      publicId?: unknown;
      sessionId?: unknown;
      referrer?: unknown;
      eventId?: unknown;
      linkId?: unknown;
      linkType?: unknown;
    };
    const event = payload.event === "click" ? "click" : "view";
    const publicId = cleanPublicId(payload.publicId);
    const sessionId = cleanSessionId(payload.sessionId);

    if (!trackedProfiles.includes(publicId as (typeof trackedProfiles)[number])) {
      return Response.json({ error: "Profile is not tracked." }, { status: 400 });
    }
    if (sessionId.length < 12) {
      return Response.json({ error: "Invalid session." }, { status: 400 });
    }

    const db = createSupabaseAdminClient();

    if (event === "click") {
      const eventId = cleanIdentifier(payload.eventId);
      const linkId = cleanIdentifier(payload.linkId);
      const linkType = payload.linkType === "product" ? "product" : "link";

      if (eventId.length < 12 || !linkId) {
        return Response.json({ error: "Invalid click event." }, { status: 400 });
      }

      const { data: storedProfile, error: profileError } = await db
        .from("profiles")
        .select("data")
        .eq("public_id", publicId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!storedProfile) {
        return Response.json({ error: "Profile not found." }, { status: 404 });
      }

      const profileData = storedProfile.data as {
        links?: Array<{
          id?: string | number;
          title?: string;
          url?: string;
          enabled?: boolean;
          kind?: string;
        }>;
        products?: Array<{
          id?: string | number;
          title?: string;
          url?: string;
          enabled?: boolean;
        }>;
      };
      const candidates = linkType === "product" ? profileData.products : profileData.links;
      const target = (candidates ?? []).find(
        (item) =>
          String(item.id ?? "") === linkId &&
          item.enabled !== false &&
          (linkType === "product" || !("kind" in item) || item.kind !== "collection"),
      );
      if (!target?.url) {
        return Response.json({ error: "Tracked link not found." }, { status: 400 });
      }

      const { error: clickError } = await db.from("profile_clicks").upsert(
        {
          public_id: publicId,
          session_id: sessionId,
          event_id: eventId,
          link_id: linkId,
          link_type: linkType,
          link_title: cleanText(target.title, 200) || "Untitled link",
          target_url: cleanText(target.url, 2000),
          user_agent: cleanText(request.headers.get("user-agent"), 500) || null,
        },
        {
          onConflict: "public_id,event_id",
          ignoreDuplicates: true,
        },
      );
      if (clickError) throw clickError;

      return Response.json(
        { ok: true },
        { headers: { "cache-control": "no-store" } },
      );
    }

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
          const [
            totalResult,
            todayResult,
            recentResult,
            totalClicksResult,
            todayClicksResult,
            recentClicksResult,
            clickLinksResult,
          ] = await Promise.all([
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
            db.from("profile_clicks").select("id", { count: "exact", head: true }).eq("public_id", publicId),
            db
              .from("profile_clicks")
              .select("id", { count: "exact", head: true })
              .eq("public_id", publicId)
              .gte("clicked_at", today.toISOString()),
            db
              .from("profile_clicks")
              .select("clicked_at")
              .eq("public_id", publicId)
              .gte("clicked_at", sevenDaysAgo.toISOString())
              .order("clicked_at", { ascending: true })
              .limit(10000),
            db
              .from("profile_clicks")
              .select("link_id,link_type,link_title,target_url")
              .eq("public_id", publicId)
              .order("clicked_at", { ascending: false })
              .limit(10000),
          ]);

          if (totalResult.error) throw totalResult.error;
          if (todayResult.error) throw todayResult.error;
          if (recentResult.error) throw recentResult.error;
          if (totalClicksResult.error) throw totalClicksResult.error;
          if (todayClicksResult.error) throw todayClicksResult.error;
          if (recentClicksResult.error) throw recentClicksResult.error;
          if (clickLinksResult.error) throw clickLinksResult.error;

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
          const clickDaily = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + index);
            const dateKey = date.toISOString().slice(0, 10);
            return {
              date: dateKey,
              label: date.toLocaleDateString("id-ID", { weekday: "short" }),
              clicks: (recentClicksResult.data ?? []).filter(
                (entry) => new Date(entry.clicked_at).toISOString().slice(0, 10) === dateKey,
              ).length,
            };
          });
          const linkCounts = new Map<
            string,
            { linkId: string; linkType: string; title: string; url: string; clicks: number }
          >();
          for (const click of clickLinksResult.data ?? []) {
            const key = `${click.link_type}:${click.link_id}`;
            const current = linkCounts.get(key);
            if (current) {
              current.clicks += 1;
            } else {
              linkCounts.set(key, {
                linkId: click.link_id,
                linkType: click.link_type,
                title: click.link_title,
                url: click.target_url,
                clicks: 1,
              });
            }
          }

          return [
            publicId,
            {
              total: totalResult.count ?? 0,
              today: todayResult.count ?? 0,
              last7Days: daily.reduce((sum, day) => sum + day.views, 0),
              daily,
              clicks: {
                total: totalClicksResult.count ?? 0,
                today: todayClicksResult.count ?? 0,
                last7Days: clickDaily.reduce((sum, day) => sum + day.clicks, 0),
                daily: clickDaily,
                links: Array.from(linkCounts.values()).sort((a, b) => b.clicks - a.clicks),
              },
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
