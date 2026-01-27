"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, CircleDot, FileCheck2 } from "lucide-react";
import {
  FCA_API_CHECKLIST,
  CHECKLIST_STATUS_OPTIONS,
  type ChecklistItemStatus,
  type ChecklistCategory,
  type ChecklistItem,
  getTotalItemCount,
} from "@/lib/fca-api-checklist";

interface FCAChecklistProps {
  packId: string;
  initialStatuses?: Record<string, ChecklistItemStatus>;
  onStatusChange?: (itemId: string, status: ChecklistItemStatus) => void;
}

function StatusIcon({ status }: { status: ChecklistItemStatus }) {
  switch (status) {
    case 'not_started':
      return <Circle className="h-4 w-4 text-slate-400" />;
    case 'in_progress':
      return <CircleDot className="h-4 w-4 text-amber-500" />;
    case 'draft_ready':
      return <CircleDot className="h-4 w-4 text-blue-500" />;
    case 'reviewed':
      return <CircleDot className="h-4 w-4 text-purple-500" />;
    case 'final_ready':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'submitted':
      return <CheckCircle2 className="h-4 w-4 text-teal-500" />;
    default:
      return <Circle className="h-4 w-4 text-slate-400" />;
  }
}

const CategorySection = memo(function CategorySection({
  category,
  statuses,
  onStatusChange,
  defaultExpanded = false,
}: {
  category: ChecklistCategory;
  statuses: Record<string, ChecklistItemStatus>;
  onStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  defaultExpanded?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const { completed, total } = useMemo(() => {
    const completedStatuses: ChecklistItemStatus[] = ['final_ready', 'submitted'];
    const completedCount = category.items.filter(item =>
      completedStatuses.includes(statuses[item.id] || 'not_started')
    ).length;
    return { completed: completedCount, total: category.items.length };
  }, [category.items, statuses]);

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              )}
              <span className="font-medium text-slate-900">{category.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{completed}/{total}</span>
              {completed === total && total > 0 && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <div className="px-4 pb-2">
          <Progress value={progressPercent} className="h-1.5" />
          <span className="text-xs text-slate-400">{progressPercent}%</span>
        </div>
        <CollapsibleContent>
          <div className="border-t border-slate-100">
            {category.items.map((item, index) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                status={statuses[item.id] || 'not_started'}
                onStatusChange={onStatusChange}
                isLast={index === category.items.length - 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});

function ChecklistItemRow({
  item,
  status,
  onStatusChange,
  isLast,
}: {
  item: ChecklistItem;
  status: ChecklistItemStatus;
  onStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  isLast: boolean;
}) {
  const statusOption = CHECKLIST_STATUS_OPTIONS.find(opt => opt.value === status);

  return (
    <div className={`flex flex-col gap-2 p-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="pt-0.5">
            <StatusIcon status={status} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {item.fcaReference && (
                <Badge variant="outline" className="text-xs bg-slate-50">
                  {item.fcaReference}
                </Badge>
              )}
              {item.applicability && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  {item.applicability}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(item.id, value as ChecklistItemStatus)}
        >
          <SelectTrigger className={`w-[140px] h-8 text-xs ${statusOption?.bgColor} border-0`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHECKLIST_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className={`inline-flex items-center gap-1.5 text-xs ${opt.color}`}>
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function FCAChecklist({ packId, initialStatuses = {}, onStatusChange }: FCAChecklistProps) {
  const [statuses, setStatuses] = useState<Record<string, ChecklistItemStatus>>(initialStatuses);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          if (data.checklist && isMounted) {
            setStatuses(data.checklist);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (isMounted) {
          console.error('Failed to load checklist:', err);
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

  // Ref to store previous status for rollback
  const previousStatusRef = useRef<{ itemId: string; status: ChecklistItemStatus } | null>(null);

  const handleStatusChange = useCallback(async (itemId: string, newStatus: ChecklistItemStatus) => {
    // Store previous status for potential rollback
    setStatuses(prev => {
      previousStatusRef.current = { itemId, status: prev[itemId] || 'not_started' };
      return { ...prev, [itemId]: newStatus };
    });
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to save status');
      }

      // Notify parent if callback provided
      onStatusChange?.(itemId, newStatus);
    } catch (err) {
      // Rollback on error using the ref
      if (previousStatusRef.current && previousStatusRef.current.itemId === itemId) {
        setStatuses(prev => ({
          ...prev,
          [itemId]: previousStatusRef.current!.status,
        }));
      }
      setError('Failed to save. Please try again.');
      console.error('Failed to save checklist status:', err);
    } finally {
      setIsSaving(false);
      previousStatusRef.current = null;
    }
  }, [packId, onStatusChange]);

  const overallProgress = useMemo(() => {
    const totalItems = getTotalItemCount();
    if (totalItems === 0) return 0;

    const completedStatuses: ChecklistItemStatus[] = ['final_ready', 'submitted'];
    const completedCount = Object.values(statuses).filter(s =>
      completedStatuses.includes(s)
    ).length;

    return Math.round((completedCount / totalItems) * 100);
  }, [statuses]);

  const itemsCompleted = useMemo(() => {
    const completedStatuses: ChecklistItemStatus[] = ['final_ready', 'submitted'];
    return Object.values(statuses).filter(s => completedStatuses.includes(s)).length;
  }, [statuses]);

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
    <Card className="border border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <FileCheck2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-lg">FCA API Documentation Checklist</CardTitle>
              <CardDescription>Track all required documents for your API application</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{overallProgress}%</p>
            <p className="text-xs text-slate-500">{itemsCompleted}/{getTotalItemCount()} complete</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={overallProgress} className="h-2" />
        </div>
        {isSaving && (
          <p className="text-xs text-slate-400 mt-2">Saving...</p>
        )}
        {error && (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {FCA_API_CHECKLIST.map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            statuses={statuses}
            onStatusChange={handleStatusChange}
            defaultExpanded={index === 0}
          />
        ))}
      </CardContent>
    </Card>
  );
}
