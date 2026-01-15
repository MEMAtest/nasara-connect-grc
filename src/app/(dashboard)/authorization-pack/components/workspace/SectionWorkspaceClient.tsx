"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PromptEditor } from "./PromptEditor";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// Constants
const AUTOSAVE_DELAY_MS = 800;
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Sanitize filename to prevent XSS
function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"\/\\|?*\x00-\x1f]/g, "_").slice(0, 255);
}

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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
  evidence: number;
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

interface EvidenceItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  annex_number?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  uploaded_at?: string | null;
  version?: number | null;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  owner_id?: string | null;
  due_date?: string | null;
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

const EVIDENCE_STATUS_OPTIONS = [
  { value: "required", label: "Required", color: "bg-slate-100 text-slate-700" },
  { value: "pending", label: "Pending Upload", color: "bg-yellow-100 text-yellow-700" },
  { value: "uploaded", label: "Uploaded", color: "bg-blue-100 text-blue-700" },
  { value: "under_review", label: "Under Review", color: "bg-purple-100 text-purple-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
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

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reviewGates, setReviewGates] = useState<ReviewGate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [savingPrompts, setSavingPrompts] = useState<Record<string, boolean | "error">>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, { notes: string; clientNotes: string }>>({});
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState<Record<string, boolean>>({});
  const [generatingPrompts, setGeneratingPrompts] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<string | null>(null);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [evidenceGaps, setEvidenceGaps] = useState<{
    gaps: Array<{ description: string; priority: string; regulatoryBasis: string; suggestedFormat: string }>;
    completeness: number;
    suggestions: string[];
  } | null>(null);
  const [gapsError, setGapsError] = useState<string | null>(null);

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

        const workspaceResponse = await fetchWithTimeout(
          `/api/authorization-pack/packs/${activePack.id}/sections/${sectionId}`
        ).catch(() => null);
        if (workspaceResponse?.ok) {
          const workspaceData = await workspaceResponse.json();
          setSectionMeta({
            status: workspaceData.section?.status || "not-started",
            reviewState: workspaceData.section?.review_state || "draft",
          });
          setPrompts(workspaceData.prompts || []);
          setEvidence(workspaceData.evidence || []);
          setTasks(workspaceData.tasks || []);
          setReviewGates(workspaceData.reviewGates || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [sectionId, packIdParam, router]);

  const currentSection = useMemo(() => sections.find((section) => section.id === sectionId), [sections, sectionId]);
  const currentSectionIndex = useMemo(() => sections.findIndex((section) => section.id === sectionId), [sections, sectionId]);

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

  // AI-powered evidence gap analysis
  const analyzeEvidenceGaps = useCallback(async () => {
    if (!pack || !sectionId) return;
    setAnalyzingGaps(true);
    setGapsError(null);
    try {
      const response = await fetch(
        `/api/authorization-pack/packs/${pack.id}/sections/${sectionId}/evidence-gaps`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setGapsError(errorData.error || "Unable to analyze evidence gaps");
        return;
      }
      const data = await response.json();
      setEvidenceGaps(data);
    } catch (error) {
      setGapsError(error instanceof Error ? error.message : "Gap analysis failed");
    } finally {
      setAnalyzingGaps(false);
    }
  }, [pack, sectionId]);

  const handleEvidenceUpload = async (itemId: string, file: File) => {
    if (!pack) return;
    setMutationError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMutationError(`File must be under ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name);

    setUploadingEvidence((prev) => ({ ...prev, [itemId]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("evidenceItemId", itemId);

      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setEvidence((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, status: "uploaded", file_path: sanitizedName, file_size: file.size, file_type: file.type }
            : item
        )
      );
    } catch (error) {
      setMutationError("Failed to upload file. Please try again.");
      console.error("Evidence upload error:", error);
    } finally {
      setUploadingEvidence((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleEvidenceStatusChange = async (itemId: string, status: string) => {
    if (!pack) return;
    setMutationError(null);
    const previousEvidence = [...evidence];

    // Optimistic update
    setEvidence((prev) => prev.map((item) => (item.id === itemId ? { ...item, status } : item)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update evidence status");
      }
    } catch (error) {
      setEvidence(previousEvidence); // Rollback
      setMutationError("Failed to update status. Please try again.");
      console.error("Evidence status update error:", error);
    }
  };

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

  const handleDrag = useCallback((e: React.DragEvent, itemId: string, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(entering ? itemId : null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, itemId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(null);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleEvidenceUpload(itemId, files[0]);
      }
    },
    [pack, sectionId]
  );

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

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      {/* Section Header Card */}
      <Card className="border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Section {currentSectionIndex + 1} of {sections.length}</span>
                <span>•</span>
                <span>{packTypeLabels[pack.template_type]}</span>
              </div>
              <CardTitle className="text-xl">{currentSection.title}</CardTitle>
              <CardDescription>
                Complete the narrative prompts and upload required evidence for this section.
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
            {sections.map((section, index) => {
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

        {/* RIGHT: Evidence + Review + Tasks */}
        <div className="space-y-6">
          {/* Evidence Checklist */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UploadIcon className="h-4 w-4 text-teal-600" />
                    Evidence Checklist
                    {evidenceGaps && (
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        evidenceGaps.completeness >= 80 ? "bg-green-100 text-green-700" :
                        evidenceGaps.completeness >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {evidenceGaps.completeness}%
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>Upload and manage required documentation.</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeEvidenceGaps}
                  disabled={analyzingGaps}
                  className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  {analyzingGaps ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border border-teal-500 border-t-transparent" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-3 w-3" />
                      Check Gaps
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Evidence Gaps Analysis Results */}
              {gapsError && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span>AI: {gapsError}</span>
                  <button onClick={() => setGapsError(null)} className="text-amber-600 hover:text-amber-800">
                    &times;
                  </button>
                </div>
              )}
              {evidenceGaps && evidenceGaps.gaps.length > 0 && (
                <div className="space-y-2 rounded-lg border border-teal-200 bg-teal-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-medium text-teal-800">
                      <SparklesIcon className="h-3 w-3" />
                      AI Identified Gaps ({evidenceGaps.gaps.length})
                    </span>
                    <button onClick={() => setEvidenceGaps(null)} className="text-teal-600 hover:text-teal-800">
                      &times;
                    </button>
                  </div>
                  <div className="space-y-2">
                    {evidenceGaps.gaps.slice(0, 5).map((gap, idx) => (
                      <div key={idx} className="rounded border border-teal-200 bg-white p-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-slate-800">{gap.description}</p>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            gap.priority === "high" ? "bg-red-100 text-red-700" :
                            gap.priority === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {gap.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {gap.regulatoryBasis} • Format: {gap.suggestedFormat}
                        </p>
                      </div>
                    ))}
                  </div>
                  {evidenceGaps.suggestions?.length > 0 && (
                    <div className="mt-2 border-t border-teal-200 pt-2">
                      <p className="text-[10px] font-medium text-teal-700">Suggestions:</p>
                      <ul className="mt-1 space-y-0.5">
                        {evidenceGaps.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <li key={idx} className="text-[10px] text-teal-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {evidence.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-400">
                  No evidence requirements for this section.
                </div>
              ) : (
                evidence.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 transition-all ${
                      dragActive === item.id
                        ? "border-teal-400 bg-teal-50"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                    onDragEnter={(e) => handleDrag(e, item.id, true)}
                    onDragLeave={(e) => handleDrag(e, item.id, false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                        )}
                      </div>
                      {item.annex_number && (
                        <Badge variant="outline" className="text-xs">
                          {item.annex_number}
                        </Badge>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="mt-2">
                      <Label className="text-xs text-slate-500">Status</Label>
                      <Select
                        value={item.status}
                        onValueChange={(value) => handleEvidenceStatusChange(item.id, value)}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVIDENCE_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${opt.color}`}>
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* File Upload Area */}
                    <div className="mt-3 space-y-2">
                      {item.file_path ? (
                        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <DocumentIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700">{item.file_path}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">v{item.version ?? 1}</span>
                            <span className="text-slate-400">{formatFileSize(item.file_size)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-md border-2 border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                          <div>
                            <UploadIcon className="mx-auto h-6 w-6" />
                            <p className="mt-1">Drop file here or click to upload</p>
                          </div>
                        </div>
                      )}
                      <Input
                        type="file"
                        disabled={isLocked}
                        className="text-xs"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleEvidenceUpload(item.id, file);
                        }}
                      />
                    </div>

                    {/* Download Button */}
                    {item.file_path && (
                      <Button asChild size="sm" variant="outline" className="mt-2 w-full text-xs">
                        <a href={`/api/authorization-pack/packs/${pack.id}/evidence/${item.id}`}>
                          Download Current Version
                        </a>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

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
              {tasks.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-400">
                  No tasks for this section.
                </div>
              ) : (
                tasks.map((task) => (
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
