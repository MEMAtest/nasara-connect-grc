"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { CriminalCheckDraft, CriminalCheckStatus, PersonRecord } from "../../context/SmcrDataContext";

const providers = [
  { value: "dbs", label: "DBS (England & Wales)" },
  { value: "disclosure_scotland", label: "Disclosure Scotland" },
  { value: "accessni", label: "AccessNI" },
  { value: "third_party", label: "Third-party screening provider" },
];

const statuses: { value: CriminalCheckStatus; label: string }[] = [
  { value: "not_requested", label: "Not requested" },
  { value: "requested", label: "Requested" },
  { value: "in_progress", label: "In progress" },
  { value: "clear", label: "Clear" },
  { value: "adverse", label: "Adverse finding" },
];

const statusTone: Record<CriminalCheckStatus, string> = {
  not_requested: "bg-slate-100 text-slate-600 border-slate-200",
  requested: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  clear: "bg-emerald-50 text-emerald-700 border-emerald-200",
  adverse: "bg-rose-50 text-rose-700 border-rose-200",
};

type CriminalCheckTaskProps = {
  draft: CriminalCheckDraft;
  people: PersonRecord[];
  onUpdateDraft: (updater: (draft: CriminalCheckDraft) => CriminalCheckDraft) => void;
};

export function CriminalCheckTask({ draft, people, onUpdateDraft }: CriminalCheckTaskProps) {
  const subject = people.find((person) => person.id === draft.subjectPersonId);
  const exportDisabled = !draft.subjectPersonId || !draft.provider;

  const handleSubjectChange = (personId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      subjectPersonId: personId,
    }));
  };

  const handleExport = () => {
    if (!subject) return;
    const generatedAt = format(new Date(), "PPP p");
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>Criminal Record Check – ${escapeHtml(subject.name)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      p { margin: 6px 0; }
      .label { color: #475569; margin-right: 8px; font-weight: 600; }
      section { margin-top: 24px; }
      .box { border: 1px solid #cbd5f5; border-radius: 8px; padding: 12px; margin-top: 12px; }
    </style>
  </head>
  <body>
    <h1>Criminal Record Check Summary</h1>
    <p><span class="label">Individual:</span>${escapeHtml(subject.name)} (${escapeHtml(subject.employeeId)})</p>
    <p><span class="label">Generated:</span>${escapeHtml(generatedAt)}</p>

    <section>
      <h2>Check details</h2>
      <div class="box">
        <p><span class="label">Provider:</span>${escapeHtml(providers.find((item) => item.value === draft.provider)?.label ?? draft.provider ?? "Not selected")}</p>
        <p><span class="label">Request date:</span>${draft.requestDate ? format(new Date(draft.requestDate), "PPP") : "Not recorded"}</p>
        <p><span class="label">Completion date:</span>${draft.completionDate ? format(new Date(draft.completionDate), "PPP") : "Not recorded"}</p>
        <p><span class="label">Reference number:</span>${escapeHtml(draft.referenceNumber ?? "Not recorded")}</p>
        <p><span class="label">Reviewer:</span>${escapeHtml(draft.reviewer ?? "Not assigned")}</p>
        <p><span class="label">Status:</span>${escapeHtml(statuses.find((status) => status.value === draft.status)?.label ?? draft.status)}</p>
      </div>
    </section>

    <section>
      <h2>Findings & follow-up</h2>
      <div class="box">
        <p><span class="label">Adverse details:</span>${escapeHtml(draft.adverseDetails || "None recorded")}</p>
        <p><span class="label">Follow-up actions:</span>${escapeHtml(draft.followUpActions || "None recorded")}</p>
      </div>
    </section>
  </body>
</html>`;

    const exportName = `${subject.name.toLowerCase().replace(/\s+/g, "-")}-criminal-check.html`;
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
    <div className="lg:grid lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-6">
      <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
        <Card className="gap-0 p-0 shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Check summary</p>
            <p className="text-xs text-slate-500">Maintain the background screening audit trail.</p>
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
                <span className="font-semibold text-slate-900">Status</span>
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1">
                <span className={cn("text-[11px] uppercase font-semibold", statusTone[draft.status])}>
                  {statuses.find((status) => status.value === draft.status)?.label ?? draft.status}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleExport} disabled={exportDisabled} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download summary
              </Button>
              {exportDisabled && (
                <p className="text-[11px] text-amber-700">
                  Link the individual and set the provider before exporting.
                </p>
              )}
            </div>
          </div>
        </Card>
      </aside>

      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Subject & provider</p>
            <p className="text-xs text-slate-500">Record who the check relates to and which service is used.</p>
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
              <Label>Provider</Label>
              <Select
                value={draft.provider ?? ""}
                onValueChange={(value) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    provider: value,
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other / manual process</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Check progress</p>
            <p className="text-xs text-slate-500">Track status, reference numbers, and key dates.</p>
          </div>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value: CriminalCheckStatus) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger className="mt-2">
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
              <Label>Reference number</Label>
              <Input
                className="mt-2"
                placeholder="Provided by screening service"
                value={draft.referenceNumber ?? ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    referenceNumber: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Request date</Label>
              <Input
                className="mt-2"
                type="date"
                value={draft.requestDate ? format(new Date(draft.requestDate), "yyyy-MM-dd") : ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    requestDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Completion date</Label>
              <Input
                className="mt-2"
                type="date"
                value={draft.completionDate ? format(new Date(draft.completionDate), "yyyy-MM-dd") : ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    completionDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Reviewer</Label>
              <Input
                className="mt-2"
                placeholder="Name of reviewer"
                value={draft.reviewer ?? ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    reviewer: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Findings & follow-up</p>
            <p className="text-xs text-slate-500">Document any adverse findings and resulting actions.</p>
          </div>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div>
              <Label>Adverse findings / remarks</Label>
              <Textarea
                className="mt-2"
                rows={4}
                value={draft.adverseDetails ?? ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    adverseDetails: event.target.value,
                  }))
                }
                placeholder="Detail the adverse information or note if none were identified."
              />
            </div>
            <div>
              <Label>Follow-up actions</Label>
              <Textarea
                className="mt-2"
                rows={4}
                value={draft.followUpActions ?? ""}
                onChange={(event) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    followUpActions: event.target.value,
                  }))
                }
                placeholder="Capture actions taken, approvals, or escalation steps."
              />
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
