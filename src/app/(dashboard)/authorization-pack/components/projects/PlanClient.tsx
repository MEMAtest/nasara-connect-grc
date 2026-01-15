"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: string;
  startWeek: number;
  durationWeeks: number;
  endWeek: number;
  dueDate: string;
  dependencies?: string[];
}

interface ProjectPlan {
  generatedAt?: string;
  startDate?: string;
  totalWeeks?: number;
  milestones?: ProjectMilestone[];
}

interface ProjectDetail {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
  projectPlan?: ProjectPlan;
}

// Phase configuration with colors
const phaseConfig: Record<string, { bg: string; bgSolid: string; border: string; text: string; dot: string }> = {
  "Assessment & Scoping": {
    bg: "bg-teal-100",
    bgSolid: "bg-teal-500",
    border: "border-teal-400",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  "Narrative & Business Plan": {
    bg: "bg-blue-100",
    bgSolid: "bg-blue-500",
    border: "border-blue-400",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  "Policies & Evidence": {
    bg: "bg-purple-100",
    bgSolid: "bg-purple-500",
    border: "border-purple-400",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  "Governance & SMCR": {
    bg: "bg-amber-100",
    bgSolid: "bg-amber-500",
    border: "border-amber-400",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  "Review & Submission": {
    bg: "bg-green-100",
    bgSolid: "bg-green-500",
    border: "border-green-400",
    text: "text-green-700",
    dot: "bg-green-500",
  },
};

// Status styles
const statusStyles: Record<string, { className: string; opacity: string }> = {
  complete: { className: "", opacity: "opacity-100" },
  "in-progress": { className: "bg-stripes", opacity: "opacity-90" },
  pending: { className: "", opacity: "opacity-50" },
  blocked: { className: "bg-red-200 border-red-400", opacity: "opacity-70" },
};

const phaseOrder = [
  "Assessment & Scoping",
  "Narrative & Business Plan",
  "Policies & Evidence",
  "Governance & SMCR",
  "Review & Submission",
];

const getPhaseIndex = (phase: string) => {
  const idx = phaseOrder.indexOf(phase);
  return idx === -1 ? phaseOrder.length : idx;
};

// Default phase config for unknown phases
const defaultPhaseConfig = {
  bg: "bg-slate-100",
  bgSolid: "bg-slate-500",
  border: "border-slate-400",
  text: "text-slate-700",
  dot: "bg-slate-500",
};

function getWeekDate(startDate: string, weekNumber: number): string {
  const start = new Date(startDate);
  const date = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0.5, Math.ceil(daysSinceStart / 7));
}

// Milestone tooltip component
function MilestoneTooltip({ milestone, config }: { milestone: ProjectMilestone; config: typeof defaultPhaseConfig }) {
  return (
    <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg group-hover:block">
      <div className="mb-2 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${config.dot}`} />
        <span className={`text-sm font-semibold ${config.text}`}>{milestone.phase}</span>
      </div>
      <p className="mb-1 font-medium text-slate-900">{milestone.title}</p>
      <p className="mb-2 text-xs text-slate-500">{milestone.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400">Start:</span>
          <span className="ml-1 text-slate-600">Week {milestone.startWeek}</span>
        </div>
        <div>
          <span className="text-slate-400">End:</span>
          <span className="ml-1 text-slate-600">Week {milestone.endWeek}</span>
        </div>
        <div>
          <span className="text-slate-400">Duration:</span>
          <span className="ml-1 text-slate-600">{milestone.durationWeeks}w</span>
        </div>
        <div>
          <span className="text-slate-400">Due:</span>
          <span className="ml-1 text-slate-600">{milestone.dueDate}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs text-slate-400">Status:</span>
        <Badge
          variant="outline"
          className={`text-xs ${
            milestone.status === "complete"
              ? "border-green-400 bg-green-50 text-green-700"
              : milestone.status === "in-progress"
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : milestone.status === "blocked"
              ? "border-red-400 bg-red-50 text-red-700"
              : "border-slate-300 bg-slate-50 text-slate-600"
          }`}
        >
          {milestone.status.replace("-", " ")}
        </Badge>
      </div>
      {/* Arrow */}
      <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
    </div>
  );
}

export function PlanClient() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadProject = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null);
      if (!response || !response.ok) {
        setLoadError("Unable to load project plan. Please try again.");
        return;
      }
      const data = await response.json();
      setProject(data.project || null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const plan = project?.projectPlan || {};
  const milestones = Array.isArray(plan.milestones) ? plan.milestones : [];
  const totalWeeks = plan.totalWeeks || Math.max(1, ...milestones.map((item) => item.endWeek || 1));
  const startDate = plan.startDate || new Date().toISOString();
  const currentWeek = getCurrentWeek(startDate);

  // Group milestones by phase
  const phaseGroups = useMemo(() => {
    const groups = new Map<string, ProjectMilestone[]>();
    milestones.forEach((milestone) => {
      const list = groups.get(milestone.phase) || [];
      list.push(milestone);
      groups.set(milestone.phase, list);
    });
    return Array.from(groups.entries()).sort((a, b) => getPhaseIndex(a[0]) - getPhaseIndex(b[0]));
  }, [milestones]);

  // Generate week columns
  const weekColumns = useMemo(() => {
    return Array.from({ length: totalWeeks }, (_, i) => ({
      week: i + 1,
      date: getWeekDate(startDate, i + 1),
    }));
  }, [totalWeeks, startDate]);

  // Calculate today marker position
  const todayPosition = useMemo(() => {
    if (currentWeek <= 0) return 0;
    if (currentWeek > totalWeeks) return 100;
    return ((currentWeek - 0.5) / totalWeeks) * 100;
  }, [currentWeek, totalWeeks]);

  const generatePlan = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/plan`, { method: "POST" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || "Unable to generate project plan.");
        return;
      }
      await loadProject();
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            Loading plan...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Plan unavailable</CardTitle>
          <CardDescription>{loadError || "We could not find this project."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadProject}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!milestones.length) {
    return (
      <div className="space-y-6">
        <ProjectHeader project={project} active="plan" />
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>No plan yet</CardTitle>
            <CardDescription>Generate the project plan after completing the assessment.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={generatePlan} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate plan"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/authorization-pack/${project.id}/assessment`}>Complete assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="plan" />

      {/* Header Card */}
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Project Timeline
            </CardTitle>
            <CardDescription>
              Generated {plan.generatedAt ? new Date(plan.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "recently"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 text-slate-600">
              {totalWeeks} weeks total
            </Badge>
            <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
              {milestones.length} milestones
            </Badge>
            <Button variant="outline" size="sm" onClick={generatePlan} disabled={isGenerating}>
              {isGenerating ? "Regenerating..." : "Regenerate"}
            </Button>
            {project.packId && (
              <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Link href={`/authorization-pack/sections?packId=${project.packId}`}>Open workspace</Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Gantt Chart */}
      <Card className="overflow-hidden border border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Week Header Row */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                {/* Phase label column */}
                <div className="w-48 flex-shrink-0 border-r border-slate-200 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phase</span>
                </div>
                {/* Week columns */}
                <div className="relative flex flex-1">
                  {weekColumns.map((col, idx) => (
                    <div
                      key={col.week}
                      className={`flex-1 border-r border-slate-100 px-1 py-2 text-center ${idx === weekColumns.length - 1 ? "border-r-0" : ""}`}
                      style={{ minWidth: "60px" }}
                    >
                      <div className="text-xs font-medium text-slate-600">W{col.week}</div>
                      <div className="text-[10px] text-slate-400">{col.date}</div>
                    </div>
                  ))}
                  {/* Today marker in header */}
                  {currentWeek > 0 && currentWeek <= totalWeeks && (
                    <div
                      className="absolute top-0 z-10 flex flex-col items-center"
                      style={{ left: `${todayPosition}%`, transform: "translateX(-50%)" }}
                    >
                      <div className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">Today</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Phase Rows */}
              {phaseGroups.map(([phase, items], phaseIdx) => {
                const config = phaseConfig[phase] || defaultPhaseConfig;
                return (
                  <div
                    key={phase}
                    className={`flex ${phaseIdx < phaseGroups.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    {/* Phase label */}
                    <div className={`w-48 flex-shrink-0 border-r border-slate-200 px-4 py-4 ${config.bg}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${config.dot}`} />
                        <span className={`text-sm font-semibold ${config.text}`}>{phase}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{items.length} milestone{items.length !== 1 ? "s" : ""}</div>
                    </div>

                    {/* Timeline area */}
                    <div className="relative flex-1 py-3" style={{ minHeight: `${Math.max(60, items.length * 44)}px` }}>
                      {/* Grid lines */}
                      <div className="pointer-events-none absolute inset-0 flex">
                        {weekColumns.map((col, idx) => (
                          <div
                            key={col.week}
                            className={`flex-1 border-r border-slate-50 ${idx === weekColumns.length - 1 ? "border-r-0" : ""}`}
                            style={{ minWidth: "60px" }}
                          />
                        ))}
                      </div>

                      {/* Today marker line */}
                      {currentWeek > 0 && currentWeek <= totalWeeks && (
                        <div
                          className="absolute top-0 bottom-0 z-10 w-0.5 bg-red-400"
                          style={{ left: `${todayPosition}%` }}
                        />
                      )}

                      {/* Milestone bars */}
                      {items.map((milestone, milestoneIdx) => {
                        const left = ((milestone.startWeek - 1) / totalWeeks) * 100;
                        const width = (milestone.durationWeeks / totalWeeks) * 100;
                        const status = statusStyles[milestone.status] || statusStyles.pending;

                        return (
                          <div
                            key={milestone.id}
                            className="group absolute px-1"
                            style={{
                              left: `${left}%`,
                              width: `${Math.max(width, 5)}%`,
                              top: `${milestoneIdx * 44 + 8}px`,
                            }}
                          >
                            <div
                              className={`relative flex h-8 cursor-pointer items-center justify-between overflow-hidden rounded-md border-2 px-2 shadow-sm transition-all hover:shadow-md ${config.bg} ${config.border} ${status.opacity} ${status.className}`}
                            >
                              {/* Progress fill for completed */}
                              {milestone.status === "complete" && (
                                <div className={`absolute inset-0 ${config.bgSolid} opacity-20`} />
                              )}
                              {/* In-progress stripes */}
                              {milestone.status === "in-progress" && (
                                <div
                                  className="absolute inset-0 opacity-10"
                                  style={{
                                    backgroundImage: `repeating-linear-gradient(
                                      45deg,
                                      transparent,
                                      transparent 4px,
                                      currentColor 4px,
                                      currentColor 8px
                                    )`,
                                  }}
                                />
                              )}

                              {/* Content */}
                              <span className={`relative z-10 truncate text-xs font-medium ${config.text}`}>
                                {milestone.title}
                              </span>
                              <span className={`relative z-10 ml-1 flex-shrink-0 text-[10px] ${config.text} opacity-70`}>
                                {milestone.durationWeeks}w
                              </span>

                              {/* Tooltip */}
                              <MilestoneTooltip milestone={milestone} config={config} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border border-slate-200">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-blue-500 opacity-80" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)" }} />
                <span className="text-xs text-slate-600">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-600">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <span className="text-xs text-slate-600">Blocked</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-500">Phases:</span>
              {phaseOrder.slice(0, 5).map((phase) => {
                const config = phaseConfig[phase] || defaultPhaseConfig;
                return (
                  <div key={phase} className="flex items-center gap-1">
                    <div className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                    <span className="text-[10px] text-slate-500">{phase.split(" ")[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Milestone List */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Milestone Details</CardTitle>
          <CardDescription>Complete list of all milestones by phase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {phaseGroups.map(([phase, items]) => {
            const config = phaseConfig[phase] || defaultPhaseConfig;
            return (
              <div key={phase}>
                <div className="mb-3 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${config.dot}`} />
                  <h3 className={`text-sm font-semibold ${config.text}`}>{phase}</h3>
                </div>
                <div className="space-y-2 pl-5">
                  {items.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${config.bg} ${config.border}`}
                    >
                      <div className="flex-1">
                        <p className={`font-medium ${config.text}`}>{milestone.title}</p>
                        <p className="text-xs text-slate-500">{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-xs text-slate-400">Week {milestone.startWeek} - {milestone.endWeek}</p>
                          <p className="text-xs text-slate-400">{milestone.durationWeeks} week{milestone.durationWeeks !== 1 ? "s" : ""}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            milestone.status === "complete"
                              ? "border-green-400 bg-green-50 text-green-700"
                              : milestone.status === "in-progress"
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : milestone.status === "blocked"
                              ? "border-red-400 bg-red-50 text-red-700"
                              : "border-slate-300 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {milestone.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
