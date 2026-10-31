"use client";

import { useActionState, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { resetLoginSession, signIn } from "./actions";

export default function LoginForm({ email, sessionExpired, initialError, sessionReset }: {
  email: string;
  sessionExpired: boolean;
  initialError: string;
  sessionReset: boolean;
}) {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const error = state.error || initialError;

  return <>
    {error ? <div className="login-denied" role="alert">
      <strong>Login belum berhasil</strong><span>{error}</span>
    </div> : (sessionExpired || sessionReset) && <div className="login-notice" role="status">
      <strong>{sessionReset ? "Sesi browser sudah direset" : "Sesi sebelumnya berakhir"}</strong>
      <span>{sessionReset ? "Masukkan kembali password untuk masuk." : "Silakan masuk kembali. Pesan ini bukan berarti password kamu salah."}</span>
    </div>}
    <form action={action} className="admin-login-form" aria-busy={pending}>
      <div className="admin-account-field">
        <label htmlFor="admin-email">Admin email</label>
        <input id="admin-email" name="email" type="email" value={email} readOnly autoComplete="username" />
      </div>
      <div className="admin-account-field">
        <label htmlFor="admin-password">Password</label>
        <div className="admin-password-control">
          <input id="admin-password" name="password" type={showPassword ? "text" : "password"}
            minLength={8} autoComplete="current-password" placeholder="Masukkan password admin" required autoFocus
            aria-describedby={capsLock ? "caps-lock-warning" : undefined}
            onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
            onBlur={() => setCapsLock(false)} />
          <button type="button" className="admin-password-toggle" onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"} aria-pressed={showPassword}>
            {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
          </button>
        </div>
        {capsLock && <small id="caps-lock-warning">Caps Lock aktif.</small>}
      </div>
      <button type="submit" disabled={pending}>
        <span className="chatgpt-mark">N</span>
        <b>{pending ? "Sedang masuk…" : "Log in to dashboard"}</b><span aria-hidden="true">→</span>
      </button>
    </form>
    <form action={resetLoginSession} className="login-reset-form">
      <button type="submit" disabled={pending}>Reset sesi browser</button>
      <small>Hanya mereset sesi di browser ini, bukan mengubah password.</small>
    </form>
  </>;
}
