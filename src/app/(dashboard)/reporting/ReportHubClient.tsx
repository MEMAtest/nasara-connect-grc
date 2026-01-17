"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Activity,
  CalendarClock,
  FileBarChart2,
  FileText,
  LayoutGrid,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { reportModules, recentReportPacks } from "@/lib/reporting/reporting-data";
import type {
  ReportAudience,
  ReportModuleStatus,
  ReportPackSummary,
  ReportPeriod,
  ReportTemplate,
} from "@/lib/reporting/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const templates = [
  {
    id: "board" as const,
    label: "Board Pack",
    description: "Executive summary, outcomes, and oversight signals.",
  },
  {
    id: "regulator" as const,
    label: "Regulator Pack",
    description: "Evidence-led detail, controls, and audit trail.",
  },
  {
    id: "ops" as const,
    label: "Ops Pack",
    description: "Actionable tasks, owners, and remediation focus.",
  },
];

const audiences = [
  { id: "board" as const, label: "Board / Senior leaders" },
  { id: "regulator" as const, label: "Regulator / External" },
  { id: "ops" as const, label: "Operations teams" },
];

const periods = [
  { id: "monthly" as const, label: "Last 30 days" },
  { id: "quarterly" as const, label: "Last quarter" },
  { id: "ytd" as const, label: "Year to date" },
  { id: "custom" as const, label: "Custom range" },
];

