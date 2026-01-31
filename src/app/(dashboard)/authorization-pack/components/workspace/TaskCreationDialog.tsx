"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { TIMELINE_PHASES } from "@/lib/fca-api-checklist";

export interface TimelineTask {
  id: string;
  packId: string;
  name: string;
  description?: string;
  phase: string;
  targetWeek: number;
  status: "pending" | "in_progress" | "completed";
  isMilestone: boolean;
  createdAt: string;
}

interface TaskCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPhase?: string;
  totalWeeks: number;
  onTaskCreated: (task: TimelineTask) => void;
  onTaskUpdated?: (task: TimelineTask) => void;
  editingTask?: TimelineTask | null;
  packId: string;
}

export function TaskCreationDialog({
  open,
  onOpenChange,
  defaultPhase,
  totalWeeks,
  onTaskCreated,
  onTaskUpdated,
  editingTask,
  packId,
}: TaskCreationDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState(defaultPhase || TIMELINE_PHASES[0].name);
  const [targetWeek, setTargetWeek] = useState(1);
  const [isMilestone, setIsMilestone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingTask;

  // Pre-populate form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description || "");
      setPhase(editingTask.phase);
      setTargetWeek(editingTask.targetWeek);
      setIsMilestone(editingTask.isMilestone);
      setError(null);
    } else {
      setName("");
      setDescription("");
      setPhase(defaultPhase || TIMELINE_PHASES[0].name);
      setTargetWeek(1);
      setIsMilestone(false);
      setError(null);
    }
  }, [editingTask, defaultPhase]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPhase(defaultPhase || TIMELINE_PHASES[0].name);
    setTargetWeek(1);
    setIsMilestone(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Task name is required");
      return;
    }
    if (targetWeek < 1 || targetWeek > totalWeeks) {
      setError(`Target week must be between 1 and ${totalWeeks}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editingTask) {
        // PATCH existing task
        const response = await fetch(`/api/authorization-pack/packs/${packId}/timeline-tasks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: editingTask.id,
            name: name.trim(),
            description: description.trim() || null,
            phase,
            targetWeek,
            isMilestone,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update task");
        }

        const data = await response.json();
        onTaskUpdated?.(data.task);
      } else {
        // POST new task
        const response = await fetch(`/api/authorization-pack/packs/${packId}/timeline-tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            phase,
            targetWeek,
            isMilestone,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create task");
        }

        const data = await response.json();
        onTaskCreated(data.task);
      }
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditing ? "Failed to update task" : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the selected phase's week range for guidance
  const selectedPhaseData = TIMELINE_PHASES.find((p) => p.name === phase);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? isMilestone ? "Edit Milestone" : "Edit Task"
              : isMilestone ? "Add Milestone" : "Add Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details below"
              : isMilestone
              ? "Add a milestone marker to the timeline"
              : "Create a task and assign it to a timeline phase"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMilestone ? "e.g. FCA Pre-Application Meeting" : "e.g. Draft AML Policy"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description (optional)</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_PHASES.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-week">
                Target Week
                {selectedPhaseData && (
                  <span className="text-[10px] text-slate-400 ml-1">
                    (W{selectedPhaseData.startWeek}-W{selectedPhaseData.endWeek})
                  </span>
                )}
              </Label>
              <Input
                id="target-week"
                type="number"
                min={1}
                max={totalWeeks}
                value={targetWeek}
                onChange={(e) => setTargetWeek(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is-milestone"
              checked={isMilestone}
              onCheckedChange={setIsMilestone}
            />
            <Label htmlFor="is-milestone" className="text-sm">
              Mark as milestone
            </Label>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing ? "Saving..." : "Creating..."
              : isEditing ? "Save Changes" : isMilestone ? "Add Milestone" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
