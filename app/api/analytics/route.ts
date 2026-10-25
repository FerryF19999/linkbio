import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getNemuUser, isAdminUser } from "../../auth";
import { createHash } from "node:crypto";

const trackedProfiles = ["nemu-ai", "cekhargadisini"] as const;
const trackedChannels = ["instagram", "tiktok", "youtube", "facebook", "x", "threads"] as const;
type TrackedChannel = (typeof trackedChannels)[number];
type TrafficChannel = TrackedChannel | "direct" | "other";

const botUserAgentPattern =
  /bot|crawler|spider|slurp|scrapy|curl|wget|python-requests|python\/|postmanruntime|insomnia|go-http-client|phantomjs|headlesschrome|selenium|puppeteer|playwright|lighthouse|pagespeed|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterestbot|slackbot|discordbot|telegrambot|skypeuripreview|google-inspectiontool|bingpreview|gptbot|chatgpt-user|claudebot|perplexitybot/i;

const channelLabels: Record<TrafficChannel, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
  threads: "Threads",
  direct: "Direct",
  other: "Lainnya",
};

const channelAliases: Record<string, TrafficChannel> = {
  ig: "instagram",
  instagram: "instagram",
  tt: "tiktok",
  tiktok: "tiktok",
  yt: "youtube",
  youtube: "youtube",
  fb: "facebook",
  facebook: "facebook",
  x: "x",
  twitter: "x",
  threads: "threads",
  direct: "direct",
  other: "other",
};

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

function channelFromReferrer(value: string): TrafficChannel | null {
  if (!value) return null;
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
    if (host === "x.com" || host.endsWith(".x.com") || host.includes("twitter.com") || host.includes("t.co")) return "x";
    if (host.includes("threads.com") || host.includes("threads.net")) return "threads";
    return null;
  } catch {
    return null;
  }
}

function channelFromUserAgent(value: string): TrafficChannel | null {
  const userAgent = value.toLowerCase();
  if (/instagram/.test(userAgent)) return "instagram";
  if (/tiktok|musical_ly|bytedance/.test(userAgent)) return "tiktok";
  if (/youtube/.test(userAgent)) return "youtube";
  if (/fban|fbav|facebook/.test(userAgent)) return "facebook";
  if (/twitter/.test(userAgent)) return "x";
  if (/threads|barcelona/.test(userAgent)) return "threads";
  return null;
}

function resolveTrafficChannel(source: unknown, referrer: unknown, userAgent: string): TrafficChannel {
  const explicit = channelAliases[cleanText(source, 40).toLowerCase()];
  const cleanedReferrer = cleanText(referrer, 500);
  return (
    explicit ??
    channelFromReferrer(cleanedReferrer) ??
    channelFromUserAgent(userAgent) ??
    (cleanedReferrer ? "other" : "direct")
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

type ClickPerformancePeriod = "daily" | "weekly" | "monthly";

function clickPerformanceLabel(period: ClickPerformancePeriod, periodStart: string) {
  const date = new Date(`${periodStart}T00:00:00+07:00`);
  if (period === "daily") {
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    });
  }
  if (period === "weekly") {
    const endDate = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
    const startLabel = date.toLocaleDateString("id-ID", {
      day: "numeric",
      timeZone: "Asia/Jakarta",
    });
    const endLabel = endDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Jakarta",
    });
    return `${startLabel}–${endLabel}`;
  }
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function botReason(request: Request, userAgent: string) {
  if (!userAgent) return "missing_user_agent";
  if (botUserAgentPattern.test(userAgent)) return "known_bot_user_agent";

  const requestOrigin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  if (requestOrigin && requestOrigin !== expectedOrigin) return "cross_origin_request";

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return "invalid_fetch_context";
  }

  return null;
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    ""
  )
    .split(",")[0]
    .trim();
}

function analyticsFingerprint(request: Request, publicId: string, userAgent: string) {
  const ip = getClientIp(request);
  if (!ip) return "";

  const salt = process.env.ANALYTICS_HASH_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "nemu-analytics";
  const browserHints = [
    request.headers.get("accept-language") ?? "",
    request.headers.get("sec-ch-ua") ?? "",
    request.headers.get("sec-ch-ua-mobile") ?? "",
    request.headers.get("sec-ch-ua-platform") ?? "",
  ].join("|");

  return createHash("sha256")
    .update(`${salt}|${publicId}|${ip}|${userAgent}|${browserHints}`)
    .digest("hex");
}

