import { use } from "react";
import { CmpControlDetailClient } from "../../cmp/CmpControlDetailClient";

export const dynamic = "force-dynamic";

export default function MonitoringControlDetailPage({ params }: { params: Promise<{ controlId: string }> }) {
  const { controlId } = use(params);
  return <CmpControlDetailClient controlId={controlId} />;
}
