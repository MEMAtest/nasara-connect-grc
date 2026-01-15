"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
  target_submission_date?: string | null;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

interface SectionSummary {
  id: string;
  title: string;
  section_key: string;
  narrativeCompletion: number;
  evidenceCompletion: number;
  reviewCompletion: number;
  evidenceUploaded: number;
  evidenceTotal: number;
  reviewApproved: number;
  reviewTotal: number;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  section_title?: string | null;
}

interface TemplateSummary {
  id: string;
  type: PackType;
  name: string;
  description: string | null;
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

  const blockers = useMemo(() => {
    if (!sections.length) return [];
    const missingEvidence = sections
      .filter((section) => section.evidenceTotal > section.evidenceUploaded)
      .map((section) => ({
        label: `${section.title}: ${section.evidenceTotal - section.evidenceUploaded} evidence items missing`,
      }));
    const reviewHold = sections
      .filter((section) => section.reviewTotal > section.reviewApproved)
      .map((section) => ({
        label: `${section.title}: awaiting review`,
      }));
    return [...missingEvidence.slice(0, 3), ...reviewHold.slice(0, 2)];
  }, [sections]);

  const nextActions = useMemo(() => {
    return tasks.filter((task) => task.status !== "completed").slice(0, 6);
  }, [tasks]);

  const handleCreatePack = async () => {
    if (!wizardState.name.trim()) return;
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
    if (response.ok) {
      const data = await response.json();
      setWizardState({ name: "", templateType: "payments-emi", targetSubmissionDate: "" });
      if (data?.pack?.id) {
        router.push(`/authorization-pack/workspace?packId=${data.pack.id}`);
      } else {
        await loadPack();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading workspace...</CardContent>
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
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Start a New Authorisation Pack</CardTitle>
            <CardDescription>
              Build a structured workspace to track your gold standard business plan and evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreatePack}>
              Create Pack
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Readiness Snapshot</CardTitle>
            <CardDescription>Gold standard completion by narrative, evidence, and review gates.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Narrative</p>
              <p className="text-2xl font-semibold text-slate-900">{readiness?.narrative ?? 0}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Evidence</p>
              <p className="text-2xl font-semibold text-slate-900">{readiness?.evidence ?? 0}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Review gates</p>
              <p className="text-2xl font-semibold text-slate-900">{readiness?.review ?? 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Top blockers</CardTitle>
            <CardDescription>Items preventing readiness progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockers.length ? (
              blockers.map((blocker, index) => (
                <div key={index} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {blocker.label}
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No blockers detected.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Next actions</CardTitle>
          <CardDescription>Focus on the highest impact tasks this week.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {nextActions.length ? (
            nextActions.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.section_title ?? "General task"}</p>
                </div>
                <Badge variant="outline" className="text-slate-600">
                  {task.status.replace("-", " ")}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">No actions queued yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
