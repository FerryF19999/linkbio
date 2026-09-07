import type { Metadata } from "next";
import Link from "next/link";
import ChallengeForm from "./ChallengeForm";

export const metadata: Metadata = {
  title: { absolute: "Pendaftaran NEMU 1 Juta Views Challenge" },
  description: "Daftar NEMU 1 Juta Views Challenge dan raih hadiah Rp1.000.000 dengan konten organik tentang NEMU.",
  alternates: { canonical: "/challenge" },
  openGraph: {
    title: "NEMU 1 Juta Views Challenge",
    description: "Bikin konten tentang NEMU, raih 1.000.000 views organik dalam maksimal 30 hari, dan dapatkan hadiah Rp1.000.000.",
    url: "/challenge",
    siteName: "NEMU AI",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-nemu-ai.png", width: 1200, height: 630, alt: "NEMU 1 Juta Views Challenge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEMU 1 Juta Views Challenge",
    description: "Raih 1.000.000 views organik dan dapatkan hadiah Rp1.000.000.",
    images: ["/og-nemu-ai.png"],
  },
};

export default function ChallengePage() {
  return (
    <main className="challenge-page">
      <header className="challenge-header">
        <Link href="/nemu-ai" className="challenge-brand" aria-label="Kembali ke NEMU AI">
          <span>✦</span><strong>nemu.ai</strong>
        </Link>
        <a href="#daftar">Daftar sekarang</a>
      </header>

      <section className="challenge-hero">
        <div className="challenge-prize">
          <span>CHALLENGE KREATOR</span>
          <strong>Rp1.000.000</strong>
          <small>untuk 1 juta views organik</small>
        </div>
        <div>
          <span className="challenge-kicker">NEMU CREATOR PROGRAM · 30 HARI</span>
          <h1>Pendaftaran NEMU<br /><em>1 Juta Views</em> Challenge</h1>
          <p>Bikin konten tentang NEMU, raih 1.000.000 views organik dalam waktu maksimal 30 hari sejak konten dipublikasikan, dan dapatkan hadiah Rp1.000.000.</p>
          <div className="challenge-highlights">
            <span><b>01</b> Buat konten</span>
            <span><b>02</b> Raih 1 juta views</span>
            <span><b>03</b> Menangkan hadiah</span>
          </div>
        </div>
      </section>

      <section className="challenge-form-shell" id="daftar">
        <aside>
          <span className="challenge-kicker">FORM PENDAFTARAN</span>
          <h2>Kirim kontenmu.</h2>
          <p>Pastikan akun dan konten tetap publik selama masa penilaian. Semua views harus diperoleh secara organik.</p>
          <div className="challenge-note">
            <strong>Harap diperhatikan</strong>
            <p>Tim NEMU akan menghubungi peserta yang mencapai target melalui WhatsApp atau email. Jangan pernah memberikan OTP atau melakukan pembayaran kepada pihak mana pun.</p>
          </div>
        </aside>
        <ChallengeForm />
      </section>

      <footer className="challenge-footer">
        <span>✦ nemu.ai</span>
        <p>Buatan Indonesia 🇮🇩 · Powered by NEMU AI</p>
        <Link href="/nemu-ai">Kembali ke NEMU Link Bio</Link>
      </footer>
    </main>
  );
}
