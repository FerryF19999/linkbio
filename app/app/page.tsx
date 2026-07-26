import { requireAdminUser } from "../auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import ClientDashboard, { type ProfileData } from "./ClientDashboard";

export const dynamic = "force-dynamic";

async function ProtectedDashboard() {
  await requireAdminUser();
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("profiles")
    .select("data")
    .eq("public_id", "nemu-ai")
    .maybeSingle();
  const initialProfile =
    data?.data && typeof data.data === "object"
      ? (data.data as ProfileData)
      : null;
  return <ClientDashboard initialProfile={initialProfile} />;
}

export default function DashboardPage() {
  return <ProtectedDashboard />;
}
