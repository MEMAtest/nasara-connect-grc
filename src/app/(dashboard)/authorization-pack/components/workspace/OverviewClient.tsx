"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// Icon components
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
  target_submission_date?: string | null;
  created_at?: string | null;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  review: number;
}

interface SectionSummary {
  id: string;
  title: string;
  section_key: string;
  narrativeCompletion: number;
  reviewCompletion: number;
  reviewApproved: number;
  reviewTotal: number;
  status?: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  section_title?: string | null;
  due_date?: string | null;
  source?: string | null;
}

interface TemplateSummary {
  id: string;
  type: PackType;
  name: string;
  description: string | null;
}

// Status options for pack
const PACK_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-slate-100 text-slate-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "review", label: "Under Review", color: "bg-purple-100 text-purple-700" },
  { value: "ready", label: "Ready for Submission", color: "bg-green-100 text-green-700" },
  { value: "submitted", label: "Submitted", color: "bg-teal-100 text-teal-700" },
];

function getPackStatusColor(status: string) {
  const option = PACK_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "bg-slate-100 text-slate-700";
}

// Circular progress component
function CircularProgress({ value, size = 120, strokeWidth = 8, color = "teal" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorMap: Record<string, string> = {
    teal: "stroke-teal-500",
    blue: "stroke-blue-500",
    green: "stroke-green-500",
    amber: "stroke-amber-500",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-slate-100"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`transition-all duration-500 ${colorMap[color] || colorMap.teal}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{value}%</span>
      </div>
    </div>
  );
}

export function OverviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState({
    name: "",
    templateType: "payments-emi" as PackType,
    targetSubmissionDate: "",
  });

  // Mutation error state
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadPack = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const packResponse = await fetchWithTimeout("/api/authorization-pack/packs?organizationId=default-org").catch(
        () => null
      );
      if (!packResponse || !packResponse.ok) {
        setLoadError("Unable to load packs. Check the database connection and try again.");
        return;
      }
      const packData = await packResponse.json();
      const activePack =
        (packIdParam ? packData.packs?.find((item: PackRow) => item.id === packIdParam) : null) ??
        packData.packs?.[0] ??
        null;
      setPack(activePack);

      if (activePack) {
        if (packIdParam !== activePack.id) {
          router.replace(`/authorization-pack/workspace?packId=${activePack.id}`);
        }
        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        const sectionResponse = await fetchWithTimeout(
          `/api/authorization-pack/packs/${activePack.id}/sections`
        ).catch(() => null);
        if (sectionResponse?.ok) {
          const sectionData = await sectionResponse.json();
          setSections(sectionData.sections || []);
        }

        const taskResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/tasks`).catch(
          () => null
        );
        if (taskResponse?.ok) {
          const taskData = await taskResponse.json();
          setTasks(taskData.tasks || []);
        }
      } else {
        const templateResponse = await fetchWithTimeout("/api/authorization-pack/templates").catch(() => null);
        if (!templateResponse || !templateResponse.ok) {
          setLoadError("Unable to load templates. Check the database connection and try again.");
          return;
        }
        const templateData = await templateResponse.json();
        setTemplates(templateData.templates || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPack();
  }, [packIdParam]);

  // Section statistics
  const sectionStats = useMemo(() => {
    if (!sections.length) return { completed: 0, inProgress: 0, notStarted: 0 };
    return {
      completed: sections.filter((s) => s.narrativeCompletion >= 100).length,
      inProgress: sections.filter((s) => s.narrativeCompletion > 0 && s.narrativeCompletion < 100).length,
      notStarted: sections.filter((s) => s.narrativeCompletion === 0).length,
    };
  }, [sections]);

  // Task statistics
  const visibleTasks = useMemo(() => tasks.filter((task) => task.source !== "auto-evidence"), [tasks]);
  const taskStats = useMemo(() => {
    if (!visibleTasks.length) return { total: 0, completed: 0, pending: 0, blocked: 0, highPriority: 0 };
    return {
      total: visibleTasks.length,
      completed: visibleTasks.filter((t) => t.status === "completed").length,
      pending: visibleTasks.filter((t) => ["pending", "in_progress"].includes(t.status)).length,
      blocked: visibleTasks.filter((t) => t.status === "blocked").length,
      highPriority: visibleTasks.filter((t) => ["high", "critical"].includes(t.priority) && t.status !== "completed").length,
    };
  }, [visibleTasks]);

  const blockers = useMemo(() => {
    if (!sections.length) return [];
    const items: { type: string; label: string; severity: "warning" | "error" }[] = [];

    // Pending reviews
    sections
      .filter((section) => section.reviewTotal > 0 && section.reviewApproved < section.reviewTotal)
      .slice(0, 2)
      .forEach((section) => {
        items.push({
          type: "review",
          label: `${section.title}: awaiting review approval`,
          severity: "warning",
        });
      });

    // Blocked tasks
    visibleTasks
      .filter((t) => t.status === "blocked")
      .slice(0, 2)
      .forEach((task) => {
        items.push({
          type: "task",
          label: `Blocked: ${task.title}`,
          severity: "error",
        });
      });

    return items;
  }, [sections, visibleTasks]);

  const nextActions = useMemo(() => {
    return visibleTasks
      .filter((task) => task.status !== "completed")
      .sort((a, b) => {
        // Sort by priority (critical > high > medium > low)
        const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      })
      .slice(0, 5);
  }, [visibleTasks]);

  // Days until target
  const daysUntilTarget = useMemo(() => {
    if (!pack?.target_submission_date) return null;
    const target = new Date(pack.target_submission_date);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [pack?.target_submission_date]);

  const handleCreatePack = async () => {
    if (!wizardState.name.trim()) return;
    setMutationError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/authorization-pack/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wizardState.name,
          templateType: wizardState.templateType,
          organizationId: "default-org",
          targetSubmissionDate: wizardState.targetSubmissionDate || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create pack");
      }
      const data = await response.json();
      setWizardState({ name: "", templateType: "payments-emi", targetSubmissionDate: "" });
      if (data?.pack?.id) {
        router.push(`/authorization-pack/workspace?packId=${data.pack.id}`);
      } else {
        await loadPack();
      }
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : "Failed to create pack. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!pack) return;
    setMutationError(null);

    // Store previous state for rollback
    const previousStatus = pack.status;

    // Optimistic update
    setPack((prev) => (prev ? { ...prev, status: newStatus } : null));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update pack status");
      }
    } catch (error) {
      // Rollback on error
      setPack((prev) => (prev ? { ...prev, status: previousStatus } : null));
      setMutationError(error instanceof Error ? error.message : "Failed to update status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertIcon className="h-5 w-5 text-red-500" />
              Dashboard unavailable
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadPack}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={null} readiness={null} />
        <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DocumentIcon className="h-5 w-5 text-teal-600" />
              Start a New Authorisation Pack
            </CardTitle>
            <CardDescription>
              Build a structured workspace to track your FCA business plan and review gates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Pack name</Label>
                <Input
                  value={wizardState.name}
                  onChange={(event) => setWizardState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="FCA Payments Authorisation Pack"
                />
              </div>
              <div className="space-y-2">
                <Label>Pack type</Label>
                <Select
                  value={wizardState.templateType}
                  onValueChange={(value) => setWizardState((prev) => ({ ...prev, templateType: value as PackType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pack type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length
                      ? templates.map((template) => (
                          <SelectItem key={template.id} value={template.type}>
                            {packTypeLabels[template.type]}
                          </SelectItem>
                        ))
                      : Object.entries(packTypeLabels).map(([type, label]) => (
                          <SelectItem key={type} value={type}>
                            {label}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target submission date</Label>
                <Input
                  type="date"
                  value={wizardState.targetSubmissionDate}
                  onChange={(event) => setWizardState((prev) => ({ ...prev, targetSubmissionDate: event.target.value }))}
                />
              </div>
            </div>
            {mutationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {mutationError}
                <button
                  onClick={() => setMutationError(null)}
                  className="ml-2 text-red-500 underline hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreatePack} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Pack"}
            </Button>
          </CardContent>
        </Card>

        {/* Feature highlights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                  <DocumentIcon className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">27 Gold Standard Topics</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete narrative prompts for each FCA requirement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <ChartIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Real-time Progress</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Track narrative and review completion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Review Workflow</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Client and consultant approval gates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      {/* Mutation Error Display */}
      {mutationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutationError}
          <button
            onClick={() => setMutationError(null)}
            className="ml-2 text-red-500 underline hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pack Status and Target */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pack Status</p>
                <div className="mt-1">
                  <Select value={pack.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PACK_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${opt.color}`}>
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Badge className={`text-sm ${getPackStatusColor(pack.status)}`}>
                {pack.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Target Submission</p>
                {pack.target_submission_date ? (
                  <>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(pack.target_submission_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {daysUntilTarget !== null && (
                      <p className={`text-xs ${daysUntilTarget < 14 ? "text-red-600" : daysUntilTarget < 30 ? "text-amber-600" : "text-slate-500"}`}>
                        {daysUntilTarget > 0 ? `${daysUntilTarget} days remaining` : daysUntilTarget === 0 ? "Due today" : `${Math.abs(daysUntilTarget)} days overdue`}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <TargetIcon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Progress Section */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left: Progress Overview */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartIcon className="h-5 w-5 text-teal-600" />
              Readiness Overview
            </CardTitle>
            <CardDescription>Track your progress across narrative and review gates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-around gap-8">
              <div className="text-center">
                <CircularProgress value={readiness?.overall ?? 0} color="teal" />
                <p className="mt-2 text-sm font-medium text-slate-700">Overall Readiness</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <p className="text-xs text-slate-500">Narrative</p>
                    <p className="text-lg font-semibold text-slate-900">{readiness?.narrative ?? 0}%</p>
                  </div>
                  <div className="w-32">
                    <Progress value={readiness?.narrative ?? 0} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <p className="text-xs text-slate-500">Review</p>
                    <p className="text-lg font-semibold text-green-600">{readiness?.review ?? 0}%</p>
                  </div>
                  <div className="w-32">
                    <Progress value={readiness?.review ?? 0} className="h-2 [&>div]:bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Stats */}
        <div className="space-y-4">
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Draft coverage</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  {sectionStats.completed} complete
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  {sectionStats.inProgress} in progress
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-slate-400">
                <CircleIcon className="h-4 w-4" />
                {sectionStats.notStarted} not started
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Tasks</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="text-center rounded-lg bg-slate-50 p-2">
                  <p className="text-lg font-semibold text-slate-900">{taskStats.total}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="text-center rounded-lg bg-green-50 p-2">
                  <p className="text-lg font-semibold text-green-600">{taskStats.completed}</p>
                  <p className="text-xs text-slate-500">Done</p>
                </div>
              </div>
              {taskStats.highPriority > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <AlertIcon className="h-3 w-3" />
                  {taskStats.highPriority} high priority pending
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Blockers and Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Blockers */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertIcon className="h-4 w-4 text-amber-500" />
              Blockers & Attention Items
            </CardTitle>
            <CardDescription>Issues requiring immediate attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockers.length ? (
              blockers.map((blocker, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    blocker.severity === "error"
                      ? "border border-red-200 bg-red-50 text-red-800"
                      : "border border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {blocker.label}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                <CheckCircleIcon className="h-4 w-4" />
                No blockers detected. Great progress!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Actions */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightIcon className="h-4 w-4 text-teal-500" />
              Next Actions
            </CardTitle>
            <CardDescription>Priority tasks to focus on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextActions.length ? (
              nextActions.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {["critical", "high"].includes(task.priority) ? (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    ) : task.priority === "medium" ? (
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.section_title ?? "General"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-slate-400">No pending tasks.</div>
            )}
            <Button asChild variant="outline" className="mt-2 w-full" size="sm">
              <Link href={pack ? `/authorization-pack/review?packId=${pack.id}` : "/authorization-pack/review"}>
                View Review Queue
                <ArrowRightIcon className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section Progress */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Draft Coverage</CardTitle>
          <CardDescription>Snapshot of narrative readiness across the pack.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sections.slice(0, 8).map((section) => {
              const status =
                section.narrativeCompletion >= 100
                  ? "completed"
                  : section.narrativeCompletion > 0
                  ? "in-progress"
                  : "not-started";
              return (
                <div
                  key={section.id}
                  className="group flex items-center gap-4 rounded-lg border border-slate-100 p-3 transition-all hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex-shrink-0">
                    {status === "completed" ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : status === "in-progress" ? (
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CircleIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 group-hover:text-teal-600">
                      {section.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            status === "completed"
                              ? "bg-green-500"
                              : status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-slate-200"
                          }`}
                          style={{ width: `${section.narrativeCompletion}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-slate-500">
                        {section.narrativeCompletion}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {sections.length > 8 && (
              <p className="pt-2 text-center text-sm text-slate-400">
                + {sections.length - 8} more sections
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
