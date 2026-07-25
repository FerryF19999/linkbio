import Link from "next/link";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getChatGPTUser();
  if (user) redirect("/app");

  return (
    <main className="login-page">
      <Link className="login-brand" href="/"><span>N</span><div><strong>NEMU Link Bio</strong><small>Powered by NEMU AI</small></div></Link>
      <section className="login-card">
        <div className="login-copy">
          <span className="login-kicker">WELCOME TO NEMU</span>
          <h1>Your link is waiting.</h1>
          <p>Sign in securely to create, edit, and share your NEMU Link Bio.</p>
          <form action="/signin-with-chatgpt" method="get">
            <input type="hidden" name="return_to" value="/app" />
            <button type="submit"><span className="chatgpt-mark">✦</span><b>Continue with ChatGPT</b><span>→</span></button>
          </form>
          <div className="login-divider"><span>Secure sign in</span></div>
          <ul>
            <li><span>✓</span>No new password to remember</li>
            <li><span>✓</span>Your dashboard stays protected</li>
            <li><span>✓</span>Public profile remains shareable</li>
          </ul>
          <small>By continuing, you agree to NEMU AI’s Terms and Privacy Policy.</small>
        </div>
        <div className="login-art">
          <div className="login-gradient-orb" />
          <div className="login-mini-phone">
            <div>NF</div><strong>@nemuai</strong><p>Everything I create, in one place.</p>
            <span>My latest project　•••</span><span>Shop my picks　•••</span><span>Let’s connect　•••</span>
            <small>NEMU Link Bio</small>
          </div>
          <div className="login-quote">“One link.<br />Every possibility.”<small>Powered by NEMU AI</small></div>
        </div>
      </section>
      <Link className="login-back" href="/">← Back to home</Link>
    </main>
  );
}
