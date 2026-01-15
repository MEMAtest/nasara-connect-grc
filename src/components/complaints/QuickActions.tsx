"use client";

import { useState } from "react";
import {
  FileText,
  MessageSquarePlus,
  AlertCircle,
  CheckCircle,
  Flag,
  UserPlus,
  Scale,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ComplaintRecord, ComplaintStatus, ComplaintPriority } from "@/lib/database";

interface QuickActionsProps {
  complaint: ComplaintRecord;
  onGenerateLetter: () => void;
  onUpdate: () => void;
  className?: string;
}

const STATUS_OPTIONS: { value: ComplaintStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "open", label: "Open", icon: AlertCircle, color: "text-blue-600" },
  { value: "investigating", label: "Investigating", icon: AlertCircle, color: "text-amber-600" },
  { value: "escalated", label: "Escalated", icon: AlertCircle, color: "text-purple-600" },
  { value: "resolved", label: "Resolved", icon: CheckCircle, color: "text-emerald-600" },
  { value: "closed", label: "Closed", icon: CheckCircle, color: "text-slate-600" },
  { value: "referred_to_fos", label: "Referred to FOS", icon: Scale, color: "text-rose-600" },
];

const PRIORITY_OPTIONS: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-slate-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

export function QuickActions({
  complaint,
  onGenerateLetter,
  onUpdate,
  className,
}: QuickActionsProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [assignee, setAssignee] = useState(complaint.assigned_to || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          updated_by: "User", // In production, use actual user name
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: ComplaintPriority) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority: newPriority,
          updated_by: "User",
        }),
      });

      if (!response.ok) throw new Error("Failed to update priority");
      onUpdate();
    } catch (error) {
      console.error("Error updating priority:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "note_added",
          description: noteContent,
          performed_by: "User",
        }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      setNoteContent("");
      setIsNoteDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignee.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: assignee,
          updated_by: "User",
        }),
      });

      if (!response.ok) throw new Error("Failed to assign");

      setIsAssignDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error assigning complaint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === complaint.status);
  const currentPriority = PRIORITY_OPTIONS.find((p) => p.value === complaint.priority);

  return (
    <div className={cn("rounded-xl border bg-white p-4", className)}>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Actions</h3>

      <div className="space-y-2">
        {/* Generate Letter */}
        <Button
          onClick={onGenerateLetter}
          className="w-full justify-start"
          variant="outline"
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Letter
        </Button>

        {/* Update Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
              <div className="flex items-center">
                {currentStatus && (
                  <currentStatus.icon className={cn("mr-2 h-4 w-4", currentStatus.color)} />
                )}
                <span>Status: {complaint.status}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={cn(
                  complaint.status === status.value && "bg-slate-100"
                )}
              >
                <status.icon className={cn("mr-2 h-4 w-4", status.color)} />
                {status.label}
                {complaint.status === status.value && (
                  <CheckCircle className="ml-auto h-4 w-4 text-emerald-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Update Priority */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
              <div className="flex items-center">
                <div className={cn("mr-2 h-2 w-2 rounded-full", currentPriority?.color)} />
                <span>Priority: {complaint.priority}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {PRIORITY_OPTIONS.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                onClick={() => handlePriorityChange(priority.value)}
                className={cn(
                  complaint.priority === priority.value && "bg-slate-100"
                )}
              >
                <div className={cn("mr-2 h-2 w-2 rounded-full", priority.color)} />
                {priority.label}
                {complaint.priority === priority.value && (
                  <CheckCircle className="ml-auto h-4 w-4 text-emerald-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenuSeparator />

        {/* Add Note */}
        <Button
          onClick={() => setIsNoteDialogOpen(true)}
          variant="outline"
          className="w-full justify-start"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Add Note
        </Button>

        {/* Assign */}
        <Button
          onClick={() => setIsAssignDialogOpen(true)}
          variant="outline"
          className="w-full justify-start"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {complaint.assigned_to ? "Reassign" : "Assign"}
        </Button>

        {/* FOS Referral */}
        {complaint.status !== "referred_to_fos" && (
          <Button
            onClick={() => handleStatusChange("referred_to_fos")}
            variant="outline"
            className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            disabled={isLoading}
          >
            <Scale className="mr-2 h-4 w-4" />
            Refer to FOS
          </Button>
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add an internal note to this complaint record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!noteContent.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Complaint</DialogTitle>
            <DialogDescription>
              Assign this complaint to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Enter name or email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!assignee.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
