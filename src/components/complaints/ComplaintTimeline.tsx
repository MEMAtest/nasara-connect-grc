"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  MessageSquare,
  UserPlus,
  Flag,
  Scale,
  XCircle,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComplaintActivity, ActivityType } from "@/lib/database";

interface ComplaintTimelineProps {
  activities: ComplaintActivity[];
  className?: string;
  onViewLetter?: (letterId: string) => void;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  complaint_created: FileText,
  status_change: AlertCircle,
  letter_generated: FileText,
  letter_sent: Mail,
  note_added: MessageSquare,
  assigned: UserPlus,
  priority_change: Flag,
  fos_referred: Scale,
  resolved: CheckCircle,
  closed: XCircle,
};

const ACTIVITY_COLORS: Record<ActivityType, { bg: string; icon: string; border: string }> = {
  complaint_created: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-200",
  },
  status_change: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    border: "border-amber-200",
  },
  letter_generated: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    border: "border-purple-200",
  },
  letter_sent: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    border: "border-indigo-200",
  },
  note_added: {
    bg: "bg-slate-50",
    icon: "text-slate-600",
    border: "border-slate-200",
  },
  assigned: {
    bg: "bg-cyan-50",
    icon: "text-cyan-600",
    border: "border-cyan-200",
  },
  priority_change: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    border: "border-orange-200",
  },
  fos_referred: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    border: "border-rose-200",
  },
  resolved: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    border: "border-emerald-200",
  },
  closed: {
    bg: "bg-slate-100",
    icon: "text-slate-500",
    border: "border-slate-300",
  },
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  complaint_created: "Complaint Created",
  status_change: "Status Changes",
  letter_generated: "Letters Generated",
  letter_sent: "Letters Sent",
  note_added: "Notes",
  assigned: "Assignments",
  priority_change: "Priority Changes",
  fos_referred: "FOS Referrals",
  resolved: "Resolutions",
  closed: "Closures",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GroupedActivities {
  date: string;
  dateLabel: string;
  activities: ComplaintActivity[];
}

export function ComplaintTimeline({
  activities,
  className,
  onViewLetter,
}: ComplaintTimelineProps) {
  const [filterTypes, setFilterTypes] = useState<Set<ActivityType>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const filtered = filterTypes.size > 0
      ? activities.filter((a) => filterTypes.has(a.activity_type))
      : activities;

    const groups: Record<string, ComplaintActivity[]> = {};

    filtered.forEach((activity) => {
      const date = new Date(activity.created_at).toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    // Sort activities within each group by time (newest first)
    Object.keys(groups).forEach((date) => {
      groups[date].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(groups)
      .map(([date, activities]) => ({
        date,
        dateLabel: formatDateLabel(date),
        activities,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, filterTypes]);

  const toggleFilter = (type: ActivityType) => {
    const newFilters = new Set(filterTypes);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setFilterTypes(newFilters);
  };

  const toggleGroup = (date: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupExpanded = (date: string) => {
    // Default to expanded for recent dates (last 7 days)
    if (expandedGroups.size === 0) {
      const daysDiff = Math.floor(
        (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 7;
    }
    return expandedGroups.has(date);
  };

  return (
    <div className={cn("rounded-xl border bg-white", className)}>
      {/* Header with filter */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Clock className="h-4 w-4" />
          Activity Timeline
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filter
              {filterTypes.size > 0 && (
                <span className="ml-1 rounded-full bg-blue-100 px-1.5 text-xs font-medium text-blue-700">
                  {filterTypes.size}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filterTypes.has(type)}
                onCheckedChange={() => toggleFilter(type)}
              >
                {ACTIVITY_LABELS[type]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline content */}
      <div className="p-4">
        {groupedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No activities to display</p>
            {filterTypes.size > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setFilterTypes(new Set())}
                className="mt-1"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 h-full w-0.5 bg-slate-200" />

            {/* Activity groups */}
            <div className="space-y-4">
              {groupedActivities.map((group) => (
                <div key={group.date} className="relative">
                  {/* Date header */}
                  <button
                    onClick={() => toggleGroup(group.date)}
                    className="relative mb-2 flex w-full items-center gap-2 text-left"
                  >
                    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                      {isGroupExpanded(group.date) ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {group.dateLabel}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({group.activities.length} {group.activities.length === 1 ? "activity" : "activities"})
                    </span>
                  </button>

                  {/* Activities for this date */}
                  {isGroupExpanded(group.date) && (
                    <div className="ml-8 space-y-2">
                      {group.activities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onViewLetter={onViewLetter}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityCardProps {
  activity: ComplaintActivity;
  onViewLetter?: (letterId: string) => void;
}

function ActivityCard({ activity, onViewLetter }: ActivityCardProps) {
  const Icon = ACTIVITY_ICONS[activity.activity_type] || Clock;
  const colors = ACTIVITY_COLORS[activity.activity_type] || ACTIVITY_COLORS.note_added;
  const time = new Date(activity.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasLetter = activity.metadata &&
    typeof activity.metadata.letter_id === 'string' &&
    activity.metadata.letter_id.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors hover:shadow-sm",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            colors.bg
          )}
        >
          <Icon className={cn("h-4 w-4", colors.icon)} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {activity.description}
            </p>
            <span className="flex-shrink-0 text-xs text-slate-400">{time}</span>
          </div>

          {/* Value change indicator */}
          {activity.old_value && activity.new_value && (
            <p className="mt-1 text-xs text-slate-500">
              <span className="line-through">{activity.old_value}</span>
              <span className="mx-1">→</span>
              <span className="font-medium">{activity.new_value}</span>
            </p>
          )}

          {/* New value only */}
          {!activity.old_value && activity.new_value && (
            <p className="mt-1 text-xs text-slate-500">
              {activity.new_value}
            </p>
          )}

          {/* Footer with attribution and actions */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              by {activity.performed_by || "System"}
            </span>

            {hasLetter && onViewLetter ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewLetter(String(activity.metadata?.letter_id))}
                className="h-6 px-2 text-xs"
                aria-label="View letter for this activity"
              >
                View Letter
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === today.toISOString().split("T")[0]) {
    return "Today";
  }
  if (dateString === yesterday.toISOString().split("T")[0]) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}
