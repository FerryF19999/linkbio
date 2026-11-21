import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import { redirect } from "next/navigation";
import { adminEmail, getNemuUser, isAdminUser } from "../auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; error?: string; reason?: string; notice?: string }>;
}) {
  const { user, authUnavailable } = await getNemuUser()
    .then((user) => ({ user, authUnavailable: false }))
    .catch(() => ({ user: null, authUnavailable: true }));
  if (isAdminUser(user)) redirect("/app");

  const params = await searchParams;
  const denied = Boolean(user) || params.denied === "1";
  const sessionExpired = params.reason === "session-expired" || /session expired/i.test(params.error ?? "");
  const error = authUnavailable
    ? "Layanan pengecekan sesi sedang bermasalah. Coba login kembali sebentar lagi."
    : sessionExpired ? "" : params.error ? "Login sebelumnya belum berhasil. Periksa password lalu coba lagi." : "";

  return (
    <main className="login-page">
      <Link className="login-brand" href="/">
        <Image src="/favicon.svg" alt="" width={32} height={32} />
        <strong>NEMU Link Bio</strong>
      </Link>
      <section className="login-card login-card-admin">
        <div className="login-copy">
          <h1>Masuk admin</h1>
          <p>Masuk dengan akun admin NEMU untuk mengelola profil dan tautan.</p>
          {denied && (
            <div className="login-denied" role="alert">
              <strong>Akses terbatas</strong>
              <span>Gunakan akun admin yang tertera di bawah.</span>
            </div>
          )}
          <LoginForm email={adminEmail()} sessionExpired={sessionExpired} initialError={error} sessionReset={params.notice === "session-reset"} />
        </div>
      </section>
      <Link className="login-back" href="/"><FiArrowLeft aria-hidden="true" /> Kembali ke beranda</Link>
    </main>
  );
}
