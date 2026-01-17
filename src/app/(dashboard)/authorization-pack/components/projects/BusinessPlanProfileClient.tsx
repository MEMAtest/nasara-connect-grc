"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HelpCircle, Sparkles } from "lucide-react";
import {
  buildProfileInsights,
  getPackSectionLabel,
  getProfileQuestions,
  getProfileSections,
  isProfilePermissionCode,
  type ProfileQuestion,
  type ProfileResponse,
} from "@/lib/business-plan-profile";

interface BusinessPlanProfileClientProps {
  projectId: string;
  permissionCode?: string | null;
  permissionName?: string | null;
  onNextPhase?: () => void;
}

const CHART_COLORS = ["#0f766e", "#2563eb", "#f97316", "#7c3aed", "#e11d48", "#16a34a"];

const verdictStyles: Record<string, string> = {
  "in-scope": "bg-emerald-100 text-emerald-700",
  "possible-exemption": "bg-amber-100 text-amber-700",
  "out-of-scope": "bg-slate-100 text-slate-600",
  unknown: "bg-slate-100 text-slate-600",
};

const SECTION_TAB_LABELS: Record<string, string> = {
  scope: "Scope",
  model: "Business Model",
  operations: "Operations",
  governance: "Governance",
  financials: "Financials",
  payments: "Payments",
  "consumer-credit": "Consumer Credit",
  investments: "Investments",
};

