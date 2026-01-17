"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { useCmpControls, DEFAULT_CMP_FILTERS, type CmpFilterState } from "./hooks/useCmpControls";
import type { CmpControlDetail } from "@/data/cmp/types";
import { CmpMetricGrid } from "./components/CmpMetricGrid";
import { CmpFilters } from "./components/CmpFilters";
import { CmpControlTable } from "./components/CmpControlTable";
import { LogTestDialog, RaiseFindingDialog } from "./components/CmpActionDialogs";
import { AlertTriangle, CheckCircle2, Clock3, Flag, RefreshCcw } from "lucide-react";

const ORGANIZATION_ID = DEFAULT_ORGANIZATION_ID;

type ActionState = { type: "logTest" | "finding" | null; control: CmpControlDetail | null };

export function CmpOverviewClient() {
  const router = useRouter();
  const { controls, filteredControls, filters, setFilters, isLoading, error, refresh } = useCmpControls({ organizationId: ORGANIZATION_ID });
  const [actionState, setActionState] = useState<ActionState>({ type: null, control: null });

  const metrics = useMemo(() => buildMetrics(controls), [controls]);
  const dutyOutcomes = useMemo(() => Array.from(new Set(controls.map((control) => control.dutyOutcome))).sort(), [controls]);

  const handleFilterChange = (next: CmpFilterState) => setFilters(next);
  const handleReset = () => setFilters(DEFAULT_CMP_FILTERS);

  const openAction = (type: ActionState["type"], control: CmpControlDetail) => setActionState({ type, control });
  const closeAction = () => setActionState({ type: null, control: null });

  const handleViewControl = (control: CmpControlDetail) => {
    router.push(`/compliance-framework/monitoring/${control.id}`);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">Compliance Monitoring Plan</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Control testing workspace</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Track CMP controls, link Consumer Duty outcomes, and trigger remediation across the platform.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refresh()}>
              Refresh data
            </Button>
            <Button onClick={() => router.push("/compliance-framework/builder")}>Framework builder</Button>
          </div>
        </div>
      </header>

      <CmpMetricGrid metrics={metrics} />

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <AlertTitle>Unable to load controls</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <CmpFilters filters={filters} dutyOutcomes={dutyOutcomes} onChange={handleFilterChange} onReset={handleReset} />

      <CmpControlTable
        controls={filteredControls}
        isLoading={isLoading}
        onView={handleViewControl}
        onLogTest={(control) => openAction("logTest", control)}
        onRaiseFinding={(control) => openAction("finding", control)}
      />

      <LogTestDialog
        open={actionState.type === "logTest"}
        control={actionState.control}
        onClose={closeAction}
        organizationId={ORGANIZATION_ID}
        onSuccess={refresh}
      />
      <RaiseFindingDialog
        open={actionState.type === "finding"}
        control={actionState.control}
        onClose={closeAction}
        organizationId={ORGANIZATION_ID}
        onSuccess={refresh}
      />
    </div>
  );
}

function buildMetrics(controls: CmpControlDetail[]) {
  const totalControls = controls.length;
  const now = Date.now();
  const fourteenDays = 1000 * 60 * 60 * 24 * 14;
  const dueSoon = controls.filter((control) => {
    const next = new Date(control.nextTestDue).getTime();
    return !Number.isNaN(next) && next - now <= fourteenDays && next >= now;
  }).length;
  const overdue = controls.filter((control) => new Date(control.nextTestDue).getTime() < now).length;
  const openFindings = controls.reduce((sum, control) => sum + (control.issuesOpen ?? 0), 0);

  return [
    { title: "Active controls", value: String(totalControls), description: "In monitoring scope", icon: CheckCircle2, accent: "teal" as const },
    { title: "Tests due (14d)", value: String(dueSoon), description: "Upcoming reviews", icon: RefreshCcw, accent: "sky" as const },
    { title: "Overdue reviews", value: String(overdue), description: "Escalate immediately", icon: Clock3, accent: "amber" as const },
    { title: "Open findings", value: String(openFindings), description: "Across all controls", icon: Flag, accent: "rose" as const },
  ];
}
