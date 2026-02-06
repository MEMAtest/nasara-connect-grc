import { DashboardHomeClient } from "./DashboardHomeClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Nasara Connect",
  description: "Your compliance dashboard and module access overview",
};

export default function DashboardPage() {
  return <DashboardHomeClient />;
}

