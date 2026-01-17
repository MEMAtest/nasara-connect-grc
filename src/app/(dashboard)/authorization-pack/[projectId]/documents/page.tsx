import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DocumentsPage({ params }: { params: { projectId: string } }) {
  redirect(`/authorization-pack/${params.projectId}/opinion-pack`);
}