export function ReportHubClient() {
  const [template, setTemplate] = useState<ReportTemplate>("board");
  const [audience, setAudience] = useState<ReportAudience>("board");
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [outputs, setOutputs] = useState({ pdf: true, docx: true });
  const [cadence, setCadence] = useState({ monthly: true, quarterly: true });
  const [moduleSelection, setModuleSelection] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(reportModules.map((mod) => [mod.id, true]))
  );

  const selectedCount = useMemo(
    () => Object.values(moduleSelection).filter(Boolean).length,
    [moduleSelection]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("template", template);
    params.set("audience", audience);
    params.set("period", period);
    const selectedModules = Object.entries(moduleSelection)
      .filter(([, value]) => value)
      .map(([id]) => id);
    params.set("modules", selectedModules.join(","));
    if (period === "custom") {
      if (customRange.start) params.set("start", customRange.start);
      if (customRange.end) params.set("end", customRange.end);
    }
    return params.toString();
  }, [audience, customRange.end, customRange.start, moduleSelection, period, template]);

  const summaryUrl = `/api/reporting/summary?${queryString}`;
  const { data: summary } = useSWR<ReportPackSummary>(summaryUrl, fetcher);

  const readiness = useMemo(() => {
    if (summary?.readiness !== undefined) return summary.readiness;
    const selected = reportModules.filter((mod) => moduleSelection[mod.id]);
    if (!selected.length) return 0;
    const avg = selected.reduce((sum, mod) => sum + mod.coverage, 0) / selected.length;
    return Math.round(avg);
  }, [moduleSelection, summary?.readiness]);

  const previewModules = summary?.modules ?? reportModules;
  const canGenerate = selectedCount > 0 && (outputs.pdf || outputs.docx);

  const buildExportUrl = (format: "pdf" | "docx") =>
    `/api/reporting/pack?${queryString}&format=${format}`;

  const handleGeneratePack = () => {
    if (!canGenerate) return;
    if (outputs.pdf) {
      window.open(buildExportUrl("pdf"), "_blank");
    }
    if (outputs.docx) {
      window.open(buildExportUrl("docx"), "_blank");
    }
  };

  const toggleModule = (id: string, enabled: boolean) => {
    setModuleSelection((prev) => ({ ...prev, [id]: enabled }));
  };

  const statusStyles: Record<ReportModuleStatus, string> = {
    ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    partial: "border-amber-200 bg-amber-50 text-amber-700",
    blocked: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 shadow-sm md:p-10">
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-3 w-3" />
              Reporting Pack
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Board-ready reporting, unified across every module.
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Build global packs that pull authorizations, registers, training, CMP, SMCR, and risk insights into a
              single, sleek document.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGeneratePack} disabled={!canGenerate}>
              <FileBarChart2 className="mr-2 h-4 w-4" />
              Generate pack
            </Button>
            <Button variant="outline">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Preview outline
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>Report configuration</CardTitle>
            <CardDescription>Global filters and pack defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template</p>
                <Select value={template} onValueChange={(value) => setTemplate(value as ReportTemplate)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {templates.find((item) => item.id === template)?.description}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audience</p>
                <Select value={audience} onValueChange={(value) => setAudience(value as ReportAudience)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Period</p>
                <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {period === "custom" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start date</p>
                  <Input
                    type="date"
                    value={customRange.start}
                    onChange={(event) => setCustomRange((prev) => ({ ...prev, start: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">End date</p>
                  <Input
                    type="date"
                    value={customRange.end}
                    onChange={(event) => setCustomRange((prev) => ({ ...prev, end: event.target.value }))}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Included modules</p>
                  <p className="text-xs text-slate-500">{selectedCount} modules in this pack.</p>
                </div>
                <Badge variant="outline" className="text-xs text-slate-600">
                  Global pack
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {reportModules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{module.label}</p>
                      <p className="text-xs text-slate-500">{module.highlight}</p>
                    </div>
                    <Switch
                      checked={moduleSelection[module.id]}
                      onCheckedChange={(checked) => toggleModule(module.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>Output and delivery</CardTitle>
            <CardDescription>Export and scheduling options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-slate-600">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formats</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <FileText className="h-4 w-4 text-slate-400" />
                    PDF report
                  </div>
                  <Switch
                    checked={outputs.pdf}
                    onCheckedChange={(checked) => setOutputs((prev) => ({ ...prev, pdf: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <FileText className="h-4 w-4 text-slate-400" />
                    DOCX report
                  </div>
                  <Switch
                    checked={outputs.docx}
                    onCheckedChange={(checked) => setOutputs((prev) => ({ ...prev, docx: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cadence</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    Monthly pack
                  </div>
                  <Switch
                    checked={cadence.monthly}
                    onCheckedChange={(checked) => setCadence((prev) => ({ ...prev, monthly: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    Quarterly pack
                  </div>
                  <Switch
                    checked={cadence.quarterly}
                    onCheckedChange={(checked) => setCadence((prev) => ({ ...prev, quarterly: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Report readiness
              </div>
              <p className="mt-1 text-xs text-slate-500">Average data readiness for selected modules.</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Readiness</span>
                  <span className="font-semibold text-slate-800">{readiness}%</span>
                </div>
                <Progress value={readiness} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Module coverage</h2>
            <p className="text-sm text-slate-500">Preview how each module will appear in the pack.</p>
          </div>
          <Button variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh data
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {previewModules.map((module) => {
            const statusLabel =
              module.status === "ready" ? "Ready" : module.status === "blocked" ? "Blocked" : "Needs review";
            return (
            <Card key={module.id} className="border-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{module.label}</span>
                  <Badge variant="outline" className={statusStyles[module.status]}>
                    {statusLabel}
                  </Badge>
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Coverage</span>
                  <span className="font-semibold text-slate-800">{module.coverage}%</span>
                </div>
                <Progress value={module.coverage} />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity className="h-3.5 w-3.5 text-slate-400" />
                  {module.highlight}
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>Pack outline</CardTitle>
            <CardDescription>Section flow aligned to the selected template.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
              {[
                "Executive summary and top outcomes",
                "KPI snapshot and RAG distribution",
                "Module highlights and trend notes",
                "Open actions and remediation timeline",
                "Appendix: evidence and supporting data",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                    {item.split(" ")[0].charAt(0)}
                  </span>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Narrative focus</p>
              <Textarea
                rows={4}
                placeholder="Add an executive summary note or highlight what leadership should focus on."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>Recent packs</CardTitle>
            <CardDescription>Latest generated reports across the org.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {recentReportPacks.map((pack) => (
              <div key={pack.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{pack.title}</p>
                  <p className="text-xs text-slate-500">{pack.date}</p>
                </div>
                <Badge variant="outline" className="text-xs text-slate-600">
                  {pack.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View report history
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
