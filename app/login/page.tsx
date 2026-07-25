import Link from "next/link";
import { redirect } from "next/navigation";
import { getChatGPTUser, isAdminUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getChatGPTUser();
  if (isAdminUser(user)) redirect("/app");
  const denied = Boolean(user);

  return (
    <main className="login-page">
      <Link className="login-brand" href="/"><span>N</span><div><strong>NEMU Link Bio</strong><small>Powered by NEMU AI</small></div></Link>
      <section className="login-card login-card-admin">
        <div className="login-copy">
          <span className="login-kicker">PRIVATE ADMIN ACCESS</span>
          <h1>Admin login.</h1>
          <p>Only the registered NEMU administrator can open this dashboard.</p>
          {denied && (
            <div className="login-denied" role="alert">
              <strong>Access denied</strong>
              <span>You are signed in as {user.email}. Switch to the registered admin account.</span>
            </div>
          )}
          <div className="admin-account-field">
            <label htmlFor="admin-account">Account type</label>
            <input id="admin-account" value="Registered NEMU administrator" readOnly />
          </div>
          {denied ? (
            <Link className="admin-switch-account" href="/signout-with-chatgpt?return_to=/login">
              Switch ChatGPT account <span>→</span>
            </Link>
          ) : (
            <form action="/signin-with-chatgpt" method="get">
              <input type="hidden" name="return_to" value="/app" />
              <button type="submit"><span className="chatgpt-mark">✦</span><b>Continue as admin</b><span>→</span></button>
            </form>
          )}
          <div className="login-divider"><span>Protected by ChatGPT</span></div>
          <ul>
            <li><span>✓</span>Restricted to one administrator</li>
            <li><span>✓</span>Password stays with ChatGPT</li>
            <li><span>✓</span>Public bio remains shareable</li>
          </ul>
          <small>Your ChatGPT password is never stored by NEMU AI.</small>
        </div>
      </section>
      <Link className="login-back" href="/">← Back to home</Link>
    </main>
  );
}
