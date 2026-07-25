import { requireAdminUser } from "../auth";
import ClientDashboard from "./ClientDashboard";

export const dynamic = "force-dynamic";

async function ProtectedDashboard() {
  await requireAdminUser();
  return <ClientDashboard />;
}

export default function DashboardPage() {
  return <ProtectedDashboard />;
}
