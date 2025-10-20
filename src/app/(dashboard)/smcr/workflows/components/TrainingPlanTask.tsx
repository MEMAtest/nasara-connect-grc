"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Download, Plus, Trash2 } from "lucide-react";
import {
  PersonRecord,
  RoleAssignment,
  TrainingPlanDraft,
  TrainingPlanDraftItem,
  TrainingPlanItemStatus,
} from "../../context/SmcrDataContext";

const itemStatuses: { value: TrainingPlanItemStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const statusTone: Record<TrainingPlanItemStatus, string> = {
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
  scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

type TrainingPlanTaskProps = {
  draft: TrainingPlanDraft;
  people: PersonRecord[];
  roles: RoleAssignment[];
  onUpdateDraft: (updater: (draft: TrainingPlanDraft) => TrainingPlanDraft) => void;
};

export function TrainingPlanTask({ draft, people, roles, onUpdateDraft }: TrainingPlanTaskProps) {
  const subject = people.find((person) => person.id === draft.subjectPersonId);
  const subjectRoles = useMemo(() => (subject ? roles.filter((role) => role.personId === subject.id) : []), [roles, subject]);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const completionBreakdown = useMemo(() => {
    const total = draft.items.length;
    const completed = draft.items.filter((item) => item.status === "completed").length;
    return { total, completed };
  }, [draft.items]);

  const exportDisabled = !subject || draft.items.length === 0;

  const handleSubjectChange = (personId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      subjectPersonId: personId,
    }));
  };

  const handleAddItem = () => {
    const title = newModuleTitle.trim();
    if (!title) return;
    const item: TrainingPlanDraftItem = {
      id: crypto.randomUUID?.() ?? `module-${Math.random().toString(36).slice(2, 10)}`,
      moduleId: undefined,
      title,
      ownerId: subject?.id,
      dueDate: undefined,
      status: "scheduled",
      deliveryMethod: "Online course",
      notes: "",
    };
    onUpdateDraft((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
    setNewModuleTitle("");
  };

  const handleUpdateItem = (itemId: string, updates: Partial<TrainingPlanDraftItem>) => {
    onUpdateDraft((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleExport = () => {
    if (!subject) return;
    const generatedAt = format(new Date(), "PPP p");
    const rows = draft.items
      .map((item) => {
        const due = item.dueDate ? format(new Date(item.dueDate), "PPP") : "—";
        const statusLabel = itemStatuses.find((status) => status.value === item.status)?.label ?? item.status;
        return `<tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(people.find((person) => person.id === item.ownerId)?.name ?? "Unassigned")}</td>
          <td>${escapeHtml(due)}</td>
          <td>${escapeHtml(statusLabel)}</td>
          <td>${escapeHtml(item.notes ?? "")}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>Training Plan – ${escapeHtml(subject.name)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #cbd5f5; padding-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #cbd5f5; padding: 8px; font-size: 13px; vertical-align: top; }
      th { background: #f8fafc; text-align: left; }
      p { margin: 6px 0; }
    </style>
  </head>
  <body>
    <h1>Training & Competence Plan</h1>
    <p><strong>Individual:</strong> ${escapeHtml(subject.name)} (${escapeHtml(subject.employeeId)})</p>
    <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>

    <h2>Summary</h2>
    <p>Total modules: ${draft.items.length}</p>
    <p>Completed: ${completionBreakdown.completed}</p>
    <p>Review date: ${draft.reviewDate ? format(new Date(draft.reviewDate), "PPP") : "Not set"}</p>
    <p>Summary notes: ${escapeHtml(draft.summary || "None recorded.")}</p>

    <h2>Modules</h2>
    <table>
      <thead>
        <tr>
          <th>Module</th>
          <th>Owner</th>
          <th>Due</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows || "<tr><td colspan='5'>No modules recorded.</td></tr>"}
      </tbody>
    </table>
  </body>
</html>`;

    const exportName = `${subject.name.toLowerCase().replace(/\s+/g, "-")}-training-plan.html`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-6">
      <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
        <Card className="gap-0 p-0 shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Plan summary</p>
            <p className="text-xs text-slate-500">Keep evidence of the competence plan agreed.</p>
          </div>
          <div className="space-y-4 px-5 py-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">Individual</p>
              <p className="text-sm font-semibold text-slate-900">
                {subject ? subject.name : "Select SM&CR record"}
              </p>
              <p className="text-slate-500">
                {subject ? subject.employeeId : "No individual linked"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">{completionBreakdown.completed}</span>{" "}
                of {completionBreakdown.total} modules completed
              </p>
              <p>
                Review date:{" "}
                {draft.reviewDate ? format(new Date(draft.reviewDate), "PPP") : "not scheduled"}
              </p>
            </div>
            <div className="space-y-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleExport} disabled={exportDisabled} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download summary
              </Button>
              {exportDisabled && (
                <p className="text-[11px] text-amber-700">
                  Select an individual and add at least one module before exporting.
                </p>
              )}
            </div>
          </div>
        </Card>
      </aside>

      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Subject & review</p>
              <p className="text-xs text-slate-500">Link the individual and set an annual review date.</p>
            </div>
          </div>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div>
              <Label>Individual</Label>
              <Select value={draft.subjectPersonId ?? ""} onValueChange={handleSubjectChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select individual" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} · {person.employeeId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Review date</Label>
              <Input
                className="mt-2"
                type="date"
                value={draft.reviewDate ? format(new Date(draft.reviewDate), "yyyy-MM-dd") : ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    reviewDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                  }))
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Modules & actions</p>
              <p className="text-xs text-slate-500">Break down commitments, assign owners, and track progress.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add module or action"
                value={newModuleTitle}
                onChange={(event) => setNewModuleTitle(event.target.value)}
                className="h-9 w-56"
              />
              <Button type="button" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4">
            {draft.items.length === 0 ? (
              <p className="text-xs text-slate-500">No modules added yet. Add items above to build the plan.</p>
            ) : (
              draft.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.deliveryMethod ?? "Delivery method not recorded"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] uppercase", statusTone[item.status])}
                      >
                        {itemStatuses.find((status) => status.value === item.status)?.label ?? item.status}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(item.id)} aria-label="Remove module">
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-slate-500">Owner</Label>
                      <Select
                        value={item.ownerId ?? ""}
                        onValueChange={(value) =>
                          handleUpdateItem(item.id, { ownerId: value || undefined })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Assign owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {people.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Due date</Label>
                      <Input
                        className="mt-1"
                        type="date"
                        value={item.dueDate ? format(new Date(item.dueDate), "yyyy-MM-dd") : ""}
                        onChange={(event) =>
                          handleUpdateItem(item.id, {
                            dueDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Status</Label>
                      <Select
                        value={item.status}
                        onValueChange={(value: TrainingPlanItemStatus) =>
                          handleUpdateItem(item.id, { status: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Delivery method</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g. Online module, classroom, coaching"
                        value={item.deliveryMethod ?? ""}
                        onChange={(event) => handleUpdateItem(item.id, { deliveryMethod: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label className="text-xs text-slate-500">Notes</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      value={item.notes ?? ""}
                      onChange={(event) => handleUpdateItem(item.id, { notes: event.target.value })}
                      placeholder="Capture evidence requirements, assessment approach, or completion notes."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Summary & attestations</p>
            <p className="text-xs text-slate-500">Capture context, escalation, and sign-off information.</p>
          </div>
          <div className="space-y-3 px-5 py-4">
            <Textarea
              rows={4}
              value={draft.summary ?? ""}
              onChange={(event) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  summary: event.target.value,
                }))
              }
              placeholder="Summarise key development areas, CPD commitments, or outstanding approvals."
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox checked={draft.items.every((item) => item.status === "completed") && draft.items.length > 0} disabled />
              <span>All training actions completed</span>
            </div>
          </div>
        </section>

        {subjectRoles.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">Linked SM&CR roles</p>
              <p className="text-xs text-slate-500">Use this overview to tailor competency requirements.</p>
            </div>
            <div className="space-y-2 px-5 py-4 text-xs text-slate-600">
              {subjectRoles.map((role) => (
                <div key={role.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-900">{role.functionLabel}</p>
                  <p>Effective {format(new Date(role.startDate), "PPP")}</p>
                  {role.notes && <p className="mt-1">Notes: {role.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
