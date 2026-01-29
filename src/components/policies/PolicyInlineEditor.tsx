"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionNotesPicker } from "@/components/policies/SectionNotesPicker";
import {
  formatNoteValue,
  getNoteSections,
  parseNoteCustomText,
  parseNoteSelections,
} from "@/lib/policies/section-notes";

interface InlineSection {
  id: string;
  title: string;
  summary: string;
  requiresFirmNotes?: boolean;
  sectionType?: string;
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
  templateCode: string;
  sections: InlineSection[];
  initialSectionNotes: Record<string, string>;
  initialGovernance: InlineGovernance;
  initialCustomContent: Record<string, unknown>;
  firmName?: string;
}

export function PolicyInlineEditor({
  policyId,
  templateCode,
  sections,
  initialSectionNotes,
  initialGovernance,
  initialCustomContent,
  firmName,
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

  const noteSections = useMemo(
    () => getNoteSections({ code: templateCode, sections }),
    [templateCode, sections],
  );
  const noteSectionMap = useMemo(() => new Map(noteSections.map((section) => [section.id, section])), [noteSections]);
  const requiredSections = useMemo(
    () => noteSections.filter((section) => section.required),
    [noteSections],
  );
  const baseSections = requiredSections.length ? requiredSections : noteSections;
  const visibleSections = showAllSections ? noteSections : baseSections;

  const handleSectionNoteToggle = (sectionId: string, option: string, checked: boolean) => {
    setSectionNotes((prev) => {
      const options = noteSectionMap.get(sectionId)?.options ?? [];
      const current = parseNoteSelections(prev[sectionId], options, firmName);
      const customText = parseNoteCustomText(prev[sectionId], options, firmName);
      const next = checked
        ? Array.from(new Set([...current, option]))
        : current.filter((value) => value !== option);
      return { ...prev, [sectionId]: formatNoteValue(next, customText) };
    });
  };

  const handleSectionNoteCustomChange = (sectionId: string, value: string) => {
    setSectionNotes((prev) => {
      const options = noteSectionMap.get(sectionId)?.options ?? [];
      const current = parseNoteSelections(prev[sectionId], options, firmName);
      return { ...prev, [sectionId]: formatNoteValue(current, value) };
    });
  };

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
              {noteSections.length > baseSections.length ? (
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
            <SectionNotesPicker
              sections={visibleSections}
              sectionNotes={sectionNotes}
              onToggle={handleSectionNoteToggle}
              onCustomChange={handleSectionNoteCustomChange}
              firmName={firmName}
            />
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
