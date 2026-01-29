"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Circle,
  CircleDot,
  CheckCircle2,
  FileText,
  Building2,
  BarChart3,
  Network,
  Briefcase,
  Landmark,
  Shield,
  Settings2,
  Lock,
  Scale,
  ScrollText,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from "lucide-react";
import {
  FCA_API_CHECKLIST,
  CHECKLIST_STATUS_OPTIONS,
  type ChecklistItemStatus,
  type ChecklistCategory,
  type ChecklistItem,
  getTotalItemCount,
} from "@/lib/fca-api-checklist";
import { PHASE_COLORS, isValidChecklistResponse } from "@/lib/checklist-constants";

// Icon map for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Building2,
  BarChart3,
  Network,
  Briefcase,
  Landmark,
  Shield,
  Settings2,
  Lock,
  Scale,
  ScrollText,
};

interface ChecklistCardsProps {
  packId: string;
  selectedPhase?: string | null;
  initialStatuses?: Record<string, ChecklistItemStatus>;
  onStatusChange?: (itemId: string, status: ChecklistItemStatus) => void;
}

function StatusIcon({ status }: { status: ChecklistItemStatus }) {
  switch (status) {
    case "not_started":
      return <Circle className="h-3.5 w-3.5 text-slate-400" />;
    case "in_progress":
      return <CircleDot className="h-3.5 w-3.5 text-amber-500" />;
    case "draft_ready":
      return <CircleDot className="h-3.5 w-3.5 text-blue-500" />;
    case "reviewed":
      return <CircleDot className="h-3.5 w-3.5 text-purple-500" />;
    case "final_ready":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "submitted":
      return <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-slate-400" />;
  }
}

