import { requireAdminUser } from "../chatgpt-auth";
import ClientDashboard from "./ClientDashboard";

export const dynamic = "force-dynamic";

async function ProtectedDashboard() {
  await requireAdminUser("/app");
  return <ClientDashboard />;
}

export default function DashboardPage() {
  return <ProtectedDashboard />;
}
