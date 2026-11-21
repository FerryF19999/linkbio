import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { FiArrowDown, FiArrowRight, FiArrowUpRight, FiLink } from "react-icons/fi";
import { SiInstagram, SiSpotify, SiTiktok, SiWhatsapp, SiYoutube } from "react-icons/si";
import { getNemuUser, isAdminUser } from "./auth";
import ThemePreview from "./ThemePreview";
import WaitlistForm from "./WaitlistForm";
import styles from "./landing.module.css";

export const dynamic = "force-dynamic";

const instrument = localFont({
  src: "./fonts/instrument-serif-italic.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

const platforms = [
  { name: "Instagram", Icon: SiInstagram },
  { name: "TikTok", Icon: SiTiktok },
  { name: "YouTube", Icon: SiYoutube },
  { name: "Spotify", Icon: SiSpotify },
  { name: "WhatsApp", Icon: SiWhatsapp },
];

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="NEMU Link Bio, beranda">
      <Image src="/favicon.svg" width={36} height={36} alt="" />
      <strong>NEMU</strong><span>Link Bio</span>
    </Link>
  );
}

export default async function LandingPage() {
  const user = await getNemuUser().catch(() => null);
  const isAdmin = isAdminUser(user);
  const actionHref = isAdmin ? "/app" : "#waitlist";
  const actionLabel = isAdmin ? "Buka dashboard" : "Daftar akses awal";

  return (
    <div className={`${styles.page} ${instrument.variable}`}>
      <header className={styles.header}>
        <div className={styles.masthead}>
          <Brand />
          <nav aria-label="Navigasi utama" className={styles.nav}>
            <a href="#features">Fitur</a>
            <Link href="/nemu-ai">Contoh profil <FiArrowUpRight aria-hidden="true" /></Link>
          </nav>
          <div className={styles.account}>
            {!isAdmin && <Link href="/login" className={styles.login}>Masuk</Link>}
            <Link href={actionHref} className={styles.navAction}>
              {isAdmin ? "Dashboard" : "Daftar"} <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <h1 id="hero-title">Duniamu,<br /><em>satu tautan.</em></h1>
            <p>Satukan karya, toko, dan media sosialmu di satu halaman yang mudah dibagikan.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primary} href={actionHref}>{actionLabel}<FiArrowRight aria-hidden="true" /></Link>
              <a className={styles.secondary} href="#features">Coba tema <FiArrowDown aria-hidden="true" /></a>
            </div>
          </div>
          <div className={styles.art} id="showcase">
            <Image src="/link-sculpture.webp" width={1402} height={1122}
              sizes="(max-width: 760px) 100vw, (max-width: 1500px) 53vw, 720px"
              preload alt="" className={styles.sculpture} />
            <Link href="/nemu-ai" className={styles.profileLink} aria-label="Buka contoh profil NEMU AI">
              <span className={styles.linkGlyph}><FiLink aria-hidden="true" /></span>
              <span className={styles.profileAddress}>linkbio.nemu-ai.com<strong>/nemu-ai</strong></span>
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles.platforms} aria-label="Contoh platform yang bisa ditautkan">
          <div className={styles.platformInner}>
            <p>Hubungkan platformmu</p>
            <ul>{platforms.map(({ name, Icon }) => <li key={name}><Icon aria-hidden="true" />{name}</li>)}</ul>
          </div>
        </section>

        <ThemePreview />

        {isAdmin ? (
          <section className={styles.signup}>
            <div><h2>Kelola profilmu.</h2></div>
            <Link className={styles.lightAction} href="/app">Buka dashboard <FiArrowRight aria-hidden="true" /></Link>
          </section>
        ) : (
          <section className={styles.signup} id="waitlist" aria-labelledby="signup-title">
            <div><h2 id="signup-title">Daftar akses awal.</h2><p>Kami akan mengabarimu lewat email saat NEMU Link Bio dibuka.</p></div>
            <WaitlistForm />
          </section>
        )}
      </main>
      <footer className={styles.footer}>
        <Brand />
        <span>© 2026 NEMU AI</span>
        <Link href={isAdmin ? "/app" : "/login"}>{isAdmin ? "Dashboard" : "Masuk admin"} <FiArrowUpRight aria-hidden="true" /></Link>
      </footer>
    </div>
  );
}
