"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// Icon components
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  review: number;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  owner_id?: string | null;
  due_date?: string | null;
  section_title?: string | null;
  sectionInstanceId?: string | null;
  source?: string | null;
}

// Status and Priority options
const TASK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-700", icon: CircleIcon },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700", icon: ClockIcon },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-700", icon: ExclamationIcon },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircleIcon },
];

const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600", dotColor: "bg-slate-400" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" },
];

const FILTER_PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  ...TASK_PRIORITY_OPTIONS,
];

const PRIORITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_COLUMNS = [
  { key: "pending", label: "Queued", description: "Ready to start", tone: "text-slate-600" },
  { key: "in_progress", label: "In Progress", description: "Work underway", tone: "text-blue-600" },
  { key: "blocked", label: "Blocked", description: "Needs resolution", tone: "text-red-600" },
  { key: "completed", label: "Completed", description: "Closed out", tone: "text-green-600" },
] as const;

function getPriorityColor(priority: string) {
  const option = TASK_PRIORITY_OPTIONS.find((opt) => opt.value === priority);
  return option?.color || "bg-slate-100 text-slate-600";
}

function getPriorityDot(priority: string) {
  const option = TASK_PRIORITY_OPTIONS.find((opt) => opt.value === priority);
  return option?.dotColor || "bg-slate-400";
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
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

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
  }, [packIdParam, router]);

  const handleStatusChange = async (taskId: string, status: string) => {
    if (!pack) return;
    setMutationError(null);
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      setTasks(previousTasks); // Rollback
      setMutationError("Failed to update task status. Please try again.");
      console.error("Task status update error:", error);
    }
  };

  const handlePriorityChange = async (taskId: string, priority: string) => {
    if (!pack) return;
    setMutationError(null);
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, priority } : task)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, priority }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task priority");
      }
    } catch (error) {
      setTasks(previousTasks); // Rollback
      setMutationError("Failed to update task priority. Please try again.");
      console.error("Task priority update error:", error);
    }
  };

  const visibleTasks = tasks.filter((task) => task.source !== "auto-evidence");

  // Filter tasks
  const filteredTasks = visibleTasks.filter((task) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (!showCompleted && task.status === "completed") return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group tasks by status for kanban-style view
  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === "pending"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    blocked: filteredTasks.filter((t) => t.status === "blocked"),
    completed: filteredTasks.filter((t) => t.status === "completed"),
  };

  const focusTasks = [...filteredTasks]
    .filter((task) => task.status !== "completed")
    .sort((a, b) => {
      const priorityDiff = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 5);

  // Summary stats
  const stats = {
    total: visibleTasks.length,
    completed: visibleTasks.filter((t) => t.status === "completed").length,
    inProgress: visibleTasks.filter((t) => t.status === "in_progress").length,
    blocked: visibleTasks.filter((t) => t.status === "blocked").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading tasks...
            </div>
          </CardContent>
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

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <CircleIcon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">In Progress</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Blocked</p>
                <p className="text-2xl font-semibold text-red-600">{stats.blocked}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ExclamationIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-500">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-slate-200 text-xs text-slate-600"
              onClick={() => setShowCompleted((prev) => !prev)}
            >
              {showCompleted ? "Hide completed" : "Show completed"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutationError && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{mutationError}</span>
          <button
            onClick={() => setMutationError(null)}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Action Focus</CardTitle>
          <CardDescription>
            Highest priority items across the pack. {filteredTasks.length} tasks match your filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {focusTasks.length ? (
            focusTasks.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${getPriorityDot(task.priority)}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.section_title ?? "General"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {task.status.replace(/_/g, " ")}
                  </Badge>
                  {task.sectionInstanceId && pack ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/authorization-pack/sections/${task.sectionInstanceId}?packId=${pack.id}`}>
                        Open section
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-slate-400">
              {visibleTasks.length === 0 ? "No tasks created yet." : "No tasks match your filters."}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-4">
        {STATUS_COLUMNS.filter((col) => showCompleted || col.key !== "completed").map((column) => {
          const columnTasks = tasksByStatus[column.key] || [];
          return (
            <Card key={column.key} className="border border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className={`text-base ${column.tone}`}>{column.label}</CardTitle>
                <CardDescription>
                  {column.description} ({columnTasks.length})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnTasks.length ? (
                  columnTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                          {task.description && (
                            <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                          )}
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {task.section_title && (
                          <Badge variant="outline" className="text-[11px]">
                            {task.section_title}
                          </Badge>
                        )}
                        {task.due_date && (
                          <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="mt-3 grid gap-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TASK_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs ${opt.color}`}>
                                    <opt.icon className="h-3 w-3" />
                                    {opt.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={task.priority} onValueChange={(value) => handlePriorityChange(task.id, value)}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TASK_PRIORITY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs ${opt.color}`}>
                                    <span className={`h-2 w-2 rounded-full ${opt.dotColor}`} />
                                    {opt.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {task.sectionInstanceId && pack ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/authorization-pack/sections/${task.sectionInstanceId}?packId=${pack.id}`}>
                              Open section
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                    No tasks in this column.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
