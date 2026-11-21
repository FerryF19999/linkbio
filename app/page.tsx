import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight, FiPlus, FiShoppingBag } from "react-icons/fi";
import { SiInstagram, SiSpotify, SiTiktok, SiWhatsapp, SiYoutube } from "react-icons/si";
import { getNemuUser, isAdminUser } from "./auth";
import HeroShowcase from "./HeroShowcase";
import LandingHeader from "./LandingHeader";
import ProfileShowcase from "./ProfileShowcase";
import ThemePreview from "./ThemePreview";
import WaitlistForm from "./WaitlistForm";
import styles from "./landing.module.css";

export const dynamic = "force-dynamic";

const launchPrice = "Rp19.000";
const platforms = [
  { name: "Instagram", Icon: SiInstagram, color: "#ffc9e5" },
  { name: "TikTok", Icon: SiTiktok, color: "#bdeded" },
  { name: "YouTube", Icon: SiYoutube, color: "#ffcec0" },
  { name: "Spotify", Icon: SiSpotify, color: "#bbf5c8" },
  { name: "WhatsApp", Icon: SiWhatsapp, color: "#ecf6aa" },
  { name: "Toko online", Icon: FiShoppingBag, color: "#dcd4ff" },
];

const questions = [
  ["Apa itu NEMU Link Bio?", "NEMU Link Bio menyatukan tautan ke toko, portofolio, dan media sosial di satu halaman yang bisa kamu bagikan."],
  ["Apakah daftar tunggunya gratis?", "Ya. Cukup isi nama dan email. Kami akan mengabarimu saat akses dibuka."],
  ["Perlu ganti alamat bio kalau tautanku berubah?", "Kamu bisa mengubah tujuan dan urutan tautan dari dashboard. Alamat profil yang sudah kamu bagikan tetap sama."],
];

function PlatformSection() {
  const tiles = platforms.map(({ name, Icon, color }) => (
    <li key={name} style={{ backgroundColor: color }}>
      <Icon aria-hidden="true" /><span>{name}</span>
    </li>
  ));
  return (
    <section className={styles.platforms} aria-labelledby="platform-title">
      <div className={styles.split}>
        <div className={styles.sectionCopy}>
          <h2 id="platform-title">Satu alamat di semua platform.</h2>
          <p>Pasang profil NEMU di bio media sosialmu. Untuk pelanggan di toko, bagikan profil yang sama lewat kode QR.</p>
        </div>
        <div className={styles.platformBoard}>
          <ul>{tiles.slice(0, 3)}</ul>
          <Link href="/nemu-ai" aria-label="Buka profil NEMU AI">
            <Image src="/favicon.svg" width={24} height={24} alt="" />
            <span>linkbio.nemu-ai.com/<strong>nemu-ai</strong></span>
            <FiArrowUpRight aria-hidden="true" />
          </Link>
          <ul>{tiles.slice(3)}</ul>
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const isAdmin = isAdminUser(await getNemuUser().catch(() => null));

  return (
    <div className={styles.page}>
      <LandingHeader isAdmin={isAdmin} />
      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 id="hero-title">Satu link&nbsp;bio untuk karya, toko, dan kontenmu.</h1>
              <p>Pilih tema, atur tautanmu, lalu bagikan semuanya lewat satu halaman NEMU.</p>
              <Link className={styles.primary} href={isAdmin ? "/app" : "#waitlist"}>
                {isAdmin ? "Buka dashboard" : "Daftar akses awal"} <FiArrowRight aria-hidden="true" />
              </Link>
              <a className={styles.priceHint} href="#harga">Rencana harga peluncuran <strong>{launchPrice}/bulan</strong></a>
            </div>
            <HeroShowcase />
          </div>
        </section>

        <ProfileShowcase />
        <ThemePreview />
        <PlatformSection />

        <section className={styles.pricing} id="harga" aria-labelledby="price-title">
          <div className={styles.split}>
            <div className={styles.price}>
              <h2 id="price-title">Rencana harga peluncuran</h2>
              <p className={styles.rate}><strong>{launchPrice}</strong> <span>/ bulan</span></p>
              <p>Termasuk pilihan tema, kode QR profil, dan statistik klik tautan.</p>
            </div>
            <div className={styles.signupForm} id="waitlist">
              {isAdmin ? (
                <Link className={styles.primary} href="/app">Buka dashboard <FiArrowRight aria-hidden="true" /></Link>
              ) : (
                <>
                  <h3>Daftar akses awal</h3>
                  <p>Daftar tunggunya gratis. Kami akan mengabarimu lewat email saat akses dibuka.</p>
                  <WaitlistForm />
                </>
              )}
            </div>
          </div>
        </section>

        <section className={styles.faq} id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Pertanyaan umum</h2>
          <div className={styles.questions}>
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<FiPlus aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/" aria-label="NEMU Link Bio, beranda"><Image src="/favicon.svg" alt="" width={28} height={28} /><strong>NEMU Link Bio</strong></Link>
        <span>© 2026 NEMU AI</span>
      </footer>
    </div>
  );
}
