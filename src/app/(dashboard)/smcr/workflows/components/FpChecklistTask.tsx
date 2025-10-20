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
import { CheckCircle2, ChevronDown, Download, Plus, Trash2 } from "lucide-react";
import {
  allSMFs,
  certificationFunctions,
  prescribedResponsibilities,
} from "../../data/core-functions";
import {
  FpChecklistDraft,
  FpPrescribedMapping,
  PersonRecord,
  RiskRating,
  RoleAssignment,
} from "../../context/SmcrDataContext";

const riskScale: { value: RiskRating; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Minimal regulatory concern, controls operating effectively." },
  { value: "medium", label: "Medium", description: "Some outstanding actions or remediation underway." },
  { value: "high", label: "High", description: "Significant issues identified; close monitoring required." },
  { value: "critical", label: "Critical", description: "Material risk to SM&CR compliance; escalation required." },
];

const riskTone: Record<RiskRating, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

const UNASSIGNED_VALUE = "__unassigned";

type FpChecklistTaskProps = {
  draft: FpChecklistDraft;
  people: PersonRecord[];
  roles: RoleAssignment[];
  onUpdateDraft: (updater: (draft: FpChecklistDraft) => FpChecklistDraft) => void;
  riskValue: string;
  onRiskChange: (value: string) => void;
  notesValue: string;
  onNotesChange: (value: string) => void;
};

