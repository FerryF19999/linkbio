import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function supabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;
  if (!value) throw new Error("Supabase URL is not configured.");
  return value;
}

function supabaseAnonKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  if (!value) throw new Error("Supabase anonymous key is not configured.");
  return value;
}

export async function clearSupabaseSessionCookies() {
  const cookieStore = await cookies();
  const projectRef = new URL(supabaseUrl()).hostname.split(".")[0];
  const prefix = `sb-${projectRef}-auth-token`;
  for (const { name } of cookieStore.getAll()) {
    if (name === prefix || name.startsWith(`${prefix}.`) || name === `${prefix}-code-verifier`) {
      cookieStore.delete(name);
    }
  }
}

export async function createSupabaseServerClient({ requireCookieWrite = false } = {}) {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          if (requireCookieWrite) throw error;
          // Server Components cannot always write cookies.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Supabase service role key is not configured.");
  }

  return createClient(supabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
