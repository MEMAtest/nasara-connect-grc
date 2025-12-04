import { use } from "react";
import { CmpControlDetailClient } from "../CmpControlDetailClient";

export const dynamic = "force-dynamic";

export default function ControlDetailPage({ params }: { params: Promise<{ controlId: string }> }) {
  const { controlId } = use(params);
  return <CmpControlDetailClient controlId={controlId} />;
}
