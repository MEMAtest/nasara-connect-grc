"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "archived", label: "Archived" },
  { value: "expired", label: "Expired" },
];

const STATUS_TONES: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  in_review: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-slate-200 bg-slate-50 text-slate-500",
  expired: "border-rose-200 bg-rose-50 text-rose-700",
};

interface PolicyStatusControlProps {
  policyId: string;
  initialStatus: string;
}

export function PolicyStatusControl({ policyId, initialStatus }: PolicyStatusControlProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (value: string) => {
    if (value === status || isSaving) return;
    const previous = status;
    setStatus(value);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });

      if (!response.ok) {
        throw new Error("Unable to update status");
      }

      toast({
        title: "Status updated",
        description: `Policy marked as ${value.replace("_", " ")}.`,
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      setStatus(previous);
      toast({
        title: "Status update failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabel = STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status.replace("_", " ");
  const statusTone = STATUS_TONES[status] ?? STATUS_TONES.draft;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`capitalize text-sm ${statusTone}`}>
          {statusLabel}
        </Badge>
        {isSaving ? <span className="text-xs text-slate-400">Saving...</span> : null}
      </div>
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Update status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
