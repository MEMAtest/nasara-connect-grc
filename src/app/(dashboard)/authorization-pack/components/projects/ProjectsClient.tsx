"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

interface ProjectRow {
  id: string;
  name: string;
  permission_code: string;
  permission_name?: string | null;
  status: string;
  target_submission_date?: string | null;
  created_at?: string | null;
  pack_id?: string | null;
  pack_name?: string | null;
  pack_status?: string | null;
  pack_template_name?: string | null;
  typical_timeline_weeks?: number | null;
  policy_templates?: string[];
  training_requirements?: string[];
  smcr_roles?: string[];
  readiness?: ReadinessSummary | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout("/api/authorization-pack/projects?organizationId=default-org").catch(
        () => null
      );
      if (!response || !response.ok) {
        setLoadError("Unable to load authorisation projects. Check the database connection and try again.");
        return;
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const emptyState = useMemo(() => !isLoading && !loadError && projects.length === 0, [isLoading, loadError, projects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">Authorisation Pack</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Authorization Projects</h1>
          <p className="mt-2 text-sm text-slate-500">
            Launch a permission ecosystem, track readiness, and jump straight into the pack workspace.
          </p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/authorization-pack/new">Create Project</Link>
        </Button>
      </div>

      {isLoading ? (
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading projects...</CardContent>
        </Card>
      ) : null}

      {loadError ? (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Projects unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadProjects}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {emptyState ? (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Create your first authorisation project to unlock the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/authorization-pack/new">Create Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !loadError && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project) => {
            const readiness = project.readiness;
            const policiesCount = project.policy_templates?.length || 0;
            const trainingCount = project.training_requirements?.length || 0;
            const smcrCount = project.smcr_roles?.length || 0;

            return (
              <Card key={project.id} className="border border-slate-200">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-900">{project.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm text-slate-500">
                      {project.permission_name || project.permission_code} · {project.pack_template_name || "Pack"}
                    </CardDescription>
                    {project.target_submission_date ? (
                      <p className="mt-2 text-xs text-slate-400">
                        Target submission: {formatDate(project.target_submission_date)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-teal-200 text-teal-600">
                      {project.permission_name || project.permission_code}
                    </Badge>
                    <Badge className="bg-slate-900 text-white">{project.status.replace(/-/g, " ")}</Badge>
                    {project.pack_status ? (
                      <Badge variant="outline" className="border-slate-200 text-slate-600">
                        Pack: {project.pack_status.replace(/-/g, " ")}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-[2fr_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Readiness</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-2xl font-semibold text-slate-900">
                          {readiness ? `${readiness.overall}%` : "0%"}
                        </p>
                        <span className="text-xs text-slate-400">
                          {project.typical_timeline_weeks
                            ? `Typical timeline: ${project.typical_timeline_weeks} weeks`
                            : "Timeline pending"}
                        </span>
                      </div>
                      <Progress value={readiness?.overall ?? 0} className="mt-3 h-2" />
                      {readiness ? (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Narrative {readiness.narrative}%</span>
                          <span>Evidence {readiness.evidence}%</span>
                          <span>Review {readiness.review}%</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{policiesCount} policies</span>
                      <span>{trainingCount} training modules</span>
                      <span>{smcrCount} SMCR roles</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild className="bg-teal-600 hover:bg-teal-700">
                      <Link href={`/authorization-pack/${project.id}`}>Open Project</Link>
                    </Button>
                    {project.pack_id ? (
                      <Button variant="outline" asChild className="border-slate-200 text-slate-700">
                        <Link href={`/authorization-pack/sections?packId=${project.pack_id}`}>Open Workspace</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="border-slate-200 text-slate-400" disabled>
                        Workspace pending
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
