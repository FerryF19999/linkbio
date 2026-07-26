"use client";

import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { FaLinkedin } from "react-icons/fa6";
import { FiExternalLink, FiGlobe, FiMail, FiShare2 } from "react-icons/fi";
import {
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
  cream: { bg: "#fff7e9", text: "#e12e26", button: "#fff7e9", buttonText: "#e12e26", outline: true },
  forest: { bg: "#07352d", text: "#e9ffe6", button: "#e4ffdc", buttonText: "#07352d" },
  cloud: { bg: "#eff1f5", text: "#171717", button: "#ffffff", buttonText: "#171717" },
  earth: { bg: "#6f655d", text: "#fffdf6", button: "#9a8b80", buttonText: "#ffffff" },
  berry: { bg: "linear-gradient(180deg,#5b002a 0%,#7d3565 100%)", text: "#ffffff", button: "transparent", buttonText: "#ffffff", outline: true },
  violet: { bg: "#9252c9", text: "#ffffff", button: "#ead6ff", buttonText: "#4b1a70" },
  mist: { bg: "#c7dbe1", text: "#183038", button: "#dcecef", buttonText: "#183038" },
  paper: { bg: "#eeeee4", text: "#171717", button: "#ffffff", buttonText: "#171717", outline: true },
  aurora: { bg: "radial-gradient(circle at 75% 22%,#ffac38 0%,#ec5d49 30%,#46d1a0 67%,#134754 100%)", text: "#ffffff", button: "#ffffff", buttonText: "#171717" },
};

const brandIcons: Record<string, IconType> = {
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

export default function PublicProfileClient({
  initialProfile,
  slug,
}: {
  initialProfile: PublicProfile;
  slug: string;
}) {
  const profile = initialProfile;
  const [joined, setJoined] = useState(false);
  const theme = themeStyles[profile.theme] ?? themeStyles.sunset;

  useEffect(() => {
    if (navigator.doNotTrack === "1") return;

    const sessionKey = "nemu-linkbio-analytics-session";
    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem(sessionKey) ?? "";
      if (!sessionId) {
        sessionId =
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(sessionKey, sessionId);
      }

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

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `@${profile.name}`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="standalone-profile-shell" data-theme={profile.theme} style={{ background: theme.bg, color: theme.text }}>
      <button className="standalone-share" onClick={share} aria-label="Share this profile"><FiShare2 /></button>
      <div className={`standalone-avatar ${profile.profileImage ? "has-image" : ""}`} style={profile.profileImage ? { backgroundImage: `url(${profile.profileImage})` } : undefined}>
        {profile.profileImage ? "" : (profile.name || "NF").slice(0, 2).toUpperCase()}
      </div>
      <h1>@{profile.name || slug}</h1>
      <p className="standalone-bio">{profile.bio || "Your story, your links, all in one place."}</p>
      <div className="standalone-socials">
        {profile.links.filter((link) => link.enabled && link.kind !== "collection" && socialIcons.has(link.icon)).slice(0, 6).map((link) => (
          <a key={link.id} href={link.url || "#"} target="_blank" rel="noreferrer" aria-label={link.title}>
            <BrandIcon name={link.icon} />
          </a>
        ))}
      </div>
      <section className="standalone-links">
        {profile.links.filter((link) => link.enabled).map((link) => link.kind === "collection" ? (
          <h2 key={link.id}>{link.title}</h2>
        ) : (
          <a
            key={link.id}
            className={link.featured ? "is-featured" : undefined}
            href={link.url || "#"}
            target="_blank"
            rel="noreferrer"
            style={{ background: theme.button, color: theme.buttonText, borderColor: theme.outline ? theme.text : "transparent" }}
          >
            <span
              className={`standalone-link-media ${link.image ? "has-image" : ""}`}
              style={link.image ? { backgroundImage: `url(${link.image})` } : undefined}
            >
              {link.image ? null : <BrandIcon name={link.icon} />}
            </span>
            <strong>{link.featured && <small className="featured-badge">Fitur Baru</small>}{link.title}</strong><span>•••</span>
          </a>
        ))}
        {(profile.products ?? []).filter((product) => product.enabled).map((product) => (
          <a key={product.id} href={product.url || "#"} target="_blank" rel="noreferrer" style={{ background: theme.button, color: theme.buttonText, borderColor: theme.outline ? theme.text : "transparent" }}>
            <span className="product-glyph">▣</span><strong>{product.title}<small>{product.price}</small></strong><span>↗</span>
          </a>
        ))}
      </section>
      {profile.emailCapture && (
        <form className="standalone-email" onSubmit={(event) => { event.preventDefault(); setJoined(true); }}>
          <strong>{joined ? "You’re on the list ✓" : "Stay in the loop"}</strong>
          {!joined && <div><input type="email" required placeholder="you@email.com" /><button type="submit">Join</button></div>}
        </form>
      )}
      <footer><strong>NEMU Link Bio</strong><small>Powered by NEMU AI</small></footer>
    </main>
  );
}
