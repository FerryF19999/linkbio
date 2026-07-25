"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Platform = {
  id: string;
  name: string;
  icon: string;
  color: string;
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

const platforms: Platform[] = [
  { id: "instagram", name: "Instagram", icon: "◎", color: "#e1306c", placeholder: "@username" },
  { id: "whatsapp", name: "WhatsApp", icon: "◉", color: "#20c66a", placeholder: "+62 812..." },
  { id: "tiktok", name: "TikTok", icon: "♪", color: "#111111", placeholder: "@username" },
  { id: "youtube", name: "YouTube", icon: "▶", color: "#ff1f3d", placeholder: "youtube.com/..." },
  { id: "website", name: "Website", icon: "⌾", color: "#111111", placeholder: "https://..." },
  { id: "spotify", name: "Spotify", icon: "≋", color: "#1ed760", placeholder: "open.spotify.com/..." },
  { id: "threads", name: "Threads", icon: "@", color: "#111111", placeholder: "@username" },
  { id: "facebook", name: "Facebook", icon: "f", color: "#1877f2", placeholder: "facebook.com/..." },
  { id: "x", name: "X", icon: "𝕏", color: "#111111", placeholder: "@username" },
  { id: "soundcloud", name: "SoundCloud", icon: "≋", color: "#ff5500", placeholder: "soundcloud.com/..." },
  { id: "snapchat", name: "Snapchat", icon: "♙", color: "#ffeb00", placeholder: "@username" },
  { id: "pinterest", name: "Pinterest", icon: "P", color: "#e60023", placeholder: "pinterest.com/..." },
  { id: "patreon", name: "Patreon", icon: "●", color: "#ff424d", placeholder: "patreon.com/..." },
  { id: "twitch", name: "Twitch", icon: "▣", color: "#9146ff", placeholder: "twitch.tv/..." },
  { id: "apple", name: "Apple Music", icon: "♫", color: "#fa4d66", placeholder: "music.apple.com/..." },
];

const themes: Theme[] = [
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
  { id: 1, title: "Instagram", url: "https://instagram.com/", icon: "◎", color: "#e1306c", enabled: true, clicks: 24 },
  { id: 2, title: "My latest project", url: "https://example.com/project", icon: "↗", color: "#171717", enabled: true, clicks: 11 },
  { id: 3, title: "Let’s work together", url: "mailto:hello@example.com", icon: "✦", color: "#7c3aed", enabled: true, clicks: 7 },
];

