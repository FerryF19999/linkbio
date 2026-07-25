import Link from "next/link";
import { getChatGPTUser, isAdminUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

const featureItems = [
  ["One link, every side of you", "Bring social profiles, products, projects, and contact details together."],
  ["Designed in real time", "Choose a theme, edit your content, and see every change instantly."],
  ["Made to grow", "Collect emails, share a QR code, and understand what your audience clicks."],
];

export default async function LandingPage() {
  const user = await getChatGPTUser();
  const isAdmin = isAdminUser(user);

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link className="landing-brand" href="/"><span>N</span><div><strong>NEMU Link Bio</strong><small>Powered by NEMU AI</small></div></Link>
        <div>
          <a href="#features">Features</a>
          <a href="#showcase">Showcase</a>
          <Link className="landing-login-link" href={isAdmin ? "/app" : "/login"}>{isAdmin ? "Dashboard" : "Log in"}</Link>
          <Link className="landing-nav-cta" href={isAdmin ? "/app" : "/login"}>{isAdmin ? "Open app" : "Create your link"}</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker">YOUR INTERNET, BEAUTIFULLY ORGANIZED</span>
          <h1>Everything you are.<br /><em>One NEMU link.</em></h1>
          <p>Build a beautiful link-in-bio page for your content, products, community, and next big idea.</p>
          <div className="landing-hero-actions">
            <Link href={isAdmin ? "/app" : "/login"}>{isAdmin ? "Go to dashboard" : "Start building free"} <span>→</span></Link>
            <a href="#showcase">See how it works</a>
          </div>
          <div className="landing-trust"><span>✦</span><p>No design skills needed<br /><strong>Live in minutes</strong></p></div>
        </div>

        <div className="landing-visual" id="showcase">
          <div className="landing-orbit orbit-one" />
          <div className="landing-orbit orbit-two" />
          <div className="landing-dashboard-card">
            <div className="ldc-top"><i>N</i><span /><span /><b>•••</b></div>
            <div className="ldc-add">＋ Add link</div>
            {["My latest work", "Shop the collection", "Join my newsletter"].map((item, index) => (
              <div className="ldc-link" key={item}><i>{["↗", "▱", "✉"][index]}</i><div><strong>{item}</strong><span>https://nemu.link/...</span></div><b>●</b></div>
            ))}
          </div>
          <div className="landing-phone">
            <div className="landing-phone-screen">
              <button>↗</button>
              <div className="landing-avatar">NF</div>
              <strong>@nemuai</strong>
              <p>Creator, builder, and curious human.</p>
              <div className="landing-social-row">◎　♪　▶</div>
              {["My latest work", "Shop the collection", "Join my newsletter"].map((item) => <span key={item}>{item}<b>•••</b></span>)}
              <small>NEMU Link Bio<br /><em>Powered by NEMU AI</em></small>
            </div>
          </div>
          <div className="landing-float-card"><span>↗</span><div><strong>+42%</strong><small>More clicks this week</small></div></div>
        </div>
      </section>

      <section className="landing-logo-strip"><span>INSTAGRAM</span><span>YOUTUBE</span><span>TIKTOK</span><span>SPOTIFY</span><span>WHATSAPP</span><span>SHOP</span></section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading"><span>BUILT FOR EVERY CREATOR</span><h2>Small link.<br />Big possibilities.</h2></div>
        <div className="landing-feature-grid">
          {featureItems.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div className={`feature-art feature-art-${index + 1}`}><i /><i /><i /></div><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="landing-final-cta">
        <span>✦</span><h2>Your audience is already looking.<br />Give them one place to find you.</h2>
        <Link href={isAdmin ? "/app" : "/login"}>{isAdmin ? "Open dashboard" : "Create your NEMU Link Bio"} →</Link>
        <small>Powered by NEMU AI</small>
      </section>

      <footer className="landing-footer">
        <div><strong>NEMU Link Bio</strong><small>Powered by NEMU AI</small></div>
        <p>One beautiful link for everything you create.</p>
        <div><a href="#features">Features</a><Link href="/login">Log in</Link><span>© 2026 NEMU AI</span></div>
      </footer>
    </main>
  );
}
