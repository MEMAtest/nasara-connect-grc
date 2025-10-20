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
import { PersonRecord, ReferenceRequestDraft, ReferenceRequestEntry, ReferenceResponseStatus } from "../../context/SmcrDataContext";

const statuses: { value: ReferenceResponseStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "requested", label: "Requested" },
  { value: "received_clean", label: "Received – clean" },
  { value: "received_concerns", label: "Received – concerns" },
  { value: "refused", label: "Refused" },
  { value: "no_response", label: "No response" },
];

const statusTone: Record<ReferenceResponseStatus, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  requested: "bg-sky-50 text-sky-700 border-sky-200",
  received_clean: "bg-emerald-50 text-emerald-700 border-emerald-200",
  received_concerns: "bg-amber-50 text-amber-700 border-amber-200",
  refused: "bg-rose-50 text-rose-700 border-rose-200",
  no_response: "bg-slate-50 text-slate-600 border-slate-200",
};

type ReferenceRequestTaskProps = {
  draft: ReferenceRequestDraft;
  people: PersonRecord[];
  onUpdateDraft: (updater: (draft: ReferenceRequestDraft) => ReferenceRequestDraft) => void;
};

export function ReferenceRequestTask({ draft, people, onUpdateDraft }: ReferenceRequestTaskProps) {
  const [newFirmName, setNewFirmName] = useState("");
  const [newContactName, setNewContactName] = useState("");

  const subject = useMemo(() => people.find((person) => person.id === draft.subjectPersonId) ?? null, [people, draft.subjectPersonId]);

  const statusSummary = useMemo(() => {
    const counts: Record<ReferenceResponseStatus, number> = {
      pending: 0,
      requested: 0,
      received_clean: 0,
      received_concerns: 0,
      refused: 0,
      no_response: 0,
    };
    draft.entries.forEach((entry) => {
      counts[entry.status] = (counts[entry.status] ?? 0) + 1;
    });
    return counts;
  }, [draft.entries]);

  const awaitingResponses = draft.entries.filter((entry) => entry.status === "pending" || entry.status === "requested").length;
  const exportDisabled = draft.entries.length === 0 || !draft.subjectPersonId;

  const handleSubjectChange = (personId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      subjectPersonId: personId,
    }));
  };

  const handleAddEntry = () => {
    const firm = newFirmName.trim();
    if (!firm) return;
    const entry: ReferenceRequestEntry = {
      id: crypto.randomUUID?.() ?? `ref-${Math.random().toString(36).slice(2, 10)}`,
      firmName: firm,
      contactName: newContactName.trim() || undefined,
      status: "requested",
      requestDate: new Date().toISOString(),
    };
    onUpdateDraft((prev) => ({
      ...prev,
      entries: [...prev.entries, entry],
    }));
    setNewFirmName("");
    setNewContactName("");
  };

  const handleUpdateEntry = (entryId: string, updates: Partial<ReferenceRequestEntry>) => {
    onUpdateDraft((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              ...updates,
            }
          : entry,
      ),
    }));
  };

  const handleRemoveEntry = (entryId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== entryId),
    }));
  };

  const handleExportSummary = () => {
    if (!subject) return;
    const generatedAt = format(new Date(), "PPP p");
    const rows = draft.entries
      .map((entry) => {
        const requested = entry.requestDate ? format(new Date(entry.requestDate), "PPP") : "—";
        const responded = entry.responseDate ? format(new Date(entry.responseDate), "PPP") : "—";
        return `<tr>
          <td>${escapeHtml(entry.firmName)}</td>
          <td>${escapeHtml(entry.contactName ?? "")}</td>
          <td>${escapeHtml(entry.contactEmail ?? "")}</td>
          <td>${escapeHtml(requested)}</td>
          <td>${escapeHtml(responded)}</td>
          <td>${escapeHtml(statuses.find((item) => item.value === entry.status)?.label ?? entry.status)}</td>
          <td>${escapeHtml(entry.notes ?? "")}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>Regulatory References – ${escapeHtml(subject.name)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #cbd5f5; padding-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #cbd5f5; padding: 8px; font-size: 13px; vertical-align: top; }
      th { background: #f8fafc; text-align: left; }
      p { margin: 4px 0; }
    </style>
  </head>
  <body>
    <h1>Regulatory Reference Tracker</h1>
    <p><strong>Individual:</strong> ${escapeHtml(subject.name)} (${escapeHtml(subject.employeeId)})</p>
    <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>

    <h2>Summary</h2>
    <p>Total references: ${draft.entries.length}</p>
    <ul>
      ${statuses
        .map(
          (status) =>
            `<li>${escapeHtml(status.label)}: ${statusSummary[status.value] ?? 0}</li>`,
        )
        .join("")}
    </ul>

    <h2>Detailed entries</h2>
    <table>
      <thead>
        <tr>
          <th>Firm</th>
          <th>Contact</th>
          <th>Email</th>
          <th>Requested</th>
          <th>Responded</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows || "<tr><td colspan='7'>No entries recorded.</td></tr>"}
      </tbody>
    </table>

    <h2>Summary notes</h2>
    <p>${escapeHtml(draft.summaryNotes ?? "None recorded.")}</p>
  </body>
</html>`;

    const exportName = `${subject.name.toLowerCase().replace(/\s+/g, "-")}-references.html`;
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
            <p className="text-sm font-semibold text-slate-900">Reference overview</p>
            <p className="text-xs text-slate-500">Track requests, follow-ups, and responses.</p>
          </div>
          <div className="space-y-4 px-5 py-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Individual</p>
              <p className="text-sm font-semibold text-slate-900">
                {subject ? subject.name : "Select individual"}
              </p>
              <p className="text-xs text-slate-500">
                {subject ? subject.employeeId : "No SM&CR record linked"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase">Status</p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs">
                {statuses.map((status) => (
                  <div key={status.value} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                    <span className="text-slate-600">{status.label}</span>
                    <span className="font-semibold text-slate-900">{statusSummary[status.value] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">{awaitingResponses}</span>{" "}
                outstanding response{awaitingResponses === 1 ? "" : "s"}
              </p>
              {draft.reminderDate && (
                <p>
                  Next reminder on <strong>{format(new Date(draft.reminderDate), "PPP")}</strong>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleExportSummary} disabled={exportDisabled} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download summary
              </Button>
              {exportDisabled && (
                <p className="text-[11px] text-amber-700">
                  Select the individual and log at least one reference before exporting.
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
              <p className="text-sm font-semibold text-slate-900">Subject linkage</p>
              <p className="text-xs text-slate-500">Associate this reference pack with an SM&CR individual.</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                <Label>Reminder date</Label>
                <Input
                  type="date"
                  className="mt-2"
                  value={draft.reminderDate ? format(new Date(draft.reminderDate), "yyyy-MM-dd") : ""}
                  onChange={(event) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      reminderDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Reference tracking</p>
              <p className="text-xs text-slate-500">Log firms contacted, follow-ups, and responses received.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Firm name"
                value={newFirmName}
                onChange={(event) => setNewFirmName(event.target.value)}
                className="h-9 w-48"
              />
              <Input
                placeholder="Contact name (optional)"
                value={newContactName}
                onChange={(event) => setNewContactName(event.target.value)}
                className="h-9 w-48"
              />
              <Button type="button" size="sm" onClick={handleAddEntry}>
                <Plus className="mr-2 h-4 w-4" />
                Add firm
              </Button>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4">
            {draft.entries.length === 0 ? (
              <p className="text-xs text-slate-500">No references logged yet. Add firms above to begin tracking.</p>
            ) : (
              draft.entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.firmName}</p>
                      <p className="text-xs text-slate-500">
                        {entry.contactName || "No contact recorded"}
                        {entry.contactEmail ? ` · ${entry.contactEmail}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] uppercase", statusTone[entry.status])}
                      >
                        {statuses.find((status) => status.value === entry.status)?.label ?? entry.status}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveEntry(entry.id)} aria-label="Remove entry">
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-slate-500">Status</Label>
                      <Select
                        value={entry.status}
                        onValueChange={(value: ReferenceResponseStatus) => handleUpdateEntry(entry.id, { status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Request date</Label>
                      <Input
                        className="mt-1"
                        type="date"
                        value={entry.requestDate ? format(new Date(entry.requestDate), "yyyy-MM-dd") : ""}
                        onChange={(event) =>
                          handleUpdateEntry(entry.id, {
                            requestDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Response date</Label>
                      <Input
                        className="mt-1"
                        type="date"
                        value={entry.responseDate ? format(new Date(entry.responseDate), "yyyy-MM-dd") : ""}
                        onChange={(event) =>
                          handleUpdateEntry(entry.id, {
                            responseDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Follow-up reminder</Label>
                      <Input
                        className="mt-1"
                        type="date"
                        value={entry.followUpDate ? format(new Date(entry.followUpDate), "yyyy-MM-dd") : ""}
                        onChange={(event) =>
                          handleUpdateEntry(entry.id, {
                            followUpDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-slate-500">Contact email</Label>
                      <Input
                        className="mt-1"
                        placeholder="contact@example.com"
                        value={entry.contactEmail ?? ""}
                        onChange={(event) => handleUpdateEntry(entry.id, { contactEmail: event.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Contact phone</Label>
                      <Input
                        className="mt-1"
                        placeholder="+44..."
                        value={entry.contactPhone ?? ""}
                        onChange={(event) => handleUpdateEntry(entry.id, { contactPhone: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label className="text-xs text-slate-500">Notes</Label>
                    <Textarea
                      className="mt-1"
                      rows={3}
                      value={entry.notes ?? ""}
                      onChange={(event) => handleUpdateEntry(entry.id, { notes: event.target.value })}
                      placeholder="Summarise responses, concerns raised, or follow-up actions."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Summary & audit notes</p>
              <p className="text-xs text-slate-500">Capture context required for audit trail or escalation.</p>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4">
            <Textarea
              rows={4}
              value={draft.summaryNotes ?? ""}
              onChange={(event) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  summaryNotes: event.target.value,
                }))
              }
              placeholder="Summarise observations, outstanding actions, or escalation decisions."
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox checked={awaitingResponses === 0 && draft.entries.length > 0} disabled />
              <span>All responses received</span>
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
