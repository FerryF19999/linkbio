"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { IconType } from "react-icons";
import { FaLinkedin } from "react-icons/fa6";
import { FiArrowUpRight, FiCheck, FiExternalLink, FiGlobe, FiMail, FiShare2, FiShoppingBag } from "react-icons/fi";
import { destinationLabel } from "@/lib/profile-links";
import styles from "./PublicProfile.module.css";
import {
  SiAppstore,
  SiApplemusic,
  SiFacebook,
  SiInstagram,
  SiPatreon,
  SiPinterest,
  SiSnapchat,
  SiSoundcloud,
  SiSpotify,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";

export type PublicLink = {
  id: number;
  title: string;
  url: string;
  icon: string;
  color: string;
  enabled: boolean;
  image?: string;
  featured?: boolean;
  badge?: string;
  kind?: "link" | "collection";
};

export type PublicProduct = {
  id: number;
  title: string;
  price: string;
  url: string;
  enabled: boolean;
};

export type PublicProfile = {
  theme: string;
  links: PublicLink[];
  name: string;
  bio: string;
  profileImage?: string;
  products?: PublicProduct[];
  emailCapture?: boolean;
};

const themeStyles: Record<string, { bg: string; text: string; button: string; buttonText: string; outline?: boolean }> = {
  classic: { bg: "#f8f8fb", text: "#0b0b0e", button: "#ffffff", buttonText: "#1a1a1f" },
  midnight: { bg: "#0a0a0a", text: "#ffffff", button: "#202020", buttonText: "#ffffff" },
  sunset: { bg: "linear-gradient(160deg,#bdeef1 0%,#e8d7ef 45%,#f06448 100%)", text: "#251b29", button: "#ffffff", buttonText: "#251b29" },
  grid: { bg: "#5b3034", text: "#fff6de", button: "#fff2d0", buttonText: "#5b3034" },
  cream: { bg: "#fff7e9", text: "#c22b24", button: "#fff7e9", buttonText: "#c22b24", outline: true },
  forest: { bg: "#07352d", text: "#e9ffe6", button: "#e4ffdc", buttonText: "#07352d" },
  cloud: { bg: "#eff1f5", text: "#171717", button: "#ffffff", buttonText: "#171717" },
  earth: { bg: "#6f655d", text: "#fffdf6", button: "#9a8b80", buttonText: "#211a16" },
  berry: { bg: "linear-gradient(180deg,#5b002a 0%,#7d3565 100%)", text: "#ffffff", button: "transparent", buttonText: "#ffffff", outline: true },
  violet: { bg: "#9252c9", text: "#ffffff", button: "#ead6ff", buttonText: "#4b1a70" },
  mist: { bg: "#c7dbe1", text: "#183038", button: "#dcecef", buttonText: "#183038" },
  paper: { bg: "#eeeee4", text: "#171717", button: "#ffffff", buttonText: "#171717", outline: true },
  aurora: { bg: "linear-gradient(#17122380, #17122380), radial-gradient(circle at 75% 22%,#ffac38 0%,#ec5d49 30%,#46d1a0 67%,#134754 100%)", text: "#ffffff", button: "#ffffff", buttonText: "#171717" },
};

const brandIcons: Record<string, IconType> = {
  appstore: SiAppstore,
  instagram: SiInstagram,
  whatsapp: SiWhatsapp,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  website: FiGlobe,
  spotify: SiSpotify,
  threads: SiThreads,
  facebook: SiFacebook,
  linkedin: FaLinkedin,
  x: SiX,
  soundcloud: SiSoundcloud,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  patreon: SiPatreon,
  twitch: SiTwitch,
  apple: SiApplemusic,
  email: FiMail,
  external: FiExternalLink,
};

const socialIcons = new Set(["instagram", "tiktok", "linkedin", "youtube", "facebook", "x", "threads", "whatsapp"]);

function BrandIcon({ name }: { name: string }) {
  const Icon = brandIcons[name] ?? FiExternalLink;
  return <Icon aria-hidden="true" />;
}

function getAnalyticsSessionId() {
  const sessionKey = "nemu-linkbio-analytics-session";
  let sessionId = sessionStorage.getItem(sessionKey) ?? "";
  if (!sessionId) {
    sessionId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(sessionKey, sessionId);
  }
  return sessionId;
}

function createAnalyticsEventId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function shouldSkipAnalytics() {
  const prerendering = (document as Document & { prerendering?: boolean }).prerendering === true;
  return (
    navigator.doNotTrack === "1" ||
    navigator.webdriver === true ||
    /HeadlessChrome|PhantomJS|Puppeteer|Playwright|Selenium/i.test(navigator.userAgent) ||
    prerendering
  );
}

const trafficChannelAliases: Record<string, string> = {
  ig: "instagram",
  instagram: "instagram",
  tiktok: "tiktok",
  tt: "tiktok",
  youtube: "youtube",
  yt: "youtube",
  facebook: "facebook",
  fb: "facebook",
  x: "x",
  twitter: "x",
  threads: "threads",
};

function channelFromValue(value: string) {
  return trafficChannelAliases[value.trim().toLowerCase()] ?? "";
}

function channelFromReferrer(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
    if (host === "x.com" || host.endsWith(".x.com") || host.includes("twitter.com") || host.includes("t.co")) return "x";
    if (host.includes("threads.com") || host.includes("threads.net")) return "threads";
  } catch {
    // Missing and privacy-stripped referrers are handled as direct traffic.
  }
  return "";
}

