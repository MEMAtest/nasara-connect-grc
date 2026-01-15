"use client";

import { useMemo } from "react";
import { Clock, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineTrackerProps {
  receivedDate: Date | string;
  resolutionDeadline?: Date | string;
  resolvedDate?: Date | string;
  fourWeekLetterSent: boolean;
  eightWeekLetterSent: boolean;
  finalResponseSent: boolean;
  className?: string;
}

export function DeadlineTracker({
  receivedDate,
  resolutionDeadline,
  resolvedDate,
  fourWeekLetterSent,
  eightWeekLetterSent,
  finalResponseSent,
  className,
}: DeadlineTrackerProps) {
  const calculations = useMemo(() => {
    const received = new Date(receivedDate);
    const now = new Date();

    // Calculate days elapsed
    const daysElapsed = Math.floor(
      (now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate deadline (8 weeks = 56 days)
    const deadline = resolutionDeadline
      ? new Date(resolutionDeadline)
      : new Date(received.getTime() + 56 * 24 * 60 * 60 * 1000);

    const daysUntilDeadline = Math.floor(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate 4-week mark (28 days)
    const fourWeekMark = new Date(received.getTime() + 28 * 24 * 60 * 60 * 1000);
    const pastFourWeeks = now > fourWeekMark;

    // Calculate 8-week mark
    const pastEightWeeks = now > deadline;

    // Progress percentage (capped at 100)
    const progress = Math.min(100, Math.round((daysElapsed / 56) * 100));

    // Determine status color
    let status: "green" | "amber" | "red" = "green";
    if (daysElapsed >= 49) {
      status = "red";
    } else if (daysElapsed >= 28) {
      status = "amber";
    }

    // Check if resolved
    const isResolved = resolvedDate !== undefined && resolvedDate !== null;

    return {
      daysElapsed,
      daysUntilDeadline: Math.max(0, daysUntilDeadline),
      progress,
      status,
      pastFourWeeks,
      pastEightWeeks,
      isResolved,
      deadline,
    };
  }, [receivedDate, resolutionDeadline, resolvedDate]);

  const statusColors = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  const statusBgColors = {
    green: "bg-emerald-100 border-emerald-200",
    amber: "bg-amber-100 border-amber-200",
    red: "bg-red-100 border-red-200",
  };

  const statusTextColors = {
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };

  return (
    <div className={cn("rounded-xl border bg-white p-4", className)}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Clock className="h-4 w-4" />
        Deadline Tracker
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {calculations.daysElapsed} days elapsed
          </span>
          <span
            className={cn(
              "font-medium",
              statusTextColors[calculations.status]
            )}
          >
            {calculations.isResolved
              ? "Resolved"
              : calculations.pastEightWeeks
              ? "Overdue"
              : `${calculations.daysUntilDeadline} days remaining`}
          </span>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
          {/* Background track */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-slate-100" />
            <div className="w-1/2 bg-slate-200" />
          </div>

          {/* 4-week marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-400"
            style={{ left: "50%" }}
          />

          {/* Progress fill */}
          <div
            className={cn(
              "absolute left-0 top-0 h-full transition-all duration-500",
              statusColors[calculations.status]
            )}
            style={{ width: `${calculations.progress}%` }}
          />
        </div>

        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Day 0</span>
          <span>4 weeks</span>
          <span>8 weeks</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {/* 4-week letter */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2",
            fourWeekLetterSent
              ? "border-emerald-200 bg-emerald-50"
              : calculations.pastFourWeeks
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-slate-50"
          )}
        >
          <div className="flex items-center gap-2">
            {fourWeekLetterSent ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : calculations.pastFourWeeks ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <Clock className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-sm text-slate-700">4-week holding letter</span>
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              fourWeekLetterSent
                ? "text-emerald-600"
                : calculations.pastFourWeeks
                ? "text-amber-600"
                : "text-slate-400"
            )}
          >
            {fourWeekLetterSent
              ? "Sent"
              : calculations.pastFourWeeks
              ? "Overdue"
              : "Pending"}
          </span>
        </div>

        {/* 8-week letter */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2",
            eightWeekLetterSent
              ? "border-emerald-200 bg-emerald-50"
              : calculations.pastEightWeeks
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-slate-50"
          )}
        >
          <div className="flex items-center gap-2">
            {eightWeekLetterSent ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : calculations.pastEightWeeks ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Clock className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-sm text-slate-700">8-week holding letter</span>
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              eightWeekLetterSent
                ? "text-emerald-600"
                : calculations.pastEightWeeks
                ? "text-red-600"
                : "text-slate-400"
            )}
          >
            {eightWeekLetterSent
              ? "Sent"
              : calculations.pastEightWeeks
              ? "Overdue"
              : "Pending"}
          </span>
        </div>

        {/* Final response */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2",
            finalResponseSent
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-slate-50"
          )}
        >
          <div className="flex items-center gap-2">
            {finalResponseSent ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <Clock className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-sm text-slate-700">Final response</span>
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              finalResponseSent ? "text-emerald-600" : "text-slate-400"
            )}
          >
            {finalResponseSent ? "Sent" : "Pending"}
          </span>
        </div>
      </div>

      {/* Deadline info */}
      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
        <div className="text-xs text-slate-500">Resolution deadline</div>
        <div className="text-sm font-medium text-slate-900">
          {calculations.deadline.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