const navItems = [
  ["Links", "⌁"],
  ["Shop", "▱"],
  ["Design", "✦"],
  ["Audience", "♙"],
  ["Insights", "▥"],
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
  onComplete: (data: { theme: string; links: LinkItem[]; name: string; bio: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("sunset");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [platformValues, setPlatformValues] = useState<Record<string, string>>({});
  const [extraLinks, setExtraLinks] = useState(["", "", ""]);
  const [name, setName] = useState("nemuai");
  const [bio, setBio] = useState("");

  const finish = () => {
    const selectedLinks = selectedPlatforms.map((id, index) => {
      const platform = platforms.find((p) => p.id === id)!;
      const value = platformValues[id] || "";
      const url = value.startsWith("http") ? value : value ? `https://${platform.id}.com/${value.replace("@", "")}` : "#";
      return { id: Date.now() + index, title: platform.name, url, icon: platform.icon, color: platform.color, enabled: true, clicks: 0 };
    });
    const extras = extraLinks
      .filter(Boolean)
      .map((url, index) => ({ id: Date.now() + 100 + index, title: `My link ${index + 1}`, url, icon: "↗", color: "#171717", enabled: true, clicks: 0 }));
    onComplete({ theme, links: [...selectedLinks, ...extras], name, bio });
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
                    <span style={{ background: platform.color }}>{platform.icon}</span>
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
                    <span style={{ background: platform.color }}>{platform.icon}</span>
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
            <button type="button" className="avatar-uploader" aria-label="Upload profile image">
              <span>NF</span><b>+</b>
            </button>
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
        <span>Made for your next click</span>
      </footer>
    </main>
  );
}

function PublicPreview({ theme, name, bio, links }: { theme: Theme; name: string; bio: string; links: LinkItem[] }) {
  return (
    <div className={`public-preview pattern-${theme.pattern ?? "none"}`} style={{ background: theme.bg, color: theme.text }}>
      <button className="preview-share" aria-label="Share profile">↗</button>
      <div className="preview-avatar">NF</div>
      <h2>@{name || "yourname"}</h2>
      <p>{bio || "Your story, your links, all in one place."}</p>
      <div className="preview-socials">
        {links.slice(0, 5).map((link) => <span key={link.id}>{link.icon}</span>)}
      </div>
      <div className="preview-links">
        {links.filter((link) => link.enabled).map((link) => (
          <a
            key={link.id}
            href={link.url || "#"}
            style={{ background: theme.button, color: theme.buttonText, borderColor: theme.pattern === "outline" ? theme.text : "transparent" }}
            onClick={(e) => link.url === "#" && e.preventDefault()}
          >
            <span>{link.icon}</span><strong>{link.title || "Untitled link"}</strong><b>•••</b>
          </a>
        ))}
      </div>
      <div className="preview-brand">link<span>spark✦</span></div>
    </div>
  );
}

function Dashboard({
  initial,
  onReset,
}: {
  initial: { theme: string; links: LinkItem[]; name: string; bio: string };
  onReset: () => void;
}) {
  const [activeNav, setActiveNav] = useState("Links");
  const [themeId, setThemeId] = useState(initial.theme);
  const [links, setLinks] = useState<LinkItem[]>(initial.links.length ? initial.links : starterLinks);
  const [name, setName] = useState(initial.name || "nemuai");
  const [bio, setBio] = useState(initial.bio);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState("");
  const nextId = useRef(10_000);
  const theme = themes.find((item) => item.id === themeId) ?? themes[1];

  useEffect(() => {
    localStorage.setItem("linkspark-profile", JSON.stringify({ theme: themeId, links, name, bio, complete: true }));
  }, [themeId, links, name, bio]);

  const addLink = () => {
    const id = ++nextId.current;
    setLinks((items) => [{ id, title: "New link", url: "https://", icon: "↗", color: "#171717", enabled: true, clicks: 0 }, ...items]);
  };

  const updateLink = (id: number, update: Partial<LinkItem>) => {
    setLinks((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
  };

  const copyProfile = async () => {
    await navigator.clipboard?.writeText(`https://linkspark.site/${name}`);
    setToast("Profile link copied");
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <main className="dashboard">
      <div className="upgrade-bar">
        <span className="spark-mark">✦</span>
        <p>Grow your audience with a page that feels like you.</p>
        <button>⚡ Upgrade</button>
      </div>

      <aside className="sidebar">
        <button className="account"><span>NF</span><strong>{name || "creator"}</strong><b>⌄</b></button>
        <nav>
          <p>MY PAGE</p>
          {navItems.map(([label, icon]) => (
            <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <p>GROW</p>
          {["Share", "Email capture", "QR code"].map((item, index) => <button key={item}><span>{["↗", "✉", "▦"][index]}</span>{item}</button>)}
        </nav>
        <div className="setup-card">
          <div className="setup-progress"><span>72%</span></div>
          <strong>Your page is looking good</strong>
          <p>One more touch can make it unforgettable.</p>
          <button onClick={() => setActiveNav("Design")}>Finish setup</button>
        </div>
        <button className="reset-link" onClick={onReset}>↺ Restart onboarding</button>
      </aside>

      <section className="editor">
        <header className="editor-header">
          <div>
            <span className="editor-eyebrow">MY LINK-IN-BIO</span>
            <h1>{activeNav}</h1>
          </div>
          <div className="header-actions">
            <button onClick={() => setMobilePreview(true)}>◉ Preview</button>
            <button onClick={copyProfile}>↗ Share</button>
          </div>
        </header>

        {activeNav === "Links" && (
          <div className="links-editor">
            <section className="profile-summary">
              <div className="profile-thumb">NF</div>
              <div>
                <input value={name} onChange={(e) => setName(e.target.value.replace(/\s/g, "").slice(0, 24))} aria-label="Profile username" />
                <input value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="Add a short bio" aria-label="Profile bio" />
                <div className="profile-networks">{links.slice(0, 5).map((link) => <span key={link.id} style={{ color: link.color }}>{link.icon}</span>)}<button>+</button></div>
              </div>
            </section>

            <button className="add-button" onClick={addLink}><span>＋</span> Add link</button>
            <div className="collection-row"><button>▱ Add collection</button><button>▰ View archive　›</button></div>

            <div className="link-stack">
              {links.map((link, index) => (
                <article className="link-card" key={link.id}>
                  <button className="drag-handle" aria-label={`Move ${link.title}`}>⠿</button>
                  <div className="link-card-main">
                    <label>
                      <span>Title</span>
                      <input value={link.title} onChange={(e) => updateLink(link.id, { title: e.target.value })} />
                    </label>
                    <label>
                      <span>URL</span>
                      <input value={link.url} onChange={(e) => updateLink(link.id, { url: e.target.value })} />
                    </label>
                    <div className="link-tools">
                      <span style={{ color: link.color }}>{link.icon}</span>
                      <button title="Add thumbnail">▧</button>
                      <button title="Feature link">☆</button>
                      <button title="Schedule">◷</button>
                      <span className="clicks">▥ {link.clicks} clicks</span>
                    </div>
                  </div>
                  <div className="link-card-actions">
                    <button className={`switch ${link.enabled ? "on" : ""}`} onClick={() => updateLink(link.id, { enabled: !link.enabled })} aria-label={`${link.enabled ? "Disable" : "Enable"} ${link.title}`}><i /></button>
                    <button onClick={() => setLinks((items) => items.filter((item) => item.id !== link.id))} aria-label={`Delete ${link.title}`}>⌫</button>
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
            <div className="metric-card"><span>TOTAL VIEWS</span><strong>1,284</strong><small>↑ 18.4% this month</small></div>
            <div className="metric-card"><span>LINK CLICKS</span><strong>{links.reduce((sum, link) => sum + link.clicks, 0)}</strong><small>↑ 9.2% this month</small></div>
            <div className="chart-card"><div className="section-title"><div><h2>Performance</h2><p>Profile activity over the last 7 days.</p></div></div><div className="fake-chart">{[32, 45, 38, 68, 57, 84, 76].map((h, i) => <i key={i} style={{ height: `${h}%` }}><span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span></i>)}</div></div>
          </div>
        )}

        {!["Links", "Design", "Insights"].includes(activeNav) && (
          <div className="empty-panel"><span>✦</span><h2>{activeNav} is ready for your next idea.</h2><p>This demo focuses on onboarding, link management, themes, and live preview.</p><button onClick={() => setActiveNav("Links")}>Back to links</button></div>
        )}
      </section>

      <aside className={`preview-pane ${mobilePreview ? "open" : ""}`}>
        <div className="preview-pane-top">
          <button onClick={copyProfile}>linkspark.site/{name || "creator"}　↗</button>
          <button className="close-preview" onClick={() => setMobilePreview(false)}>×</button>
        </div>
        <div className="phone-shell"><PublicPreview theme={theme} name={name} bio={bio} links={links} /></div>
      </aside>
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<{ theme: string; links: LinkItem[]; name: string; bio: string; complete: boolean } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem("linkspark-profile");
        setProfile(saved ? JSON.parse(saved) : null);
      } catch {
        setProfile(null);
      }
      setReady(true);
    });
  }, []);

  const dashboardData = useMemo(() => profile ? { theme: profile.theme, links: profile.links, name: profile.name, bio: profile.bio } : null, [profile]);

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
