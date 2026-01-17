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
  active: "overview" | "assessment" | "plan" | "documents" | "ecosystem";
}

export function ProjectHeader({ project, active }: ProjectHeaderProps) {
  const permissionLabel = project.permissionName || project.permissionCode || "Permission";
  const workspaceHref = project.packId ? `/authorization-pack/workspace?packId=${project.packId}` : null;

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

      <div className="flex flex-wrap gap-2">
        <Button
          variant={active === "overview" ? "default" : "outline"}
          className={active === "overview" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}`}>Overview</Link>
        </Button>
        <Button
          variant={active === "assessment" ? "default" : "outline"}
          className={active === "assessment" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}/assessment`}>Assessment</Link>
        </Button>
        <Button
          variant={active === "plan" ? "default" : "outline"}
          className={active === "plan" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}/plan`}>Plan</Link>
        </Button>
        <Button
          variant={active === "documents" ? "default" : "outline"}
          className={active === "documents" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}/documents`}>Opinion Pack</Link>
        </Button>
        <Button
          variant={active === "ecosystem" ? "default" : "outline"}
          className={active === "ecosystem" ? "bg-slate-900 text-white" : "text-slate-600"}
          asChild
        >
          <Link href={`/authorization-pack/${project.id}/ecosystem`}>Ecosystem</Link>
        </Button>
        {workspaceHref ? (
          <Button variant="outline" className="text-slate-600" asChild>
            <Link href={workspaceHref}>Workspace</Link>
          </Button>
        ) : (
          <Button variant="outline" className="text-slate-400" disabled>
            Workspace
          </Button>
        )}
        <Button variant="ghost" className="text-slate-500" asChild>
          <Link href="/authorization-pack">Back to Projects</Link>
        </Button>
      </div>
    </div>
  );
}
