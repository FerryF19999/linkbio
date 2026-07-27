"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaLinkedin } from "react-icons/fa6";
import { FiExternalLink, FiGlobe, FiMail } from "react-icons/fi";
import QRCode from "react-qr-code";
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

type Platform = {
  id: string;
  name: string;
  icon: string;
  color: string;
  brandBg?: string;
  placeholder: string;
};

type LinkItem = {
  id: number;
  title: string;
  url: string;
  icon: string;
  color: string;
  enabled: boolean;
  clicks: number;
  image?: string;
  featured?: boolean;
  kind?: "link" | "collection";
};

type ProductItem = {
  id: number;
  title: string;
  price: string;
  url: string;
  enabled: boolean;
};

type Subscriber = {
  email: string;
  joined: string;
};

type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
};

type TrafficDay = {
  date: string;
  label: string;
  views: number;
};

type ClickDay = {
  date: string;
  label: string;
  clicks: number;
};

type ClickLinkStats = {
  linkId: string;
  linkType: string;
  title: string;
  url: string;
  clicks: number;
};

type ClickStats = {
  total: number;
  today: number;
  last7Days: number;
  daily: ClickDay[];
  links: ClickLinkStats[];
};

type TrafficStats = {
  total: number;
  today: number;
  last7Days: number;
  daily: TrafficDay[];
  clicks: ClickStats;
};

type TrafficResponse = {
  profiles?: Record<string, TrafficStats>;
  error?: string;
};

export type ProfileData = {
  theme: string;
  links: LinkItem[];
  name: string;
  bio: string;
  complete: boolean;
  publicId?: string;
  profileImage?: string;
  archive?: LinkItem[];
  products?: ProductItem[];
  subscribers?: Subscriber[];
  emailCapture?: boolean;
};

type Theme = {
  id: string;
  name: string;
  bg: string;
  text: string;
  button: string;
  buttonText: string;
  pattern?: string;
};

const PUBLIC_PROFILE_ID = "nemu-ai";
const PUBLIC_PROFILE_ORIGIN = "https://linkbio.nemu-ai.com";

const platforms: Platform[] = [
  { id: "instagram", name: "Instagram", icon: "instagram", color: "#e1306c", brandBg: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)", placeholder: "@username" },
  { id: "whatsapp", name: "WhatsApp", icon: "whatsapp", color: "#25d366", placeholder: "+62 812..." },
  { id: "tiktok", name: "TikTok", icon: "tiktok", color: "#111111", placeholder: "@username" },
  { id: "youtube", name: "YouTube", icon: "youtube", color: "#ff0033", placeholder: "youtube.com/..." },
  { id: "website", name: "Website", icon: "website", color: "#111111", placeholder: "https://..." },
  { id: "spotify", name: "Spotify", icon: "spotify", color: "#1ed760", placeholder: "open.spotify.com/..." },
  { id: "threads", name: "Threads", icon: "threads", color: "#111111", placeholder: "@username" },
  { id: "facebook", name: "Facebook", icon: "facebook", color: "#1877f2", placeholder: "facebook.com/..." },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin", color: "#0a66c2", placeholder: "linkedin.com/company/..." },
  { id: "x", name: "X", icon: "x", color: "#111111", placeholder: "@username" },
  { id: "soundcloud", name: "SoundCloud", icon: "soundcloud", color: "#ff5500", placeholder: "soundcloud.com/..." },
  { id: "snapchat", name: "Snapchat", icon: "snapchat", color: "#fffc00", placeholder: "@username" },
  { id: "pinterest", name: "Pinterest", icon: "pinterest", color: "#e60023", placeholder: "pinterest.com/..." },
  { id: "patreon", name: "Patreon", icon: "patreon", color: "#ff424d", placeholder: "patreon.com/..." },
  { id: "twitch", name: "Twitch", icon: "twitch", color: "#9146ff", placeholder: "twitch.tv/..." },
  { id: "apple", name: "Apple Music", icon: "apple", color: "#fa243c", placeholder: "music.apple.com/..." },
];

