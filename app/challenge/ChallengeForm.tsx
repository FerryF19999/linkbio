"use client";

import { FormEvent, useRef, useState } from "react";

type FormState =
  | { type: "idle" | "loading"; message: "" }
  | { type: "success" | "error"; message: string };

const agreements = [
  ["ownsContent", "Konten ini merupakan karya saya sendiri."],
  ["staysPublic", "Akun dan konten akan dibuat publik selama masa penilaian."],
  ["organicViews", "Views diperoleh secara organik, tanpa membeli views atau menggunakan iklan/boost."],
  ["insightVerification", "Saya bersedia memberikan akses screenshot insight untuk verifikasi."],
  ["repostPermission", "Saya mengizinkan NEMU me-repost konten dengan mencantumkan kredit kreator."],
  ["termsAccepted", "Saya menyetujui syarat dan ketentuan challenge."],
] as const;

const today = new Date().toISOString().slice(0, 10);

export default function ChallengeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>({ type: "idle", message: "" });
  const [fileName, setFileName] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ type: "loading", message: "" });

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Pendaftaran belum berhasil.");
      form.reset();
      setFileName("");
      setState({
        type: "success",
        message: "Pendaftaran berhasil dikirim. Simpan link kontenmu dan pantau views selama 30 hari.",
      });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Pendaftaran belum berhasil. Silakan coba lagi.",
      });
    }
  }

  return (
    <form ref={formRef} className="challenge-form" onSubmit={submit}>
      <input className="challenge-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <fieldset>
        <legend><span>01</span><div><strong>Data peserta</strong><small>Informasi dasar untuk menghubungi kamu</small></div></legend>
        <div className="challenge-fields two-columns">
          <label><span>Nama lengkap *</span><input name="fullName" required minLength={2} maxLength={100} autoComplete="name" placeholder="Nama lengkap kamu" /></label>
          <label><span>Nomor WhatsApp aktif *</span><input name="whatsapp" required inputMode="tel" maxLength={30} autoComplete="tel" placeholder="Contoh: +62 812 3456 7890" /></label>
          <label><span>Alamat email <em>Opsional</em></span><input name="email" type="email" maxLength={254} autoComplete="email" placeholder="nama@email.com" /></label>
          <label><span>Domisili <em>Opsional</em></span><input name="domicile" maxLength={100} autoComplete="address-level2" placeholder="Kota tempat tinggal" /></label>
          <label className="full-field"><span>Username Instagram/TikTok *</span><input name="socialUsername" required maxLength={120} placeholder="@username" /></label>
          <label className="challenge-check full-field adult-check"><input name="isAdult" type="checkbox" required /><i /><span>Saya berusia minimal 18 tahun.</span></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span><div><strong>Data konten</strong><small>Detail konten yang mengikuti challenge</small></div></legend>
        <div className="challenge-fields">
          <label><span>Platform tempat konten dipublikasikan *</span><select name="platform" required defaultValue=""><option value="" disabled>Pilih platform</option><option>Instagram Reels</option><option>TikTok</option><option>YouTube Shorts</option></select></label>
          <label><span>Link konten challenge *</span><input name="contentUrl" type="url" required maxLength={2000} placeholder="https://..." /></label>
          <label><span>Tanggal konten dipublikasikan *</span><input name="publishedAt" type="date" required max={today} /></label>
          <label className="challenge-upload"><span>Screenshot insight awal <em>Opsional · Maks. 3 MB</em></span><input name="insightScreenshot" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /><i>{fileName || "Pilih JPG, PNG, atau WebP"}</i></label>
          <label><span>Ceritakan singkat konsep kontenmu <em>Opsional</em></span><textarea name="contentConcept" maxLength={1000} rows={4} placeholder="Apa ide utama dari kontenmu?" /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>03</span><div><strong>Persetujuan wajib</strong><small>Baca dan centang seluruh pernyataan</small></div></legend>
        <div className="challenge-agreements">
          {agreements.map(([name, label]) => (
            <label className="challenge-check" key={name}>
              <input name={name} type="checkbox" required /><i /><span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="challenge-submit" type="submit" disabled={state.type === "loading"}>
        {state.type === "loading" ? "Mengirim pendaftaran…" : "Kirim pendaftaran"}<span>→</span>
      </button>
      {state.message && <p className={`challenge-message ${state.type}`} role="status">{state.message}</p>}
      <small className="challenge-form-footnote">Dengan mengirim formulir ini, kamu menyatakan seluruh data yang diberikan benar.</small>
    </form>
  );
}