// Memoized checklist item row
const ChecklistItemRow = memo(function ChecklistItemRow({
  item,
  status,
  onStatusChange,
  accentColor,
  isSaving,
}: {
  item: ChecklistItem;
  status: ChecklistItemStatus;
  onStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  accentColor: string;
  isSaving?: boolean;
}) {
  const statusOption = CHECKLIST_STATUS_OPTIONS.find((opt) => opt.value === status);
  const colors = PHASE_COLORS[accentColor] || PHASE_COLORS.teal;

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-white/50 bg-white px-2.5 py-1.5 transition hover:border-slate-200 hover:bg-white/90">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <StatusIcon status={status} />
        <span className="text-xs text-slate-700 truncate">{item.label}</span>
      </div>
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(item.id, value as ChecklistItemStatus)}
        disabled={isSaving}
      >
        <SelectTrigger
          className={`w-[100px] h-6 text-[10px] ${statusOption?.bgColor} border-0 shrink-0`}
          aria-label={`Status for ${item.label}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CHECKLIST_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className={`text-[10px] ${opt.color}`}>{opt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

// Memoized category card
const CategoryCard = memo(function CategoryCard({
  category,
  statuses,
  onStatusChange,
  isHighlighted,
  savingItems,
}: {
  category: ChecklistCategory;
  statuses: Record<string, ChecklistItemStatus>;
  onStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  isHighlighted: boolean;
  savingItems?: Set<string>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = PHASE_COLORS[category.accentColor] || PHASE_COLORS.teal;
  const Icon = iconMap[category.icon] || FileText;

  const { completed, total, percentage } = useMemo(() => {
    const completedStatuses: ChecklistItemStatus[] = ["final_ready", "submitted"];
    const completedCount = category.items.filter((item) =>
      completedStatuses.includes(statuses[item.id] || "not_started")
    ).length;
    const totalCount = category.items.length;
    return {
      completed: completedCount,
      total: totalCount,
      percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    };
  }, [category.items, statuses]);

  // Show first 5 items, rest in expanded view
  const visibleItems = isExpanded ? category.items : category.items.slice(0, 5);
  const hiddenCount = category.items.length - 5;

  return (
    <Card
      className={`border transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isHighlighted
          ? `${colors.border} ${colors.bg} ring-2 ring-offset-1 ${colors.border.replace("border-", "ring-")}`
          : `${colors.border} ${colors.bg}`
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg}`}>
              <Icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm truncate">{category.title}</CardTitle>
              <CardDescription className="text-[10px]">{category.phase}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`${colors.text} text-xs shrink-0`}>
            {category.items.length}
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
            <div
              className={`h-full transition-all ${colors.progressBg}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className={colors.text}>
              {completed}/{total}
            </span>
            <span className="text-slate-400">{percentage}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-1" role="list" aria-label={`${category.title} checklist items`}>
          {visibleItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              status={statuses[item.id] || "not_started"}
              onStatusChange={onStatusChange}
              accentColor={category.accentColor}
              isSaving={savingItems?.has(item.id)}
            />
          ))}
        </div>
        {hiddenCount > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${category.title} items` : `Show ${hiddenCount} more ${category.title} items`}
            className={`mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-white/50 bg-white/50 py-1.5 text-[10px] transition hover:bg-white ${colors.text}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                +{hiddenCount} more
              </>
            )}
          </button>
        )}
        {/* FCA Reference badge */}
        {category.items.some((item) => item.fcaReference) && (
          <div className="mt-2 pt-2 border-t border-white/30">
            <Badge variant="outline" className="text-[9px] bg-white/50">
              FCA Connect reference
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export function ChecklistCards({
  packId,
  selectedPhase,
  initialStatuses = {},
  onStatusChange,
}: ChecklistCardsProps) {
  const [statuses, setStatuses] = useState<Record<string, ChecklistItemStatus>>(initialStatuses);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which items are currently being saved (fixes race condition with per-item tracking)
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  // Map to store previous statuses for rollback (per-item tracking)
  const previousStatusesRef = useRef<Map<string, ChecklistItemStatus>>(new Map());

  // Load checklist state from API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadChecklist = async () => {
      if (!packId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/checklist`, {
          signal: controller.signal,
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          // Validate API response before using
          if (isValidChecklistResponse(data) && isMounted) {
            setStatuses(data.checklist as Record<string, ChecklistItemStatus>);
          } else if (isMounted) {
            console.warn("Invalid checklist response format:", data);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          console.error("Failed to load checklist:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadChecklist();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [packId]);

  const handleStatusChange = useCallback(
    async (itemId: string, newStatus: ChecklistItemStatus) => {
      // Store previous status for this specific item before updating
      const previousStatus = statuses[itemId] || "not_started";
      previousStatusesRef.current.set(itemId, previousStatus);

      // Mark this item as saving
      setSavingItems((prev) => new Set(prev).add(itemId));

      // Optimistically update the UI
      setStatuses((prev) => ({ ...prev, [itemId]: newStatus }));
      setError(null);

      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/checklist`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to save status");
        }

        // Success - remove from previous statuses map
        previousStatusesRef.current.delete(itemId);
        onStatusChange?.(itemId, newStatus);
      } catch (err) {
        // Rollback this specific item to its previous status
        const rollbackStatus = previousStatusesRef.current.get(itemId);
        if (rollbackStatus !== undefined) {
          setStatuses((prev) => ({
            ...prev,
            [itemId]: rollbackStatus,
          }));
          previousStatusesRef.current.delete(itemId);
        }
        setError("Failed to save. Please try again.");
        console.error("Failed to save checklist status:", err);
      } finally {
        // Remove from saving set
        setSavingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [packId, onStatusChange, statuses]
  );

  // Check if any items are currently being saved
  const isSaving = savingItems.size > 0;

  // Calculate overall progress
  const { overallProgress, itemsCompleted, totalItems } = useMemo(() => {
    const total = getTotalItemCount();
    const completedStatuses: ChecklistItemStatus[] = ["final_ready", "submitted"];
    const completed = Object.values(statuses).filter((s) => completedStatuses.includes(s)).length;
    return {
      overallProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
      itemsCompleted: completed,
      totalItems: total,
    };
  }, [statuses]);

  // Filter categories based on selected phase
  const filteredCategories = useMemo(() => {
    if (!selectedPhase) return FCA_API_CHECKLIST;
    return FCA_API_CHECKLIST.filter((category) => category.phase === selectedPhase);
  }, [selectedPhase]);

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            Loading checklist...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <FileCheck2 className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-base">Documentation Checklist</CardTitle>
                <CardDescription>
                  {selectedPhase
                    ? `Showing ${filteredCategories.length} categories for ${selectedPhase}`
                    : `${FCA_API_CHECKLIST.length} categories | ${totalItems} items`}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{overallProgress}%</p>
              <p className="text-xs text-slate-500">
                {itemsCompleted}/{totalItems} complete
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-2" />
          </div>
          {isSaving && <p className="text-xs text-slate-400 mt-2">Saving...</p>}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </CardHeader>
      </Card>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Documentation checklist categories">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            statuses={statuses}
            onStatusChange={handleStatusChange}
            isHighlighted={selectedPhase === category.phase}
            savingItems={savingItems}
          />
        ))}
      </div>
    </div>
  );
}
