"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import { BarChart3, List, LayoutGrid, ChevronDown, ChevronRight } from "lucide-react";

// ============================================================================
// CONSTANTS - Extracted magic numbers for maintainability
// ============================================================================
const GANTT_CONFIG = {
  WEEK_COLUMN_MIN_WIDTH: 60,
  MILESTONE_ROW_HEIGHT: 44,
  MILESTONE_MIN_HEIGHT: 60,
  MILESTONE_BAR_HEIGHT: 32,
  MILESTONE_VERTICAL_PADDING: 8,
  PHASE_LABEL_WIDTH: 192, // w-48 = 12rem = 192px
  MIN_CHART_WIDTH: 800,
  TOOLTIP_EDGE_THRESHOLD: 15, // percentage from edge
  MOBILE_BREAKPOINT: 768, // Tailwind md: breakpoint
} as const;

// ============================================================================
// TYPES - Stricter TypeScript types
// ============================================================================
type MilestoneStatus = "complete" | "in-progress" | "pending" | "blocked";

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: MilestoneStatus | string; // Allow string for backwards compatibility
  owner?: string;
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

type ViewMode = "gantt" | "list";

// ============================================================================
// CONFIGURATION
// ============================================================================

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

// Status styles (in-progress uses inline stripes pattern, not CSS class)
const statusStyles: Record<string, { className: string; opacity: string }> = {
  complete: { className: "", opacity: "opacity-100" },
  "in-progress": { className: "", opacity: "opacity-90" },
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

// Default phase config for unknown phases
const defaultPhaseConfig = {
  bg: "bg-slate-100",
  bgSolid: "bg-slate-500",
  border: "border-slate-400",
  text: "text-slate-700",
  dot: "bg-slate-500",
};

const PHASE_LABELS: Record<string, string> = {
  "Policies & Evidence": "Policies & Controls",
};

const getPhaseLabel = (phase: string) => PHASE_LABELS[phase] || phase;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPhaseIndex = (phase: string) => {
  const idx = phaseOrder.indexOf(phase);
  return idx === -1 ? phaseOrder.length : idx;
};

function getWeekDate(startDate: string, weekNumber: number): string {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "Invalid";

  // Use setDate to handle DST correctly
  const date = new Date(start);
  date.setDate(date.getDate() + (weekNumber - 1) * 7);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getCurrentWeek(startDate: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 0;

  const today = new Date();
  // Normalize both dates to midnight for accurate day calculation
  const startNormalized = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysSinceStart = Math.floor((todayNormalized.getTime() - startNormalized.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return 0; // Project hasn't started yet

  return Math.max(1, Math.ceil((daysSinceStart + 1) / 7));
}

const formatIsoDate = (date: Date) => date.toISOString().split("T")[0];

function getDueDateForWeek(startDate: string, endWeek: number): string {
  if (!startDate) return "";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "";
  const date = new Date(start);
  date.setDate(date.getDate() + (endWeek - 1) * 7);
  return formatIsoDate(date);
}

function getWeekFromDate(startDate: string, dueDate: string): number {
  if (!startDate || !dueDate) return 1;
  const start = new Date(startDate);
  const due = new Date(dueDate);
  if (isNaN(start.getTime()) || isNaN(due.getTime())) return 1;
  const startNormalized = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dueNormalized = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const daysSinceStart = Math.floor((dueNormalized.getTime() - startNormalized.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil((daysSinceStart + 1) / 7));
}

const clonePlan = (plan?: ProjectPlan | null): ProjectPlan | null =>
  plan ? (JSON.parse(JSON.stringify(plan)) as ProjectPlan) : null;

// Extracted status badge styling helper to eliminate duplication
function getStatusBadgeClassName(status: string): string {
  const statusMap: Record<string, string> = {
    complete: "border-green-400 bg-green-50 text-green-700",
    "in-progress": "border-blue-400 bg-blue-50 text-blue-700",
    blocked: "border-red-400 bg-red-50 text-red-700",
  };
  return statusMap[status] || "border-slate-300 bg-slate-50 text-slate-600";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Milestone tooltip component with smart positioning
function MilestoneTooltip({
  milestone,
  config,
  position,
}: {
  milestone: ProjectMilestone;
  config: typeof defaultPhaseConfig;
  position: "left" | "center" | "right";
}) {
  const positionClasses =
    position === "left"
      ? "left-0"
      : position === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  const arrowClasses =
    position === "left"
      ? "left-4"
      : position === "right"
      ? "right-4"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      role="tooltip"
      className={`absolute bottom-full z-50 mb-2 hidden w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg group-hover:block group-focus:block ${positionClasses}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${config.dot}`} />
        <span className={`text-sm font-semibold ${config.text}`}>{getPhaseLabel(milestone.phase)}</span>
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
        <Badge variant="outline" className={`text-xs ${getStatusBadgeClassName(milestone.status)}`}>
          {milestone.status.replace(/-/g, " ")}
        </Badge>
      </div>
      {milestone.owner ? (
        <p className="mt-2 text-xs text-slate-500">Owner: {milestone.owner}</p>
      ) : null}
      {/* Arrow */}
      <div className={`absolute -bottom-2 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white ${arrowClasses}`} />
    </div>
  );
}

// Loading overlay component with ARIA live region for accessibility
function LoadingOverlay({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-lg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-700">{message}</span>
      </div>
    </div>
  );
}

// Mobile-friendly list view component
function MilestoneListView({
  phaseGroups,
  editable = false,
  onMilestoneUpdate,
}: {
  phaseGroups: [string, ProjectMilestone[]][];
  editable?: boolean;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<ProjectMilestone>) => void;
}) {
  return (
    <div className="space-y-4">
      {phaseGroups.map(([phase, items]) => {
        const config = phaseConfig[phase] || defaultPhaseConfig;
        return (
          <Card key={phase} className={`border-2 ${config.border}`}>
            <CardHeader className={`py-3 ${config.bg}`}>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${config.dot}`} />
                <CardTitle className={`text-sm ${config.text}`}>{getPhaseLabel(phase)}</CardTitle>
                <Badge variant="outline" className="ml-auto text-xs">
                  {items.length} milestone{items.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {items.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{milestone.title}</p>
                    <p className="text-xs text-slate-500">{milestone.description}</p>
                  </div>
                  {editable ? (
                    <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Owner</span>
                        <Input
                          value={milestone.owner ?? ""}
                          onChange={(event) => onMilestoneUpdate?.(milestone.id, { owner: event.target.value })}
                          placeholder="Assign owner"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Due date</span>
                        <Input
                          type="date"
                          value={milestone.dueDate || ""}
                          onChange={(event) => onMilestoneUpdate?.(milestone.id, { dueDate: event.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Duration (weeks)</span>
                        <Input
                          type="number"
                          min={1}
                          value={milestone.durationWeeks}
                          onChange={(event) =>
                            onMilestoneUpdate?.(milestone.id, { durationWeeks: Number(event.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</span>
                        <Select
                          value={milestone.status}
                          onValueChange={(value) => onMilestoneUpdate?.(milestone.id, { status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In progress</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-full text-[11px] text-slate-400">
                        Weeks {milestone.startWeek}-{milestone.endWeek} · {milestone.durationWeeks} week
                        {milestone.durationWeeks !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400">
                        W{milestone.startWeek}-{milestone.endWeek}
                      </span>
                      <span className="text-slate-400">({milestone.durationWeeks}w)</span>
                      <Badge variant="outline" className={getStatusBadgeClassName(milestone.status)}>
                        {milestone.status.replace(/-/g, " ")}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PlanClient() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("gantt");
  const [isEditing, setIsEditing] = useState(false);
  const [draftPlan, setDraftPlan] = useState<ProjectPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // Ref to track if component is mounted (prevents memory leaks)
  const isMountedRef = useRef(true);

  // Detect mobile viewport for responsive initial view
  // Note: We use a ref to track if this is initial load vs user-initiated change
  const hasSetInitialViewRef = useRef(false);
  useEffect(() => {
    if (hasSetInitialViewRef.current) return;
    hasSetInitialViewRef.current = true;
    // Only set initial view - don't override user's manual choice on resize
    if (window.innerWidth < GANTT_CONFIG.MOBILE_BREAKPOINT) {
      setViewMode("list");
    }
  }, []);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch((err) => {
        console.error("Failed to fetch project:", err);
        return null;
      });
      if (!isMountedRef.current) return; // Abort if unmounted

      if (!response || !response.ok) {
        setLoadError("Unable to load project plan. Please try again.");
        return;
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setProject(data.project || null);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error loading project:", error);
        setLoadError("Unable to load project plan. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    isMountedRef.current = true;
    loadProject();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadProject]);

  useEffect(() => {
    setDraftPlan(clonePlan(project?.projectPlan ?? null));
  }, [project?.projectPlan]);

  const basePlan = project?.projectPlan || {};
  const plan = isEditing ? draftPlan ?? basePlan : basePlan;

  // Memoize milestones array properly to prevent unnecessary re-renders
  const milestones = useMemo(
    () => (Array.isArray(plan.milestones) ? plan.milestones : []),
    [plan.milestones]
  );

  const totalWeeks = plan.totalWeeks || Math.max(1, ...milestones.map((item) => item.endWeek || 1));
  const startDate = plan.startDate || formatIsoDate(new Date());
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

  // Calculate today marker position (with division by zero guard)
  const todayPosition = useMemo(() => {
    if (totalWeeks === 0 || currentWeek <= 0) return 0;
    if (currentWeek > totalWeeks) return 100;
    return ((currentWeek - 0.5) / totalWeeks) * 100;
  }, [currentWeek, totalWeeks]);

  const generatePlan = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/plan`, { method: "POST" });
      if (!isMountedRef.current) return;

      if (!response.ok) {
        let errorMessage = "Unable to generate project plan.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setLoadError(errorMessage);
        return;
      }
      await loadProject();
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error generating plan:", error);
        setLoadError("Network error. Please check your connection and try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const beginEditing = () => {
    setDraftPlan(clonePlan(basePlan) ?? null);
    setIsEditing(true);
    setSaveError(null);
    setViewMode("list");
  };

  const cancelEditing = () => {
    setDraftPlan(clonePlan(basePlan) ?? null);
    setIsEditing(false);
    setSaveError(null);
  };

  const updateDraftPlan = (updater: (plan: ProjectPlan) => ProjectPlan) => {
    setDraftPlan((prev) => {
      const seed = prev ?? (clonePlan(basePlan) ?? null);
      if (!seed) return prev;
      return updater(seed);
    });
  };

  const handleStartDateChange = (value: string) => {
    updateDraftPlan((currentPlan) => {
      const nextStartDate = value || formatIsoDate(new Date());
      const nextMilestones = (currentPlan.milestones || []).map((milestone) => ({
        ...milestone,
        dueDate: getDueDateForWeek(nextStartDate, milestone.endWeek),
      }));
      return {
        ...currentPlan,
        startDate: nextStartDate,
        milestones: nextMilestones,
      };
    });
  };

  const handleMilestoneUpdate = (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    updateDraftPlan((currentPlan) => {
      const planStartDate = currentPlan.startDate || startDate;
      const nextMilestones = (currentPlan.milestones || []).map((milestone) => {
        if (milestone.id !== milestoneId) return milestone;

        const nextMilestone = { ...milestone, ...updates };
        const durationWeeks = Math.max(1, Number(nextMilestone.durationWeeks) || 1);
        let startWeek = Math.max(1, Number(nextMilestone.startWeek) || 1);
        let endWeek = startWeek + durationWeeks - 1;

        if (typeof updates.dueDate === "string" && updates.dueDate.trim().length > 0) {
          endWeek = getWeekFromDate(planStartDate, updates.dueDate);
          startWeek = Math.max(1, endWeek - durationWeeks + 1);
        } else if (updates.durationWeeks !== undefined) {
          endWeek = startWeek + durationWeeks - 1;
        }

        const dueDate =
          typeof updates.dueDate === "string" && updates.dueDate.trim().length > 0
            ? updates.dueDate
            : getDueDateForWeek(planStartDate, endWeek);

        return {
          ...nextMilestone,
          startWeek,
          durationWeeks,
          endWeek,
          dueDate,
        };
      });

      const nextTotalWeeks = Math.max(1, ...nextMilestones.map((item) => item.endWeek || 1));

      return {
        ...currentPlan,
        milestones: nextMilestones,
        totalWeeks: nextTotalWeeks,
      };
    });
  };

  const savePlanChanges = async () => {
    if (!projectId || !draftPlan) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: draftPlan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSaveError(errorData.error || "Unable to save plan changes.");
        return;
      }

      const data = await response.json();
      setProject((prev) => (prev ? { ...prev, projectPlan: data.plan } : prev));
      setDraftPlan(clonePlan(data.plan));
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save plan changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // RENDER - Loading state
  // ============================================================================
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

  // ============================================================================
  // RENDER - Error state
  // ============================================================================
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

  // ============================================================================
  // RENDER - Empty state
  // ============================================================================
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

  // ============================================================================
  // RENDER - Main content
  // ============================================================================
  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="plan" />

      {/* Header Card */}
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Project Timeline
            </CardTitle>
            <CardDescription>
              Generated{" "}
              {plan.generatedAt
                ? new Date(plan.generatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "recently"}
            </CardDescription>
            <div className="mt-2 text-xs text-slate-500">
              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Timeline start</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => handleStartDateChange(event.target.value)}
                  />
                  <span className="text-[10px] text-slate-400">Adjusts all milestone due dates.</span>
                </div>
              ) : (
                <span>
                  Start date{" "}
                  {startDate
                    ? new Date(startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "pending"}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 text-slate-600">
              {totalWeeks} weeks total
            </Badge>
            <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
              {milestones.length} milestones
            </Badge>

            {/* View mode toggle */}
            <div className="flex rounded-md border border-slate-200" role="group" aria-label="View mode">
              <button
                onClick={() => setViewMode("gantt")}
                className={`flex items-center gap-1 px-2 py-1 text-xs ${
                  viewMode === "gantt" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                }`}
                aria-label="Gantt view"
                aria-pressed={viewMode === "gantt"}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Gantt</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 border-l border-slate-200 px-2 py-1 text-xs ${
                  viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {isEditing ? (
              <>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={savePlanChanges} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={beginEditing}>
                Edit timeline
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={generatePlan} disabled={isGenerating || isEditing}>
              {isGenerating ? "Regenerating..." : "Regenerate"}
            </Button>
            {project.packId && (
              <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Link href={`/authorization-pack/workspace?packId=${project.packId}`}>Open workspace</Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
      {saveError ? (
        <Card className="border border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-700">{saveError}</CardContent>
        </Card>
      ) : null}

      {/* Conditional rendering based on view mode */}
      {viewMode === "list" ? (
        <MilestoneListView
          phaseGroups={phaseGroups}
          editable={isEditing}
          onMilestoneUpdate={handleMilestoneUpdate}
        />
      ) : (
        <>
          {/* Gantt Chart */}
          <Card className="relative overflow-visible border border-slate-200">
            {/* Loading overlay during regeneration */}
            {isGenerating && <LoadingOverlay message="Regenerating plan..." />}

            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-visible">
                <div style={{ minWidth: `${GANTT_CONFIG.MIN_CHART_WIDTH}px` }}>
                  {/* Week Header Row */}
                  <div className="flex border-b border-slate-200 bg-slate-50">
                    {/* Phase label column */}
                    <div
                      className="flex-shrink-0 border-r border-slate-200 px-4 py-3"
                      style={{ width: `${GANTT_CONFIG.PHASE_LABEL_WIDTH}px` }}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phase</span>
                    </div>
                    {/* Week columns */}
                    <div className="relative flex flex-1">
                      {weekColumns.map((col, idx) => (
                        <div
                          key={col.week}
                          className={`flex-1 border-r border-slate-100 px-1 py-2 text-center ${
                            idx === weekColumns.length - 1 ? "border-r-0" : ""
                          }`}
                          style={{ minWidth: `${GANTT_CONFIG.WEEK_COLUMN_MIN_WIDTH}px` }}
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

                  {/* Phase Rows - Collapsible */}
                  {phaseGroups.map(([phase, items], phaseIdx) => {
                    const config = phaseConfig[phase] || defaultPhaseConfig;
                    const isExpanded = expandedPhases.has(phase);
                    const togglePhase = () => {
                      setExpandedPhases((prev) => {
                        const next = new Set(prev);
                        if (next.has(phase)) {
                          next.delete(phase);
                        } else {
                          next.add(phase);
                        }
                        return next;
                      });
                    };

                    // Calculate phase summary bar (collapsed view)
                    const phaseStartWeek = Math.min(...items.map((m) => m.startWeek));
                    const phaseEndWeek = Math.max(...items.map((m) => m.endWeek));
                    const phaseDuration = phaseEndWeek - phaseStartWeek + 1;
                    const completedCount = items.filter((m) => m.status === "complete").length;
                    const inProgressCount = items.filter((m) => m.status === "in-progress").length;

                    return (
                      <div
                        key={phase}
                        className={`group/phase ${phaseIdx < phaseGroups.length - 1 ? "border-b border-slate-100" : ""}`}
                      >
                        {/* Phase header - clickable to expand/collapse */}
                        <div className="flex">
                          <button
                            onClick={togglePhase}
                            className={`flex-shrink-0 border-r border-slate-200 px-4 py-3 text-left transition-colors hover:bg-opacity-80 ${config.bg}`}
                            style={{ width: `${GANTT_CONFIG.PHASE_LABEL_WIDTH}px` }}
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              )}
                              <div className={`h-3 w-3 rounded-full ${config.dot}`} />
                              <span className={`text-sm font-semibold ${config.text}`}>{getPhaseLabel(phase)}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 pl-6 text-xs text-slate-500">
                              <span>{items.length} task{items.length !== 1 ? "s" : ""}</span>
                              {completedCount > 0 && (
                                <Badge className="h-4 bg-green-100 px-1 text-[10px] text-green-700">
                                  {completedCount} done
                                </Badge>
                              )}
                              {inProgressCount > 0 && (
                                <Badge className="h-4 bg-blue-100 px-1 text-[10px] text-blue-700">
                                  {inProgressCount} active
                                </Badge>
                              )}
                            </div>
                          </button>

                          {/* Timeline area - collapsed summary bar */}
                          {!isExpanded && (
                            <div className="relative flex-1 py-3" style={{ minHeight: `${GANTT_CONFIG.MILESTONE_MIN_HEIGHT}px` }}>
                              {/* Grid lines */}
                              <div className="pointer-events-none absolute inset-0 flex">
                                {weekColumns.map((col, idx) => (
                                  <div
                                    key={col.week}
                                    className={`flex-1 border-r border-slate-50 ${idx === weekColumns.length - 1 ? "border-r-0" : ""}`}
                                    style={{ minWidth: `${GANTT_CONFIG.WEEK_COLUMN_MIN_WIDTH}px` }}
                                  />
                                ))}
                              </div>
                              {/* Today marker line */}
                              {currentWeek > 0 && currentWeek <= totalWeeks && (
                                <div className="absolute bottom-0 top-0 z-10 w-0.5 bg-red-400" style={{ left: `${todayPosition}%` }} />
                              )}
                              {/* Collapsed phase summary bar */}
                              <div
                                className="absolute px-1"
                                style={{
                                  left: `${totalWeeks > 0 ? ((phaseStartWeek - 1) / totalWeeks) * 100 : 0}%`,
                                  width: `${Math.max(totalWeeks > 0 ? (phaseDuration / totalWeeks) * 100 : 0, 5)}%`,
                                  top: `${GANTT_CONFIG.MILESTONE_VERTICAL_PADDING}px`,
                                }}
                              >
                                <div
                                  className={`flex h-8 cursor-pointer items-center justify-between rounded-md border-2 px-3 shadow-sm transition-all group-hover/phase:border-slate-300 group-hover/phase:shadow-md ${config.bg} ${config.border}`}
                                  onClick={togglePhase}
                                >
                                  <span className={`text-xs font-medium ${config.text}`}>
                                    W{phaseStartWeek}-{phaseEndWeek}
                                  </span>
                                  <span className={`text-[10px] ${config.text} opacity-70`}>
                                    {phaseDuration}w · {items.length} tasks
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expanded milestone rows */}
                        {isExpanded && (
                          <div className="flex">
                            <div
                              className={`flex-shrink-0 border-r border-slate-200 ${config.bg} opacity-50`}
                              style={{ width: `${GANTT_CONFIG.PHASE_LABEL_WIDTH}px` }}
                            />
                            <div
                              className="relative flex-1 py-3"
                              style={{
                                minHeight: `${Math.max(
                                  GANTT_CONFIG.MILESTONE_MIN_HEIGHT,
                                  items.length * GANTT_CONFIG.MILESTONE_ROW_HEIGHT
                                )}px`,
                              }}
                            >
                              {/* Grid lines */}
                              <div className="pointer-events-none absolute inset-0 flex">
                                {weekColumns.map((col, idx) => (
                                  <div
                                    key={col.week}
                                    className={`flex-1 border-r border-slate-50 ${idx === weekColumns.length - 1 ? "border-r-0" : ""}`}
                                    style={{ minWidth: `${GANTT_CONFIG.WEEK_COLUMN_MIN_WIDTH}px` }}
                                  />
                                ))}
                              </div>
                              {/* Today marker line */}
                              {currentWeek > 0 && currentWeek <= totalWeeks && (
                                <div className="absolute bottom-0 top-0 z-10 w-0.5 bg-red-400" style={{ left: `${todayPosition}%` }} />
                              )}
                              {/* Milestone bars */}
                              {items.map((milestone, milestoneIdx) => {
                                const left = totalWeeks > 0 ? ((milestone.startWeek - 1) / totalWeeks) * 100 : 0;
                                const width = totalWeeks > 0 ? (milestone.durationWeeks / totalWeeks) * 100 : 0;
                                const status = statusStyles[milestone.status] || statusStyles.pending;
                                const tooltipPosition: "left" | "center" | "right" =
                                  left < GANTT_CONFIG.TOOLTIP_EDGE_THRESHOLD
                                    ? "left"
                                    : left + width > 100 - GANTT_CONFIG.TOOLTIP_EDGE_THRESHOLD
                                    ? "right"
                                    : "center";

                                return (
                                  <div
                                    key={milestone.id}
                                    className="group absolute px-1"
                                    style={{
                                      left: `${left}%`,
                                      width: `${Math.max(width, 5)}%`,
                                      top: `${milestoneIdx * GANTT_CONFIG.MILESTONE_ROW_HEIGHT + GANTT_CONFIG.MILESTONE_VERTICAL_PADDING}px`,
                                    }}
                                  >
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`${milestone.title}: ${getPhaseLabel(milestone.phase)}, Week ${milestone.startWeek} to ${milestone.endWeek}, Status: ${milestone.status.replace(/-/g, " ")}`}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                        }
                                      }}
                                      className={`relative flex h-8 cursor-pointer items-center justify-between overflow-hidden rounded-md border-2 px-2 shadow-sm transition-all hover:shadow-md group-hover/phase:border-slate-300 group-hover/phase:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${config.bg} ${config.border} ${status.opacity} ${status.className}`}
                                    >
                                      {milestone.status === "complete" && (
                                        <div className={`absolute inset-0 ${config.bgSolid} opacity-20`} />
                                      )}
                                      {milestone.status === "in-progress" && (
                                        <div
                                          className="absolute inset-0 opacity-10"
                                          style={{
                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)`,
                                          }}
                                        />
                                      )}
                                      <span className={`relative z-10 truncate text-xs font-medium ${config.text}`}>
                                        {milestone.title}
                                      </span>
                                      <span className={`relative z-10 ml-1 flex-shrink-0 text-[10px] ${config.text} opacity-70`}>
                                        {milestone.durationWeeks}w
                                      </span>
                                    </div>
                                    <MilestoneTooltip milestone={milestone} config={config} position={tooltipPosition} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
                    <div
                      className="h-3 w-3 rounded-full bg-blue-500 opacity-80"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)",
                      }}
                    />
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
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-medium text-slate-500">Phases:</span>
                  {phaseOrder.map((phase) => {
                    const config = phaseConfig[phase] || defaultPhaseConfig;
                    return (
                      <div key={phase} className="flex items-center gap-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                        <span className="text-[10px] text-slate-500">{getPhaseLabel(phase).split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed Milestone List (shown in both modes) */}
      {viewMode === "gantt" && (
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
                    <h3 className={`text-sm font-semibold ${config.text}`}>{getPhaseLabel(phase)}</h3>
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
                            <p className="text-xs text-slate-400">
                              Week {milestone.startWeek} - {milestone.endWeek}
                            </p>
                            <p className="text-xs text-slate-400">
                              {milestone.durationWeeks} week{milestone.durationWeeks !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getStatusBadgeClassName(milestone.status)}`}>
                            {milestone.status.replace(/-/g, " ")}
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
      )}
    </div>
  );
}