function getTrafficChannel(slug: string) {
  const storageKey = `nemu-linkbio-channel:${slug}`;
  const params = new URLSearchParams(window.location.search);
  const explicit = channelFromValue(
    params.get("utm_source") ?? params.get("source") ?? params.get("ref") ?? "",
  );
  const detected = explicit || channelFromReferrer(document.referrer);
  if (detected) sessionStorage.setItem(storageKey, detected);
  return detected || sessionStorage.getItem(storageKey) || "";
}

export default function PublicProfileClient({
  initialProfile,
  slug,
}: {
  initialProfile: PublicProfile;
  slug: string;
}) {
  const profile = initialProfile;
  const [joined, setJoined] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "manual">("idle");
  const theme = themeStyles[profile.theme] ?? themeStyles.sunset;
  const enabledLinks = profile.links.filter((link) => link.enabled);
  const socials = enabledLinks.filter((link) => link.kind !== "collection" && socialIcons.has(link.icon)).slice(0, 6);
  const products = (profile.products ?? []).filter((product) => product.enabled);
  const name = profile.name || slug;
  const themeVariables = {
    background: theme.bg,
    color: theme.text,
    "--profile-ink": theme.text,
    "--link-fill": theme.button,
    "--link-text": theme.buttonText,
    "--link-border": theme.outline ? theme.text : "color-mix(in srgb, currentColor 13%, transparent)",
  } as CSSProperties;

  useEffect(() => {
    if (shareState !== "copied") return;
    const timeout = window.setTimeout(() => setShareState("idle"), 3000);
    return () => window.clearTimeout(timeout);
  }, [shareState]);

  useEffect(() => {
    if (shouldSkipAnalytics()) return;

    try {
      const sessionId = getAnalyticsSessionId();
      const viewKey = `nemu-linkbio-viewed:${slug}:${sessionId}`;
      if (sessionStorage.getItem(viewKey)) return;
      sessionStorage.setItem(viewKey, "1");

      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          publicId: slug,
          sessionId,
          referrer: document.referrer,
          sourceChannel: getTrafficChannel(slug),
        }),
        keepalive: true,
      }).then((response) => {
        if (!response.ok) sessionStorage.removeItem(viewKey);
      }).catch(() => {
        sessionStorage.removeItem(viewKey);
      });
    } catch {
      // Analytics must never block the public profile experience.
    }
  }, [slug]);

  const trackClick = (
    item: { id: number; title: string; url: string },
    linkType: "link" | "product",
  ) => {
    if (!item.url || item.url === "#" || shouldSkipAnalytics()) return;
    try {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: "click",
          publicId: slug,
          sessionId: getAnalyticsSessionId(),
          eventId: createAnalyticsEventId(),
          linkId: String(item.id),
          linkType,
          referrer: document.referrer,
          sourceChannel: getTrafficChannel(slug),
        }),
        keepalive: true,
      }).catch(() => {
        // A tracking failure must never interrupt navigation.
      });
    } catch {
      // A tracking failure must never interrupt navigation.
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `@${name}`, url });
        setShareState("idle");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch {
      setShareState("manual");
    }
  };

  return (
    <main className={styles.shell} data-theme={profile.theme} style={themeVariables}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <Link className={styles.brand} href="/">
            <span aria-hidden="true" className={styles.mark} /> NEMU Link Bio
          </Link>
          <button className={styles.share} type="button" onClick={share}>
            {shareState === "copied" ? <FiCheck aria-hidden="true" /> : <FiShare2 aria-hidden="true" />}
            <span aria-live="polite">{shareState === "copied" ? "Tersalin" : "Bagikan"}</span>
          </button>
        </header>
        {shareState === "manual" && (
          <label className={styles.manualShare}>
            Salin alamat profil ini
            <input type="url" readOnly value={window.location.href} onFocus={(event) => event.target.select()} />
          </label>
        )}
        <div className={styles.layout}>
          <section aria-labelledby="profile-name" className={styles.identity}>
            <div
              aria-hidden="true"
              className={styles.avatar}
              style={profile.profileImage ? { backgroundImage: `url("${profile.profileImage}")` } : undefined}
            >
              {!profile.profileImage && name.slice(0, 2).toUpperCase()}
            </div>
            <h1 id="profile-name">@{name}</h1>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            {socials.length > 0 && (
              <nav className={styles.socials} aria-label="Media sosial">
                {socials.map((link) => (
                  <a key={link.id} href={link.url || "#"} target="_blank" rel="noreferrer" aria-label={link.title || link.icon} onClick={() => trackClick(link, "link")}>
                    <BrandIcon name={link.icon} />
                  </a>
                ))}
              </nav>
            )}
          </section>
          <div className={styles.content}>
            <section aria-label="Tautan profil" className={styles.links}>
              {enabledLinks.map((link) => {
                if (link.kind === "collection") return <h2 className={styles.collection} key={link.id}>{link.title}</h2>;
                const destination = destinationLabel(link.url);
                return (
                  <a
                    key={link.id}
                    className={styles.row}
                    data-featured={link.featured || undefined}
                    href={link.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackClick(link, "link")}
                  >
                    <span aria-hidden="true" className={styles.media} data-image={Boolean(link.image) || undefined}
                      style={link.image ? { backgroundImage: `url("${link.image}")` } : undefined}>
                      {!link.image && <BrandIcon name={link.icon} />}
                    </span>
                    <span className={styles.label}>
                      {link.featured && <small className={styles.badge}>{link.badge || "Fitur Baru"}</small>}
                      <strong>{link.title || destination || "Buka tautan"}</strong>
                      {destination && link.title && !link.featured && <small>{destination}</small>}
                    </span>
                    <FiArrowUpRight aria-hidden="true" className={styles.arrow} />
                  </a>
                );
              })}
              {products.map((product) => (
                <a className={styles.row} key={`product-${product.id}`} href={product.url || "#"} target="_blank" rel="noreferrer" onClick={() => trackClick(product, "product")}>
                  <span className={styles.media}><FiShoppingBag aria-hidden="true" /></span>
                  <span className={styles.label}><strong>{product.title || "Lihat produk"}</strong>{product.price && <small>{product.price}</small>}</span>
                  <FiArrowUpRight aria-hidden="true" className={styles.arrow} />
                </a>
              ))}
            </section>
            {profile.emailCapture && (
              <form className={styles.email} onSubmit={(event) => { event.preventDefault(); setJoined(true); }}>
                <strong aria-live="polite">{joined ? "Terima kasih sudah bergabung." : "Ikuti kabar terbaru"}</strong>
                {!joined && <div><input aria-label="Alamat email" autoComplete="email" type="email" required placeholder="nama@email.com" /><button type="submit">Daftar</button></div>}
              </form>
            )}
          </div>
        </div>
        <footer className={styles.footer}>Powered by NEMU AI</footer>
      </div>
    </main>
  );
}
