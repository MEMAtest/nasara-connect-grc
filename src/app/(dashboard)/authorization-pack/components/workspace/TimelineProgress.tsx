"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, BarChart3, Plus, Flag, Circle, CalendarDays, Download, Loader2 } from "lucide-react";
import {
  TIMELINE_PHASES,
  calculatePhaseCompletion,
  type ChecklistItemStatus,
} from "@/lib/fca-api-checklist";
import {
  PHASE_COLORS,
  TIMELINE_LAYOUT,
  getCurrentWeekFromStart,
  getWeekDate,
} from "@/lib/checklist-constants";
import { TaskCreationDialog, type TimelineTask } from "./TaskCreationDialog";

interface TimelineProgressProps {
  statuses: Record<string, ChecklistItemStatus>;
  startDate?: string;
  selectedPhase?: string | null;
  onPhaseSelect?: (phase: string | null) => void;
  packId?: string;
  onStartDateChange?: (newDate: string) => void;
}

export function TimelineProgress({
  statuses,
  startDate,
  selectedPhase,
  onPhaseSelect,
  packId,
  onStartDateChange,
}: TimelineProgressProps) {
  const totalWeeks = TIMELINE_PHASES.at(-1)?.endWeek ?? 56;
  const currentWeek = getCurrentWeekFromStart(startDate);

  // Start date editing
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);

  // Excel export
  const [isExporting, setIsExporting] = useState(false);

  // Timeline tasks state
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [defaultPhaseForDialog, setDefaultPhaseForDialog] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);

  // Load tasks
  useEffect(() => {
    if (!packId) return;
    const loadTasks = async () => {
      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/timeline-tasks`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch {
        // Tasks may not exist yet
      }
    };
    loadTasks();
  }, [packId]);

  // Calculate completion for each phase
  const phaseCompletions = useMemo(() => {
    return TIMELINE_PHASES.map(phase => ({
      ...phase,
      ...calculatePhaseCompletion(phase.name, statuses),
    }));
  }, [statuses]);

  // Calculate today marker position (offset by 0.5 to center within the week column)
  const todayPosition = useMemo(() => {
    if (currentWeek <= 0) return 0;
    if (currentWeek > totalWeeks) return 100;
    return ((currentWeek - TIMELINE_LAYOUT.WEEK_CENTER_OFFSET) / totalWeeks) * 100;
  }, [currentWeek, totalWeeks]);

  // Generate week markers dynamically based on total weeks
  const weekMarkers = useMemo(() =>
    TIMELINE_LAYOUT.generateWeekMarkers(totalWeeks),
  [totalWeeks]);

  // Total items across all phases
  const totalItems = phaseCompletions.reduce((sum, p) => sum + p.total, 0);
  const totalCompleted = phaseCompletions.reduce((sum, p) => sum + p.completed, 0);
  const overallPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    const map: Record<string, TimelineTask[]> = {};
    tasks.forEach((t) => {
      if (!map[t.phase]) map[t.phase] = [];
      map[t.phase].push(t);
    });
    return map;
  }, [tasks]);

  const handlePhaseClick = (phaseName: string) => {
    if (onPhaseSelect) {
      onPhaseSelect(selectedPhase === phaseName ? null : phaseName);
    }
  };

  const handleAddTask = (phaseName: string) => {
    setDefaultPhaseForDialog(phaseName);
    setShowTaskDialog(true);
  };

  const handleTaskCreated = (task: TimelineTask) => {
    setTasks((prev) => [...prev, task]);
  };

  const handleTaskUpdated = (updatedTask: TimelineTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
  };

  const handleEditTask = (task: TimelineTask) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  };

  const handleExportGantt = async () => {
    if (!packId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/export/timeline-gantt`);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "timeline-gantt.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to export timeline");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base">Project Timeline</CardTitle>
                <p className="text-xs text-slate-500">
                  {totalWeeks} weeks | {totalItems} items | {overallPercentage}% complete
                  {tasks.length > 0 && ` | ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onStartDateChange && (
                <div className="relative">
                  {isEditingStartDate ? (
                    <input
                      ref={dateInputRef}
                      type="date"
                      defaultValue={startDate || ""}
                      className="h-7 rounded-md border border-slate-200 px-2 text-xs"
                      autoFocus
                      onBlur={(e) => {
                        setIsEditingStartDate(false);
                        if (e.target.value && e.target.value !== startDate) {
                          onStartDateChange(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        } else if (e.key === "Escape") {
                          setIsEditingStartDate(false);
                        }
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setIsEditingStartDate(true)}
                      className="flex items-center gap-1 h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
                      title="Click to change start date"
                    >
                      <CalendarDays className="h-3 w-3" />
                      {startDate
                        ? `Started: ${new Date(startDate + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`
                        : "Set start date"}
                    </button>
                  )}
                </div>
              )}
              {packId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setDefaultPhaseForDialog(undefined);
                      setShowTaskDialog(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Task
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleExportGantt}
                    disabled={isExporting}
                    title="Export as Excel Gantt"
                  >
                    {isExporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </>
              )}
              {startDate && currentWeek > 0 && currentWeek <= totalWeeks && (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                  Week {currentWeek}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Timeline container */}
          <div className="relative">
            {/* Week scale header */}
            <div className="mb-2 flex border-b border-slate-100" style={{ height: startDate ? "2rem" : "1.5rem" }}>
              <div className="w-44 flex-shrink-0" />
              <div className="relative flex-1">
                {/* Week markers */}
                {weekMarkers.map((week) => {
                  const dateLabel = startDate ? getWeekDate(startDate, week) : "";
                  return (
                    <div
                      key={week}
                      className="absolute -translate-x-1/2 text-[10px] text-slate-400 leading-tight"
                      style={{ left: `${((week - TIMELINE_LAYOUT.WEEK_CENTER_OFFSET) / totalWeeks) * 100}%` }}
                    >
                      <div>W{week}</div>
                      {dateLabel && <div className="text-[8px] text-slate-300">{dateLabel}</div>}
                    </div>
                  );
                })}
                {/* Today marker in header */}
                {currentWeek > 0 && currentWeek <= totalWeeks && (
                  <div
                    className="absolute top-0 z-10 flex flex-col items-center"
                    style={{ left: `${todayPosition}%`, transform: "translateX(-50%)" }}
                  >
                    <div className="rounded bg-red-500 px-1 py-0.5 text-[9px] font-medium text-white">
                      Today
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Phase rows */}
            <div className="space-y-1.5">
              {phaseCompletions.map((phase) => {
                const colors = PHASE_COLORS[phase.color] || PHASE_COLORS.teal;
                const isSelected = selectedPhase === phase.name;
                const left = ((phase.startWeek - 1) / totalWeeks) * 100;
                const width = ((phase.endWeek - phase.startWeek + 1) / totalWeeks) * 100;
                const phaseTasks = tasksByPhase[phase.name] || [];

                return (
                  <div key={phase.id}>
                    <div
                      className={`flex w-full items-center rounded-lg border transition-all ${
                        isSelected
                          ? `${colors.border} ${colors.bg} shadow-sm`
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {/* Phase label */}
                      <button
                        onClick={() => handlePhaseClick(phase.name)}
                        aria-label={`Filter checklist by ${phase.name} phase. ${phase.completed} of ${phase.total} items complete.`}
                        aria-pressed={isSelected}
                        className="flex w-44 flex-shrink-0 items-center gap-2 px-3 py-2"
                      >
                        <div className={`h-2.5 w-2.5 rounded-full ${colors.bgSolid}`} />
                        <span className={`text-xs font-medium ${isSelected ? colors.text : "text-slate-700"}`}>
                          {phase.name}
                        </span>
                        <ChevronDown
                          className={`ml-auto h-3 w-3 transition-transform ${
                            isSelected ? "rotate-180 text-slate-500" : "text-slate-300"
                          }`}
                        />
                      </button>

                      {/* Timeline bar area */}
                      <div className="relative h-10 flex-1 py-1.5">
                        {/* Phase bar */}
                        <div
                          className={`absolute h-7 rounded-md border ${colors.border} ${colors.bg} overflow-hidden`}
                          style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
                        >
                          {/* Progress fill */}
                          <div
                            className={`absolute inset-y-0 left-0 ${colors.bgSolid} opacity-30`}
                            style={{ width: `${phase.percentage}%` }}
                          />
                          {/* Bar content */}
                          <div className="relative flex h-full items-center justify-between px-2">
                            <span className={`text-[10px] font-medium ${colors.text}`}>
                              {phase.completed}/{phase.total}
                            </span>
                            {phase.percentage > 0 && (
                              <span className={`text-[10px] ${colors.text} opacity-70`}>
                                {phase.percentage}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Task/milestone markers on the bar */}
                        {phaseTasks.map((task) => {
                          const taskLeft = ((task.targetWeek - 0.5) / totalWeeks) * 100;
                          return (
                            <button
                              key={task.id}
                              className="absolute top-0 z-10 cursor-pointer hover:scale-125 transition-transform"
                              style={{ left: `${taskLeft}%`, transform: "translateX(-50%)" }}
                              title={`${task.isMilestone ? "Milestone" : "Task"}: ${task.name} (W${task.targetWeek}) — click to edit`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                            >
                              {task.isMilestone ? (
                                <Flag className={`h-3.5 w-3.5 ${
                                  task.status === "completed" ? "text-green-600" : "text-amber-500"
                                }`} />
                              ) : (
                                <Circle className={`h-2.5 w-2.5 ${
                                  task.status === "completed"
                                    ? "text-green-500 fill-green-500"
                                    : task.status === "in_progress"
                                    ? "text-blue-500 fill-blue-500"
                                    : "text-slate-400 fill-slate-400"
                                }`} />
                              )}
                            </button>
                          );
                        })}

                        {/* Today marker line */}
                        {currentWeek > 0 && currentWeek <= totalWeeks && (
                          <div
                            className="absolute bottom-0 top-0 w-0.5 bg-red-400"
                            style={{ left: `${todayPosition}%` }}
                          />
                        )}
                      </div>

                      {/* Add task button */}
                      {packId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTask(phase.name);
                          }}
                          className="mr-2 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-teal-600 transition shrink-0"
                          title={`Add task to ${phase.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
              <span>Click a phase to filter checklist below</span>
              <span className="text-slate-300">|</span>
              {TIMELINE_PHASES.map((phase) => {
                const colors = PHASE_COLORS[phase.color] || PHASE_COLORS.teal;
                return (
                  <div key={phase.id} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${colors.bgSolid}`} />
                    <span>{phase.name.split(" ")[0]}</span>
                  </div>
                );
              })}
              {tasks.length > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1">
                    <Flag className="h-2.5 w-2.5 text-amber-500" />
                    <span>Milestone</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="h-2 w-2 text-slate-400 fill-slate-400" />
                    <span>Task</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Creation / Edit Dialog */}
      {packId && (
        <TaskCreationDialog
          open={showTaskDialog}
          onOpenChange={(open) => {
            setShowTaskDialog(open);
            if (!open) setEditingTask(null);
          }}
          defaultPhase={defaultPhaseForDialog}
          totalWeeks={totalWeeks}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          editingTask={editingTask}
          packId={packId}
        />
      )}
    </>
  );
}
