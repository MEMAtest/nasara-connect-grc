"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Flag,
  Gauge,
  Link2,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { useCmpSummary } from "./cmp/hooks/useCmpSummary";
import { buildCmpAlerts } from "@/lib/cmp-alerts";
import { useAssistantContext } from "@/components/dashboard/useAssistantContext";
import { useCmpControls } from "./cmp/hooks/useCmpControls";
import { CmpMetricGrid } from "./cmp/components/CmpMetricGrid";
import { CmpControlTable } from "./cmp/components/CmpControlTable";
import { LogTestDialog, RaiseFindingDialog } from "./cmp/components/CmpActionDialogs";
import type { CmpControlDetail } from "@/data/cmp/types";
import type { StoredPolicy } from "@/lib/server/policy-store";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = { type: "logTest" | "finding" | null; control: CmpControlDetail | null };

function formatDate(value: string | null) {
  if (!value) return "n/a";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "n/a";
  }
}

export function ComplianceFrameworkClient() {
  const router = useRouter();
  const { setContext } = useAssistantContext();
  const { summary, isLoading: summaryLoading, error: summaryError, refresh } = useCmpSummary({
    organizationId: DEFAULT_ORGANIZATION_ID,
  });
  const {
    controls,
    isLoading: controlsLoading,
    error: controlsError,
    refresh: refreshControls,
  } = useCmpControls({ organizationId: DEFAULT_ORGANIZATION_ID });
  const { data: policies, error: policiesError, isLoading: policiesLoading } = useSWR<StoredPolicy[]>(
    "/api/policies",
    fetcher
  );
  const { data: mappingData } = useSWR<{ counts: Record<string, Record<string, number>> }>(
    "/api/policies/mapping",
    fetcher
  );
  const [actionState, setActionState] = useState<ActionState>({ type: null, control: null });

  const alerts = useMemo(() => buildCmpAlerts(summary), [summary]);
  const counts = mappingData?.counts ?? {};

  const coverage = useMemo(() => {
    return (policies ?? []).map((policy) => {
      const governance = (policy.customContent as { governance?: Record<string, unknown> } | null)?.governance ?? null;
      const effectiveDate = governance && typeof governance.effectiveDate === "string" ? governance.effectiveDate : null;
      const nextReviewAt = governance && typeof governance.nextReviewAt === "string" ? governance.nextReviewAt : null;
      const owner = governance && typeof governance.owner === "string" ? governance.owner : null;
      const policyCounts = counts[policy.id] ?? {};
      return {
        policy,
        governance: { effectiveDate, nextReviewAt, owner },
        counts: {
          control: policyCounts.control ?? 0,
          risk: policyCounts.risk ?? 0,
          training: policyCounts.training ?? 0,
          evidence: policyCounts.evidence ?? 0,
        },
      };
    });
  }, [policies, counts]);

  const missingMapping = useMemo(
    () => coverage.filter((row) => row.counts.control === 0 || row.counts.risk === 0),
    [coverage]
  );
  const coverageRate = useMemo(() => {
    if (!coverage.length) return 0;
    return Math.round(((coverage.length - missingMapping.length) / coverage.length) * 100);
  }, [coverage, missingMapping.length]);

  const governanceGaps = useMemo(() => {
    const missingOwner = coverage.filter((row) => !row.governance.owner).length;
    const missingEffectiveDate = coverage.filter((row) => !row.governance.effectiveDate).length;
    const missingReview = coverage.filter((row) => !row.governance.nextReviewAt).length;
    return { missingOwner, missingEffectiveDate, missingReview };
  }, [coverage]);

  const mappingCoverage = useMemo(() => {
    const total = coverage.length || 0;
    const countBy = (key: keyof (typeof coverage)[number]["counts"]) =>
      coverage.filter((row) => row.counts[key] > 0).length;
    return {
      total,
      control: countBy("control"),
      risk: countBy("risk"),
      training: countBy("training"),
      evidence: countBy("evidence"),
    };
  }, [coverage]);

  const mappingPriority = useMemo(() => {
    const rows = coverage
      .map((row) => {
        const gapCount = [
          !row.governance.owner,
          !row.governance.effectiveDate,
          !row.governance.nextReviewAt,
          row.counts.control === 0,
          row.counts.risk === 0,
          row.counts.training === 0,
          row.counts.evidence === 0,
        ].filter(Boolean).length;
        return { ...row, gapCount };
      })
      .filter((row) => row.gapCount > 0)
      .sort((a, b) => b.gapCount - a.gapCount);
    return rows.slice(0, 3);
  }, [coverage]);

  const prioritizedControls = useMemo(() => {
    if (!controls.length) return [];
    const now = Date.now();
    const score = (control: CmpControlDetail) => {
      const due = new Date(control.nextTestDue).getTime();
      if (Number.isNaN(due)) return 3_000;
      const days = Math.floor((due - now) / (1000 * 60 * 60 * 24));
      if (days < 0) return 0;
      if (days <= 14) return 1;
      return 2;
    };
    return [...controls]
      .sort((a, b) => {
        const scoreDiff = score(a) - score(b);
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(a.nextTestDue).getTime() - new Date(b.nextTestDue).getTime();
      })
      .slice(0, 4);
  }, [controls]);

  const cadence = useMemo(() => {
    const buckets = { overdue: 0, dueSoon: 0, dueNext: 0, dueLater: 0, unscheduled: 0 };
    const frequency = { monthly: 0, quarterly: 0, "semi-annually": 0, annually: 0 };
    if (!controls.length) {
      return { buckets, frequency, nextUp: [] as CmpControlDetail[], planned: 0, executed: 0, executionRate: 0 };
    }
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const upcoming: { control: CmpControlDetail; due: number }[] = [];
    let planned = 0;
    let executed = 0;
    controls.forEach((control) => {
      frequency[control.frequency] += 1;
      planned += control.testsPlanned ?? 0;
      executed += control.testsExecuted ?? 0;
      const due = new Date(control.nextTestDue).getTime();
      if (Number.isNaN(due)) {
        buckets.unscheduled += 1;
        return;
      }
      const days = Math.floor((due - dayStart) / (1000 * 60 * 60 * 24));
      if (days < 0) {
        buckets.overdue += 1;
      } else if (days <= 14) {
        buckets.dueSoon += 1;
        upcoming.push({ control, due });
      } else if (days <= 30) {
        buckets.dueNext += 1;
        upcoming.push({ control, due });
      } else {
        buckets.dueLater += 1;
      }
    });
    upcoming.sort((a, b) => a.due - b.due);
    const executionRate = planned ? Math.round((executed / planned) * 100) : 0;
    return {
      buckets,
      frequency,
      nextUp: upcoming.slice(0, 3).map((item) => item.control),
      planned,
      executed,
      executionRate,
    };
  }, [controls]);

  const reportingStats = useMemo(() => {
    const rag = { green: 0, amber: 0, red: 0 };
    const kri = { green: 0, amber: 0, red: 0 };
    const issues: CmpControlDetail[] = [];
    if (!controls.length) {
      return { rag, kri, issues };
    }
    controls.forEach((control) => {
      rag[control.ragStatus] += 1;
      control.kris?.forEach((kriItem) => {
        kri[kriItem.status] += 1;
      });
      if (control.issuesOpen > 0 || control.ragStatus !== "green") {
        issues.push(control);
      }
    });
    const ragScore = (status: CmpControlDetail["ragStatus"]) => (status === "red" ? 2 : status === "amber" ? 1 : 0);
    issues.sort((a, b) => {
      if (b.issuesOpen !== a.issuesOpen) return b.issuesOpen - a.issuesOpen;
      return ragScore(b.ragStatus) - ragScore(a.ragStatus);
    });
    return { rag, kri, issues: issues.slice(0, 3) };
  }, [controls]);

  const cmpMetrics = useMemo(
    () => [
      {
        title: "Controls in scope",
        value: summary ? String(summary.totalControls) : "--",
        description: "Mapped to framework components",
        icon: ClipboardList,
        accent: "teal" as const,
      },
      {
        title: "Avg pass rate",
        value: summary ? `${Math.round(summary.avgPassRate * 100)}%` : "--",
        description: "Latest CMP cycle",
        icon: Gauge,
        accent: "sky" as const,
      },
      {
        title: "Tests due (14d)",
        value: summary ? String(summary.dueSoon) : "--",
        description: "Upcoming monitoring events",
        icon: RefreshCcw,
        accent: "amber" as const,
      },
      {
        title: "Open findings",
        value: summary ? String(summary.openFindings) : "--",
        description: "Across all controls",
        icon: Flag,
        accent: "rose" as const,
      },
    ],
    [summary]
  );

  const openAction = (type: ActionState["type"], control: CmpControlDetail) => setActionState({ type, control });
  const closeAction = () => setActionState({ type: null, control: null });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm md:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-12 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 ring-1 ring-emerald-100">
                <Sparkles className="h-3 w-3" />
                Framework Builder
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                Build the compliance framework that drives monitoring.
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Align policies, risks, controls, and evidence in one place. When the framework is tight, the CMP monitoring
                workflow runs like clockwork.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setContext({ path: "/compliance-framework/monitoring", cmpId: "cmp-workspace" });
                  router.push("/compliance-framework/monitoring");
                }}
              >
                <Target className="mr-2 h-4 w-4" />
                Open CMP Monitoring
              </Button>
              <Button variant="outline" onClick={() => router.push("/policies/mapping")}>
                <Link2 className="mr-2 h-4 w-4" />
                Policy Mapping
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-100 bg-white/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Framework coverage</CardTitle>
              </CardHeader>
              <CardContent>
                {policiesLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-semibold text-slate-900">{coverageRate}%</div>
                )}
                <p className="text-sm text-slate-500">Policies mapped to controls & risks</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 bg-white/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Policies in scope</CardTitle>
              </CardHeader>
              <CardContent>
                {policiesLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-semibold text-slate-900">{coverage.length || 0}</div>
                )}
                <p className="text-sm text-slate-500">Total governance artifacts tracked</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 bg-white/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">CMP readiness</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-semibold text-slate-900">
                    {summary ? Math.round(summary.avgPassRate * 100) : 0}%
                  </div>
                )}
                <p className="text-sm text-slate-500">Average control pass rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {summaryError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <AlertTitle>Unable to load CMP summary</AlertTitle>
            <AlertDescription>{summaryError}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Framework build path</h2>
            <p className="text-sm text-slate-500">
              Work from scope → mapping → monitoring so the CMP execution is always traceable.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refresh()}>
              Refresh framework
            </Button>
            <Button variant="ghost" onClick={() => refreshControls()}>
              Refresh monitoring
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">1. Define scope</CardTitle>
              <CardDescription>Policies, obligations, and ownership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Policies</span>
                <span className="font-semibold text-slate-900">{coverage.length || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Missing owner</span>
                <span className="font-semibold text-slate-900">
                  {coverage.filter((row) => !row.governance.owner).length}
                </span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/policies/register")}>
                Go to policy register
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">2. Tighten mapping</CardTitle>
              <CardDescription>Link controls, risks, training, evidence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Coverage rate</span>
                <span className="font-semibold text-slate-900">{coverageRate}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Missing mapping</span>
                <span className="font-semibold text-slate-900">{missingMapping.length}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/policies/mapping")}>
                Review policy coverage
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">3. Run monitoring</CardTitle>
              <CardDescription>Execute CMP tests, capture evidence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Tests due (14d)</span>
                <span className="font-semibold text-slate-900">{summary?.dueSoon ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Open findings</span>
                <span className="font-semibold text-slate-900">{summary?.openFindings ?? 0}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setContext({ path: "/compliance-framework/monitoring", cmpId: "cmp-workspace" });
                  router.push("/compliance-framework/monitoring");
                }}
              >
                Launch CMP workflow
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Framework essentials</h2>
          <p className="text-sm text-slate-500">
            Three layers that keep the compliance framework accurate, monitored, and board-ready.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Mapping completeness</CardTitle>
              <CardDescription>Governance metadata + mapping depth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Missing owners</span>
                  <span className="font-semibold text-slate-900">{governanceGaps.missingOwner}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Missing effective date</span>
                  <span className="font-semibold text-slate-900">{governanceGaps.missingEffectiveDate}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Missing next review</span>
                  <span className="font-semibold text-slate-900">{governanceGaps.missingReview}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-xs text-slate-500">Mapping depth</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                  <Badge variant="outline">Controls {mappingCoverage.control}/{mappingCoverage.total}</Badge>
                  <Badge variant="outline">Risks {mappingCoverage.risk}/{mappingCoverage.total}</Badge>
                  <Badge variant="outline">Training {mappingCoverage.training}/{mappingCoverage.total}</Badge>
                  <Badge variant="outline">Evidence {mappingCoverage.evidence}/{mappingCoverage.total}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Top gaps</p>
                {mappingPriority.length ? (
                  mappingPriority.map((row) => (
                    <div key={row.policy.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{row.policy.name}</span>
                      <Badge variant="secondary">{row.gapCount} gaps</Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    Mapping is complete across the framework.
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/policies/mapping")}>
                Tighten mapping
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Monitoring cadence</CardTitle>
              <CardDescription>Keep tests on schedule and balanced.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Overdue</span>
                  <span className="font-semibold text-slate-900">{cadence.buckets.overdue}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Due in 14d</span>
                  <span className="font-semibold text-slate-900">{cadence.buckets.dueSoon}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Due in 30d</span>
                  <span className="font-semibold text-slate-900">{cadence.buckets.dueNext}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Unscheduled</span>
                  <span className="font-semibold text-slate-900">{cadence.buckets.unscheduled}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-xs text-slate-500">Frequency mix</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                  <Badge variant="outline">Monthly {cadence.frequency.monthly}</Badge>
                  <Badge variant="outline">Quarterly {cadence.frequency.quarterly}</Badge>
                  <Badge variant="outline">Semi-annually {cadence.frequency["semi-annually"]}</Badge>
                  <Badge variant="outline">Annually {cadence.frequency.annually}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                <span className="text-slate-500">Execution rate</span>
                <span className="font-semibold text-slate-900">{cadence.executionRate}%</span>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setContext({ path: "/compliance-framework/monitoring", cmpId: "cmp-workspace" });
                  router.push("/compliance-framework/monitoring");
                }}
              >
                Review monitoring cadence
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Reporting layer</CardTitle>
              <CardDescription>Board-ready view of control health.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Avg pass rate</span>
                  <span className="font-semibold text-slate-900">
                    {summary ? Math.round(summary.avgPassRate * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Overdue tests</span>
                  <span className="font-semibold text-slate-900">{summary?.overdue ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <span className="text-slate-500">Open findings</span>
                  <span className="font-semibold text-slate-900">{summary?.openFindings ?? 0}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-xs text-slate-500">RAG distribution</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                  <Badge variant="outline">Green {reportingStats.rag.green}</Badge>
                  <Badge variant="outline">Amber {reportingStats.rag.amber}</Badge>
                  <Badge variant="outline">Red {reportingStats.rag.red}</Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-xs text-slate-500">KRI status</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                  <Badge variant="outline">Green {reportingStats.kri.green}</Badge>
                  <Badge variant="outline">Amber {reportingStats.kri.amber}</Badge>
                  <Badge variant="outline">Red {reportingStats.kri.red}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Top issues</p>
                {reportingStats.issues.length ? (
                  reportingStats.issues.map((control) => (
                    <div key={control.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{control.title}</span>
                      <Badge variant={control.ragStatus === "red" ? "destructive" : "secondary"}>
                        {control.issuesOpen} open
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    No control issues flagged.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>Coverage focus</CardTitle>
            <CardDescription>Policies that still need control or risk mapping.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {policiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : policiesError ? (
              <p className="text-sm text-rose-600">Failed to load policies.</p>
            ) : missingMapping.length === 0 ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  All policies have controls and risks mapped.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {missingMapping.slice(0, 4).map((row) => (
                  <div key={row.policy.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{row.policy.name}</p>
                        <p className="text-xs text-slate-500">{row.policy.code} · {row.policy.template.category}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/policies/${row.policy.id}`)}>
                        Open
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      <Badge variant={row.counts.control ? "outline" : "secondary"} className="text-[11px]">
                        Controls {row.counts.control}
                      </Badge>
                      <Badge variant={row.counts.risk ? "outline" : "secondary"} className="text-[11px]">
                        Risks {row.counts.risk}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        Training {row.counts.training}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        Evidence {row.counts.evidence}
                      </Badge>
                      <span className="ml-auto text-xs text-slate-400">
                        Next review {formatDate(row.governance.nextReviewAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => router.push("/policies/mapping")}>
                View full mapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>CMP alerts</CardTitle>
            <CardDescription>Escalations that need attention before the next cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-3 text-sm ${
                    alert.severity === "critical" ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-xs text-slate-600">{alert.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
                No current CMP alerts. Keep monitoring cadence on track.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Monitoring workflows</h2>
            <p className="text-sm text-slate-500">
              Prioritised CMP controls that are due or overdue. Log tests and findings directly here.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setContext({ path: "/compliance-framework/monitoring", cmpId: "cmp-workspace" });
              router.push("/compliance-framework/monitoring");
            }}
          >
            View full CMP workspace
          </Button>
        </div>

        <CmpMetricGrid metrics={cmpMetrics} />

        {controlsError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <AlertTitle>Unable to load controls</AlertTitle>
              <AlertDescription>{controlsError}</AlertDescription>
            </div>
          </Alert>
        ) : (
          <CmpControlTable
            controls={prioritizedControls}
            isLoading={controlsLoading}
            onView={(control) => router.push(`/compliance-framework/monitoring/${control.id}`)}
            onLogTest={(control) => openAction("logTest", control)}
            onRaiseFinding={(control) => openAction("finding", control)}
          />
        )}
      </section>

      <LogTestDialog
        open={actionState.type === "logTest"}
        control={actionState.control}
        onClose={closeAction}
        organizationId={DEFAULT_ORGANIZATION_ID}
        onSuccess={refreshControls}
      />
      <RaiseFindingDialog
        open={actionState.type === "finding"}
        control={actionState.control}
        onClose={closeAction}
        organizationId={DEFAULT_ORGANIZATION_ID}
        onSuccess={refreshControls}
      />
    </div>
  );
}
