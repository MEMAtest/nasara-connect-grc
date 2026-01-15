"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PackType } from "@/lib/authorization-pack-templates";
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

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  owner_id?: string | null;
  section_title?: string | null;
}

export function TasksClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
          router.replace(`/authorization-pack/tasks?packId=${activePack.id}`);
        }

        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        const taskResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}/tasks`).catch(
          () => null
        );
        if (taskResponse?.ok) {
          const taskData = await taskResponse.json();
          setTasks(taskData.tasks || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam]);

  const handleStatusChange = async (taskId: string, status: string) => {
    if (!pack) return;
    await fetch(`/api/authorization-pack/packs/${pack.id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Loading tasks...</CardContent>
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
            <CardTitle>Tasks unavailable</CardTitle>
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

  if (!pack) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={null} readiness={null} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Create a pack to track tasks.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Project Tracker</CardTitle>
          <CardDescription>Owners, due dates, and blockers across the pack.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.section_title ?? "General task"}</p>
                </div>
                <Badge variant="outline">{task.priority}</Badge>
              </div>
              <div className="mt-3 max-w-xs">
                <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                  <SelectTrigger>
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
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
