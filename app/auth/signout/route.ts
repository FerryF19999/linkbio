import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // A missing or expired session is already effectively signed out.
  }

  return NextResponse.redirect(new URL("/", request.url));
}
