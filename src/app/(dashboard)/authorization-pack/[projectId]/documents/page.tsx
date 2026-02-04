import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/authorization-pack/${projectId}/opinion-pack`);
}
