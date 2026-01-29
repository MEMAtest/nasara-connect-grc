"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { TimelineProgress } from "./TimelineProgress";
import { ChecklistCards } from "./ChecklistCards";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Calendar, FileText, BarChart3, Download, Target } from "lucide-react";
import { type ChecklistItemStatus } from "@/lib/fca-api-checklist";
import {
  isValidChecklistResponse,
  isValidProjectResponse,
  isValidReadinessResponse,
} from "@/lib/checklist-constants";

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

interface TemplateSummary {
  id: string;
  type: PackType;
  name: string;
  description: string | null;
}

interface ProjectSummary {
  id: string;
  name: string;
}

interface ProjectPlan {
  startDate?: string;
  totalWeeks?: number;
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

export function OverviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");

  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [checklistStatuses, setChecklistStatuses] = useState<Record<string, ChecklistItemStatus>>({});

  const [wizardState, setWizardState] = useState({
    name: "",
    templateType: "payments-emi" as PackType,
    targetSubmissionDate: "",
  });

  const loadPack = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const packResponse = await fetchWithTimeout("/api/authorization-pack/packs").catch(
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

        const [readinessResponse, projectResponse, checklistResponse] = await Promise.all([
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/project`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/checklist`).catch(() => null),
        ]);

        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          // Validate response before using
          if (isValidReadinessResponse(readinessData)) {
            setReadiness(readinessData.readiness);
          } else {
            console.warn("Invalid readiness response format:", readinessData);
          }
        }

        if (projectResponse?.ok) {
          const projectData = await projectResponse.json();
          // Validate response before using
          if (isValidProjectResponse(projectData)) {
            setProject(projectData.project || null);
            // Also fetch project plan if project exists
            if (projectData.project?.id) {
              const planResponse = await fetchWithTimeout(
                `/api/authorization-pack/projects/${projectData.project.id}`
              ).catch(() => null);
              if (planResponse?.ok) {
                const planData = await planResponse.json();
                setProjectPlan(planData.project?.projectPlan || null);
              }
            }
          } else {
            console.warn("Invalid project response format:", projectData);
          }
        }

        if (checklistResponse?.ok) {
          const checklistData = await checklistResponse.json();
          // Validate response before using
          if (isValidChecklistResponse(checklistData)) {
            setChecklistStatuses(checklistData.checklist as Record<string, ChecklistItemStatus>);
          } else {
            console.warn("Invalid checklist response format:", checklistData);
          }
        }
      } else {
        setReadiness(null);
        setProject(null);
        setProjectPlan(null);
        setChecklistStatuses({});
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

  // Calculate days until target
  const daysUntilTarget = pack?.target_submission_date
    ? Math.ceil(
        (new Date(pack.target_submission_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

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
    const previousStatus = pack.status;
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
      setPack((prev) => (prev ? { ...prev, status: previousStatus } : null));
      setMutationError(error instanceof Error ? error.message : "Failed to update status. Please try again.");
    }
  };

  // Handler for checklist status updates (for syncing timeline progress)
  const handleChecklistStatusChange = (itemId: string, status: ChecklistItemStatus) => {
    setChecklistStatuses((prev) => ({ ...prev, [itemId]: status }));
  };

  // Loading state
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

  // Error state
  if (loadError) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">Dashboard unavailable</CardTitle>
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

  // No pack - show create wizard
  if (!pack) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={null} readiness={null} />
        <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Start a New Authorisation Pack
            </CardTitle>
            <CardDescription>
              Build a structured workspace to track your FCA business plan and documentation.
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
      </div>
    );
  }

  // Main dashboard with pack
  const exportHref = `/authorization-pack/export?packId=${pack.id}`;
  const planHref = project ? `/authorization-pack/${project.id}/plan` : null;

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

      {/* Quick Actions Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Status Card */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Status</p>
                <Select value={pack.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 mt-1 text-sm">
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
          </CardContent>
        </Card>

        {/* Target Date Card */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Target Date</p>
                {pack.target_submission_date ? (
                  <>
                    <p className="font-semibold text-slate-900">
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
            </div>
          </CardContent>
        </Card>

        {/* View Plan Card */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">View Plan</p>
                {planHref ? (
                  <Button asChild variant="outline" size="sm" className="mt-1 h-8 text-xs">
                    <Link href={planHref}>Open Gantt</Link>
                  </Button>
                ) : (
                  <p className="text-sm text-slate-400 mt-1">No project linked</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Card */}
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Download className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Export</p>
                <Button asChild variant="outline" size="sm" className="mt-1 h-8 text-xs">
                  <Link href={exportHref}>Export PDF</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline */}
      <TimelineProgress
        statuses={checklistStatuses}
        startDate={projectPlan?.startDate}
        selectedPhase={selectedPhase}
        onPhaseSelect={setSelectedPhase}
      />

      {/* Documentation Checklist Cards */}
      <ChecklistCards
        packId={pack.id}
        selectedPhase={selectedPhase}
        initialStatuses={checklistStatuses}
        onStatusChange={handleChecklistStatusChange}
      />
    </div>
  );
}
