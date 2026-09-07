import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getNemuUser, isAdminUser } from "../../auth";

export const runtime = "nodejs";

const platforms = new Set(["Instagram Reels", "TikTok", "YouTube Shorts"]);
const agreementFields = [
  "ownsContent",
  "staysPublic",
  "organicViews",
  "insightVerification",
  "repostPermission",
  "termsAccepted",
] as const;

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function cleanMultiline(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function checked(formData: FormData, field: string) {
  return formData.get(field) === "on" || formData.get(field) === "true";
}

export async function POST(request: Request) {
  let uploadedPath = "";
  try {
    const formData = await request.formData();
    if (cleanText(formData.get("website"), 100)) {
      return Response.json({ ok: true });
    }

    const fullName = cleanText(formData.get("fullName"), 100);
    const whatsapp = cleanText(formData.get("whatsapp"), 30);
    const email = cleanText(formData.get("email"), 254).toLowerCase();
    const domicile = cleanText(formData.get("domicile"), 100);
    const socialUsername = cleanText(formData.get("socialUsername"), 120);
    const platform = cleanText(formData.get("platform"), 30);
    const contentUrl = cleanText(formData.get("contentUrl"), 2000);
    const publishedAt = cleanText(formData.get("publishedAt"), 10);
    const contentConcept = cleanMultiline(formData.get("contentConcept"), 1000);
    const isAdult = checked(formData, "isAdult");

    if (fullName.length < 2) {
      return Response.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
    }
    if (!/^[+\d][\d\s()-]{7,28}$/.test(whatsapp)) {
      return Response.json({ error: "Masukkan nomor WhatsApp aktif yang valid." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Alamat email tidak valid." }, { status: 400 });
    }
    if (!isAdult) {
      return Response.json({ error: "Peserta harus berusia minimal 18 tahun." }, { status: 400 });
    }
    if (socialUsername.length < 2) {
      return Response.json({ error: "Username Instagram atau TikTok wajib diisi." }, { status: 400 });
    }
    if (!platforms.has(platform)) {
      return Response.json({ error: "Pilih platform tempat konten dipublikasikan." }, { status: 400 });
    }
    if (!isValidUrl(contentUrl)) {
      return Response.json({ error: "Masukkan link konten challenge yang valid." }, { status: 400 });
    }

    const publishedDate = new Date(`${publishedAt}T00:00:00Z`);
    if (!publishedAt || Number.isNaN(publishedDate.getTime())) {
      return Response.json({ error: "Tanggal publikasi wajib diisi." }, { status: 400 });
    }
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    if (publishedDate >= tomorrow) {
      return Response.json({ error: "Tanggal publikasi tidak boleh di masa depan." }, { status: 400 });
    }

    if (!agreementFields.every((field) => checked(formData, field))) {
      return Response.json({ error: "Semua persetujuan wajib harus dicentang." }, { status: 400 });
    }

    const screenshot = formData.get("insightScreenshot");
    if (screenshot instanceof File && screenshot.size > 0) {
      if (screenshot.size > 3 * 1024 * 1024) {
        return Response.json({ error: "Screenshot maksimal berukuran 3 MB." }, { status: 400 });
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(screenshot.type)) {
        return Response.json({ error: "Screenshot harus berformat JPG, PNG, atau WebP." }, { status: 400 });
      }
    }

    const submissionId = crypto.randomUUID();
    const db = createSupabaseAdminClient();

    if (screenshot instanceof File && screenshot.size > 0) {
      const extension = screenshot.type === "image/png" ? "png" : screenshot.type === "image/webp" ? "webp" : "jpg";
      uploadedPath = `${submissionId}/insight.${extension}`;
      const { error: uploadError } = await db.storage
        .from("challenge-insights")
        .upload(uploadedPath, Buffer.from(await screenshot.arrayBuffer()), {
          contentType: screenshot.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;
    }

    const { error: insertError } = await db.from("challenge_submissions").insert({
      id: submissionId,
      full_name: fullName,
      whatsapp,
      email: email || null,
      is_adult: isAdult,
      domicile: domicile || null,
      social_username: socialUsername,
      platform,
      content_url: contentUrl,
      published_at: publishedAt,
      insight_screenshot_path: uploadedPath || null,
      content_concept: contentConcept || null,
      owns_content: checked(formData, "ownsContent"),
      stays_public: checked(formData, "staysPublic"),
      organic_views: checked(formData, "organicViews"),
      insight_verification: checked(formData, "insightVerification"),
      repost_permission: checked(formData, "repostPermission"),
      terms_accepted: checked(formData, "termsAccepted"),
    });
    if (insertError) {
      if (uploadedPath) {
        await db.storage.from("challenge-insights").remove([uploadedPath]);
      }
      if (insertError.code === "23505") {
        return Response.json({ error: "Link konten ini sudah pernah didaftarkan." }, { status: 409 });
      }
      throw insertError;
    }

    return Response.json(
      { ok: true, submissionId },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Pendaftaran belum berhasil. Silakan coba lagi." },
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
    const { data, error } = await db
      .from("challenge_submissions")
      .select("id,full_name,whatsapp,email,domicile,social_username,platform,content_url,published_at,insight_screenshot_path,content_concept,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;

    const entries = await Promise.all((data ?? []).map(async (entry) => {
      let screenshotUrl: string | null = null;
      if (entry.insight_screenshot_path) {
        const { data: signed } = await db.storage
          .from("challenge-insights")
          .createSignedUrl(entry.insight_screenshot_path, 3600);
        screenshotUrl = signed?.signedUrl ?? null;
      }
      return {
        id: entry.id,
        fullName: entry.full_name,
        whatsapp: entry.whatsapp,
        email: entry.email,
        domicile: entry.domicile,
        socialUsername: entry.social_username,
        platform: entry.platform,
        contentUrl: entry.content_url,
        publishedAt: entry.published_at,
        screenshotUrl,
        contentConcept: entry.content_concept,
        createdAt: entry.created_at,
      };
    }));

    return Response.json({ entries }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load challenge submissions." },
      { status: 500 },
    );
  }
}
