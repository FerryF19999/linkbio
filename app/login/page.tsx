import Link from "next/link";
import { redirect } from "next/navigation";
import { adminEmail, getNemuUser, isAdminUser } from "../auth";
import { signIn } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; error?: string }>;
}) {
  const user = await getNemuUser();
  if (isAdminUser(user)) redirect("/app");

  const params = await searchParams;
  const denied = Boolean(user) || params.denied === "1";
  const error = params.error ?? "";

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
          {(denied || error) && (
            <div className="login-denied" role="alert">
              <strong>{denied ? "Access denied" : "Login failed"}</strong>
              <span>
                {denied
                  ? `Only ${adminEmail()} can access this dashboard.`
                  : error}
              </span>
            </div>
          )}
          <form action={signIn} className="admin-login-form">
            <div className="admin-account-field">
              <label htmlFor="admin-email">Admin email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={adminEmail()}
                readOnly
              />
            </div>
            <div className="admin-account-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="current-password"
                placeholder="Enter your admin password"
                required
                autoFocus
              />
            </div>
            <button type="submit">
              <span className="chatgpt-mark">N</span>
              <b>Log in to dashboard</b>
              <span>→</span>
            </button>
          </form>
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
