"use client";

import { useState } from "react";
import {
  GitBranch,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  FileText,
  Check,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PolicyVersion } from "@/lib/database";

interface PolicyVersionHistoryProps {
  versions: PolicyVersion[];
  currentVersionNumber?: number;
  className?: string;
  onViewVersion?: (version: PolicyVersion) => void;
  onRestoreVersion?: (version: PolicyVersion) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-700" },
  in_review: { bg: "bg-amber-100", text: "text-amber-700" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700" },
  archived: { bg: "bg-slate-100", text: "text-slate-500" },
  expired: { bg: "bg-rose-100", text: "text-rose-700" },
};

export function PolicyVersionHistory({
  versions,
  currentVersionNumber,
  className,
  onViewVersion,
  onRestoreVersion,
}: PolicyVersionHistoryProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const toggleExpand = (versionId: string) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  if (versions.length === 0) {
    return (
      <div className={cn("rounded-xl border bg-white", className)}>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <GitBranch className="h-4 w-4" />
          <h3 className="text-sm font-semibold text-slate-900">Version History</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <GitBranch className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No version history available</p>
          <p className="mt-1 text-xs text-slate-400">
            Versions are created when policies are published
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-white", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <GitBranch className="h-4 w-4" />
          Version History
        </h3>
        <Badge variant="secondary" className="text-xs">
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="divide-y">
        {versions.map((version, index) => {
          const isCurrent = currentVersionNumber === version.version_number;
          const isLatest = index === 0;
          const isExpanded = expandedVersion === version.id;
          const statusColors = STATUS_COLORS[version.status] || STATUS_COLORS.draft;

          return (
            <div
              key={version.id}
              className={cn(
                "transition-colors",
                isCurrent && "bg-blue-50/50"
              )}
            >
              {/* Version header */}
              <button
                onClick={() => toggleExpand(version.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      Version {version.version_number}
                    </span>
                    {isCurrent && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Current
                      </Badge>
                    )}
                    {isLatest && !isCurrent && (
                      <Badge variant="outline" className="text-xs">
                        Latest
                      </Badge>
                    )}
                    <Badge className={cn("text-xs", statusColors.bg, statusColors.text)}>
                      {version.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {version.change_summary && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {version.change_summary}
                    </p>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-col items-end text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(version.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {version.published_by && (
                    <span className="mt-0.5 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {version.published_by}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t bg-slate-50 px-4 py-3">
                  <div className="ml-11 space-y-3">
                    {/* Version details */}
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div>
                          <span className="font-medium text-slate-700">Name:</span>{" "}
                          <span className="text-slate-600">{version.name}</span>
                        </div>
                      </div>
                      {version.description && (
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                          <div>
                            <span className="font-medium text-slate-700">Description:</span>{" "}
                            <span className="text-slate-600">{version.description}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div>
                          <span className="font-medium text-slate-700">Created:</span>{" "}
                          <span className="text-slate-600">
                            {new Date(version.created_at).toLocaleString("en-GB")}
                          </span>
                        </div>
                      </div>
                      {version.published_at && (
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-slate-400" />
                          <div>
                            <span className="font-medium text-slate-700">Published:</span>{" "}
                            <span className="text-slate-600">
                              {new Date(version.published_at).toLocaleString("en-GB")}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div>
                          <span className="font-medium text-slate-700">Clauses:</span>{" "}
                          <span className="text-slate-600">
                            {Array.isArray(version.clauses) ? version.clauses.length : 0} clauses
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {onViewVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewVersion(version);
                          }}
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5" />
                          View Full Version
                        </Button>
                      )}
                      {onRestoreVersion && !isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreVersion(version);
                          }}
                        >
                          <GitBranch className="mr-1.5 h-3.5 w-3.5" />
                          Restore This Version
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
