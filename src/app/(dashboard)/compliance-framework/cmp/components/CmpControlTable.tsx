"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, ClipboardList, Flag, RefreshCcw } from "lucide-react";
import type { CmpControlDetail } from "@/data/cmp/types";

interface CmpControlTableProps {
  controls: CmpControlDetail[];
  isLoading?: boolean;
  onView: (control: CmpControlDetail) => void;
  onLogTest: (control: CmpControlDetail) => void;
  onRaiseFinding: (control: CmpControlDetail) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBC";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getNextTestState(value: string) {
  const target = new Date(value);
  const now = new Date();
  const diffDays = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (Number.isNaN(diffDays)) return { label: "TBC", intent: "neutral" as const };
  if (diffDays < 0) return { label: `${formatDate(value)} • overdue`, intent: "destructive" as const };
  if (diffDays <= 14) return { label: `${formatDate(value)} • due soon`, intent: "warning" as const };
  return { label: formatDate(value), intent: "neutral" as const };
}

function RagPill({ status }: { status: CmpControlDetail["ragStatus"] }) {
  const colors: Record<string, string> = {
    green: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    amber: "bg-amber-100 text-amber-800 border-amber-300",
    red: "bg-rose-100 text-rose-800 border-rose-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold", colors[status])}>
      <span className={cn("h-2 w-2 rounded-full", { "bg-emerald-500": status === "green", "bg-amber-500": status === "amber", "bg-rose-500": status === "red" })} />
      {status.toUpperCase()}
    </span>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="divide-y divide-slate-100">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto] gap-4 py-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-60" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CmpControlTable({ controls, isLoading, onView, onLogTest, onRaiseFinding }: CmpControlTableProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!controls.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-slate-500">
          No controls match the selected filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-slate-100">
        {controls.map((control) => {
          const nextTest = getNextTestState(control.nextTestDue);
          const passRatePercent = Math.round((control.passRate ?? 0) * 100);
          const linkedRisks = control.linkedRisks.slice(0, 3);
          return (
            <div key={control.id} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{control.id}</span>
                  <Badge variant="secondary">{control.frequency.toUpperCase()}</Badge>
                  <Badge>{control.criticality.toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-base font-medium text-slate-900">{control.title}</p>
                  <p className="text-sm text-slate-500">{control.objective}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>Duty outcome: <span className="font-medium text-slate-900">{control.dutyOutcome}</span></span>
                  <span className="hidden text-slate-400 md:block">•</span>
                  <span>Owner: <span className="font-medium text-slate-900">{control.owner}</span></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {linkedRisks.map((risk) => (
                    <Badge key={risk.riskId} variant="outline" className="border-slate-200 text-xs">
                      {risk.riskId} · residual {risk.residualScore}
                    </Badge>
                  ))}
                  {control.linkedRisks.length > linkedRisks.length ? (
                    <Badge variant="outline" className="border-dashed text-xs">+{control.linkedRisks.length - linkedRisks.length} more</Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Pass rate</span>
                  <span className="font-semibold text-slate-900">{passRatePercent}%</span>
                </div>
                <Progress value={passRatePercent} className="h-2" />
                <div className="space-y-1 text-sm">
                  <p className="text-slate-500">Next test</p>
                  <div className={cn("flex items-center gap-2 text-sm font-medium", {
                    "text-rose-600": nextTest.intent === "destructive",
                    "text-amber-600": nextTest.intent === "warning",
                    "text-slate-900": nextTest.intent === "neutral",
                  })}>
                    {nextTest.intent === "destructive" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : nextTest.intent === "warning" ? (
                      <RefreshCcw className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {nextTest.label}
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <p className="text-slate-500">Open findings</p>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Flag className="h-4 w-4" />
                    {control.issuesOpen} open
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <RagPill status={control.ragStatus} />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(control)}>
                    View
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onLogTest(control)}>
                    Log Test
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRaiseFinding(control)}>
                    Raise Issue
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
