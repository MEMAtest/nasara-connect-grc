"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRegisterItems } from "@/lib/authorization-pack-integrations";
import { ProjectHeader } from "./ProjectHeader";
import { CheckCircle2, Circle } from "lucide-react";

interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

interface SectionSummary {
  id: string;
  title: string;
  narrativeCompletion: number;
  evidenceCompletion: number;
  reviewCompletion: number;
}

interface ProjectDetail {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
  packName?: string | null;
  packStatus?: string | null;
  packTemplateName?: string | null;
  typicalTimelineWeeks?: number | null;
  policyTemplates?: string[];
  trainingRequirements?: string[];
  smcrRoles?: string[];
  readiness?: ReadinessSummary | null;
  sections?: SectionSummary[];
  assessmentData?: Record<string, unknown>;
  projectPlan?: Record<string, unknown>;
}

export function ProjectDashboardClient() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null);
      if (!response || !response.ok) {
        setLoadError("Unable to load project. Please try again.");
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

  const readiness = project?.readiness;
  const sectionCount = project?.sections?.length || 0;
  const registerCount = useMemo(
    () => (project ? getRegisterItems(project.permissionCode).length : 0),
    [project]
  );

  const nextActions = useMemo(() => {
    if (!project) return [];
    const actions: string[] = [];
    const assessmentData = project.assessmentData || {};
    const hasAssessment = Object.keys(assessmentData).length > 0;
    const planData = project.projectPlan || {};
    const hasPlan = Array.isArray((planData as { milestones?: unknown }).milestones) && (planData as { milestones?: unknown[] }).milestones!.length > 0;

    if (!hasAssessment) {
      actions.push("Complete the firm assessment to capture current readiness.");
    }
    if (hasAssessment && !hasPlan) {
      actions.push("Generate the auto project plan and timeline.");
    }

    if (project.sections?.length) {
      const narrativeGaps = project.sections.filter((section) => section.narrativeCompletion < 50).slice(0, 2);
      narrativeGaps.forEach((section) => actions.push(`Complete narrative draft for ${section.title}`));
    }

    return actions.slice(0, 4);
  }, [project]);

  const nextSteps = useMemo(() => {
    if (!project) return [];
    const assessmentData = project.assessmentData || {};
    const hasAssessment = Object.keys(assessmentData).length > 0;
    const planData = project.projectPlan || {};
    const hasPlan = Array.isArray((planData as { milestones?: unknown }).milestones) && (planData as { milestones?: unknown[] }).milestones!.length > 0;

    const steps = [];
    if (!hasAssessment) {
      steps.push({ label: "Complete firm assessment", href: `/authorization-pack/${project.id}/assessment` });
    }
    if (hasAssessment && !hasPlan) {
      steps.push({ label: "Generate project plan", href: `/authorization-pack/${project.id}/plan` });
    }
    if (project.packId) {
      steps.push({ label: "Open pack workspace", href: `/authorization-pack/sections?packId=${project.packId}` });
    }
    return steps.slice(0, 3);
  }, [project]);

  const guidedSteps = useMemo(() => {
    if (!project) return [];
    const assessmentData = project.assessmentData || {};
    const hasAssessment = Object.keys(assessmentData).length > 0;
    const planData = project.projectPlan || {};
    const hasPlan =
      Array.isArray((planData as { milestones?: unknown }).milestones) &&
      (planData as { milestones?: unknown[] }).milestones!.length > 0;
    const narrativeStarted = (project.readiness?.narrative ?? 0) > 0;
    return [
      {
        key: "assessment",
        label: "Complete firm assessment",
        description: "Capture company details and the current readiness baseline.",
        done: hasAssessment,
        href: `/authorization-pack/${project.id}/assessment`,
      },
      {
        key: "plan",
        label: "Generate project plan",
        description: "Auto-build milestones, owners, and target dates.",
        done: hasPlan,
        href: `/authorization-pack/${project.id}/plan`,
        disabled: !hasAssessment,
      },
      {
        key: "workspace",
        label: "Build the pack narrative",
        description: "Draft sections, attach evidence, and move into review.",
        done: narrativeStarted,
        href: project.packId ? `/authorization-pack/sections?packId=${project.packId}` : undefined,
        disabled: !project.packId,
      },
    ];
  }, [project]);

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">Loading project...</CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Project unavailable</CardTitle>
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

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="overview" />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Readiness snapshot</CardTitle>
            <CardDescription>
              Track overall completion across narrative, evidence, and review gates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-slate-900">{readiness ? `${readiness.overall}%` : "0%"}</p>
              <span className="text-xs text-slate-400">
                {project.typicalTimelineWeeks
                  ? `Typical timeline: ${project.typicalTimelineWeeks} weeks`
                  : "Timeline pending"}
              </span>
            </div>
            <Progress value={readiness?.overall ?? 0} className="h-2" />
            {readiness ? (
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span>Narrative {readiness.narrative}%</span>
                <span>Evidence {readiness.evidence}%</span>
                <span>Review {readiness.review}%</span>
              </div>
            ) : null}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Pack coverage</p>
              <p className="mt-2">{sectionCount} gold-standard sections configured.</p>
              {project.packName ? <p className="mt-1">Workspace: {project.packName}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
            <CardDescription>Follow the guided steps to unlock the workspace and submission readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {nextActions.length ? (
              <ul className="list-disc space-y-2 pl-4">
                {nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Assessment and plan are complete. Continue executing in the workspace.</p>
            )}
            {nextSteps.length ? (
              <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Start here</p>
                {nextSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-600">{index + 1}. {step.label}</span>
                    <Button asChild size="sm" variant="outline" className="border-slate-200 text-slate-600">
                      <Link href={step.href}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Guided path</p>
              {guidedSteps.map((step, index) => (
                <div key={step.key} className="flex items-start gap-3">
                  {step.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-600" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 text-slate-300" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {index + 1}. {step.label}
                    </p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                  {step.href ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      disabled={step.disabled}
                      className="border-slate-200 text-slate-600"
                    >
                      <Link href={step.href}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Connected ecosystem</CardTitle>
          <CardDescription>Everything linked to policies, training, and Key Persons requirements.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Policies</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{project.policyTemplates?.length || 0}</p>
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/policies">Open policy library</Link>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Templates your permission type must evidence in the submission pack.</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Training</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{project.trainingRequirements?.length || 0}</p>
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/training-library">Open training library</Link>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Mandatory staff training linked to FCA expectations for this permission.</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Key Persons</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{project.smcrRoles?.length || 0}</p>
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/smcr">Open Key Persons module</Link>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>SMCR / PSD roles that must be assigned before submission.</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Registers</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{registerCount}</p>
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/registers">Open registers</Link>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Live logs and trackers required for audit-ready evidence.</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
}
