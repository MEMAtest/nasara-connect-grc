import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Export page - redirecting to main workspace
export default function AuthorizationPackExportPage() {
  redirect("/authorization-pack/workspace");
}
