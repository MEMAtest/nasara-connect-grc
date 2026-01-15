"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PromptEditor } from "./PromptEditor";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

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
  status: string;
  priority: string;
  owner_id?: string | null;
}

interface ReviewGate {
  id: string;
  stage: string;
  state: string;
  reviewer_role: string;
  notes?: string | null;
  client_notes?: string | null;
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
  const [savingPrompts, setSavingPrompts] = useState<Record<string, boolean>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, { notes: string; clientNotes: string }>>({});

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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
  }, [sectionId, packIdParam]);

  const currentSection = useMemo(() => sections.find((section) => section.id === sectionId), [sections, sectionId]);

  const handlePromptChange = (promptId: string, value: string) => {
    setPrompts((prev) => prev.map((prompt) => (prompt.id === promptId ? { ...prompt, value } : prompt)));
    if (saveTimers.current[promptId]) {
      clearTimeout(saveTimers.current[promptId]);
    }
    setSavingPrompts((prev) => ({ ...prev, [promptId]: true }));
    saveTimers.current[promptId] = setTimeout(async () => {
      if (!pack) return;
      await fetch(`/api/authorization-pack/packs/${pack.id}/sections/${sectionId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, value }),
      });
      setSavingPrompts((prev) => ({ ...prev, [promptId]: false }));
    }, 800);
  };

  const handleEvidenceUpload = async (itemId: string, file: File) => {
    if (!pack) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("evidenceItemId", itemId);

    const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      setEvidence((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: "uploaded", file_path: file.name } : item
        )
      );
    }
  };

  const handleTaskStatus = async (taskId: string, status: string) => {
    if (!pack) return;
    await fetch(`/api/authorization-pack/packs/${pack.id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  const handleReviewUpdate = async (gateId: string, state: string) => {
    if (!pack) return;
    const notes = reviewNotes[gateId]?.notes ?? "";
    const clientNotes = reviewNotes[gateId]?.clientNotes ?? "";

    await fetch(`/api/authorization-pack/packs/${pack.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateId, state, notes, clientNotes }),
    });
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
  };

  const handleReadyForReview = async () => {
    if (!pack) return;
    await fetch(`/api/authorization-pack/packs/${pack.id}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewState: "ready", resetReview: hasChangesRequested }),
    });
    setSectionMeta((current) => (current ? { ...current, reviewState: "ready" } : current));
    if (hasChangesRequested) {
      setReviewGates((prev) => prev.map((gate) => ({ ...gate, state: "pending" })));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading section workspace...</CardContent>
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
            <CardTitle>Workspace unavailable</CardTitle>
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
  const isLocked =
    ["ready", "in-review", "approved"].includes(reviewState) && !hasChangesRequested;
  const canSubmit = reviewState !== "approved" && !isLocked;

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>{currentSection.title}</CardTitle>
              <CardDescription>{packTypeLabels[pack.template_type]} section workspace.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{(sectionMeta?.status || "not-started").replace("-", " ")}</Badge>
              <Badge variant="outline">{reviewState.replace("-", " ")}</Badge>
              {canSubmit ? (
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleReadyForReview}>
                  {reviewState === "changes-requested" ? "Resubmit for review" : "Mark ready for review"}
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr_320px]">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-500">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                asChild
                variant={section.id === sectionId ? "default" : "outline"}
                className="w-full justify-start"
              >
                <Link
                  href={`/authorization-pack/sections/${section.id}?packId=${pack.id}`}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <span className="truncate">{section.title}</span>
                  <span className="text-xs text-slate-400">{section.narrativeCompletion}%</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Narrative prompts</CardTitle>
            <CardDescription>Capture the gold standard narrative for this section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLocked ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                This section is locked for review. Request changes to edit again.
              </div>
            ) : null}
            {prompts.map((prompt) => (
              <div key={prompt.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{prompt.title}</p>
                    {prompt.guidance ? (
                      <p className="text-xs text-slate-500">{prompt.guidance}</p>
                    ) : null}
                  </div>
                  {prompt.required ? (
                    <Badge variant="outline" className="text-slate-500">Required</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400">Optional</Badge>
                  )}
                </div>
                <PromptEditor
                  value={prompt.value ?? ""}
                  placeholder="Paste your narrative here..."
                  onChange={(value) => handlePromptChange(prompt.id, value)}
                  disabled={isLocked}
                />
                {savingPrompts[prompt.id] ? (
                  <p className="text-xs text-slate-400">Saving...</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle>Evidence checklist</CardTitle>
              <CardDescription>Upload required annexes for this section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidence.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <Badge variant="outline" className="text-slate-500">
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label className="text-xs text-slate-500">Upload evidence</Label>
                    <Input
                      type="file"
                      disabled={isLocked}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleEvidenceUpload(item.id, file);
                      }}
                    />
                    <p className="text-xs text-slate-400">
                      {item.annex_number ? `${item.annex_number} · ` : ""}Version {item.version ?? 0}
                    </p>
                    {item.file_path ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={`/api/authorization-pack/packs/${pack.id}/evidence/${item.id}`}>Download</a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle>Review gates</CardTitle>
              <CardDescription>Client and consultant review stages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewGates.map((gate) => (
                <div key={gate.id} className="space-y-2 rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{gate.stage.replace("-", " ")}</p>
                    <Badge variant="outline">{gate.state.replace("-", " ")}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Internal notes</Label>
                    <Textarea
                      value={reviewNotes[gate.id]?.notes ?? ""}
                      onChange={(event) =>
                        setReviewNotes((prev) => ({
                          ...prev,
                          [gate.id]: {
                            notes: event.target.value,
                            clientNotes: prev[gate.id]?.clientNotes ?? "",
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Client-visible notes</Label>
                    <Textarea
                      value={reviewNotes[gate.id]?.clientNotes ?? ""}
                      onChange={(event) =>
                        setReviewNotes((prev) => ({
                          ...prev,
                          [gate.id]: {
                            notes: prev[gate.id]?.notes ?? "",
                            clientNotes: event.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleReviewUpdate(gate.id, "changes_requested")}>
                      Request changes
                    </Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => handleReviewUpdate(gate.id, "approved")}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Section-specific tasks and status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <Select value={task.status} onValueChange={(value) => handleTaskStatus(task.id, value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
