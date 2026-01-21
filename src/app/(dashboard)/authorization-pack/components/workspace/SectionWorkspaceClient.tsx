"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// Constants
const AUTOSAVE_DELAY_MS = 800;

const PromptEditor = dynamic(
  () => import("./PromptEditor").then((mod) => mod.PromptEditor),
  { ssr: false }
);

// Icon components for better UX
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

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
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

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  review: number;
}

interface SectionNavItem {
  id: string;
  title: string;
  section_key: string;
  narrativeCompletion: number;
  status?: string;
}

interface PromptItem {
  id: string;
  prompt_key: string;
  title: string;
  guidance?: string | null;
  input_type: string;
  required: boolean;
  value?: string | null;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  owner_id?: string | null;
  due_date?: string | null;
  source?: string | null;
}

interface ReviewGate {
  id: string;
  stage: string;
  state: string;
  reviewer_role: string;
  notes?: string | null;
  client_notes?: string | null;
}

// Status and Priority options
const TASK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
];

const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
];

const REVIEW_STATE_OPTIONS = [
  { value: "pending", label: "Pending Review", color: "bg-slate-100 text-slate-700" },
  { value: "in_review", label: "In Review", color: "bg-blue-100 text-blue-700" },
  { value: "changes_requested", label: "Changes Requested", color: "bg-orange-100 text-orange-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
];

function getStatusBadgeColor(status: string, options: { value: string; color: string }[]) {
  const option = options.find((opt) => opt.value === status);
  return option?.color || "bg-slate-100 text-slate-700";
}

export function SectionWorkspaceClient() {
  const params = useParams();
  const sectionId = params?.sectionId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");

  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [sections, setSections] = useState<SectionNavItem[]>([]);
  const [sectionMeta, setSectionMeta] = useState<{ status: string; reviewState: string } | null>(null);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reviewGates, setReviewGates] = useState<ReviewGate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [savingPrompts, setSavingPrompts] = useState<Record<string, boolean | "error">>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, { notes: string; clientNotes: string }>>({});
  const [generatingPrompts, setGeneratingPrompts] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});

  // Cleanup timers and abort controllers on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach((timer) => clearTimeout(timer));
      Object.values(abortControllers.current).forEach((controller) => controller.abort());
    };
  }, []);

  useEffect(() => {
    const load = async () => {
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

        if (!activePack) return;

        if (packIdParam !== activePack.id) {
          router.replace(`/authorization-pack/sections/${sectionId}?packId=${activePack.id}`);
        }

        const [readinessResponse, sectionResponse, workspaceResponse] = await Promise.all([
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/sections`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/sections/${sectionId}`).catch(() => null),
        ]);

        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        if (sectionResponse?.ok) {
          const sectionData = await sectionResponse.json();
          setSections(sectionData.sections || []);
        }

        if (workspaceResponse?.ok) {
          const workspaceData = await workspaceResponse.json();
          setSectionMeta({
            status: workspaceData.section?.status || "not-started",
            reviewState: workspaceData.section?.review_state || "draft",
          });
          setPrompts(workspaceData.prompts || []);
          setTasks(workspaceData.tasks || []);
          setReviewGates(workspaceData.reviewGates || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [sectionId, packIdParam, router]);

  const navSections = useMemo(() => {
    const map = new Map<string, SectionNavItem>();
    sections.forEach((section) => {
      const key = section.section_key || section.title;
      const existing = map.get(key);
      if (!existing || section.id === sectionId) {
        map.set(key, section);
      }
    });
    return Array.from(map.values());
  }, [sections, sectionId]);

  const currentSection = useMemo(() => navSections.find((section) => section.id === sectionId), [navSections, sectionId]);
  const currentSectionIndex = useMemo(
    () => navSections.findIndex((section) => section.id === sectionId),
    [navSections, sectionId]
  );

  const handlePromptChange = (promptId: string, value: string) => {
    setPrompts((prev) => prev.map((prompt) => (prompt.id === promptId ? { ...prompt, value } : prompt)));
    setMutationError(null);

    // Clear existing timer and abort controller
    if (saveTimers.current[promptId]) {
      clearTimeout(saveTimers.current[promptId]);
    }
    if (abortControllers.current[promptId]) {
      abortControllers.current[promptId].abort();
    }

    setSavingPrompts((prev) => ({ ...prev, [promptId]: true }));

    saveTimers.current[promptId] = setTimeout(async () => {
      if (!pack) return;

      // Create new abort controller for this request
      const controller = new AbortController();
      abortControllers.current[promptId] = controller;

      try {
        const response = await fetch(`/api/authorization-pack/packs/${pack.id}/sections/${sectionId}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId, value }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to save response");
        }

        setSavingPrompts((prev) => ({ ...prev, [promptId]: false }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, ignore
          return;
        }
        setSavingPrompts((prev) => ({ ...prev, [promptId]: "error" }));
        setMutationError("Failed to save. Please try again.");
      }
    }, AUTOSAVE_DELAY_MS);
  };

  // AI-powered narrative generation
  const handleGenerateNarrative = useCallback(
    async (prompt: PromptItem, mode: "generate" | "enhance" = "generate") => {
      if (!pack || !sectionId) return;

      setGeneratingPrompts((prev) => ({ ...prev, [prompt.id]: true }));
      setAiError(null);

      try {
        const response = await fetch(
          `/api/authorization-pack/packs/${pack.id}/sections/${sectionId}/suggest`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              promptKey: prompt.prompt_key,
              promptTitle: prompt.title,
              promptGuidance: prompt.guidance,
              existingContent: mode === "enhance" ? prompt.value : undefined,
              sectionTemplate: currentSection?.title,
              mode,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate narrative");
        }

        // Stream the response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let content = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          // Update in real-time for visual feedback
          setPrompts((prev) =>
            prev.map((p) => (p.id === prompt.id ? { ...p, value: content } : p))
          );
        }

        // Trigger autosave after generation completes
        if (content) {
          handlePromptChange(prompt.id, content);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "AI generation failed";
        setAiError(message);
        console.error("AI generation error:", error);
      } finally {
        setGeneratingPrompts((prev) => ({ ...prev, [prompt.id]: false }));
      }
    },
    [pack, sectionId, currentSection?.title, handlePromptChange]
  );

  const handleTaskStatus = async (taskId: string, status: string) => {
    if (!pack) return;
    setMutationError(null);
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      setTasks(previousTasks); // Rollback
      setMutationError("Failed to update task. Please try again.");
      console.error("Task status update error:", error);
    }
  };

  const handleTaskPriority = async (taskId: string, priority: string) => {
    if (!pack) return;
    setMutationError(null);
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, priority } : task)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, priority }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task priority");
      }
    } catch (error) {
      setTasks(previousTasks); // Rollback
      setMutationError("Failed to update priority. Please try again.");
      console.error("Task priority update error:", error);
    }
  };

  const handleReviewStateChange = async (gateId: string, state: string) => {
    if (!pack) return;
    setMutationError(null);
    const previousReviewGates = [...reviewGates];
    const previousSectionMeta = sectionMeta;
    const payload = reviewNotes[gateId] || { notes: "", clientNotes: "" };

    // Optimistic update
    setReviewGates((prev) => {
      const updated = prev.map((gate) => (gate.id === gateId ? { ...gate, state } : gate));
      const states = updated.map((gate) => gate.state);
      setSectionMeta((current) => {
        if (!current) return current;
        let nextState = current.reviewState;
        if (states.some((item) => item === "changes_requested")) {
          nextState = "changes-requested";
        } else if (states.length && states.every((item) => item === "approved")) {
          nextState = "approved";
        } else if (states.some((item) => item === "approved")) {
          nextState = "in-review";
        }
        return { ...current, reviewState: nextState };
      });
      return updated;
    });

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, state, notes: payload.notes, clientNotes: payload.clientNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review state");
      }
    } catch (error) {
      setReviewGates(previousReviewGates); // Rollback
      setSectionMeta(previousSectionMeta);
      setMutationError("Failed to update review. Please try again.");
      console.error("Review state update error:", error);
    }
  };

  const handleReadyForReview = async () => {
    if (!pack) return;
    setMutationError(null);
    const previousSectionMeta = sectionMeta;
    const previousReviewGates = [...reviewGates];

    // Optimistic update
    setSectionMeta((current) => (current ? { ...current, reviewState: "ready" } : current));
    if (hasChangesRequested) {
      setReviewGates((prev) => prev.map((gate) => ({ ...gate, state: "pending" })));
    }

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewState: "ready", resetReview: hasChangesRequested }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit for review");
      }
    } catch (error) {
      setSectionMeta(previousSectionMeta); // Rollback
      setReviewGates(previousReviewGates);
      setMutationError("Failed to submit for review. Please try again.");
      console.error("Submit for review error:", error);
    }
  };

  // Section completion status helper
  const getSectionStatus = (section: SectionNavItem) => {
    if (section.narrativeCompletion >= 100) return "completed";
    if (section.narrativeCompletion > 0) return "in-progress";
    return "not-started";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading section workspace...
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
              Workspace unavailable
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pack || !currentSection) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            Select a section from the workspace list to begin.
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasChangesRequested = reviewGates.some((gate) => gate.state === "changes_requested");
  const reviewState = sectionMeta?.reviewState ?? "draft";
  const isLocked = ["ready", "in-review", "approved"].includes(reviewState) && !hasChangesRequested;
  const canSubmit = reviewState !== "approved" && !isLocked;
  const visibleTasks = tasks.filter((task) => task.source !== "auto-evidence");

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      {/* Section Header Card */}
      <Card className="border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Section {currentSectionIndex + 1} of {navSections.length}</span>
                <span>•</span>
                <span>{packTypeLabels[pack.template_type]}</span>
              </div>
              <CardTitle className="text-xl">{currentSection.title}</CardTitle>
              <CardDescription>
                Complete the narrative prompts and manage review for this section.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusBadgeColor(sectionMeta?.status || "not-started", [
                { value: "not-started", color: "bg-slate-100 text-slate-700" },
                { value: "in-progress", color: "bg-blue-100 text-blue-700" },
                { value: "completed", color: "bg-green-100 text-green-700" },
              ])}>
                {(sectionMeta?.status || "not-started").replace("-", " ")}
              </Badge>
              <Badge className={getStatusBadgeColor(reviewState.replace("-", "_"), REVIEW_STATE_OPTIONS)}>
                {reviewState.replace("-", " ")}
              </Badge>
              {canSubmit && (
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleReadyForReview}>
                  {reviewState === "changes-requested" ? "Resubmit for Review" : "Submit for Review"}
                </Button>
              )}
            </div>
          </div>
          {/* Section Progress Bar */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Section Progress</span>
              <span className="font-medium">{currentSection.narrativeCompletion}%</span>
            </div>
            <Progress value={currentSection.narrativeCompletion} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* 3-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr_340px]">
        {/* LEFT: Navigation Sidebar */}
        <Card className="border border-slate-200 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              All Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-4">
            {navSections.map((section, index) => {
              const status = getSectionStatus(section);
              const isActive = section.id === sectionId;
              return (
                <Link
                  key={section.id}
                  href={`/authorization-pack/sections/${section.id}?packId=${pack.id}`}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-teal-50 border border-teal-200"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {status === "completed" ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : status === "in-progress" ? (
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CircleIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  {/* Section Info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        isActive ? "text-teal-700" : "text-slate-700"
                      }`}
                    >
                      {index + 1}. {section.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-slate-100">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            status === "completed"
                              ? "bg-green-500"
                              : status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-slate-200"
                          }`}
                          style={{ width: `${section.narrativeCompletion}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{section.narrativeCompletion}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* CENTER: Narrative Editor */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DocumentIcon className="h-5 w-5 text-teal-600" />
              Narrative Prompts
            </CardTitle>
            <CardDescription>Complete each prompt to build the gold-standard narrative for this section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {mutationError && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <div className="flex items-center gap-2">
                  <AlertIcon className="h-4 w-4" />
                  {mutationError}
                </div>
                <button
                  onClick={() => setMutationError(null)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  &times;
                </button>
              </div>
            )}
            {aiError && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  AI: {aiError}
                </div>
                <button
                  onClick={() => setAiError(null)}
                  className="text-amber-600 hover:text-amber-800"
                  aria-label="Dismiss AI error"
                >
                  &times;
                </button>
              </div>
            )}
            {isLocked && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertIcon className="h-4 w-4" />
                This section is locked for review. Request changes from the review panel to edit again.
              </div>
            )}
            {prompts.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No prompts configured for this section yet.
              </div>
            ) : (
              prompts.map((prompt, index) => (
                <div key={prompt.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                          {index + 1}
                        </span>
                        <p className="font-semibold text-slate-900">{prompt.title}</p>
                      </div>
                      {prompt.guidance && (
                        <p className="ml-8 text-sm text-slate-500">{prompt.guidance}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* AI Generation Buttons */}
                      {!isLocked && (
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={generatingPrompts[prompt.id]}
                            onClick={() => handleGenerateNarrative(prompt, "generate")}
                            className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                            title="Generate AI draft"
                          >
                            {generatingPrompts[prompt.id] ? (
                              <span className="h-3 w-3 animate-spin rounded-full border border-teal-500 border-t-transparent" />
                            ) : (
                              <SparklesIcon className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline">
                              {generatingPrompts[prompt.id] ? "Generating..." : "Generate"}
                            </span>
                          </Button>
                          {prompt.value && prompt.value.length > 20 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={generatingPrompts[prompt.id]}
                              onClick={() => handleGenerateNarrative(prompt, "enhance")}
                              className="gap-1 text-slate-600 hover:text-teal-700"
                              title="Enhance existing content"
                            >
                              <SparklesIcon className="h-3 w-3" />
                              <span className="hidden sm:inline">Enhance</span>
                            </Button>
                          )}
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        className={prompt.required ? "border-red-200 text-red-600" : "text-slate-400"}
                      >
                        {prompt.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-8">
                    <PromptEditor
                      value={prompt.value ?? ""}
                      placeholder="Enter your narrative response here..."
                      onChange={(value) => handlePromptChange(prompt.id, value)}
                      disabled={isLocked || generatingPrompts[prompt.id]}
                    />
                    {generatingPrompts[prompt.id] && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-teal-600">
                        <SparklesIcon className="h-3 w-3 animate-pulse" />
                        AI is generating content...
                      </p>
                    )}
                    {savingPrompts[prompt.id] === true && !generatingPrompts[prompt.id] && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <span className="h-2 w-2 animate-spin rounded-full border border-slate-400 border-t-transparent" />
                        Saving...
                      </p>
                    )}
                    {savingPrompts[prompt.id] === "error" && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertIcon className="h-3 w-3" />
                        Failed to save
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Review + Tasks */}
        <div className="space-y-6">
          {/* Review Gates */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Review Gates</CardTitle>
              <CardDescription>Manage client and consultant review stages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviewGates.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-400">
                  No review gates configured for this section.
                </div>
              ) : (
                reviewGates.map((gate) => (
                  <div key={gate.id} className="space-y-3 rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {gate.stage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </p>
                        <p className="text-xs text-slate-500">{gate.reviewer_role} review</p>
                      </div>
                    </div>

                    {/* Review State Dropdown */}
                    <div>
                      <Label className="text-xs text-slate-500">Review Status</Label>
                      <Select
                        value={gate.state}
                        onValueChange={(value) => handleReviewStateChange(gate.id, value)}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REVIEW_STATE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${opt.color}`}>
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes Fields */}
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-slate-500">Internal Notes</Label>
                        <Textarea
                          className="mt-1 text-xs"
                          rows={2}
                          placeholder="Notes visible to consultants only..."
                          value={reviewNotes[gate.id]?.notes ?? ""}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({
                              ...prev,
                              [gate.id]: {
                                notes: e.target.value,
                                clientNotes: prev[gate.id]?.clientNotes ?? "",
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Client Notes</Label>
                        <Textarea
                          className="mt-1 text-xs"
                          rows={2}
                          placeholder="Notes visible to the client..."
                          value={reviewNotes[gate.id]?.clientNotes ?? ""}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({
                              ...prev,
                              [gate.id]: {
                                notes: prev[gate.id]?.notes ?? "",
                                clientNotes: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleReviewStateChange(gate.id, "changes_requested")}
                      >
                        Request Changes
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 text-xs hover:bg-green-700"
                        onClick={() => handleReviewStateChange(gate.id, "approved")}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Section Tasks</CardTitle>
              <CardDescription>Track tasks specific to this section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleTasks.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-400">
                  No tasks for this section.
                </div>
              ) : (
                visibleTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      {task.due_date && (
                        <span className="text-xs text-slate-400">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                    )}

                    {/* Status and Priority Dropdowns */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-500">Status</Label>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleTaskStatus(task.id, value)}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${opt.color}`}>
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Priority</Label>
                        <Select
                          value={task.priority}
                          onValueChange={(value) => handleTaskPriority(task.id, value)}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_PRIORITY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${opt.color}`}>
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
