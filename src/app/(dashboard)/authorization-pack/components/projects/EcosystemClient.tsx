"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  getPolicyItems,
  getRegisterItems,
  getSmcrItems,
  getTrainingItems,
} from "@/lib/authorization-pack-integrations";
import { ProjectHeader } from "./ProjectHeader";

// Icon components
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function UserGroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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

// Ecosystem item card component
function EcosystemItemCard({
  icon: Icon,
  title,
  description,
  count,
  items,
  emptyLabel,
  accentColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count: number;
  items: Array<{ key: string; label: string; href?: string }>;
  emptyLabel: string;
  accentColor: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string; border: string }> = {
    teal: { bg: "bg-teal-50", text: "text-teal-700", iconBg: "bg-teal-100", border: "border-teal-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100", border: "border-blue-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", iconBg: "bg-purple-100", border: "border-purple-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100", border: "border-amber-200" },
  };
  const colors = colorMap[accentColor] || colorMap.teal;

  return (
    <Card className={`border ${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg}`}>
              <Icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`${colors.text} text-xs`}>
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {items.length > 0 ? (
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2 rounded-md border border-white/50 bg-white px-2.5 py-1.5 text-sm"
              >
                <CheckCircleIcon className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                {item.href ? (
                  <Link href={item.href} className={`flex-1 truncate hover:underline ${colors.text}`}>
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex-1 truncate text-slate-700">{item.label}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white/50 px-2.5 py-2 text-xs text-slate-400">
            <CircleIcon className="h-3.5 w-3.5" />
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
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
        <CardContent className="p-8 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            Loading ecosystem...
          </div>
        </CardContent>
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
  const policyItems = getPolicyItems(project.policyTemplates);
  const trainingItems = getTrainingItems(project.trainingRequirements);
  const smcrItems = getSmcrItems(project.smcrRoles);
  const registerItems = getRegisterItems(project.permissionCode);

  // Calculate completion stats
  const totalItems = policyItems.length + trainingItems.length + smcrItems.length + registerItems.length;
  const completedItems = [...policyItems, ...trainingItems, ...smcrItems, ...registerItems].filter(
    (item) => item.href
  ).length;
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="ecosystem" />

      {/* Overview Card */}
      <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Permission Ecosystem
                <Badge variant="outline" className="ml-2 border-teal-200 text-teal-700">
                  {project.permissionName || project.permissionCode}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Policies, training, key persons, and registers required for authorisation.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Coverage</p>
                <p className="text-2xl font-bold text-teal-600">{sections.length}</p>
                <p className="text-xs text-slate-500">Gold-standard sections</p>
              </div>
              {project.typicalTimelineWeeks && (
                <div className="border-l border-slate-200 pl-4 text-right">
                  <p className="text-xs text-slate-400">Timeline</p>
                  <p className="text-2xl font-bold text-slate-900">{project.typicalTimelineWeeks}</p>
                  <p className="text-xs text-slate-500">weeks typical</p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            {project.packId && (
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href={`/authorization-pack/workspace?packId=${project.packId}`}>
                  Open Workspace
                  <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/policies">Policy Templates</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/training-library">Training Library</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/smcr">Key Persons Setup</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem Grid - 2x2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <EcosystemItemCard
          icon={DocumentIcon}
          title="Policies"
          description="Required policy documents"
          count={policyItems.length}
          items={policyItems}
          emptyLabel="Policy templates to be confirmed"
          accentColor="teal"
        />
        <EcosystemItemCard
          icon={BookOpenIcon}
          title="Training"
          description="Mandatory training modules"
          count={trainingItems.length}
          items={trainingItems}
          emptyLabel="Training plan pending assessment"
          accentColor="blue"
        />
        <EcosystemItemCard
          icon={UserGroupIcon}
          title="Key Persons / PSD Roles"
          description="Responsible persons required"
          count={smcrItems.length}
          items={smcrItems}
          emptyLabel="Key person roles to be assigned"
          accentColor="purple"
        />
        <EcosystemItemCard
          icon={ClipboardListIcon}
          title="Registers & Trackers"
          description="Compliance logs and records"
          count={registerItems.length}
          items={registerItems}
          emptyLabel="Registers created with workspace"
          accentColor="amber"
        />
      </div>

      {/* Sections List */}
      {sections.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gold-Standard Sections</CardTitle>
            <CardDescription>Business plan sections required for {project.permissionName || project.permissionCode}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-xs font-medium text-teal-700">
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-slate-700">{section.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
