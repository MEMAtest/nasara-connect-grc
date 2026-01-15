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

  const phaseGroups = useMemo(() => {
    const groups = new Map<string, ProjectMilestone[]>();
    milestones.forEach((milestone) => {
      const list = groups.get(milestone.phase) || [];
      list.push(milestone);
      groups.set(milestone.phase, list);
    });
    return Array.from(groups.entries()).sort((a, b) => getPhaseIndex(a[0]) - getPhaseIndex(b[0]));
  }, [milestones]);

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
        <CardContent className="p-8 text-center text-slate-500">Loading plan...</CardContent>
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

      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Project plan</CardTitle>
            <CardDescription>Generated {plan.generatedAt ? new Date(plan.generatedAt).toLocaleDateString("en-GB") : "recently"}.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-200 text-slate-600">
              {totalWeeks} weeks
            </Badge>
            <Button variant="outline" onClick={generatePlan} disabled={isGenerating}>
              {isGenerating ? "Regenerating..." : "Regenerate plan"}
            </Button>
            {project.packId ? (
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href={`/authorization-pack/sections?packId=${project.packId}`}>Open workspace</Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {phaseGroups.map(([phase, items]) => (
          <Card key={phase} className="border border-slate-200">
            <CardHeader>
              <CardTitle>{phase}</CardTitle>
              <CardDescription>{items.length} milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((milestone) => {
                const left = ((milestone.startWeek - 1) / totalWeeks) * 100;
                const width = (milestone.durationWeeks / totalWeeks) * 100;
                const safeWidth = Math.max(4, width);
                return (
                  <div key={milestone.id} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{milestone.title}</p>
                        <p className="text-xs text-slate-500">{milestone.description}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Week {milestone.startWeek} - {milestone.endWeek}</p>
                        <p>Due {milestone.dueDate}</p>
                      </div>
                    </div>
                    <div className="relative h-3 rounded-full bg-slate-200">
                      <div
                        className="absolute h-3 rounded-full bg-teal-500"
                        style={{ left: `${left}%`, width: `${safeWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
