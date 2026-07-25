import { requireChatGPTUser } from "../chatgpt-auth";
import ClientDashboard from "./ClientDashboard";

export const dynamic = "force-dynamic";

async function ProtectedDashboard() {
  await requireChatGPTUser("/app");
  return <ClientDashboard />;
}

export default function DashboardPage() {
  return <ProtectedDashboard />;
}
