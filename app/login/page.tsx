import Link from "next/link";
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
        <span>N</span>
        <div>
          <strong>NEMU Link Bio</strong>
          <small>Powered by NEMU AI</small>
        </div>
      </Link>
      <section className="login-card login-card-admin">
        <div className="login-copy">
          <span className="login-kicker">PRIVATE ADMIN ACCESS</span>
          <h1>Admin login.</h1>
          <p>Only the registered NEMU administrator can open this dashboard.</p>
          {denied && (
            <div className="login-denied" role="alert">
              <strong>Access denied</strong>
              <span>
                {`Only ${adminEmail()} can access this dashboard.`}
              </span>
            </div>
          )}
          <LoginForm email={adminEmail()} sessionExpired={sessionExpired} initialError={error} sessionReset={params.notice === "session-reset"} />
          <div className="login-divider">
            <span>Protected by Supabase Auth</span>
          </div>
          <ul>
            <li><span>✓</span>Restricted to one administrator</li>
            <li><span>✓</span>Secure server-managed session</li>
            <li><span>✓</span>Public bio remains shareable</li>
          </ul>
          <small>
            Your password is handled by Supabase Auth and is never stored in
            the NEMU application database.
          </small>
        </div>
      </section>
      <Link className="login-back" href="/">← Back to home</Link>
    </main>
  );
}
