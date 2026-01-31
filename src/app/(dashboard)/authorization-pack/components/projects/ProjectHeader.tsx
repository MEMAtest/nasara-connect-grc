"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    permissionName?: string | null;
    permissionCode?: string | null;
    status: string;
    packId?: string | null;
  };
  active: "overview" | "assessment" | "regulatory-questions" | "results" | "opinion-pack" | "ecosystem" | "workspace";
}

export function ProjectHeader({ project, active }: ProjectHeaderProps) {
  const permissionLabel = project.permissionName || project.permissionCode || "Permission";
  const workspaceHref = project.packId ? `/authorization-pack/workspace?packId=${project.packId}` : null;
  const phaseItems = [
    { key: "assessment", label: "Assessment", href: `/authorization-pack/${project.id}/assessment`, phase: 1 },
    { key: "regulatory-questions", label: "Reg Questions", href: `/authorization-pack/${project.id}/regulatory-questions`, phase: 2 },
    { key: "results", label: "Results", href: `/authorization-pack/${project.id}/results`, phase: 3 },
    { key: "opinion-pack", label: "Opinion Pack", href: `/authorization-pack/${project.id}/opinion-pack`, phase: 4 },
    { key: "workspace", label: "Workspace", href: workspaceHref, phase: 5 },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">Authorisation Pack</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Permission scope: {permissionLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-teal-200 text-teal-600">
            {permissionLabel}
          </Badge>
          <Badge className="bg-slate-900 text-white">{project.status.replace(/-/g, " ")}</Badge>
          {workspaceHref ? (
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href={workspaceHref}>Open Workspace</Link>
            </Button>
          ) : (
            <Button className="bg-slate-200 text-slate-500" disabled>
              Workspace pending
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phases</span>
        <div className="flex flex-wrap gap-2">
          {phaseItems.map((item) => {
            const isActive = active === item.key;
            const phaseBadgeClasses = isActive
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500";
            if (!item.href) {
              return (
                <Button key={item.key} variant="outline" className="text-slate-400" disabled>
                  <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${phaseBadgeClasses}`}>
                    {item.phase}
                  </span>
                  {item.label}
                </Button>
              );
            }
            return (
              <Button
                key={item.key}
                variant={isActive ? "default" : "outline"}
                className={isActive ? "bg-slate-900 text-white" : "text-slate-600"}
                asChild
              >
                <Link href={item.href}>
                  <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${phaseBadgeClasses}`}>
                    {item.phase}
                  </span>
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={active === "overview" ? "default" : "outline"}
          className={active === "overview" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}`}>Overview</Link>
        </Button>
        <Button
          variant={active === "ecosystem" ? "default" : "outline"}
          className={active === "ecosystem" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}/ecosystem`}>Ecosystem</Link>
        </Button>
        <Button variant="ghost" className="text-slate-500" asChild>
          <Link href="/authorization-pack">Back to Projects</Link>
        </Button>
      </div>
    </div>
  );
}