export function FpChecklistTask({
  draft,
  people,
  roles,
  onUpdateDraft,
  riskValue,
  onRiskChange,
  notesValue,
  onNotesChange,
}: FpChecklistTaskProps) {
  const [dependencyDraft, setDependencyDraft] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(["subject", "risk"]));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const subject = useMemo(
    () => people.find((person) => person.id === draft.subjectPersonId) ?? null,
    [people, draft.subjectPersonId],
  );

  const subjectRoles = useMemo(
    () => roles.filter((role) => role.personId === draft.subjectPersonId),
    [roles, draft.subjectPersonId],
  );

  const selectedRoleAssignments = useMemo(
    () => roles.filter((role) => draft.subjectRoleIds.includes(role.id)),
    [roles, draft.subjectRoleIds],
  );

  const selectedSmfDefinitions = useMemo(
    () =>
      selectedRoleAssignments
        .filter((role) => role.functionType === "SMF")
        .map((role) => ({
          role,
          definition: allSMFs.find((item) => item.id === role.functionId),
        }))
        .filter((item): item is { role: RoleAssignment; definition: (typeof allSMFs)[number] } => Boolean(item.definition)),
    [selectedRoleAssignments],
  );

  const selectedCertificationDefinitions = useMemo(
    () =>
      selectedRoleAssignments
        .filter((role) => role.functionType === "CF")
        .map((role) => ({
          role,
          definition: certificationFunctions.find((item) => item.id === role.functionId),
        }))
        .filter((item): item is { role: RoleAssignment; definition: (typeof certificationFunctions)[number] } => Boolean(item.definition)),
    [selectedRoleAssignments],
  );

  const prescribedById = useMemo(() => {
    const map = new Map(prescribedResponsibilities.map((item) => [item.id, item]));
    return map;
  }, []);

  const recommendedPrescribedIds = useMemo(() => {
    const ids = new Set<string>();
    selectedSmfDefinitions.forEach(({ definition }) => {
      (definition.prescribed_responsibilities ?? []).forEach((responsibilityNumber) => {
        ids.add(`pr${responsibilityNumber}`);
      });
    });
    return ids;
  }, [selectedSmfDefinitions]);

  const assignedSmfMappings = useMemo(
    () => draft.smfMappings.filter((mapping) => mapping.assigned),
    [draft.smfMappings],
  );

  const assignedPrescribedMappings = useMemo(
    () => draft.prescribedMappings.filter((mapping) => mapping.assigned),
    [draft.prescribedMappings],
  );

  const recommendedPrescribed = useMemo(
    () =>
      draft.prescribedMappings
        .filter((mapping) => recommendedPrescribedIds.has(mapping.responsibilityId))
        .sort((a, b) => Number(b.assigned) - Number(a.assigned)),
    [draft.prescribedMappings, recommendedPrescribedIds],
  );

  const additionalPrescribed = useMemo(
    () =>
      draft.prescribedMappings
        .filter((mapping) => !recommendedPrescribedIds.has(mapping.responsibilityId))
        .sort((a, b) => Number(b.assigned) - Number(a.assigned)),
    [draft.prescribedMappings, recommendedPrescribedIds],
  );

  const lastUpdatedDisplay = draft.lastUpdated ? format(new Date(draft.lastUpdated), "PPP p") : null;
  const exportDisabled =
    !draft.subjectPersonId ||
    !draft.riskRating ||
    (assignedSmfMappings.length === 0 && assignedPrescribedMappings.length === 0);

  const progressItems = [
    {
      id: "subject",
      label: "Subject & roles selected",
      complete: Boolean(draft.subjectPersonId && draft.subjectRoleIds.length > 0),
    },
    {
      id: "risk",
      label: "Risk profile captured",
      complete: Boolean(draft.riskRating),
    },
    {
      id: "responsibilities",
      label: "Responsibilities mapped",
      complete: assignedSmfMappings.length + assignedPrescribedMappings.length > 0,
    },
    {
      id: "dependencies",
      label: "Dependencies recorded",
      complete: draft.dependencies.length > 0,
    },
  ];

  const handleSubjectChange = (personId: string) => {
    onUpdateDraft((prev) => {
      const personRoles = roles.filter((role) => role.personId === personId);
      return {
        ...prev,
        subjectPersonId: personId,
        subjectRoleIds: personRoles.map((role) => role.id),
      };
    });
  };

  const handleToggleRole = (roleId: string, checked: boolean) => {
    onUpdateDraft((prev) => ({
      ...prev,
      subjectRoleIds: checked
        ? Array.from(new Set([...prev.subjectRoleIds, roleId]))
        : prev.subjectRoleIds.filter((existingId) => existingId !== roleId),
    }));
  };

  const handleRiskChange = (value: RiskRating) => {
    onUpdateDraft((prev) => ({
      ...prev,
      riskRating: value,
    }));
    onRiskChange(value);
  };

  const handleKeyConsiderationsChange = (value: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      keyConsiderations: value,
    }));
    onNotesChange(value);
  };

  const handleSmfMappingUpdate = (functionId: string, updates: Partial<FpChecklistDraft["smfMappings"][number]>) => {
    onUpdateDraft((prev) => ({
      ...prev,
      smfMappings: prev.smfMappings.map((mapping) =>
        mapping.functionId === functionId ? { ...mapping, ...updates } : mapping,
      ),
    }));
  };

  const handlePrescribedMappingUpdate = (
    responsibilityId: string,
    updates: Partial<FpChecklistDraft["prescribedMappings"][number]>,
  ) => {
    onUpdateDraft((prev) => ({
      ...prev,
      prescribedMappings: prev.prescribedMappings.map((mapping) =>
        mapping.responsibilityId === responsibilityId ? { ...mapping, ...updates } : mapping,
      ),
    }));
  };

  const handleAddDependency = () => {
    const trimmed = dependencyDraft.trim();
    if (!trimmed) return;
    onUpdateDraft((prev) => ({
      ...prev,
      dependencies: Array.from(new Set([...prev.dependencies, trimmed])),
    }));
    setDependencyDraft("");
  };

  const handleRemoveDependency = (dependency: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      dependencies: prev.dependencies.filter((item) => item !== dependency),
    }));
  };

  const resolvePersonName = (personId?: string) => {
    if (!personId) return "Unassigned";
    return people.find((person) => person.id === personId)?.name ?? "Unassigned";
  };

  const handleExportProfile = () => {
    const exportSubject = subject ? `${subject.name} (${subject.employeeId})` : "Not selected";
    const exportRoles = selectedRoleAssignments.map((role) => role.functionLabel).join(", ") || "No roles selected";
    const exportRisk = riskValue ? riskValue.toUpperCase() : "Not set";
    const exportDependencies = draft.dependencies.length
      ? `<ul>${draft.dependencies.map((dep) => `<li>${escapeHtml(dep)}</li>`).join("")}</ul>`
      : "<p>No additional dependencies recorded.</p>";

    const smfRows = assignedSmfMappings
      .map((mapping) => {
        const definition = allSMFs.find((item) => item.id === mapping.functionId);
        if (!definition) return null;
        return `<tr>
          <td>${definition.smf_number}</td>
          <td>${escapeHtml(definition.title)}</td>
          <td>${escapeHtml(resolvePersonName(mapping.ownerId))}</td>
          <td>${escapeHtml(mapping.notes ?? "No notes captured")}</td>
        </tr>`;
      })
      .filter(Boolean)
      .join("");

    const prescribedRows = assignedPrescribedMappings
      .map((mapping) => {
        const responsibility = prescribedById.get(mapping.responsibilityId);
        if (!responsibility) return null;
        return `<tr>
          <td>${responsibility.pr_number}</td>
          <td>${escapeHtml(responsibility.description)}</td>
          <td>${escapeHtml(resolvePersonName(mapping.ownerId))}</td>
          <td>${escapeHtml(mapping.notes ?? "No notes captured")}</td>
        </tr>`;
      })
      .filter(Boolean)
      .join("");

    const considerations = draft.keyConsiderations?.trim()
      ? `<p>${escapeHtml(draft.keyConsiderations)}</p>`
      : "<p>No additional considerations captured.</p>";

    const generatedAt = format(new Date(), "PPP p");
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>F&P Checklist – ${escapeHtml(subject?.name ?? "Unassigned")}</title>
    <style>
      body { font-family: 'Arial', sans-serif; color: #0f172a; margin: 24px; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { margin-top: 32px; font-size: 18px; border-bottom: 1px solid #cbd5f5; padding-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #cbd5f5; padding: 8px; font-size: 14px; vertical-align: top; }
      th { background: #f1f5f9; text-align: left; }
      ul { margin: 8px 0; padding-left: 18px; }
      .meta { font-size: 12px; color: #475569; margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <h1>Fitness &amp; Propriety Checklist</h1>
    <div class="meta">
      Generated ${escapeHtml(generatedAt)} · Last updated ${escapeHtml(lastUpdatedDisplay ?? "---")}
    </div>
    <section>
      <h2>Subject overview</h2>
      <p><strong>Individual:</strong> ${escapeHtml(exportSubject)}</p>
      <p><strong>Included roles:</strong> ${escapeHtml(exportRoles)}</p>
      <p><strong>Risk rating:</strong> ${escapeHtml(exportRisk)}</p>
    </section>
    <section>
      <h2>Key considerations</h2>
      ${considerations}
    </section>
    <section>
      <h2>Dependencies</h2>
      ${exportDependencies}
    </section>
    <section>
      <h2>Confirmed SMF responsibilities</h2>
      ${
        smfRows
          ? `<table>
              <thead>
                <tr>
                  <th>SMF Ref</th>
                  <th>Function Title</th>
                  <th>Accountable Owner</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>${smfRows}</tbody>
            </table>`
          : "<p>No SMF responsibilities marked as assigned.</p>"
      }
    </section>
    <section>
      <h2>Prescribed responsibilities</h2>
      ${
        prescribedRows
          ? `<table>
              <thead>
                <tr>
                  <th>PR Ref</th>
                  <th>Description</th>
                  <th>Accountable Owner</th>
                  <th>Notes / Evidence</th>
                </tr>
              </thead>
              <tbody>${prescribedRows}</tbody>
            </table>`
          : "<p>No prescribed responsibilities allocated.</p>"
      }
    </section>
  </body>
</html>`;

    const exportName = `${(subject?.name ?? "fp-checklist")
      .toLowerCase()
      .replace(/\s+/g, "-")}-assessment-profile.html`;
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
            <p className="text-sm font-semibold text-slate-900">Checklist overview</p>
            {lastUpdatedDisplay && (
              <p className="text-xs text-slate-500">Updated {lastUpdatedDisplay}</p>
            )}
          </div>
          <div className="space-y-4 px-5 py-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">{subject ? subject.name : "Select an individual"}</p>
              <p className="text-xs text-slate-500">
                {subject ? subject.employeeId : "Choose a person to start mapping responsibilities"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Roles included:{" "}
                {selectedRoleAssignments.length > 0
                  ? selectedRoleAssignments.map((role) => role.functionLabel).join(", ")
                  : "None selected"}
              </p>
            </div>

            <div className="space-y-2">
              {progressItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4",
                      item.complete ? "text-emerald-500" : "text-slate-300",
                    )}
                  />
                  <span className={item.complete ? "text-slate-800" : "text-slate-500"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">{assignedSmfMappings.length}</span>{" "}
                SMF functions confirmed
              </p>
              <p>
                <span className="font-semibold text-slate-900">{assignedPrescribedMappings.length}</span>{" "}
                prescribed responsibilities allocated
              </p>
              <p>
                <span className="font-semibold text-slate-900">{draft.dependencies.length}</span>{" "}
                dependencies recorded
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "border text-xs uppercase tracking-wide",
                    riskValue && riskTone[riskValue as RiskRating],
                  )}
                >
                  {riskValue ? `Risk: ${riskValue}` : "Risk pending"}
                </Badge>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleExportProfile} disabled={exportDisabled} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download profile
              </Button>
              {exportDisabled && (
                <p className="text-[11px] text-amber-700">
                  Select a subject, capture the risk rating, and assign at least one responsibility to export.
                </p>
              )}
            </div>
          </div>
        </Card>
      </aside>

      <div className="space-y-4">
        <ChecklistSection
          id="subject"
          title="Subject profile & role context"
          description="Confirm who this checklist covers and the SMF/CF roles included."
          open={openSections.has("subject")}
          onToggle={() => toggleSection("subject")}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Person</Label>
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
                <Label>Included roles</Label>
                <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                  {subjectRoles.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Assign SMF or certification roles to this individual to map responsibilities.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {subjectRoles.map((role) => (
                        <label key={role.id} className="flex items-start gap-2">
                          <Checkbox
                            checked={draft.subjectRoleIds.includes(role.id)}
                            onCheckedChange={(checked) => handleToggleRole(role.id, Boolean(checked))}
                          />
                          <span>
                            <span className="font-medium text-slate-800">{role.functionLabel}</span>
                            <span className="block text-xs text-slate-500">
                              {role.functionType} · Effective {format(new Date(role.startDate), "PPP")}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedCertificationDefinitions.length > 0 && (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700">
                <p className="text-sm font-semibold text-sky-800">Certification context</p>
                <ul className="mt-2 space-y-1">
                  {selectedCertificationDefinitions.map(({ role, definition }) => (
                    <li key={role.id}>
                      {definition.cf_number} · {definition.title} — assessment cadence{" "}
                      {definition.annual_assessment ? "Annual" : "By policy"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ChecklistSection>

        <ChecklistSection
          id="risk"
          title="Risk profile & key considerations"
          description="Set the inherent risk rating for this appointment and provide supporting rationale."
          open={openSections.has("risk")}
          onToggle={() => toggleSection("risk")}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {riskScale.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left text-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200",
                    riskValue === option.value ? "border-sky-400 bg-sky-50" : "border-slate-200",
                  )}
                  onClick={() => handleRiskChange(option.value)}
                  aria-pressed={riskValue === option.value}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{option.label}</span>
                    {riskValue === option.value && (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                </button>
              ))}
            </div>
            <div>
              <Label>Key considerations & rationale</Label>
              <Textarea
                className="mt-2"
                rows={4}
                value={notesValue}
                onChange={(event) => handleKeyConsiderationsChange(event.target.value)}
                placeholder="Summarise diligence performed, outstanding actions, and escalation decisions."
              />
            </div>
          </div>
        </ChecklistSection>

        <ChecklistSection
          id="dependencies"
          title="Dependencies & supporting controls"
          description="Capture reliance on other functions or documentation required to complete this checklist."
          open={openSections.has("dependencies")}
          onToggle={() => toggleSection("dependencies")}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="flex-1 min-w-[220px]"
                placeholder="e.g. Awaiting Conduct Rule attestation"
                value={dependencyDraft}
                onChange={(event) => setDependencyDraft(event.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleAddDependency}>
                <Plus className="mr-2 h-4 w-4" />
                Add dependency
              </Button>
            </div>
            {draft.dependencies.length === 0 ? (
              <p className="text-xs text-slate-500">No dependencies captured yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {draft.dependencies.map((dependency) => (
                  <Badge key={dependency} variant="outline" className="flex items-center gap-2 text-xs">
                    {dependency}
                    <button
                      type="button"
                      className="text-rose-500 hover:text-rose-600"
                      onClick={() => handleRemoveDependency(dependency)}
                      aria-label={`Remove dependency ${dependency}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </ChecklistSection>

        {selectedSmfDefinitions.length > 0 && (
          <ChecklistSection
            id="smf"
            title="SMF responsibility alignment"
            description="Confirm the scope of each Senior Management Function and who is accountable."
            open={openSections.has("smf")}
            onToggle={() => toggleSection("smf")}
          >
            <div className="space-y-4">
              {selectedSmfDefinitions.map(({ definition }) => {
                const mapping = draft.smfMappings.find((item) => item.functionId === definition.id);
                const ownerValue = mapping?.ownerId ?? draft.subjectPersonId ?? UNASSIGNED_VALUE;
                return (
                  <div key={definition.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {definition.smf_number} · {definition.title}
                        </p>
                        <p className="text-xs text-slate-500">{definition.description}</p>
                      </div>
                      <Checkbox
                        checked={mapping?.assigned ?? false}
                        onCheckedChange={(checked) => handleSmfMappingUpdate(definition.id, { assigned: Boolean(checked) })}
                      />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <Label>Accountable owner</Label>
                        <Select
                          value={ownerValue}
                          onValueChange={(value) =>
                            handleSmfMappingUpdate(definition.id, {
                              ownerId: value === UNASSIGNED_VALUE ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                            {people.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          className="mt-1"
                          rows={3}
                          value={mapping?.notes ?? ""}
                          onChange={(event) => handleSmfMappingUpdate(definition.id, { notes: event.target.value })}
                          placeholder="Outline key responsibilities or conditions agreed with the SMF holder."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChecklistSection>
        )}

        <ChecklistSection
          id="prescribed"
          title="Prescribed responsibilities"
          description="Allocate FCA prescribed responsibilities and confirm acceptance with the accountable owner."
          open={openSections.has("prescribed")}
          onToggle={() => toggleSection("prescribed")}
        >
          <div className="space-y-4">
            {renderPrescribedGroup(
              "Recommended based on selected SMFs",
              recommendedPrescribed,
              recommendedPrescribedIds,
              prescribedById,
              people,
              draft,
              handlePrescribedMappingUpdate,
            )}
            {renderPrescribedGroup(
              "Additional responsibilities",
              additionalPrescribed,
              recommendedPrescribedIds,
              prescribedById,
              people,
              draft,
              handlePrescribedMappingUpdate,
            )}
          </div>
        </ChecklistSection>
      </div>
    </div>
  );
}

type ChecklistSectionProps = {
  id: string;
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function ChecklistSection({ title, description, open, onToggle, children }: ChecklistSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 rounded-t-xl px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <ChevronDown
          className={cn("mt-1 h-4 w-4 text-slate-400 transition-transform", open ? "rotate-180" : "rotate-0")}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden border-t border-slate-200 px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function renderPrescribedGroup(
  heading: string,
  mappings: FpPrescribedMapping[],
  recommendedIds: Set<string>,
  prescribedById: Map<string, (typeof prescribedResponsibilities)[number]>,
  people: PersonRecord[],
  draft: FpChecklistDraft,
  handleUpdate: (responsibilityId: string, updates: Partial<FpChecklistDraft["prescribedMappings"][number]>) => void,
) {
  if (mappings.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</p>
      <div className="space-y-3">
        {mappings.map((mapping) => {
          const responsibility = prescribedById.get(mapping.responsibilityId);
          if (!responsibility) return null;
          const ownerValue = mapping.ownerId ?? draft.subjectPersonId ?? UNASSIGNED_VALUE;
          const recommended = recommendedIds.has(responsibility.id);

          return (
            <div
              key={responsibility.id}
              className={cn(
                "rounded-lg border p-3",
                recommended ? "border-amber-300 bg-amber-50/60" : "border-slate-200",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {responsibility.pr_number} · {responsibility.description}
                  </p>
                  <p className="text-xs text-slate-500">Typical holder: {responsibility.typical_holder}</p>
                </div>
                <Checkbox
                  checked={mapping.assigned}
                  onCheckedChange={(checked) =>
                    handleUpdate(responsibility.id, { assigned: Boolean(checked) })
                  }
                />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Accountable owner</Label>
                  <Select
                    value={ownerValue}
                    onValueChange={(value) =>
                      handleUpdate(responsibility.id, {
                        ownerId: value === UNASSIGNED_VALUE ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {recommended && (
                    <p className="mt-1 text-[11px] text-amber-700">
                      Recommended for selected SMF functions.
                    </p>
                  )}
                </div>
                <div>
                  <Label>Notes / evidence</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    value={mapping.notes ?? ""}
                    onChange={(event) =>
                      handleUpdate(responsibility.id, { notes: event.target.value })
                    }
                    placeholder="Reference statements of responsibility, board approval, or control mapping."
                  />
                </div>
              </div>
            </div>
          );
        })}
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