const iconMap: Record<string, IconType> = {
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

function resolveIconName(icon: string, title = "") {
  if (iconMap[icon]) return icon;
  const match = platforms.find((platform) => title.toLowerCase().includes(platform.name.toLowerCase()));
  if (match) return match.icon;
  if (title.toLowerCase().includes("mail") || title.toLowerCase().includes("work together")) return "email";
  return "external";
}

function SocialIcon({ name, title }: { name: string; title?: string }) {
  const BrandIcon = iconMap[resolveIconName(name, title)] ?? FiExternalLink;
  return <BrandIcon aria-hidden="true" focusable="false" />;
}

const themes: Theme[] = [
  { id: "classic", name: "Classic", bg: "#f8f8fb", text: "#0b0b0e", button: "#ffffff", buttonText: "#1a1a1f" },
  { id: "midnight", name: "Midnight", bg: "#0a0a0a", text: "#ffffff", button: "#202020", buttonText: "#ffffff" },
  { id: "sunset", name: "Sunset", bg: "linear-gradient(160deg,#bdeef1 0%,#e8d7ef 45%,#f06448 100%)", text: "#251b29", button: "#ffffff", buttonText: "#251b29" },
  { id: "grid", name: "Mulberry", bg: "#5b3034", text: "#fff6de", button: "#fff2d0", buttonText: "#5b3034", pattern: "grid" },
  { id: "cream", name: "Editorial", bg: "#fff7e9", text: "#e12e26", button: "#fff7e9", buttonText: "#e12e26", pattern: "outline" },
  { id: "forest", name: "Forest", bg: "#07352d", text: "#e9ffe6", button: "#e4ffdc", buttonText: "#07352d" },
  { id: "cloud", name: "Cloud", bg: "#eff1f5", text: "#171717", button: "#ffffff", buttonText: "#171717" },
  { id: "earth", name: "Earth", bg: "#6f655d", text: "#fffdf6", button: "#9a8b80", buttonText: "#ffffff", pattern: "waves" },
  { id: "berry", name: "Berry", bg: "linear-gradient(180deg,#5b002a 0%,#7d3565 100%)", text: "#ffffff", button: "transparent", buttonText: "#ffffff", pattern: "outline" },
  { id: "violet", name: "Violet", bg: "#9252c9", text: "#ffffff", button: "#ead6ff", buttonText: "#4b1a70", pattern: "blobs" },
  { id: "mist", name: "Mist", bg: "#c7dbe1", text: "#183038", button: "#dcecef", buttonText: "#183038" },
  { id: "paper", name: "Paper", bg: "#eeeee4", text: "#171717", button: "#ffffff", buttonText: "#171717", pattern: "outline" },
  { id: "aurora", name: "Aurora", bg: "radial-gradient(circle at 75% 22%,#ffac38 0%,#ec5d49 30%,#46d1a0 67%,#134754 100%)", text: "#ffffff", button: "#ffffff", buttonText: "#171717" },
];

const starterLinks: LinkItem[] = [
  { id: 1, title: "Instagram", url: "https://instagram.com/", icon: "instagram", color: "#e1306c", enabled: true, clicks: 24 },
  { id: 2, title: "My latest project", url: "https://example.com/project", icon: "external", color: "#171717", enabled: true, clicks: 11 },
  { id: 3, title: "Let’s work together", url: "mailto:hello@example.com", icon: "email", color: "#7c3aed", enabled: true, clicks: 7 },
];

const navItems = [
  ["Links", "⌁"],
  ["Shop", "▱"],
  ["Design", "✦"],
  ["Audience", "♙"],
  ["Waitlist", "◷"],
  ["Insights", "▥"],
];

const growItems = [
  ["Share", "↗"],
  ["Email capture", "✉"],
  ["QR code", "▦"],
];

function ThemePreview({ theme, selected, onClick, compact = false }: { theme: Theme; selected?: boolean; onClick?: () => void; compact?: boolean }) {
  return (
    <button
      className={`theme-card ${selected ? "selected" : ""} ${compact ? "compact" : ""}`}
      onClick={onClick}
      aria-label={`Select ${theme.name} theme`}
      type="button"
    >
      <div className={`mini-profile pattern-${theme.pattern ?? "none"}`} style={{ background: theme.bg, color: theme.text }}>
        <div className="mini-avatar" />
        <strong>{theme.name}</strong>
        <span>Creator · Storyteller</span>
        <div className="mini-socials">•　•　•</div>
        {[1, 2, 3].map((n) => (
          <i key={n} style={{ background: theme.button, color: theme.buttonText, borderColor: theme.pattern === "outline" ? theme.text : "transparent" }} />
        ))}
      </div>
      {!compact && <span className="theme-label">{theme.name}</span>}
      {selected && <b className="selected-check">✓</b>}
    </button>
  );
}

function Onboarding({
  onComplete,
}: {
  onComplete: (data: { theme: string; links: LinkItem[]; name: string; bio: string; profileImage: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("sunset");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [platformValues, setPlatformValues] = useState<Record<string, string>>({});
  const [extraLinks, setExtraLinks] = useState(["", "", ""]);
  const [name, setName] = useState("nemuai");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const onboardingFileRef = useRef<HTMLInputElement>(null);

  const loadProfileImage = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const finish = () => {
    const selectedLinks = selectedPlatforms.map((id, index) => {
      const platform = platforms.find((p) => p.id === id)!;
      const value = platformValues[id] || "";
      const url = value.startsWith("http") ? value : value ? `https://${platform.id}.com/${value.replace("@", "")}` : "#";
      return { id: Date.now() + index, title: platform.name, url, icon: platform.icon, color: platform.color, enabled: true, clicks: 0 };
    });
    const extras = extraLinks
      .filter(Boolean)
      .map((url, index) => ({ id: Date.now() + 100 + index, title: `My link ${index + 1}`, url, icon: "external", color: "#171717", enabled: true, clicks: 0 }));
    onComplete({ theme, links: [...selectedLinks, ...extras], name, bio, profileImage });
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
    else finish();
  };

  return (
    <main className="onboarding">
      <header className="onboarding-top">
        <button className="text-button" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>Back</button>
        <div className="progress-track"><span style={{ width: `${25 * (step + 1)}%` }} /></div>
        <button className="text-button" onClick={step === 3 ? finish : next}>Skip</button>
      </header>

      <section className={`step-panel ${step === 0 ? "theme-step" : ""}`}>
        {step === 0 && (
          <>
            <div className="step-heading">
              <span className="eyebrow">MAKE IT YOURS</span>
              <h1>Select a theme</h1>
              <p>Pick the style that feels right. You can change it any time.</p>
            </div>
            <div className="theme-grid">
              {themes.map((item) => <ThemePreview key={item.id} theme={item} selected={theme === item.id} onClick={() => setTheme(item.id)} />)}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="step-heading">
              <span className="eyebrow">YOUR CORNERS OF THE INTERNET</span>
              <h1>Which platforms are you on?</h1>
              <p>Pick up to five to get started. You can update these later.</p>
            </div>
            <div className="platform-grid">
              {platforms.map((platform) => {
                const selected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    type="button"
                    key={platform.id}
                    className={`platform-card ${selected ? "selected" : ""}`}
                    onClick={() => setSelectedPlatforms((items) => selected ? items.filter((i) => i !== platform.id) : items.length < 5 ? [...items, platform.id] : items)}
                  >
                    <span style={{ background: platform.brandBg ?? platform.color }}><SocialIcon name={platform.icon} /></span>
                    <strong>{platform.name}</strong>
                    {selected && <b>✓</b>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="form-step">
            <div className="step-heading">
              <span className="eyebrow">THE GOOD STUFF</span>
              <h1>Add your links</h1>
              <p>Connect your selected platforms and add anything else you want to share.</p>
            </div>
            <div className="link-form-group">
              <h3>Your selections</h3>
              {selectedPlatforms.map((id) => {
                const platform = platforms.find((p) => p.id === id)!;
                return (
                  <label className="url-row" key={id}>
                    <span style={{ background: platform.brandBg ?? platform.color }}><SocialIcon name={platform.icon} /></span>
                    <input value={platformValues[id] ?? ""} onChange={(e) => setPlatformValues({ ...platformValues, [id]: e.target.value })} placeholder={platform.placeholder} />
                  </label>
                );
              })}
              <h3>Additional links</h3>
              {extraLinks.map((value, index) => (
                <label className="url-row" key={index}>
                  <span className="generic-icon">↗</span>
                  <input value={value} onChange={(e) => setExtraLinks(extraLinks.map((item, i) => i === index ? e.target.value : item))} placeholder="https://your-link.com" />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step profile-step">
            <div className="step-heading">
              <span className="eyebrow">ONE LAST DETAIL</span>
              <h1>Add profile details</h1>
              <p>Add your profile image, display name, and a short bio.</p>
            </div>
            <button type="button" className={`avatar-uploader ${profileImage ? "has-image" : ""}`} style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined} aria-label="Upload profile image" onClick={() => onboardingFileRef.current?.click()}>
              {profileImage ? "" : <span>NF</span>}<b>+</b>
            </button>
            <input ref={onboardingFileRef} className="visually-hidden" type="file" accept="image/*" onChange={(event) => loadProfileImage(event.target.files?.[0])} />
            <label className="floating-field">
              <span>Display name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="floating-field bio-field">
              <span>Bio</span>
              <textarea maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Creator, builder, and curious human." />
              <small>{bio.length}/160</small>
            </label>
          </div>
        )}
      </section>

      <footer className="onboarding-footer">
        <span>Privacy · Terms</span>
        <button className="primary-button" onClick={next} disabled={step === 1 && selectedPlatforms.length === 0}>
          {step === 3 ? "Build my page" : "Continue"} <b>→</b>
        </button>
        <span>Buatan Indonesia 🇮🇩</span>
      </footer>
    </main>
  );
}

function PublicPreview({
  theme,
  name,
  bio,
  links,
  profileImage,
  products = [],
  emailCapture = false,
  onLinkClick,
  onSubscribe,
}: {
  theme: Theme;
  name: string;
  bio: string;
  links: LinkItem[];
  profileImage?: string;
  products?: ProductItem[];
  emailCapture?: boolean;
  onLinkClick?: (id: number) => void;
  onSubscribe?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  return (
    <div className={`public-preview pattern-${theme.pattern ?? "none"}`} style={{ background: theme.bg, color: theme.text }}>
      <button className="preview-share" aria-label="Share profile">↗</button>
      <div className={`preview-avatar ${profileImage ? "has-image" : ""}`} style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined}>{profileImage ? "" : "NF"}</div>
      <h2>@{name || "yourname"}</h2>
      <p>{bio || "Your story, your links, all in one place."}</p>
      <div className="preview-socials">
        {links.slice(0, 5).map((link) => <span key={link.id}><SocialIcon name={link.icon} title={link.title} /></span>)}
      </div>
      <div className="preview-links">
        {links.filter((link) => link.enabled).map((link) => link.kind === "collection" ? (
          <h3 className="preview-collection" key={link.id}>{link.title || "Collection"}</h3>
        ) : (
            <a
              key={link.id}
              className={link.featured ? "is-featured" : undefined}
              href={link.url || "#"}
              target={link.url?.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              style={{ background: theme.button, color: theme.buttonText, borderColor: theme.pattern === "outline" ? theme.text : "transparent" }}
              onClick={(event) => {
                if (!link.url || link.url === "https://" || link.url === "#") event.preventDefault();
                onLinkClick?.(link.id);
              }}
            >
              <span
                className={link.image ? "preview-link-image" : undefined}
                style={link.image ? { backgroundImage: `url(${link.image})` } : undefined}
              >
                {link.image ? null : <SocialIcon name={link.icon} title={link.title} />}
              </span>
              <strong>{link.featured && <small className="featured-badge">Fitur Baru</small>}{link.title || "Untitled link"}</strong><b>•••</b>
            </a>
          ))}
        {products.filter((product) => product.enabled).map((product) => (
          <a key={product.id} href={product.url || "#"} target="_blank" rel="noreferrer" className="product-preview-link" style={{ background: theme.button, color: theme.buttonText, borderColor: theme.pattern === "outline" ? theme.text : "transparent" }}>
            <span>▣</span><strong>{product.title}<small>{product.price}</small></strong><b>↗</b>
          </a>
        ))}
      </div>
      {emailCapture && (
        <form className="preview-email" onSubmit={(event) => { event.preventDefault(); if (email.includes("@")) { onSubscribe?.(email); setEmail(""); } }}>
          <strong>Stay in the loop</strong>
          <div><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@email.com" /><button type="submit">Join</button></div>
        </form>
      )}
      <div className="preview-brand"><strong>NEMU Link Bio</strong><small>Powered by NEMU AI</small></div>
    </div>
  );
}

function Dashboard({
  initial,
  onReset,
}: {
  initial: Omit<ProfileData, "complete">;
  onReset: () => void;
}) {
  const [activeNav, setActiveNav] = useState("Links");
  const [themeId, setThemeId] = useState(initial.theme);
  const [links, setLinks] = useState<LinkItem[]>(initial.links.length ? initial.links : starterLinks);
  const [name, setName] = useState(initial.name || "nemuai");
  const [bio, setBio] = useState(initial.bio);
  const [profileImage, setProfileImage] = useState(initial.profileImage ?? "");
  const [archive, setArchive] = useState<LinkItem[]>(initial.archive ?? []);
  const [products, setProducts] = useState<ProductItem[]>(initial.products ?? [
    { id: 101, title: "Creator Starter Pack", price: "Rp99.000", url: "https://example.com", enabled: true },
  ]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initial.subscribers ?? []);
  const [emailCapture, setEmailCapture] = useState(initial.emailCapture ?? false);
  const [publicId, setPublicId] = useState(PUBLIC_PROFILE_ID);
  const [showArchive, setShowArchive] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistVersion, setWaitlistVersion] = useState(0);
  const [trafficProfiles, setTrafficProfiles] = useState<Record<string, TrafficStats>>({});
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficError, setTrafficError] = useState("");
  const nextId = useRef(10_000);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const theme = themes.find((item) => item.id === themeId) ?? themes[1];
  const publicUrl = `${PUBLIC_PROFILE_ORIGIN}/${PUBLIC_PROFILE_ID}`;
  const emptyTraffic: TrafficStats = {
    total: 0,
    today: 0,
    last7Days: 0,
    daily: [],
    clicks: { total: 0, today: 0, last7Days: 0, daily: [], links: [] },
  };
  const nemuTraffic = trafficProfiles["nemu-ai"] ?? emptyTraffic;
  const cekHargaTraffic = trafficProfiles.cekhargadisini ?? emptyTraffic;
  const nemuLinkClickCounts = new Map(
    nemuTraffic.clicks.links
      .filter((entry) => entry.linkType === "link")
      .map((entry) => [entry.linkId, entry.clicks]),
  );
  const combinedDaily = Array.from({ length: 7 }, (_, index) => ({
    label: nemuTraffic.daily[index]?.label ?? cekHargaTraffic.daily[index]?.label ?? "",
    views: (nemuTraffic.daily[index]?.views ?? 0) + (cekHargaTraffic.daily[index]?.views ?? 0),
  }));
  const maxDailyViews = Math.max(1, ...combinedDaily.map((day) => day.views));

  useEffect(() => {
    queueMicrotask(() => {
      localStorage.setItem("linkspark-public-id", PUBLIC_PROFILE_ID);
      localStorage.removeItem("linkspark-edit-token");
      setPublicId(PUBLIC_PROFILE_ID);
    });
  }, []);

  useEffect(() => {
    const savedProfile = {
      theme: themeId,
      links,
      name,
      bio,
      profileImage,
      archive,
      products,
      subscribers,
      emailCapture,
      publicId,
      complete: true,
    };
    localStorage.setItem("linkspark-profile", JSON.stringify(savedProfile));
    if (!publicId) return;
    const syncTimer = window.setTimeout(() => {
      void fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publicId, profile: savedProfile }),
      });
    }, 700);
    return () => window.clearTimeout(syncTimer);
  }, [themeId, links, name, bio, profileImage, archive, products, subscribers, emailCapture, publicId]);

  useEffect(() => {
    if (activeNav !== "Waitlist") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setWaitlistLoading(true);
      setWaitlistError("");

      void fetch("/api/waitlist")
        .then(async (response) => {
          const result = (await response.json()) as { entries?: WaitlistEntry[]; error?: string };
          if (!response.ok) throw new Error(result.error || "Unable to load waitlist.");
          if (!cancelled) setWaitlistEntries(result.entries ?? []);
        })
        .catch((error) => {
          if (!cancelled) setWaitlistError(error instanceof Error ? error.message : "Unable to load waitlist.");
        })
        .finally(() => {
          if (!cancelled) setWaitlistLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [activeNav, waitlistVersion]);

  useEffect(() => {
    if (activeNav !== "Insights") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setTrafficLoading(true);
      setTrafficError("");

      void fetch("/api/analytics", { cache: "no-store" })
        .then(async (response) => {
          const result = (await response.json()) as TrafficResponse;
          if (!response.ok) throw new Error(result.error || "Unable to load traffic.");
          if (!cancelled) setTrafficProfiles(result.profiles ?? {});
        })
        .catch((error) => {
          if (!cancelled) setTrafficError(error instanceof Error ? error.message : "Unable to load traffic.");
        })
        .finally(() => {
          if (!cancelled) setTrafficLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [activeNav]);

  const addLink = () => {
    const id = ++nextId.current;
    setLinks((items) => [{ id, title: "New link", url: "https://", icon: "external", color: "#171717", enabled: true, clicks: 0 }, ...items]);
  };

  const updateLink = (id: number, update: Partial<LinkItem>) => {
    setLinks((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
  };

  const addCollection = () => {
    const id = ++nextId.current;
    setLinks((items) => [...items, { id, title: "New collection", url: "#", icon: "external", color: "#7c2cff", enabled: true, clicks: 0, kind: "collection" }]);
  };

  const archiveLink = (id: number) => {
    const item = links.find((link) => link.id === id);
    if (!item) return;
    setArchive((items) => [item, ...items]);
    setLinks((items) => items.filter((link) => link.id !== id));
    setToast("Link moved to archive");
    setTimeout(() => setToast(""), 1800);
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    setLinks((items) => {
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const uploadProfileImage = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const recordClick = (id: number) => {
    setLinks((items) => items.map((item) => item.id === id ? { ...item, clicks: item.clicks + 1 } : item));
  };

  const addSubscriber = (email: string) => {
    if (subscribers.some((subscriber) => subscriber.email.toLowerCase() === email.toLowerCase())) {
      setToast("Email already subscribed");
    } else {
      setSubscribers((items) => [{ email, joined: new Date().toLocaleDateString("en-GB") }, ...items]);
      setToast("Subscriber added");
    }
    setTimeout(() => setToast(""), 1800);
  };

  const copyProfile = async () => {
    await navigator.clipboard?.writeText(publicUrl);
    setToast("Profile link copied");
    setTimeout(() => setToast(""), 1800);
  };

  const downloadQr = () => {
    const svg = document.getElementById("profile-qr");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${name || "nemu-link-bio"}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const downloadWaitlist = () => {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["Name", "Email", "Joined", "Source"],
      ...waitlistEntries.map((entry) => [
        entry.name,
        entry.email,
        new Date(entry.createdAt).toLocaleString("id-ID"),
        entry.source,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `nemu-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <main className="dashboard">
      <div className="upgrade-bar">
        <span className="spark-mark">✦</span>
        <p>Grow your audience with a page that feels like you.</p>
        <button>⚡ Upgrade</button>
      </div>

      <aside className="sidebar">
        <div className="brand-lockup">
          <span>N</span>
          <div><strong>NEMU Link Bio</strong><small>Buatan Indonesia 🇮🇩</small></div>
        </div>
        <button className="account"><span>NF</span><strong>{name || "creator"}</strong><b>⌄</b></button>
        <nav>
          <p>MY PAGE</p>
          {navItems.map(([label, icon]) => (
            <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <p>GROW</p>
          {growItems.map(([item, icon]) => (
            <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}>
              <span>{icon}</span>{item}
            </button>
          ))}
        </nav>
        <div className="setup-card">
          <div className="setup-progress"><span>72%</span></div>
          <strong>Your page is looking good</strong>
          <p>One more touch can make it unforgettable.</p>
          <button onClick={() => setActiveNav("Design")}>Finish setup</button>
        </div>
        <button className="reset-link" onClick={onReset}>↺ Restart onboarding</button>
        <Link className="dashboard-logout" href="/auth/signout">⇥ Sign out</Link>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[["Links", "⌁"], ["Design", "✦"], ["Share", "↗"], ["QR code", "▦"]].map(([item, icon]) => (
          <button key={item} className={activeNav === item ? "active" : ""} onClick={() => { setActiveNav(item); setMobileMenuOpen(false); }}>
            <span>{icon}</span><b>{item === "QR code" ? "QR" : item}</b>
          </button>
        ))}
        <button className={mobileMenuOpen ? "active" : ""} onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen}>
          <span>•••</span><b>More</b>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <section className="mobile-menu-sheet" onClick={(event) => event.stopPropagation()} aria-label="All tools">
            <div><strong>All tools</strong><button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">×</button></div>
            <nav>
              {[...navItems, ...growItems].map(([item, icon]) => (
                <button key={item} className={activeNav === item ? "active" : ""} onClick={() => { setActiveNav(item); setMobileMenuOpen(false); }}>
                  <span>{icon}</span><b>{item}</b>
                </button>
              ))}
            </nav>
            <button className="mobile-reset" onClick={() => { setMobileMenuOpen(false); onReset(); }}>↺ Restart onboarding</button>
            <Link className="mobile-signout" href="/auth/signout">⇥ Sign out</Link>
          </section>
        </div>
      )}

      <section className="editor">
        <header className="editor-header">
          <div>
            <span className="editor-eyebrow">MY LINK-IN-BIO</span>
            <h1>{activeNav}</h1>
          </div>
          <div className="header-actions">
            <button onClick={() => setMobilePreview(true)}><span>◉</span><b>Preview</b></button>
            <button onClick={copyProfile}><span>↗</span><b>Share</b></button>
          </div>
        </header>

        {activeNav === "Links" && (
          <div className="links-editor">
            <section className="profile-summary">
              <button className={`profile-thumb ${profileImage ? "has-image" : ""}`} style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined} onClick={() => profileFileRef.current?.click()} aria-label="Change profile image">{profileImage ? "" : "NF"}<i>+</i></button>
              <input ref={profileFileRef} className="visually-hidden" type="file" accept="image/*" onChange={(event) => uploadProfileImage(event.target.files?.[0])} />
              <div>
                <input value={name} onChange={(e) => setName(e.target.value.replace(/\s/g, "").slice(0, 24))} aria-label="Profile username" />
                <input value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="Add a short bio" aria-label="Profile bio" />
                <div className="profile-networks">{links.slice(0, 5).map((link) => <span key={link.id} style={{ color: link.color }}><SocialIcon name={link.icon} title={link.title} /></span>)}<button>+</button></div>
              </div>
            </section>

            <button className="add-button" onClick={addLink}><span>＋</span> Add link</button>
            <div className="collection-row"><button onClick={addCollection}>▱ Add collection</button><button onClick={() => setShowArchive((open) => !open)}>▰ View archive ({archive.length})　›</button></div>

            {showArchive && (
              <div className="archive-panel">
                <div className="section-title"><div><h2>Archive</h2><p>Restore a link or remove it permanently.</p></div><button onClick={() => setShowArchive(false)}>×</button></div>
                {archive.length === 0 ? <p className="archive-empty">Nothing archived yet.</p> : archive.map((item) => (
                  <div className="archive-item" key={item.id}>
                    <SocialIcon name={item.icon} title={item.title} /><strong>{item.title}</strong>
                    <button onClick={() => { setLinks((linksNow) => [...linksNow, item]); setArchive((items) => items.filter((entry) => entry.id !== item.id)); }}>Restore</button>
                    <button onClick={() => setArchive((items) => items.filter((entry) => entry.id !== item.id))}>Delete</button>
                  </div>
                ))}
              </div>
            )}

            <div className="link-stack">
              {links.map((link, index) => (
                <article className="link-card" key={link.id}>
                  <div className="drag-controls">
                    <button onClick={() => moveLink(index, -1)} disabled={index === 0} aria-label={`Move ${link.title} up`}>↑</button>
                    <button onClick={() => moveLink(index, 1)} disabled={index === links.length - 1} aria-label={`Move ${link.title} down`}>↓</button>
                  </div>
                  <div className="link-card-main">
                    <label>
                      <span>Title</span>
                      <input value={link.title} onChange={(e) => updateLink(link.id, { title: e.target.value })} />
                    </label>
                    {link.kind !== "collection" && <label>
                      <span>URL</span>
                      <input value={link.url} onChange={(e) => updateLink(link.id, { url: e.target.value })} />
                    </label>}
                    <div className="link-tools">
                      <span style={{ color: link.color }}><SocialIcon name={link.icon} title={link.title} /></span>
                      <button title="Add thumbnail">▧</button>
                      <button title="Feature link">☆</button>
                      <button title="Schedule">◷</button>
                      <span className="clicks">▥ {nemuLinkClickCounts.get(String(link.id)) ?? 0} clicks</span>
                    </div>
                  </div>
                  <div className="link-card-actions">
                    <button className={`switch ${link.enabled ? "on" : ""}`} onClick={() => updateLink(link.id, { enabled: !link.enabled })} aria-label={`${link.enabled ? "Disable" : "Enable"} ${link.title}`}><i /></button>
                    <button onClick={() => archiveLink(link.id)} aria-label={`Archive ${link.title}`}>⌫</button>
                  </div>
                  <span className="link-number">{String(index + 1).padStart(2, "0")}</span>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeNav === "Design" && (
          <div className="design-editor">
            <div className="section-title"><div><h2>Choose your look</h2><p>Make every visit feel unmistakably yours.</p></div><span>{themes.length} styles</span></div>
            <div className="dashboard-theme-grid">
              {themes.map((item) => <ThemePreview key={item.id} theme={item} compact selected={themeId === item.id} onClick={() => setThemeId(item.id)} />)}
            </div>
          </div>
        )}

        {activeNav === "Insights" && (
          <div className="insights-panel">
            <div className="metric-card">
              <span>TOTAL TRAFFIC</span>
              <strong>{(nemuTraffic.total + cekHargaTraffic.total).toLocaleString("id-ID")}</strong>
              <small>{nemuTraffic.today + cekHargaTraffic.today} kunjungan hari ini</small>
            </div>
            <div className="metric-card">
              <span>TOTAL LINK CLICKS</span>
              <strong>{(nemuTraffic.clicks.total + cekHargaTraffic.clicks.total).toLocaleString("id-ID")}</strong>
              <small>{nemuTraffic.clicks.today + cekHargaTraffic.clicks.today} klik hari ini</small>
            </div>
            <div className="metric-card">
              <span>NEMU AI</span>
              <strong>{nemuTraffic.total.toLocaleString("id-ID")} <em>views</em></strong>
              <small>{nemuTraffic.clicks.total} klik tautan</small>
            </div>
            <div className="metric-card">
              <span>CEK HARGA DI SINI</span>
              <strong>{cekHargaTraffic.total.toLocaleString("id-ID")} <em>views</em></strong>
              <small>{cekHargaTraffic.clicks.total} klik tautan</small>
            </div>
            <div className="chart-card">
              <div className="section-title">
                <div><h2>Traffic 7 Hari</h2><p>Gabungan kunjungan halaman NEMU AI dan Cek Harga di Sini.</p></div>
              </div>
              {trafficLoading ? (
                <p className="analytics-state">Memuat traffic…</p>
              ) : trafficError ? (
                <p className="analytics-state error">{trafficError}</p>
              ) : (
                <div className="fake-chart">
                  {combinedDaily.map((day, index) => (
                    <i key={`${day.label}-${index}`} style={{ height: `${Math.max(5, (day.views / maxDailyViews) * 100)}%` }}>
                      <b>{day.views}</b>
                      <span>{day.label}</span>
                    </i>
                  ))}
                </div>
              )}
            </div>
            <div className="chart-card click-performance-card">
              <div className="section-title">
                <div><h2>Klik per Tautan</h2><p>Jumlah klik nyata dari halaman publik, diurutkan dari yang paling banyak.</p></div>
              </div>
              {trafficLoading ? (
                <p className="analytics-state compact">Memuat klik…</p>
              ) : trafficError ? (
                <p className="analytics-state compact error">{trafficError}</p>
              ) : (
                <div className="click-profile-grid">
                  {[
                    ["NEMU AI", nemuTraffic.clicks.links],
                    ["CEK HARGA DI SINI", cekHargaTraffic.clicks.links],
                  ].map(([profileLabel, clickLinks]) => (
                    <section className="click-profile-list" key={String(profileLabel)}>
                      <header>
                        <strong>{String(profileLabel)}</strong>
                        <span>{(clickLinks as ClickLinkStats[]).reduce((sum, item) => sum + item.clicks, 0)} klik</span>
                      </header>
                      {(clickLinks as ClickLinkStats[]).length === 0 ? (
                        <p>Belum ada klik.</p>
                      ) : (
                        (clickLinks as ClickLinkStats[]).map((item) => (
                          <div key={`${item.linkType}-${item.linkId}`}>
                            <span><strong>{item.title}</strong><small>{item.url}</small></span>
                            <b>{item.clicks}</b>
                          </div>
                        ))
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeNav === "Shop" && (
          <div className="utility-panel">
            <div className="section-title"><div><h2>Your products</h2><p>Add products or paid resources to your page.</p></div><button onClick={() => setProducts((items) => [...items, { id: ++nextId.current, title: "New product", price: "Rp0", url: "https://", enabled: true }])}>＋ Add product</button></div>
            <div className="product-list">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-art">▣</div>
                  <div>
                    <label><span>Product</span><input value={product.title} onChange={(event) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, title: event.target.value } : item))} /></label>
                    <label><span>Price</span><input value={product.price} onChange={(event) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, price: event.target.value } : item))} /></label>
                    <label><span>URL</span><input value={product.url} onChange={(event) => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, url: event.target.value } : item))} /></label>
                  </div>
                  <div className="product-actions">
                    <button className={`switch ${product.enabled ? "on" : ""}`} onClick={() => setProducts((items) => items.map((item) => item.id === product.id ? { ...item, enabled: !item.enabled } : item))}><i /></button>
                    <button onClick={() => setProducts((items) => items.filter((item) => item.id !== product.id))}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeNav === "Audience" && (
          <div className="utility-panel">
            <div className="section-title"><div><h2>Your audience</h2><p>People who joined through your page.</p></div><span>{subscribers.length} subscribers</span></div>
            <form className="manual-subscriber" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const input = form.elements.namedItem("email") as HTMLInputElement; addSubscriber(input.value); input.value = ""; }}>
              <input name="email" type="email" required placeholder="Add subscriber email" /><button type="submit">Add</button>
            </form>
            <div className="audience-table">
              <div><strong>Email</strong><strong>Joined</strong><span /></div>
              {subscribers.map((subscriber) => <div key={subscriber.email}><span>{subscriber.email}</span><span>{subscriber.joined}</span><button onClick={() => setSubscribers((items) => items.filter((item) => item.email !== subscriber.email))}>×</button></div>)}
              {subscribers.length === 0 && <p>No subscribers yet. Turn on email capture to start collecting emails.</p>}
            </div>
          </div>
        )}

        {activeNav === "Waitlist" && (
          <div className="utility-panel">
            <div className="section-title">
              <div><h2>Early-access waitlist</h2><p>People who submitted the form on your landing page.</p></div>
              <span>{waitlistEntries.length} submissions</span>
            </div>
            <div className="waitlist-actions">
              <button onClick={() => setWaitlistVersion((value) => value + 1)} disabled={waitlistLoading}>
                {waitlistLoading ? "Refreshing..." : "Refresh"}
              </button>
              <button onClick={downloadWaitlist} disabled={waitlistEntries.length === 0}>Download CSV</button>
            </div>
            {waitlistError && <p className="waitlist-admin-error">{waitlistError}</p>}
            <div className="waitlist-table">
              <div><strong>Name</strong><strong>Email</strong><strong>Joined</strong><strong>Source</strong></div>
              {waitlistEntries.map((entry) => (
                <div key={entry.id}>
                  <strong>{entry.name}</strong>
                  <span>{entry.email}</span>
                  <span>{new Date(entry.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                  <span>{entry.source}</span>
                </div>
              ))}
              {!waitlistLoading && waitlistEntries.length === 0 && !waitlistError && <p>No waitlist submissions yet.</p>}
              {waitlistLoading && waitlistEntries.length === 0 && <p>Loading submissions...</p>}
            </div>
          </div>
        )}

        {activeNav === "Email capture" && (
          <div className="utility-panel email-panel">
            <div className="feature-toggle">
              <div><span>✉</span><div><h2>Email capture</h2><p>Let visitors join your list directly from your page.</p></div></div>
              <button className={`switch ${emailCapture ? "on" : ""}`} onClick={() => setEmailCapture((value) => !value)}><i /></button>
            </div>
            <div className="email-preview-card">
              <span>LIVE PREVIEW</span><h3>Stay in the loop</h3><p>Updates, new projects, and useful things—straight to your inbox.</p>
              <div><input disabled placeholder="you@email.com" /><button disabled>Join</button></div>
            </div>
          </div>
        )}

        {(activeNav === "Share" || activeNav === "QR code") && (
          <div className="utility-panel share-panel">
            <div className="section-title"><div><h2>Share your page</h2><p>Copy your URL or download a QR code.</p></div></div>
            <div className="share-card">
              <div className="qr-box"><QRCode id="profile-qr" value={publicUrl} size={190} bgColor="#ffffff" fgColor="#111111" /></div>
              <div className="share-details">
                <span>YOUR PUBLIC LINK</span><strong>{publicUrl}</strong>
                <div><button onClick={copyProfile}>Copy link</button><button onClick={downloadQr}>Download QR</button></div>
              </div>
            </div>
          </div>
        )}

        {!["Links", "Design", "Insights", "Shop", "Audience", "Waitlist", "Email capture", "Share", "QR code"].includes(activeNav) && (
          <div className="empty-panel"><span>✦</span><h2>{activeNav} is ready for your next idea.</h2><p>This demo focuses on onboarding, link management, themes, and live preview.</p><button onClick={() => setActiveNav("Links")}>Back to links</button></div>
        )}
      </section>

      <aside className={`preview-pane ${mobilePreview ? "open" : ""}`}>
        <div className="preview-pane-top">
          <button onClick={copyProfile}>linkbio.nemu-ai.com/{PUBLIC_PROFILE_ID}　↗</button>
          <button className="close-preview" onClick={() => setMobilePreview(false)}>×</button>
        </div>
        <div className="phone-shell"><PublicPreview theme={theme} name={name} bio={bio} links={links} profileImage={profileImage} products={products} emailCapture={emailCapture} onLinkClick={recordClick} onSubscribe={addSubscriber} /></div>
      </aside>
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}

export default function ClientDashboard({ initialProfile }: { initialProfile?: ProfileData | null }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      if (initialProfile?.complete) {
        localStorage.setItem("linkspark-profile", JSON.stringify(initialProfile));
        setProfile(initialProfile);
        setReady(true);
        return;
      }
      try {
        const saved = localStorage.getItem("linkspark-profile");
        setProfile(saved ? JSON.parse(saved) : null);
      } catch {
        setProfile(null);
      }
      setReady(true);
    });
  }, [initialProfile]);

  const dashboardData = useMemo(() => profile ? {
    theme: profile.theme,
    links: profile.links,
    name: profile.name,
    bio: profile.bio,
    profileImage: profile.profileImage,
    archive: profile.archive,
    products: profile.products,
    subscribers: profile.subscribers,
    emailCapture: profile.emailCapture,
    publicId: profile.publicId,
  } : null, [profile]);

  if (!ready) return <div className="loading-screen"><span>✦</span></div>;
  if (!profile?.complete || !dashboardData) {
    return <Onboarding onComplete={(data) => {
      const next = { ...data, complete: true };
      localStorage.setItem("linkspark-profile", JSON.stringify(next));
      setProfile(next);
    }} />;
  }
  return <Dashboard initial={dashboardData} onReset={() => { localStorage.removeItem("linkspark-profile"); setProfile(null); }} />;
}
