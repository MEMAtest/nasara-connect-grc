"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, RefreshCcw, Flag, Gauge, Target, AlertTriangle } from "lucide-react";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { useCmpSummary } from "./cmp/hooks/useCmpSummary";
import { buildCmpAlerts } from "@/lib/cmp-alerts";
import { useAssistantContext } from "@/components/dashboard/useAssistantContext";

export function ComplianceFrameworkClient() {
  const router = useRouter();
  const { setContext } = useAssistantContext();
  const {
    summary,
    isLoading,
    error,
    refresh,
  } = useCmpSummary({ organizationId: DEFAULT_ORGANIZATION_ID });

  const metricCards = useMemo(
    () => [
      {
        title: "Active controls",
        value: summary ? String(summary.totalControls) : "--",
        description: "Mapped to framework components",
        icon: ClipboardList,
      },
      {
        title: "Avg pass rate",
        value: summary ? `${Math.round(summary.avgPassRate * 100)}%` : "--",
        description: "Latest CMP cycle",
        icon: Gauge,
      },
      {
        title: "Tests due (14d)",
        value: summary ? String(summary.dueSoon) : "--",
        description: "Upcoming monitoring events",
        icon: RefreshCcw,
      },
      {
        title: "Open findings",
        value: summary ? String(summary.openFindings) : "--",
        description: "Across all controls",
        icon: Flag,
      },
    ],
    [summary],
  );
  const alerts = useMemo(() => buildCmpAlerts(summary), [summary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Framework</h1>
          <p className="text-muted-foreground">
            Map controls to risks and regulatory requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Button
            onClick={() => {
              setContext({ path: "/compliance-framework/cmp", cmpId: "cmp-workspace" });
              router.push("/compliance-framework/cmp");
            }}
          >
            <Target className="mr-2 h-4 w-4" />
            CMP Workspace
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <AlertTitle>Unable to load CMP summary</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length > 0 ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">CMP Alerts</CardTitle>
            <CardDescription>Prioritise remediation actions from monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border p-3 text-sm ${
                  alert.severity === "critical" ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"
                }`}
              >
                <p className="font-semibold text-slate-900">{alert.title}</p>
                <p className="text-xs text-slate-600">{alert.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Framework Overview</CardTitle>
          <CardDescription>
            Your compliance framework implementation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
            Leverage the CMP workspace to evidence testing, then map controls to policies and risks directly here.
            The detailed builder is arriving soon—meanwhile, manage controls via{" "}
            <Button variant="link" className="h-auto p-0 text-teal-600" onClick={() => router.push("/compliance-framework/cmp")}>
              CMP Monitoring
            </Button>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
