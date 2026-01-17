import { use } from "react";
import { redirect } from "next/navigation";

export default function ControlDetailPage({ params }: { params: Promise<{ controlId: string }> }) {
  const { controlId } = use(params);
  redirect(`/compliance-framework/monitoring/${controlId}`);
}
