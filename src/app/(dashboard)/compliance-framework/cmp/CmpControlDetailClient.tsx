"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import type { CmpControlDetail } from "@/data/cmp/types";
import { LogTestDialog, RaiseFindingDialog } from "./components/CmpActionDialogs";
import { AlertTriangle, ArrowLeft, Building, CalendarDays, CheckCircle2, GitBranch, Link as LinkIcon, Target, TrendingUp } from "lucide-react";
import { LinkedPoliciesPanel } from "@/components/policies/LinkedPoliciesPanel";

const ORGANIZATION_ID = DEFAULT_ORGANIZATION_ID;

type ActionState = { type: "logTest" | "finding" | null; control: CmpControlDetail | null };
type ControlTab = "summary" | "plan" | "execution" | "findings" | "kri";
const CONTROL_TABS: ReadonlySet<ControlTab> = new Set(["summary", "plan", "execution", "findings", "kri"]);

interface CmpControlDetailClientProps {
  controlId: string;
}

export function CmpControlDetailClient({ controlId }: CmpControlDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [control, setControl] = useState<CmpControlDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({ type: null, control: null });
  const [tab, setTab] = useState("summary");

  const fetchControl = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${ORGANIZATION_ID}/cmp/controls/${controlId}`);
      if (!response.ok) throw new Error("Unable to load control");
      const data = (await response.json()) as CmpControlDetail;
      setControl(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }, [controlId]);

  useEffect(() => {
    void fetchControl();
  }, [fetchControl]);

  useEffect(() => {
    const requested = searchParams?.get("tab");
    if (!requested) return;
    if (!CONTROL_TABS.has(requested as ControlTab)) return;
    if (requested === tab) return;
    setTab(requested);
  }, [searchParams, tab]);

  const openAction = (type: ActionState["type"], detail: CmpControlDetail | null) => setActionState({ type, control: detail });
  const closeAction = () => setActionState({ type: null, control: null });

  const handleTabChange = (nextTab: string) => {
    setTab(nextTab);
    const nextParams = new URLSearchParams(searchParams?.toString());
    if (CONTROL_TABS.has(nextTab as ControlTab)) {
      nextParams.set("tab", nextTab);
    } else {
      nextParams.delete("tab");
    }
    const suffix = nextParams.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname);
  };

  const summaryStats = useMemo(() => {
    if (!control) return [];
    return [
      { label: "Pass rate", value: `${Math.round((control.passRate ?? 0) * 100)}%`, icon: CheckCircle2 },
      { label: "Automation coverage", value: `${Math.round((control.automationCoverage ?? 0) * 100)}%`, icon: TrendingUp },
      { label: "Tests executed", value: String(control.testsExecuted ?? 0), icon: CalendarDays },
      { label: "Open findings", value: String(control.issuesOpen ?? 0), icon: AlertTriangle },
    ];
  }, [control]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <div>
          <AlertTitle>Unable to load control</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </div>
      </Alert>
    );
  }

  if (!control) return null;

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="text-slate-600" onClick={() => router.push("/compliance-framework/cmp")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to CMP overview
      </Button>

      <div className="space-y-3 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-slate-100 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em]">
          <span>Control</span>
          <span className="text-slate-500">•</span>
          <span>{control.id}</span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{control.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{control.objective}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-100">
              <Badge variant="secondary" className="bg-white/15 text-white">{control.frequency.toUpperCase()}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">{control.dutyOutcome}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">{control.controlType}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => openAction("logTest", control)}>Log test</Button>
            <Button variant="ghost" className="text-white" onClick={() => openAction("finding", control)}>Raise finding</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-100">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="rounded-full bg-teal-50 p-3 text-teal-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Control summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <DetailRow icon={<Target className="h-4 w-4" />} label="Owner" value={control.owner} />
            <DetailRow icon={<Building className="h-4 w-4" />} label="Backup owner" value={control.backupOwner} />
            <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Next test" value={new Date(control.nextTestDue).toLocaleString()} />
            <DetailRow icon={<GitBranch className="h-4 w-4" />} label="Dependencies" value={control.dependencies.join(", ") || "None"} />
            <DetailRow icon={<LinkIcon className="h-4 w-4" />} label="Data sources" value={control.dataSources.join(", ") || "Not defined"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Linked risks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {control.linkedRisks.map((risk) => (
                <Badge key={risk.riskId} variant="outline" className="border-slate-200 text-xs">
                  {risk.riskId} · residual {risk.residualScore}
                </Badge>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-sm font-semibold text-slate-700">Regulatory references</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {control.regulatoryReferences.map((ref) => (
                <Badge key={ref} variant="secondary" className="bg-slate-100 text-slate-700">
                  {ref}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <LinkedPoliciesPanel
        title="Linked policies"
        helperText="Policies mapped to this control (for coverage and evidence reporting)."
        endpoint={`/api/organizations/${ORGANIZATION_ID}/cmp/controls/${controlId}/links`}
      />

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="plan">Test plan</TabsTrigger>
          <TabsTrigger value="execution">Execution log</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="kri">MI & KRIs</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardContent className="space-y-4 py-6">
              <SummaryInsight heading="Consumer Duty notes" body={control.consumerDutyNotes ?? "Focus testing on vulnerable customer comms."} />
              <SummaryInsight heading="Trend" body={`Performance is ${control.trend}.`} />
              <SummaryInsight heading="Notes" body={control.notes ?? "No additional commentary"} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Procedures & sampling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {control.testPlan.map((step) => (
                <div key={step.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Step {step.stepNumber}: {step.objective}
                    </p>
                    <Badge variant="outline">Sample {step.sampleSize}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{step.procedure}</p>
                  <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <span>Technique: <span className="font-semibold text-slate-900">{step.technique}</span></span>
                    <span>Automation: <span className="font-semibold text-slate-900">{step.automation ? "Yes" : "Manual"}</span></span>
                    <span>Data source: {step.dataSource}</span>
                    <span>Evidence: {step.evidenceLocation}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="execution">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Execution log</CardTitle>
              <Button variant="outline" onClick={() => openAction("logTest", control)}>New test</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {control.executions.map((execution) => (
                <div key={execution.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{execution.id}</p>
                      <p className="text-xs text-slate-500">{new Date(execution.testedAt).toLocaleString()} by {execution.tester}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize ${
                        execution.result === "pass"
                          ? "text-emerald-600 border-emerald-200"
                          : execution.result === "fail"
                            ? "text-rose-600 border-rose-200"
                            : "text-amber-600 border-amber-200"
                      }`}
                    >
                      {execution.result}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{execution.comments ?? "No commentary"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="findings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Findings & actions</CardTitle>
              <Button variant="outline" onClick={() => openAction("finding", control)}>Raise finding</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {control.findings.length === 0 ? (
                <p className="text-sm text-slate-500">No findings recorded for this control.</p>
              ) : (
                control.findings.map((finding) => (
                  <div key={finding.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-semibold text-slate-900">{finding.title}</p>
                      <Badge variant="outline" className="uppercase">{finding.severity}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{finding.description}</p>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      <span>Owner: <span className="font-medium text-slate-900">{finding.owner}</span></span>
                      <span>Due: {new Date(finding.dueDate).toLocaleDateString()}</span>
                      <span>Status: {finding.status}</span>
                      <span>Root cause: {finding.rootCause}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="kri">
          <Card>
            <CardHeader>
              <CardTitle>Metrics & indicators</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {control.kris.map((kri) => {
                const percent = kri.target ? Math.round((kri.actual / kri.target) * 100) : 0;
                const statusColor = kri.status === "green" ? "text-emerald-600" : kri.status === "amber" ? "text-amber-600" : "text-rose-600";
                return (
                  <div key={kri.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-900">{kri.name}</p>
                    <p className="text-xs text-slate-500">Target {kri.target} {kri.metric}</p>
                    <p className={`mt-2 text-2xl font-bold ${statusColor}`}>{kri.actual}</p>
                    <Progress className="mt-3 h-2" value={Math.min(percent, 120)} />
                    <p className="mt-2 text-xs text-slate-500">{kri.commentary ?? "No commentary"}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LogTestDialog
        open={actionState.type === "logTest"}
        control={control}
        organizationId={ORGANIZATION_ID}
        onClose={closeAction}
        onSuccess={fetchControl}
      />
      <RaiseFindingDialog
        open={actionState.type === "finding"}
        control={control}
        organizationId={ORGANIZATION_ID}
        onClose={closeAction}
        onSuccess={fetchControl}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function SummaryInsight({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{heading}</p>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
