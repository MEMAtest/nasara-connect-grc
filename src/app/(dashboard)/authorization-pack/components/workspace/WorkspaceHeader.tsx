"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { packTypeLabels, PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface PackSummary {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
  target_submission_date?: string | null;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  review: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  permissionCode?: string | null;
  permissionName?: string | null;
  packId?: string | null;
}

interface WorkspaceHeaderProps {
  pack: PackSummary | null;
  readiness?: ReadinessSummary | null;
  showCTA?: boolean;
}

const clampPercent = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
};

const navItems = [
  { href: "/authorization-pack/workspace", label: "Workspace" },
  { href: "/authorization-pack/export", label: "Export" },
];

export function WorkspaceHeader({ pack, readiness, showCTA = true }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [project, setProject] = useState<ProjectSummary | null>(null);

  const activePackId = searchParams.get("packId") || pack?.id || "";
  const readinessSummary = readiness
    ? {
        overall: clampPercent(readiness.overall),
        narrative: clampPercent(readiness.narrative),
        review: clampPercent(readiness.review),
      }
    : null;

  useEffect(() => {
    const loadPacks = async () => {
      const response = await fetchWithTimeout("/api/authorization-pack/packs").catch(
        () => null
      );
      if (response?.ok) {
        const data = await response.json();
        setPacks(data.packs || []);
      }
    };
    loadPacks();
  }, []);

  useEffect(() => {
    if (!activePackId) {
      setProject(null);
      return;
    }
    const loadProject = async () => {
      const response = await fetchWithTimeout(
        `/api/authorization-pack/packs/${activePackId}/project`
      ).catch(() => null);
      if (!response?.ok) {
        setProject(null);
        return;
      }
      const data = await response.json();
      setProject(data.project || null);
    };
    loadProject();
  }, [activePackId]);

  const handlePackChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("packId", value);
    } else {
      params.delete("packId");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const phaseItems = project
    ? [
        { key: "assessment", label: "Assessment", href: `/authorization-pack/${project.id}/assessment`, phase: 1 },
        { key: "regulatory-questions", label: "Reg Questions", href: `/authorization-pack/${project.id}/regulatory-questions`, phase: 2 },
        { key: "results", label: "Results", href: `/authorization-pack/${project.id}/results`, phase: 3 },
        { key: "opinion-pack", label: "Opinion Pack", href: `/authorization-pack/${project.id}/opinion-pack`, phase: 4 },
        {
          key: "workspace",
          label: "Workspace",
          href: activePackId ? `/authorization-pack/workspace?packId=${activePackId}` : "/authorization-pack/workspace",
          phase: 5,
        },
      ]
    : [];
  const isWorkspaceArea = [
    "/authorization-pack/workspace",
    "/authorization-pack/export",
  ].some((route) => pathname.startsWith(route));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">Authorisation Pack</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {pack ? pack.name : "Authorisation Pack Workspace"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track your FCA application documentation and submission readiness.
          </p>
        </div>
        {showCTA && (
          <div className="flex flex-wrap items-center gap-3">
            {pack ? (
              <>
                {packs.length > 1 ? (
                  <Select value={activePackId} onValueChange={handlePackChange}>
                    <SelectTrigger className="min-w-[220px] bg-white">
                      <SelectValue placeholder="Select pack" />
                    </SelectTrigger>
                    <SelectContent>
                      {packs.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Badge variant="outline" className="border-teal-200 text-teal-600">
                  {packTypeLabels[pack.template_type]}
                </Badge>
                <Badge className="bg-slate-900 text-white">{(pack.status || "draft").replace("-", " ")}</Badge>
              </>
            ) : (
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/authorization-pack/new">Create Project</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {readinessSummary ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Readiness</p>
              <p className="text-2xl font-semibold text-slate-900">{readinessSummary.overall}%</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 min-w-[240px]">
              <Progress value={readinessSummary.overall} className="h-2" />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Narrative {readinessSummary.narrative}%</span>
                <span>Review {readinessSummary.review}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {phaseItems.length ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phases</span>
          <div className="flex flex-wrap gap-2">
            {phaseItems.map((item) => {
              const isActive =
                (item.key === "assessment" && pathname.includes("/assessment")) ||
                (item.key === "regulatory-questions" && pathname.includes("/regulatory-questions")) ||
                (item.key === "results" && pathname.includes("/results")) ||
                (item.key === "opinion-pack" && pathname.includes("/opinion-pack")) ||
                (item.key === "workspace" && isWorkspaceArea);
              const phaseBadgeClasses = isActive
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500";
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "outline"}
                  className={isActive ? "bg-slate-900 text-white" : "text-slate-600"}
                  asChild
                >
                  <Link href={item.href}>
                    <span
                      className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${phaseBadgeClasses}`}
                    >
                      {item.phase}
                    </span>
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isWorkspaceTab =
            item.href === "/authorization-pack/workspace" &&
            pathname.startsWith("/authorization-pack/workspace");
          const isActive = isWorkspaceTab || pathname.startsWith(item.href);
          const href = activePackId ? `${item.href}?packId=${activePackId}` : item.href;
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "outline"}
              className={isActive ? "bg-slate-900 text-white" : "text-slate-600"}
              asChild
            >
              <Link href={href}>{item.label}</Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
