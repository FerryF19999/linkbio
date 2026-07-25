"use server";

import { redirect } from "next/navigation";
import { adminEmail } from "../auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (email !== adminEmail()) {
    redirect("/login?error=This+account+is+not+allowed.");
  }
  if (password.length < 8) {
    redirect("/login?error=Enter+your+admin+password.");
  }

  let loginError = "";
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    loginError = error?.message ?? "";
  } catch (error) {
    loginError =
      error instanceof Error ? error.message : "Unable to sign in.";
  }

  if (loginError) {
    redirect(`/login?error=${encodeURIComponent(loginError)}`);
  }

  redirect("/app");
}
