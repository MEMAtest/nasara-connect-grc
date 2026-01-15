"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";

interface SectionSummary {
  id: string;
  title: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
  typicalTimelineWeeks?: number | null;
  policyTemplates?: string[];
  trainingRequirements?: string[];
  smcrRoles?: string[];
  sections?: SectionSummary[];
}

export function EcosystemClient() {
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
        setLoadError("Unable to load ecosystem details. Please try again.");
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

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">Loading ecosystem...</CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Ecosystem unavailable</CardTitle>
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

  const sections = project.sections || [];
  const policies = project.policyTemplates || [];
  const training = project.trainingRequirements || [];
  const smcr = project.smcrRoles || [];

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="ecosystem" />

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Permission ecosystem</CardTitle>
          <CardDescription>
            {project.permissionName || project.permissionCode} requires the following spine, policies, training, and
            Key Persons coverage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Gold-standard sections</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{sections.length}</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                {sections.map((section) => (
                  <div key={section.id} className="rounded-md border border-slate-100 bg-white p-2">
                    {section.title}
                  </div>
                ))}
              </div>
            </div>
            {project.packId ? (
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href={`/authorization-pack/sections?packId=${project.packId}`}>Open workspace sections</Link>
              </Button>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Typical timeline</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {project.typicalTimelineWeeks ? `${project.typicalTimelineWeeks} weeks` : "Pending"}
              </p>
              <p className="mt-2 text-sm text-slate-500">Adjust the timeline once the assessment is complete.</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cross-links</p>
              <div className="mt-3 space-y-2">
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/policies">Policy templates</Link>
                </Button>
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/training-library">Training modules</Link>
                </Button>
                <Button asChild variant="link" className="px-0 text-teal-600">
                  <Link href="/smcr">Key Persons setup</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>{policies.length} required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {policies.map((item) => (
              <div key={item} className="rounded-md border border-slate-100 bg-white p-2">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Training</CardTitle>
            <CardDescription>{training.length} modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {training.map((item) => (
              <div key={item} className="rounded-md border border-slate-100 bg-white p-2">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Key Persons / PSD Roles</CardTitle>
            <CardDescription>{smcr.length} responsible persons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {smcr.map((item) => (
              <div key={item} className="rounded-md border border-slate-100 bg-white p-2">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