async function isRateLimited(
  db: ReturnType<typeof createSupabaseAdminClient>,
  request: Request,
  publicId: string,
  userAgent: string,
  event: "view" | "click",
) {
  const fingerprint = analyticsFingerprint(request, publicId, userAgent);
  if (!fingerprint) return false;

  const { data, error } = await db.rpc("consume_analytics_rate_limit", {
    p_fingerprint: fingerprint,
    p_event_kind: event,
    p_limit: event === "view" ? 30 : 90,
    p_window_seconds: 600,
  });
  if (error) throw error;
  return data !== true;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      event?: unknown;
      publicId?: unknown;
      sessionId?: unknown;
      referrer?: unknown;
      sourceChannel?: unknown;
      eventId?: unknown;
      linkId?: unknown;
      linkType?: unknown;
    };
    const event = payload.event === "click" ? "click" : "view";
    const publicId = cleanPublicId(payload.publicId);
    const sessionId = cleanSessionId(payload.sessionId);
    const userAgent = cleanText(request.headers.get("user-agent"), 500);
    const sourceChannel = resolveTrafficChannel(payload.sourceChannel, payload.referrer, userAgent);

    if (!trackedProfiles.includes(publicId as (typeof trackedProfiles)[number])) {
      return Response.json({ error: "Profile is not tracked." }, { status: 400 });
    }
    if (sessionId.length < 12) {
      return Response.json({ error: "Invalid session." }, { status: 400 });
    }

    const filteredReason = botReason(request, userAgent);
    if (filteredReason) {
      return Response.json(
        { ok: true, filtered: true },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const db = createSupabaseAdminClient();
    if (await isRateLimited(db, request, publicId, userAgent, event)) {
      return Response.json(
        { ok: true, filtered: true },
        { headers: { "cache-control": "no-store" } },
      );
    }

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
          source_channel: sourceChannel,
          user_agent: userAgent || null,
          is_bot: false,
          bot_reason: null,
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
        source_channel: sourceChannel,
        user_agent: userAgent || null,
        is_bot: false,
        bot_reason: null,
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

export async function GET(request: Request) {
  try {
    const user = await getNemuUser();
    if (!user) {
      return Response.json(
        { error: "Admin session expired. Please log in again." },
        { status: 401, headers: { "cache-control": "no-store" } },
      );
    }
    if (!isAdminUser(user)) {
      return Response.json(
        { error: "Admin access required." },
        { status: 403, headers: { "cache-control": "no-store" } },
      );
    }

    const db = createSupabaseAdminClient();
    const now = new Date();
    const params = new URL(request.url).searchParams;
    const channelRange = params.get("channelRange") ?? "all";
    if (!["daily", "last7", "last14", "monthly", "all"].includes(channelRange)) {
      return Response.json({ error: "Invalid channel period." }, { status: 400 });
    }
    const wibDate = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const selectedDate = params.get("channelDate") || wibDate;
    const selectedMonth = params.get("channelMonth") || wibDate.slice(0, 7);
    const parsedDate = new Date(`${selectedDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) || Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== selectedDate ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth) ||
      Number(selectedMonth.slice(0, 4)) < 2000) {
      return Response.json({ error: "Invalid channel date or month." }, { status: 400 });
    }
    let channelStart = new Date(`${wibDate}T00:00:00+07:00`);
    let channelEnd = new Date(channelStart.getTime() + 86_400_000);
    if (channelRange === "daily") {
      channelStart = new Date(`${selectedDate}T00:00:00+07:00`);
      channelEnd = new Date(channelStart.getTime() + 86_400_000);
    } else if (channelRange === "last7" || channelRange === "last14") {
      channelStart = new Date(channelStart.getTime() - (channelRange === "last7" ? 6 : 13) * 86_400_000);
    } else if (channelRange === "monthly") {
      channelStart = new Date(`${selectedMonth}-01T00:00:00+07:00`);
      const nextMonth = new Date(`${selectedMonth}-01T00:00:00Z`);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      channelEnd = new Date(`${nextMonth.toISOString().slice(0, 10)}T00:00:00+07:00`);
    }
    const channelDates: string[] = [];
    if (channelRange !== "all") {
      for (let date = channelStart.getTime(); date < channelEnd.getTime(); date += 86_400_000) {
        channelDates.push(new Date(date + 7 * 60 * 60 * 1000).toISOString().slice(0, 10));
      }
    }
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
            clickPerformanceResult,
            clickLinksResult,
            channelAnalyticsResult,
          ] = await Promise.all([
            db.from("profile_views").select("id", { count: "exact", head: true }).eq("public_id", publicId).eq("is_bot", false),
            db
              .from("profile_views")
              .select("id", { count: "exact", head: true })
              .eq("public_id", publicId)
              .eq("is_bot", false)
              .gte("viewed_at", today.toISOString()),
            db
              .from("profile_views")
              .select("viewed_at")
              .eq("public_id", publicId)
              .eq("is_bot", false)
              .gte("viewed_at", sevenDaysAgo.toISOString())
              .order("viewed_at", { ascending: true })
              .limit(10000),
            db.from("profile_clicks").select("id", { count: "exact", head: true }).eq("public_id", publicId).eq("is_bot", false),
            db
              .rpc("get_profile_click_performance", {
                p_public_id: publicId,
              }),
            db
              .from("profile_clicks")
              .select("session_id,source_channel,link_id,link_type,link_title,target_url")
              .eq("public_id", publicId)
              .eq("is_bot", false)
              .order("clicked_at", { ascending: false })
              .limit(10000),
            channelRange === "all"
              ? db.rpc("get_profile_channel_analytics", { p_public_id: publicId })
              : db.rpc("get_profile_channel_period", {
                  p_public_id: publicId,
                  p_start: channelStart.toISOString(),
                  p_end: channelEnd.toISOString(),
                }),
          ]);

          if (totalResult.error) throw totalResult.error;
          if (todayResult.error) throw todayResult.error;
          if (recentResult.error) throw recentResult.error;
          if (totalClicksResult.error) throw totalClicksResult.error;
          if (clickPerformanceResult.error) throw clickPerformanceResult.error;
          if (clickLinksResult.error) throw clickLinksResult.error;
          if (channelAnalyticsResult.error) throw channelAnalyticsResult.error;

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
          const clickPerformance: Record<
            ClickPerformancePeriod,
            Array<{ date: string; label: string; clicks: number }>
          > = { daily: [], weekly: [], monthly: [] };
          for (const row of clickPerformanceResult.data ?? []) {
            const period = String(row.period) as ClickPerformancePeriod;
            if (!(period in clickPerformance)) continue;
            const date = String(row.period_start);
            clickPerformance[period].push({
              date,
              label: clickPerformanceLabel(period, date),
              clicks: Number(row.clicks ?? 0),
            });
          }
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

          const channelCounts = new Map<TrafficChannel, { views: number; clicks: number }>(
            ([...trackedChannels, "direct", "other"] as TrafficChannel[]).map((channel) => [
              channel,
              { views: 0, clicks: 0 },
            ]),
          );
          for (const row of channelAnalyticsResult.data ?? []) {
            const channel = channelAliases[String(row.channel ?? "").toLowerCase()] ?? "other";
            const counts = channelCounts.get(channel)!;
            counts.views += Number(row.views ?? 0);
            counts.clicks += Number(row.clicks ?? 0);
          }

          return [
            publicId,
            {
              total: totalResult.count ?? 0,
              today: todayResult.count ?? 0,
              last7Days: daily.reduce((sum, day) => sum + day.views, 0),
              daily,
              channelDaily: channelDates.map((date) => ({
                date,
                channels: [...trackedChannels, "direct", "other"].map((channel) => {
                  const row = (channelAnalyticsResult.data ?? []).find(
                    (entry: { date?: string; channel: string }) => entry.date === date && entry.channel === channel,
                  );
                  return { channel, views: Number(row?.views ?? 0), clicks: Number(row?.clicks ?? 0) };
                }),
              })),
              channels: Array.from(channelCounts, ([channel, counts]) => ({
                channel,
                label: channelLabels[channel],
                ...counts,
              })),
              clicks: {
                total: totalClicksResult.count ?? 0,
                today: clickPerformance.daily.at(-1)?.clicks ?? 0,
                last7Days: clickPerformance.daily.reduce((sum, day) => sum + day.clicks, 0),
                ...clickPerformance,
                links: Array.from(linkCounts.values()).sort((a, b) => b.clicks - a.clicks),
              },
            },
          ];
        }),
      ),
    );

    return Response.json(
      { profiles, channelPeriod: { range: channelRange, dates: channelDates } },
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
