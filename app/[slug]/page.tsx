"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { IconType } from "react-icons";
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

type PublicLink = {
  id: number;
  title: string;
  url: string;
  icon: string;
  color: string;
  enabled: boolean;
  kind?: "link" | "collection";
};

type PublicProduct = {
  id: number;
  title: string;
  price: string;
  url: string;
  enabled: boolean;
};

type PublicProfile = {
  theme: string;
  links: PublicLink[];
  name: string;
  bio: string;
  profileImage?: string;
  products?: PublicProduct[];
  emailCapture?: boolean;
};

const themeStyles: Record<string, { bg: string; text: string; button: string; buttonText: string; outline?: boolean }> = {
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

const fallbackProfile: PublicProfile = {
  theme: "sunset",
  name: "nemuai",
  bio: "Your story, your links, all in one place.",
  links: [
    { id: 1, title: "Instagram", url: "https://instagram.com/", icon: "instagram", color: "#e1306c", enabled: true },
    { id: 2, title: "My latest project", url: "https://example.com", icon: "external", color: "#171717", enabled: true },
  ],
  products: [{ id: 3, title: "Creator Starter Pack", price: "Rp99.000", url: "https://example.com", enabled: true }],
};

function BrandIcon({ name }: { name: string }) {
  const Icon = brandIcons[name] ?? FiExternalLink;
  return <Icon aria-hidden="true" />;
}

export default function PublicProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug ?? "nemuai").toLowerCase();
  const [profile, setProfile] = useState<PublicProfile>(fallbackProfile);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const theme = themeStyles[profile.theme] ?? themeStyles.sunset;

  useEffect(() => {
    let active = true;
    fetch(`/api/profile?id=${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (active && result?.profile) setProfile(result.profile);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `@${profile.name}`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="standalone-profile-shell" style={{ background: theme.bg, color: theme.text }}>
      {loading && <div className="standalone-loading">Loading profile…</div>}
      <button className="standalone-share" onClick={share} aria-label="Share this profile"><FiShare2 /></button>
      <div className={`standalone-avatar ${profile.profileImage ? "has-image" : ""}`} style={profile.profileImage ? { backgroundImage: `url(${profile.profileImage})` } : undefined}>
        {profile.profileImage ? "" : (profile.name || "NF").slice(0, 2).toUpperCase()}
      </div>
      <h1>@{profile.name || slug}</h1>
      <p className="standalone-bio">{profile.bio || "Your story, your links, all in one place."}</p>
      <div className="standalone-socials">
        {profile.links.filter((link) => link.enabled && link.kind !== "collection").slice(0, 6).map((link) => <BrandIcon key={link.id} name={link.icon} />)}
      </div>
      <section className="standalone-links">
        {profile.links.filter((link) => link.enabled).map((link) => link.kind === "collection" ? (
          <h2 key={link.id}>{link.title}</h2>
        ) : (
          <a key={link.id} href={link.url || "#"} target="_blank" rel="noreferrer" style={{ background: theme.button, color: theme.buttonText, borderColor: theme.outline ? theme.text : "transparent" }}>
            <BrandIcon name={link.icon} /><strong>{link.title}</strong><span>•••</span>
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
