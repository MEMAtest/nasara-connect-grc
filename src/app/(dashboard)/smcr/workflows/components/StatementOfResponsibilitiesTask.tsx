"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
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
  SorApprovalStatus,
  SorResponsibilityDraft,
  StatementOfResponsibilitiesDraft,
} from "../../context/SmcrDataContext";

const approvalStatuses: { value: SorApprovalStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted for approval" },
  { value: "approved", label: "Approved" },
];

const approvalTone: Record<SorApprovalStatus, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  submitted: "bg-sky-50 text-sky-700 border-sky-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const UNASSIGNED_OWNER_VALUE = "__unassigned__";

type StatementOfResponsibilitiesTaskProps = {
  draft: StatementOfResponsibilitiesDraft;
  people: PersonRecord[];
  roles: RoleAssignment[];
  onUpdateDraft: (updater: (draft: StatementOfResponsibilitiesDraft) => StatementOfResponsibilitiesDraft) => void;
};

export function StatementOfResponsibilitiesTask({
  draft,
  people,
  roles,
  onUpdateDraft,
}: StatementOfResponsibilitiesTaskProps) {
  const subject = people.find((person) => person.id === draft.subjectPersonId);
  const [customResponsibility, setCustomResponsibility] = useState("");

  const confirmedCount = useMemo(
    () => draft.responsibilities.filter((item) => item.confirmed).length,
    [draft.responsibilities],
  );

  const exportDisabled = !subject || draft.responsibilities.length === 0;

  const handleSubjectChange = (personId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      subjectPersonId: personId,
    }));
  };

  const handleAddResponsibility = () => {
    const description = customResponsibility.trim();
    if (!description) return;
    const assignment: SorResponsibilityDraft = {
      id: crypto.randomUUID?.() ?? `sor-${Math.random().toString(36).slice(2, 10)}`,
      reference: "Custom",
      description,
      ownerId: draft.subjectPersonId,
      confirmed: false,
      notes: "",
    };
    onUpdateDraft((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, assignment],
    }));
    setCustomResponsibility("");
  };

  const handleUpdateResponsibility = (id: string, updates: Partial<SorResponsibilityDraft>) => {
    onUpdateDraft((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    }));
  };

  const handleRemoveResponsibility = (id: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((item) => item.id !== id),
    }));
  };

  const handleExport = () => {
    if (!subject) return;
    const generatedAt = format(new Date(), "PPP p");
    const rows = draft.responsibilities
      .map((item) => {
        const ownerName = people.find((person) => person.id === item.ownerId)?.name ?? "Unassigned";
        return `<tr>
          <td>${escapeHtml(item.reference)}</td>
          <td>${escapeHtml(item.description)}</td>
          <td>${escapeHtml(ownerName)}</td>
          <td>${item.confirmed ? "Yes" : "No"}</td>
          <td>${escapeHtml(item.notes ?? "")}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>Statement of Responsibilities – ${escapeHtml(subject.name)}</title>
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
    <h1>Statement of Responsibilities Summary</h1>
    <p><strong>SMF holder:</strong> ${escapeHtml(subject.name)} (${escapeHtml(subject.employeeId)})</p>
    <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
    <p><strong>Effective date:</strong> ${draft.effectiveDate ? escapeHtml(format(new Date(draft.effectiveDate), "PPP")) : "Not set"}</p>
    <p><strong>Approval status:</strong> ${escapeHtml(approvalStatuses.find((status) => status.value === draft.approvalStatus)?.label ?? draft.approvalStatus)}</p>

    <h2>Responsibility assignments</h2>
    <table>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Description</th>
          <th>Owner</th>
          <th>Confirmed</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows || "<tr><td colspan='5'>No responsibilities recorded.</td></tr>"}
      </tbody>
    </table>

    <h2>Approval notes</h2>
    <p>${escapeHtml(draft.approvalNotes ?? "None recorded.")}</p>
  </body>
</html>`;

    const exportName = `${subject.name.toLowerCase().replace(/\s+/g, "-")}-statement-of-responsibilities.html`;
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
            <p className="text-sm font-semibold text-slate-900">SoR summary</p>
            <p className="text-xs text-slate-500">Record accountability and approval trail.</p>
          </div>
          <div className="space-y-4 px-5 py-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">SMF holder</p>
              <p className="text-sm font-semibold text-slate-900">
                {subject ? subject.name : "Select SM&CR individual"}
              </p>
              <p className="text-slate-500">
                {subject ? subject.employeeId : "No individual linked"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Responsibilities confirmed:</span>{" "}
                {confirmedCount}/{draft.responsibilities.length}
              </p>
              <p>
                Approval status:{" "}
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] uppercase font-semibold",
                    approvalTone[draft.approvalStatus],
                  )}
                >
                  {approvalStatuses.find((status) => status.value === draft.approvalStatus)?.label ?? draft.approvalStatus}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleExport} disabled={exportDisabled} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download summary
              </Button>
              {exportDisabled && (
                <p className="text-[11px] text-amber-700">
                  Select the SMF holder and confirm responsibilities before exporting.
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
              <p className="text-sm font-semibold text-slate-900">SMF holder & metadata</p>
              <p className="text-xs text-slate-500">Link the SMF holder and set the effective date.</p>
            </div>
          </div>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div>
              <Label>SMF holder</Label>
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
              <Label>Effective date</Label>
              <Input
                className="mt-2"
                type="date"
                value={draft.effectiveDate ? format(new Date(draft.effectiveDate), "yyyy-MM-dd") : ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    effectiveDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Approval status</Label>
              <Select
                value={draft.approvalStatus}
                onValueChange={(value: SorApprovalStatus) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    approvalStatus: value,
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Responsibility assignments</p>
              <p className="text-xs text-slate-500">Confirm ownership and evidence for prescribed responsibilities.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add custom responsibility"
                value={customResponsibility}
                onChange={(event) => setCustomResponsibility(event.target.value)}
                className="h-9 w-64"
              />
              <Button type="button" size="sm" onClick={handleAddResponsibility}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4">
            {draft.responsibilities.length === 0 ? (
              <p className="text-xs text-slate-500">No responsibilities captured yet.</p>
            ) : (
              draft.responsibilities.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.reference} · {item.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {roles.find((role) => role.personId === item.ownerId)?.functionLabel || "Assign accountable owner"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.confirmed}
                        onCheckedChange={(checked) =>
                          handleUpdateResponsibility(item.id, { confirmed: Boolean(checked) })
                        }
                      />
                      <span className="text-xs text-slate-500">Confirmed</span>
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveResponsibility(item.id)} aria-label="Remove">
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-slate-500">Owner / accountable SMF</Label>
                      <Select
                        value={item.ownerId ?? ""}
                        onValueChange={(value) =>
                          handleUpdateResponsibility(item.id, { ownerId: value === UNASSIGNED_OWNER_VALUE ? undefined : value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED_OWNER_VALUE}>Unassigned</SelectItem>
                          {people.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Notes / evidence</Label>
                      <Textarea
                        className="mt-1"
                        rows={3}
                        value={item.notes ?? ""}
                        onChange={(event) => handleUpdateResponsibility(item.id, { notes: event.target.value })}
                        placeholder="Reference Statements of Responsibility, board approvals, or linked workflow evidence."
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Approval notes</p>
            <p className="text-xs text-slate-500">Capture sign-off commentary or escalation decisions.</p>
          </div>
          <div className="space-y-3 px-5 py-4">
            <Textarea
              rows={4}
              value={draft.approvalNotes ?? ""}
              onChange={(event) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  approvalNotes: event.target.value,
                }))
              }
              placeholder="Document approvals, board minutes references, or any conditions attached to the SoR."
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox checked={confirmedCount === draft.responsibilities.length && draft.responsibilities.length > 0} disabled />
              <span>All responsibilities confirmed</span>
            </div>
          </div>
        </section>
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
