"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasaraLoader } from "@/components/ui/nasara-loader";
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

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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
  sectionInstanceId?: string | null;
  due_date?: string | null;
  source?: string | null;
}

interface ReviewGate {
  id: string;
  stage: string;
  state: string;
  section_title: string;
  section_instance_id?: string;
}

interface TemplateSummary {
  id: string;
  type: PackType;
  name: string;
  description: string | null;
}

const QUICK_CHECKLIST = [
  { id: "firm-profile", category: "Documents", label: "Firm profile complete (legal entity, permissions, scope)" },
  { id: "business-plan", category: "Documents", label: "Business plan narrative drafted" },
  { id: "financial-forecasts", category: "Documents", label: "Financial forecasts (3-year) uploaded" },
  { id: "wind-down", category: "Documents", label: "Wind-down plan prepared" },
  { id: "psd-individuals", category: "Governance", label: "PSD/key persons identified and documented" },
  { id: "controllers", category: "Governance", label: "Controllers list verified (10%/20%/33%/50%)" },
  { id: "governance-forums", category: "Governance", label: "Governance forums and committees documented" },
  { id: "risk-register", category: "Governance", label: "Risk register completed" },
  { id: "cmp", category: "Governance", label: "Compliance Monitoring Plan (CMP) approved" },
  { id: "aml-ctf", category: "Policies", label: "AML/CTF policy approved" },
  { id: "safeguarding", category: "Policies", label: "Safeguarding policy in place (if applicable)" },
  { id: "complaints", category: "Policies", label: "Complaints handling policy approved" },
  { id: "fin-promotions", category: "Policies", label: "Financial promotions policy approved" },
  { id: "outsourcing", category: "Policies", label: "Outsourcing & third-party risk policy approved" },
  { id: "info-security", category: "Policies", label: "Information & cyber security policy approved" },
  { id: "op-resilience", category: "Operational", label: "Operational resilience & incident response documented" },
  { id: "consumer-duty", category: "Operational", label: "Consumer duty & vulnerable customers plan documented" },
  { id: "evidence-pack", category: "Operational", label: "Evidence pack assembled for FCA submission" },
];

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

const clampPercent = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
};

