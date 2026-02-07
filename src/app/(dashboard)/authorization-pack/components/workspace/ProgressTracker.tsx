"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Requirement,
  RequirementStatus,
  RequirementCategory,
  requirementCategories,
} from "@/lib/requirements-by-permission";

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

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
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

export interface RequirementProgress {
  requirementId: string;
  status: RequirementStatus;
  documentsUploaded: number;
  documentsRequired: number;
}

interface ProgressTrackerProps {
  requirements: Requirement[];
  progress: RequirementProgress[];
  onRequirementClick?: (requirementId: string) => void;
}

const statusConfig: Record<RequirementStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  not_started: {
    label: "Not Started",
    color: "text-slate-400",
    bgColor: "bg-slate-100",
    icon: CircleIcon,
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: ClockIcon,
  },
  complete: {
    label: "Complete",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: CheckCircleIcon,
  },
};

export function ProgressTracker({ requirements, progress, onRequirementClick }: ProgressTrackerProps) {
  // Calculate overall progress
  const progressStats = useMemo(() => {
    const total = requirements.length;
    const completed = progress.filter((p) => p.status === "complete").length;
    const inProgress = progress.filter((p) => p.status === "in_progress").length;
    const notStarted = total - completed - inProgress;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, notStarted, percentage };
  }, [requirements, progress]);

  // Find next action (first incomplete requirement)
  const nextAction = useMemo(() => {
    const incomplete = requirements.find((req) => {
      const reqProgress = progress.find((p) => p.requirementId === req.id);
      return !reqProgress || reqProgress.status !== "complete";
    });
    return incomplete;
  }, [requirements, progress]);

  // Group requirements by category with status
  const requirementsByCategory = useMemo(() => {
    const grouped = new Map<RequirementCategory, Array<Requirement & { progress: RequirementProgress | undefined }>>();

    requirements.forEach((req) => {
      const reqProgress = progress.find((p) => p.requirementId === req.id);
      const existing = grouped.get(req.category) || [];
      existing.push({ ...req, progress: reqProgress });
      grouped.set(req.category, existing);
    });

    return grouped;
  }, [requirements, progress]);

  const getRequirementStatus = (req: Requirement): RequirementStatus => {
    const reqProgress = progress.find((p) => p.requirementId === req.id);
    return reqProgress?.status || "not_started";
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Authorization Progress</CardTitle>
          <CardDescription>Track your progress across all FCA requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">{progressStats.percentage}% Complete</span>
                <span className="text-slate-500">
                  {progressStats.completed} of {progressStats.total} requirements
                </span>
              </div>
              <Progress value={progressStats.percentage} className="h-3" />
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{progressStats.completed}</p>
                <p className="text-xs text-green-700">Complete</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{progressStats.inProgress}</p>
                <p className="text-xs text-blue-700">In Progress</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-2xl font-bold text-slate-600">{progressStats.notStarted}</p>
                <p className="text-xs text-slate-500">Not Started</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Action Card */}
      {nextAction && (
        <Card className="border-2 border-teal-200 bg-teal-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                <ArrowRightIcon className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-teal-600">What&apos;s Next</p>
                <p className="mt-1 font-medium text-slate-900">{nextAction.title}</p>
                <p className="mt-1 text-sm text-slate-600">{nextAction.description}</p>
                {onRequirementClick && (
                  <button
                    onClick={() => onRequirementClick(nextAction.id)}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Start this requirement
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Checklist by Category */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Requirements Checklist</CardTitle>
          <CardDescription>All FCA requirements for your authorization application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from(requirementsByCategory.entries()).map(([category, reqs]) => {
            const categoryInfo = requirementCategories[category];
            const categoryComplete = reqs.filter((r) => r.progress?.status === "complete").length;
            const categoryTotal = reqs.length;

            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{categoryInfo.label}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryComplete}/{categoryTotal}
                    </Badge>
                  </div>
                  <Progress
                    value={categoryTotal > 0 ? (categoryComplete / categoryTotal) * 100 : 0}
                    className="h-1.5 w-24"
                  />
                </div>

                {/* Requirements List */}
                <div className="space-y-2">
                  {reqs.map((req) => {
                    const status = getRequirementStatus(req);
                    const config = statusConfig[status];
                    const StatusIcon = config.icon;
                    const docsUploaded = req.progress?.documentsUploaded || 0;
                    const docsRequired = req.documents.filter((d) => d.isMandatory).length;

                    return (
                      <button
                        key={req.id}
                        onClick={() => onRequirementClick?.(req.id)}
                        className="flex w-full items-start gap-3 rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-slate-200 hover:shadow-sm"
                      >
                        <StatusIcon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-slate-900">{req.title}</p>
                            {req.isMandatory && (
                              <Badge className="flex-shrink-0 bg-red-100 text-red-700 text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{req.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs">
                            <span className={`rounded-full px-2 py-0.5 ${config.bgColor} ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-slate-400">
                              {docsUploaded}/{docsRequired} documents
                            </span>
                            {req.fcaReference && (
                              <span className="text-slate-400">{req.fcaReference}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
