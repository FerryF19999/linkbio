import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NemuUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export function adminEmail() {
  return (
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    "openclawid6@gmail.com"
  );
}

export async function getNemuUser(): Promise<NemuUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;

    return {
      displayName: fullName ?? user.email,
      email: user.email,
      fullName,
    };
  } catch {
    return null;
  }
}

export function isAdminUser(user: NemuUser | null): user is NemuUser {
  return user?.email.toLowerCase() === adminEmail();
}

export async function requireAdminUser(): Promise<NemuUser> {
  const user = await getNemuUser();
  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/login?denied=1");
  return user;
}