// Circular progress component
function CircularProgress({ value, size = 120, strokeWidth = 8, color = "teal" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const clampedValue = clampPercent(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

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
        <span className="text-2xl font-bold text-slate-900">{clampedValue}%</span>
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
  const [review, setReview] = useState<ReviewGate[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [compactView, setCompactView] = useState(true);
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
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() =>
    QUICK_CHECKLIST.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

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
        const [readinessResponse, sectionResponse, taskResponse, reviewResponse] = await Promise.all([
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/sections`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/tasks`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/review`).catch(() => null),
        ]);

        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        if (sectionResponse?.ok) {
          const sectionData = await sectionResponse.json();
          setSections(sectionData.sections || []);
        }

        if (taskResponse?.ok) {
          const taskData = await taskResponse.json();
          setTasks(taskData.tasks || []);
        }

        if (reviewResponse?.ok) {
          const reviewData = await reviewResponse.json();
          setReview(reviewData.review || []);
        } else {
          setReview([]);
        }
      } else {
        setReadiness(null);
        setSections([]);
        setTasks([]);
        setReview([]);
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

  const readinessSummary = readiness
    ? {
        overall: clampPercent(readiness.overall),
        narrative: clampPercent(readiness.narrative),
        review: clampPercent(readiness.review),
      }
    : null;

  const uniqueSections = useMemo(() => {
    const seen = new Set<string>();
    return sections.filter((section) => {
      const key = section.section_key || section.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sections]);

  // Section statistics
  const sectionStats = useMemo(() => {
    if (!uniqueSections.length) return { completed: 0, inProgress: 0, notStarted: 0 };
    return {
      completed: uniqueSections.filter((s) => s.narrativeCompletion >= 100).length,
      inProgress: uniqueSections.filter((s) => s.narrativeCompletion > 0 && s.narrativeCompletion < 100).length,
      notStarted: uniqueSections.filter((s) => s.narrativeCompletion === 0).length,
    };
  }, [uniqueSections]);

  const incompleteSections = useMemo(() => {
    return uniqueSections.filter((section) => section.narrativeCompletion < 100);
  }, [uniqueSections]);

  const nextSection = incompleteSections[0] || uniqueSections[0] || null;

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

  const reviewStats = useMemo(() => {
    return {
      total: review.length,
      pending: review.filter((r) => r.state === "pending").length,
      inReview: review.filter((r) => r.state === "in-review").length,
      changesRequested: review.filter((r) => r.state === "changes_requested").length,
      approved: review.filter((r) => r.state === "approved").length,
    };
  }, [review]);

  const reviewActionItems = useMemo(() => {
    const order: Record<string, number> = {
      changes_requested: 0,
      pending: 1,
      "in-review": 2,
      approved: 3,
    };
    return [...review]
      .filter((item) => item.state !== "approved")
      .sort((a, b) => (order[a.state] ?? 99) - (order[b.state] ?? 99))
      .slice(0, 6);
  }, [review]);

  const checklistGroups = useMemo(() => {
    const groups = new Map<string, typeof QUICK_CHECKLIST>();
    QUICK_CHECKLIST.forEach((item) => {
      const existing = groups.get(item.category) ?? [];
      existing.push(item);
      groups.set(item.category, existing);
    });
    return Array.from(groups.entries());
  }, []);

  const completedChecklistCount = QUICK_CHECKLIST.filter((item) => checklistState[item.id]).length;
  const toggleChecklistItem = (id: string) => {
    setChecklistState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const blockers = useMemo(() => {
    if (!uniqueSections.length) return [];
    const items: { type: string; label: string; severity: "warning" | "error" }[] = [];

    // Pending reviews
    uniqueSections
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
  }, [uniqueSections, visibleTasks]);

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

  const handleReviewUpdate = async (gateId: string, state: string) => {
    if (!pack) return;
    setMutationError(null);

    const previousReview = [...review];
    setReview((prev) => prev.map((item) => (item.id === gateId ? { ...item, state } : item)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, state }),
      });
      if (!response.ok) {
        throw new Error("Failed to update review status");
      }
    } catch (error) {
      setReview(previousReview);
      setMutationError(error instanceof Error ? error.message : "Failed to update review status.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8">
            <NasaraLoader label="Loading dashboard..." />
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

  if (compactView) {
    const reviewHref = pack
      ? `/authorization-pack/workspace?packId=${pack.id}#review`
      : "/authorization-pack/workspace#review";
    const exportHref = pack ? `/authorization-pack/export?packId=${pack.id}` : "/authorization-pack/export";
    const taskHref = (task: TaskItem) => {
      if (task.sectionInstanceId) {
        return pack
          ? `/authorization-pack/sections/${task.sectionInstanceId}?packId=${pack.id}`
          : `/authorization-pack/sections/${task.sectionInstanceId}`;
      }
      return reviewHref;
    };

    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />

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
                        <p
                          className={`text-xs ${
                            daysUntilTarget < 14
                              ? "text-red-600"
                              : daysUntilTarget < 30
                              ? "text-amber-600"
                              : "text-slate-500"
                          }`}
                        >
                          {daysUntilTarget > 0
                            ? `${daysUntilTarget} days remaining`
                            : daysUntilTarget === 0
                            ? "Due today"
                            : `${Math.abs(daysUntilTarget)} days overdue`}
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

        <Card className="border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightIcon className="h-4 w-4 text-teal-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Jump into the key workspace areas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {nextSection ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/authorization-pack/sections/${nextSection.id}?packId=${pack.id}`}>
                  Open next section
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={reviewHref}>Review Checklist</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={exportHref}>Export Pack</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ChartIcon className="h-4 w-4 text-teal-600" />
                Readiness Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Overall</span>
                <span className="font-semibold text-slate-900">{readinessSummary?.overall ?? 0}%</span>
              </div>
              <Progress value={readinessSummary?.overall ?? 0} className="h-2" />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Narrative {readinessSummary?.narrative ?? 0}%</span>
                <span>Review {readinessSummary?.review ?? 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold text-slate-900">{taskStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span className="font-semibold text-slate-900">{taskStats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Blocked</span>
                <span className="font-semibold text-slate-900">{taskStats.blocked}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                <Link href={reviewHref}>Open Review</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertIcon className="h-4 w-4 text-amber-500" />
                Blockers
              </CardTitle>
              <CardDescription>Issues needing attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              {blockers.length ? (
                blockers.map((blocker, index) => (
                  <div
                    key={index}
                    className={`rounded-md border px-3 py-2 ${
                      blocker.severity === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {blocker.label}
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700">
                  No blockers detected.
                </div>
              )}
            </CardContent>
          </Card>

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
                  <Link
                    key={task.id}
                    href={taskHref(task)}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm hover:border-slate-200"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.section_title ?? "General"}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.status.replace(/_/g, " ")}
                    </Badge>
                  </Link>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-slate-400">No pending tasks.</div>
              )}
              <Button asChild variant="outline" className="mt-2 w-full" size="sm">
                <Link href={reviewHref}>
                  View Review Queue
                  <ArrowRightIcon className="ml-1.5 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div id="review">
          <Card className="border border-slate-200">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Review &amp; Sign-off</CardTitle>
                <CardDescription>Track approvals and confirm submission readiness.</CardDescription>
              </div>
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {reviewStats.approved}/{reviewStats.total} approved
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <Badge variant="outline">Pending {reviewStats.pending}</Badge>
                <Badge variant="outline">In review {reviewStats.inReview}</Badge>
                <Badge variant="outline">Changes {reviewStats.changesRequested}</Badge>
              </div>
              {reviewActionItems.length ? (
                reviewActionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.section_title}</p>
                      <p className="text-xs text-slate-500">
                        {item.stage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={item.state} onValueChange={(value) => handleReviewUpdate(item.id, value)}>
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-review">In Review</SelectItem>
                          <SelectItem value="changes_requested">Changes Requested</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      {item.section_instance_id ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/authorization-pack/sections/${item.section_instance_id}?packId=${pack.id}`}>
                            Open Section
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  All review items are approved.
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Checklist: {completedChecklistCount}/{QUICK_CHECKLIST.length} complete
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowChecklist((prev) => !prev)}>
                  {showChecklist ? "Hide checklist" : "Show checklist"}
                </Button>
              </div>
              {showChecklist ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {checklistGroups.map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category}</p>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <label key={item.id} className="flex items-start gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600"
                              checked={Boolean(checklistState[item.id])}
                              onChange={() => toggleChecklistItem(item.id)}
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setCompactView(true)}>
          Switch to lean view
        </Button>
      </div>

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
                <CircularProgress value={readinessSummary?.overall ?? 0} color="teal" />
                <p className="mt-2 text-sm font-medium text-slate-700">Overall Readiness</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <p className="text-xs text-slate-500">Narrative</p>
                    <p className="text-lg font-semibold text-slate-900">{readinessSummary?.narrative ?? 0}%</p>
                  </div>
                  <div className="w-32">
                    <Progress value={readinessSummary?.narrative ?? 0} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <p className="text-xs text-slate-500">Review</p>
                    <p className="text-lg font-semibold text-green-600">{readinessSummary?.review ?? 0}%</p>
                  </div>
                  <div className="w-32">
                    <Progress value={readinessSummary?.review ?? 0} className="h-2 [&>div]:bg-green-500" />
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
              <Link
                href={pack ? `/authorization-pack/workspace?packId=${pack.id}#review` : "/authorization-pack/workspace#review"}
              >
                View Review Queue
                <ArrowRightIcon className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
