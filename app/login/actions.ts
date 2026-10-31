"use server";

import { redirect } from "next/navigation";
import { adminEmail } from "../auth";
import { clearSupabaseSessionCookies, createSupabaseServerClient } from "@/lib/supabase/server";
import { loginErrorMessage } from "@/lib/auth-errors";

export type LoginState = { error: string };

export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (email !== adminEmail()) {
    return { error: "Akun ini tidak memiliki akses admin." };
  }
  if (password.length < 8) {
    return { error: "Masukkan password admin minimal 8 karakter." };
  }

  try {
    // A fresh login must not inherit a broken/expired refresh token.
    await clearSupabaseSessionCookies();
    const supabase = await createSupabaseServerClient({ requireCookieWrite: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: loginErrorMessage(error) };
    if (!data.session) return { error: "Sesi login belum terbentuk. Coba lagi." };
  } catch {
    return { error: "Tidak dapat menyimpan sesi login. Reset sesi browser lalu coba lagi." };
  }

  redirect("/app");
}

export async function resetLoginSession() {
  // Local browser cookies only; do not revoke other devices' sessions.
  await clearSupabaseSessionCookies();
  redirect("/login?notice=session-reset");
}
