import type { RiskRecord } from "../lib/riskConstants";

interface MitigationPlanProps {
  risk: RiskRecord | null;
  onPlanUpdate?: () => void;
}

export function MitigationPlan({ risk, onPlanUpdate }: MitigationPlanProps) {
  if (!risk) {
    return null;
  }

  void onPlanUpdate;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Mitigation Plan</h3>
      <p className="mt-2 text-sm text-slate-500">
        Document mitigation actions, owners, and due dates. This section will integrate with treatment workflows.
      </p>
    </section>
  );
}
