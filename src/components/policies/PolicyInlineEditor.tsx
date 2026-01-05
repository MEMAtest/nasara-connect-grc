"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface InlineSection {
  id: string;
  title: string;
  requiresFirmNotes?: boolean;
}

interface InlineGovernance {
  owner: string;
  version: string;
  effectiveDate: string;
  nextReviewAt: string;
  scopeStatement: string;
  distributionList: string;
  linkedProcedures: string;
}

interface PolicyInlineEditorProps {
  policyId: string;
  sections: InlineSection[];
  initialSectionNotes: Record<string, string>;
  initialGovernance: InlineGovernance;
  initialCustomContent: Record<string, unknown>;
}

export function PolicyInlineEditor({
  policyId,
  sections,
  initialSectionNotes,
  initialGovernance,
  initialCustomContent,
}: PolicyInlineEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>(initialSectionNotes);
  const [governance, setGovernance] = useState<InlineGovernance>(initialGovernance);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setSectionNotes(initialSectionNotes);
      setGovernance(initialGovernance);
      setError(null);
    }
  }, [initialGovernance, initialSectionNotes, isEditing]);

  const requiredSections = useMemo(
    () => sections.filter((section) => section.requiresFirmNotes),
    [sections],
  );
  const baseSections = requiredSections.length ? requiredSections : sections;
  const visibleSections = showAllSections ? sections : baseSections;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const nextCustomContent = {
        ...initialCustomContent,
        governance: {
          effectiveDate: governance.effectiveDate || null,
          nextReviewAt: governance.nextReviewAt || null,
          owner: governance.owner.trim() || null,
          version: governance.version.trim() || null,
          scopeStatement: governance.scopeStatement.trim() || null,
          distributionList: governance.distributionList.trim()
            ? governance.distributionList
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : null,
          linkedProcedures: governance.linkedProcedures.trim() || null,
        },
        sectionNotes,
      };

      const response = await fetch(`/api/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customContent: nextCustomContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setIsEditing(false);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Inline edits</h3>
          <p className="text-xs text-slate-500">
            Update firm notes and governance without leaving this page.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "Close editor" : "Edit in page"}
        </Button>
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Owner</p>
              <Input
                value={governance.owner}
                onChange={(event) => setGovernance((current) => ({ ...current, owner: event.target.value }))}
                placeholder="e.g. MLRO"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Version</p>
              <Input
                value={governance.version}
                onChange={(event) => setGovernance((current) => ({ ...current, version: event.target.value }))}
                placeholder="e.g. V1.0"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Effective date</p>
              <Input
                type="date"
                value={governance.effectiveDate}
                onChange={(event) => setGovernance((current) => ({ ...current, effectiveDate: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Next review</p>
              <Input
                type="date"
                value={governance.nextReviewAt}
                onChange={(event) => setGovernance((current) => ({ ...current, nextReviewAt: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-slate-500 hover:text-slate-700"
              onClick={() => setShowAdvanced((value) => !value)}
            >
              {showAdvanced ? "Hide advanced fields" : "Show advanced fields"}
            </Button>

            {showAdvanced ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Scope statement</p>
                  <Textarea
                    value={governance.scopeStatement}
                    onChange={(event) => setGovernance((current) => ({ ...current, scopeStatement: event.target.value }))}
                    placeholder="Define the activities, channels, and client types covered."
                    className="h-24"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Distribution list</p>
                  <Input
                    value={governance.distributionList}
                    onChange={(event) =>
                      setGovernance((current) => ({ ...current, distributionList: event.target.value }))
                    }
                    placeholder="Board, Compliance, Operations"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Linked procedures</p>
                  <Input
                    value={governance.linkedProcedures}
                    onChange={(event) =>
                      setGovernance((current) => ({ ...current, linkedProcedures: event.target.value }))
                    }
                    placeholder="Complaints SOP, FOS escalation procedure"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Firm notes ({visibleSections.length})
              </p>
              {sections.length > baseSections.length ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 text-slate-500 hover:text-slate-700"
                  onClick={() => setShowAllSections((value) => !value)}
                >
                  {showAllSections ? "Show required only" : "Show all sections"}
                </Button>
              ) : null}
            </div>
            <div className="space-y-3">
              {visibleSections.map((section) => (
                <details key={section.id} className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                      {section.requiresFirmNotes ? (
                        <Badge variant="secondary" className="text-[11px]">Required</Badge>
                      ) : null}
                    </div>
                    <span className="text-xs text-slate-400">Edit</span>
                  </summary>
                  <div className="mt-3">
                    <Textarea
                      value={sectionNotes[section.id] ?? ""}
                      onChange={(event) =>
                        setSectionNotes((current) => ({
                          ...current,
                          [section.id]: event.target.value,
                        }))
                      }
                      placeholder="Add firm-specific detail for this section"
                      className="h-28"
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>

          {error ? <p className="text-xs text-rose-600">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