function HelpTooltip({ label, description }: { label: string; description: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
          aria-label={`${label} help`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
        <p className="font-semibold">{label}</p>
        <p className="mt-1">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function BusinessPlanProfileClient({
  projectId,
  permissionCode,
  permissionName,
  onNextPhase,
}: BusinessPlanProfileClientProps) {
  const permission = isProfilePermissionCode(permissionCode) ? permissionCode : null;
  const sections = useMemo(() => getProfileSections(permission), [permission]);
  const questions = useMemo(() => getProfileQuestions(permission), [permission]);

  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const [responses, setResponses] = useState<Record<string, ProfileResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const insights = useMemo(() => buildProfileInsights(permission, responses), [permission, responses]);

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.find((section) => section.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`);
        if (!response.ok) {
          setLoadError("Unable to load business plan profile.");
          return;
        }
        const data = await response.json();
        const nextResponses = data?.profile?.responses ?? {};
        setResponses(nextResponses);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load business plan profile.");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProfile();
    }
  }, [projectId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSaveMessage(errorData.error || "Failed to save profile.");
        return;
      }

      setSaveMessage("Profile saved.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2500);
    }
  };

  const updateResponse = (questionId: string, value: ProfileResponse) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildQuestionMeta = (question: ProfileQuestion) => {
    const regulatoryRefs = question.regulatoryRefs ?? [];
    const packLabels = (question.packSectionKeys ?? []).map(getPackSectionLabel);
    const parts: string[] = [];
    if (regulatoryRefs.length) {
      parts.push(`Regulatory source: ${regulatoryRefs.join(", ")}`);
    }
    if (packLabels.length) {
      parts.push(`Feeds into: ${packLabels.join(", ")}`);
    }
    return {
      text: parts.join(" - "),
      regulatoryRefs,
      packLabels,
    };
  };

  const isResponseComplete = (response: ProfileResponse | undefined) => {
    if (response === undefined || response === null) return false;
    if (Array.isArray(response)) return response.length > 0;
    if (typeof response === "string") return response.trim().length > 0;
    return true;
  };

  const sectionProgress = useMemo(
    () =>
      sections.map((section) => {
        const sectionQuestions = questions.filter((question) => question.sectionId === section.id);
        const answered = sectionQuestions.filter((question) => isResponseComplete(responses[question.id])).length;
        const total = sectionQuestions.length;
        return {
          id: section.id,
          title: section.title,
          answered,
          total,
          remaining: Math.max(total - answered, 0),
        };
      }),
    [sections, questions, responses]
  );

  const incompleteSections = sectionProgress.filter((section) => section.remaining > 0);
  const remainingRequired = questions.filter((question) => question.required).filter(
    (question) => !isResponseComplete(responses[question.id])
  ).length;
  const aiReady = remainingRequired === 0;

  const toggleMultiChoice = (questionId: string, optionValue: string) => {
    setResponses((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const next = current.includes(optionValue)
        ? current.filter((value) => value !== optionValue)
        : [...current, optionValue];
      return { ...prev, [questionId]: next };
    });
  };

  const renderQuestionInput = (question: ProfileQuestion) => {
    const value = responses[question.id];

    if (question.type === "single-choice" && question.options) {
      return (
        <Select value={typeof value === "string" ? value : ""} onValueChange={(val) => updateResponse(question.id, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (question.type === "multi-choice" && question.options) {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => (
            <label key={option.value} className="flex items-start gap-2 text-sm text-slate-700">
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={() => toggleMultiChoice(question.id, option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (question.type === "number") {
      return (
        <Input
          type="number"
          value={typeof value === "number" ? value : value ? String(value) : ""}
          onChange={(event) => updateResponse(question.id, event.target.value)}
          placeholder={question.placeholder ?? "Enter value"}
        />
      );
    }

    return (
      <Textarea
        value={typeof value === "string" ? value : value ? String(value) : ""}
        onChange={(event) => updateResponse(question.id, event.target.value)}
        placeholder={question.placeholder ?? "Type your response"}
        rows={3}
      />
    );
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">Loading business plan profile...</CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Business plan profile unavailable</CardTitle>
          <CardDescription>{loadError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sectionChartData = insights.sectionScores.map((section) => ({
    name: section.label,
    percent: section.percent,
  }));

  const focusCoverage = [...insights.packSectionScores]
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 8)
    .map((item) => ({ name: item.label, percent: item.percent }));

  const regulatoryChartData = insights.regulatorySignals.slice(0, 6);

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Business Plan Profile</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                    aria-label="Business plan profile help"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                  Answer in plain language. The AI will draft FCA-ready narrative, map to gold-standard sections,
                  and generate a 5-7 page perimeter opinion pack in Phase 2.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Permission scope: {permissionName || permissionCode || "Not set"}.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-teal-200 text-teal-600">
              {insights.completionPercent}% complete
            </Badge>
            <Badge variant="outline" className={aiReady ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-500"}>
              {aiReady ? "Opinion pack ready" : "Opinion pack locked"}
            </Badge>
            {onNextPhase ? (
              <Button variant="outline" className="border-slate-200 text-slate-600" onClick={onNextPhase}>
                Go to Opinion Pack
              </Button>
            ) : null}
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Profile completion</span>
              <span>{insights.completionPercent}%</span>
            </div>
            <Progress value={insights.completionPercent} className="h-2" />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">What happens next</p>
            <p className="mt-2">
              Complete the scope and operations questions, then save. The AI will translate responses into FCA-ready
              narrative and generate a 5-7 page perimeter opinion pack (not a full business plan). {remainingRequired > 0
                ? `${remainingRequired} required responses remain before the AI draft is unlocked.`
                : "All required responses are complete."} Use the next phase button to generate the opinion pack.
            </p>
          </div>
          {saveMessage && (
            <p className="text-sm text-slate-500">{saveMessage}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Activity Highlights</span>
              <HelpTooltip
                label="Activity Highlights"
                description="Signals pulled from your scope responses to spotlight regulated activity themes."
              />
            </CardTitle>
            <CardDescription>Key regulated activities in scope.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.activityHighlights.length ? (
              <div className="flex flex-wrap gap-2">
                {insights.activityHighlights.map((item) => (
                  <Badge key={item} variant="outline" className="border-slate-200 text-slate-600">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Add activities to see highlights.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Regulatory Drivers</span>
              <HelpTooltip
                label="Regulatory Drivers"
                description="Counts of PERG/PSD2/CONC/COBS references behind your answers."
              />
            </CardTitle>
            <CardDescription>Top referenced perimeter sources.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {regulatoryChartData.length ? (
              <ul className="space-y-2 text-sm text-slate-600">
                {regulatoryChartData.map((item) => (
                  <li key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-400">{item.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Answer scope questions to populate.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Focus Areas</span>
              <HelpTooltip
                label="Focus Areas"
                description="Lowest-scoring sections based on what has been answered so far."
              />
            </CardTitle>
            <CardDescription>Lowest coverage sections to address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.focusAreas.length ? (
              <ul className="space-y-2 text-sm text-slate-600">
                {insights.focusAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Complete the profile to highlight focus areas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Section Readiness</span>
              <HelpTooltip
                label="Section Readiness"
                description="Completion score by profile section based on weighted answers."
              />
            </CardTitle>
            <CardDescription>Progress against profile sections.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionChartData} layout="vertical" margin={{ left: 16, right: 16 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="percent" fill="#0f766e" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Regulatory Coverage</span>
              <HelpTooltip
                label="Regulatory Coverage"
                description="Mix of referenced sources inferred from your responses."
              />
            </CardTitle>
            <CardDescription>Signals by referenced sources.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regulatoryChartData.length ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={regulatoryChartData} dataKey="count" nameKey="label" innerRadius={44} outerRadius={84}>
                        {regulatoryChartData.map((entry, index) => (
                          <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  {regulatoryChartData.map((entry, index) => (
                    <div key={entry.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span>{entry.label}</span>
                      </div>
                      <span className="text-slate-400">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
                No regulatory signals yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>Gold Standard Coverage</span>
            <HelpTooltip
              label="Gold Standard Coverage"
              description="Coverage gaps against the gold-standard narrative spine."
            />
          </CardTitle>
          <CardDescription>Lowest coverage sections from the gold-standard narrative.</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          {focusCoverage.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusCoverage} layout="vertical" margin={{ left: 16, right: 16 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="percent" fill="#2563eb" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Add profile responses to score coverage.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>Perimeter Opinion</span>
            <HelpTooltip
              label="Perimeter Opinion"
              description="Indicative FCA perimeter view generated from scope responses."
            />
          </CardTitle>
          <CardDescription>Indicative view based on the profile responses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge className={verdictStyles[insights.perimeterOpinion.verdict]}>
            {insights.perimeterOpinion.verdict.replace("-", " ")}
          </Badge>
          <p className="text-sm text-slate-700">{insights.perimeterOpinion.summary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rationale</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {insights.perimeterOpinion.rationale.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Key Obligations</p>
              {insights.perimeterOpinion.obligations.length ? (
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {insights.perimeterOpinion.obligations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Complete scope questions to generate obligations.</p>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            This is an indicative perimeter view only and does not constitute legal advice.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>Profile Questions</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                  aria-label="Profile questions help"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                These answers feed the perimeter opinion, readiness scores, and the gold-standard narrative.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Each question maps to PERG/PSD2/CONC/COBS and drives the perimeter opinion pack.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <HelpCircle className="mt-0.5 h-4 w-4 text-slate-400" />
            <p>
              Why we ask: each response updates the charts, perimeter opinion, and draft FCA narrative. Respond in
              plain language and the AI will translate it into regulatory terms for the opinion pack.
            </p>
          </div>
          {incompleteSections.length ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sections still to complete</p>
                <Badge variant="outline" className="border-slate-200 text-slate-500">
                  {incompleteSections.length} sections
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {incompleteSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  >
                    {SECTION_TAB_LABELS[section.id] ?? section.title}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                      {section.remaining} left
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              All sections complete. Use the next phase button to generate the opinion pack.
            </div>
          )}
          <Tabs value={activeSectionId} onValueChange={setActiveSectionId}>
            <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-lg border border-slate-200 bg-slate-100/70 p-2">
              {sections.map((section) => (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={section.id}
                      className="flex-none whitespace-nowrap px-3 py-1 text-xs sm:text-sm"
                    >
                      <span>{SECTION_TAB_LABELS[section.id] ?? section.title}</span>
                      {sectionProgress.find((item) => item.id === section.id)?.remaining ? (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                          {sectionProgress.find((item) => item.id === section.id)?.remaining}
                        </span>
                      ) : (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                          Done
                        </span>
                      )}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6} className="max-w-xs text-left">
                    <p className="font-semibold">{section.title}</p>
                    <p className="mt-1">{section.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsList>
            {sections.map((section) => {
              const sectionQuestions = questions.filter((question) => question.sectionId === section.id);
              const sectionScore = insights.sectionScores.find((score) => score.id === section.id);
              const sectionTargets = (section.packSectionKeys ?? []).map(getPackSectionLabel);
              const sectionStats = sectionProgress.find((item) => item.id === section.id);
              const sectionIndex = sections.findIndex((item) => item.id === section.id);
              const prevSection = sectionIndex > 0 ? sections[sectionIndex - 1] : null;
              const nextSection = sectionIndex < sections.length - 1 ? sections[sectionIndex + 1] : null;
              return (
                <TabsContent key={section.id} value={section.id} className="mt-4 space-y-6">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {prevSection ? (
                      <Button variant="outline" size="sm" onClick={() => setActiveSectionId(prevSection.id)}>
                        Previous section
                      </Button>
                    ) : null}
                    {nextSection ? (
                      <Button variant="outline" size="sm" onClick={() => setActiveSectionId(nextSection.id)}>
                        Next section
                      </Button>
                    ) : null}
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                                aria-label={`${section.title} help`}
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                              <p className="font-semibold">{section.title}</p>
                              <p className="mt-1">{section.description}</p>
                              {sectionTargets.length ? (
                                <p className="mt-2">Feeds into: {sectionTargets.join(", ")}</p>
                              ) : null}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-xs text-slate-500">{section.description}</p>
                        {sectionTargets.length ? (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Feeds into
                            </span>
                            {sectionTargets.map((item) => (
                              <Badge key={item} variant="outline" className="border-slate-200 text-slate-500">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          {sectionScore?.percent ?? 0}% ready
                        </Badge>
                        {sectionStats ? (
                          <Badge variant="outline" className="border-slate-200 text-slate-500">
                            {sectionStats.answered}/{sectionStats.total} answered
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sectionQuestions.map((question) => {
                      const meta = buildQuestionMeta(question);
                      return (
                        <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Label className="text-sm font-semibold text-slate-900">
                                  {question.prompt}
                                  {question.required ? " *" : ""}
                                </Label>
                                {question.description && (
                                  <p className="text-xs text-slate-500">{question.description}</p>
                                )}
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-slate-400 transition hover:text-slate-600"
                                    aria-label={`Why we ask: ${question.prompt}`}
                                  >
                                    <HelpCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Why we ask</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                                  <p className="font-semibold">Why we ask</p>
                                  {question.description ? <p className="mt-1">{question.description}</p> : null}
                                  {question.aiHint ? <p className="mt-2">{question.aiHint}</p> : null}
                                  {meta.regulatoryRefs.length ? (
                                    <p className="mt-2">Regulatory source: {meta.regulatoryRefs.join(", ")}</p>
                                  ) : null}
                                  {meta.packLabels.length ? (
                                    <p className="mt-2">Feeds into: {meta.packLabels.join(", ")}</p>
                                  ) : null}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {renderQuestionInput(question)}
                            {question.aiHint ? (
                              <div className="flex items-start gap-2 rounded-md border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-700">
                                <Sparkles className="mt-0.5 h-4 w-4 text-teal-500" />
                                <p>{question.aiHint}</p>
                              </div>
                            ) : null}
                            {meta.text ? (
                              <div className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                <HelpCircle className="mt-0.5 h-4 w-4 text-slate-400" />
                                <p>{meta.text}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
          {onNextPhase ? (
            <div className="mt-6 flex justify-end">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={onNextPhase}>
                Continue to Opinion Pack
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
