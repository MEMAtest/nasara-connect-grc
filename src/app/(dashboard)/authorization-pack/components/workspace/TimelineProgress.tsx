"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, BarChart3 } from "lucide-react";
import {
  TIMELINE_PHASES,
  calculatePhaseCompletion,
  type ChecklistItemStatus,
} from "@/lib/fca-api-checklist";
import {
  PHASE_COLORS,
  TIMELINE_LAYOUT,
  getCurrentWeekFromStart,
} from "@/lib/checklist-constants";

interface TimelineProgressProps {
  statuses: Record<string, ChecklistItemStatus>;
  startDate?: string;
  selectedPhase?: string | null;
  onPhaseSelect?: (phase: string | null) => void;
}

export function TimelineProgress({
  statuses,
  startDate,
  selectedPhase,
  onPhaseSelect,
}: TimelineProgressProps) {
  const totalWeeks = TIMELINE_PHASES.at(-1)?.endWeek ?? 56;
  const currentWeek = getCurrentWeekFromStart(startDate);

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

  const handlePhaseClick = (phaseName: string) => {
    if (onPhaseSelect) {
      onPhaseSelect(selectedPhase === phaseName ? null : phaseName);
    }
  };

  return (
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
              </p>
            </div>
          </div>
          {startDate && currentWeek > 0 && currentWeek <= totalWeeks && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
              Week {currentWeek}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Timeline container */}
        <div className="relative">
          {/* Week scale header */}
          <div className="mb-2 flex h-6 border-b border-slate-100">
            <div className="w-44 flex-shrink-0" />
            <div className="relative flex-1">
              {/* Week markers */}
              {weekMarkers.map((week) => (
                <div
                  key={week}
                  className="absolute -translate-x-1/2 text-[10px] text-slate-400"
                  style={{ left: `${((week - TIMELINE_LAYOUT.WEEK_CENTER_OFFSET) / totalWeeks) * 100}%` }}
                >
                  W{week}
                </div>
              ))}
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

              return (
                <button
                  key={phase.id}
                  onClick={() => handlePhaseClick(phase.name)}
                  aria-label={`Filter checklist by ${phase.name} phase. ${phase.completed} of ${phase.total} items complete.`}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center rounded-lg border transition-all ${
                    isSelected
                      ? `${colors.border} ${colors.bg} shadow-sm`
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {/* Phase label */}
                  <div className="flex w-44 flex-shrink-0 items-center gap-2 px-3 py-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${colors.bgSolid}`} />
                    <span className={`text-xs font-medium ${isSelected ? colors.text : "text-slate-700"}`}>
                      {phase.name}
                    </span>
                    <ChevronDown
                      className={`ml-auto h-3 w-3 transition-transform ${
                        isSelected ? "rotate-180 text-slate-500" : "text-slate-300"
                      }`}
                    />
                  </div>

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

                    {/* Today marker line */}
                    {currentWeek > 0 && currentWeek <= totalWeeks && (
                      <div
                        className="absolute bottom-0 top-0 w-0.5 bg-red-400"
                        style={{ left: `${todayPosition}%` }}
                      />
                    )}
                  </div>
                </button>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
