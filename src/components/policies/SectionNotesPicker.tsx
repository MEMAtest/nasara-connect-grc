"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  mergeNoteOptions,
  parseNoteSelections,
  type NoteSectionConfig,
} from "@/lib/policies/section-notes";

type SectionNotesPickerProps = {
  sections: NoteSectionConfig[];
  sectionNotes: Record<string, string>;
  onToggle: (sectionId: string, option: string, checked: boolean) => void;
  emptyState?: string;
  renderFooter?: (sectionId: string) => ReactNode;
};

export function SectionNotesPicker({
  sections,
  sectionNotes,
  onToggle,
  emptyState = "No firm note sections configured for this template.",
  renderFooter,
}: SectionNotesPickerProps) {
  if (!sections.length) {
    return <p className="mt-3 text-sm text-slate-500">{emptyState}</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {sections.map((section) => {
        const selections = parseNoteSelections(sectionNotes[section.id]);
        const mergedOptions = mergeNoteOptions(section.options, selections);
        const baseOptionSet = new Set(section.options);
        return (
          <details key={section.id} className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <summary className="flex cursor-pointer items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                  {section.required ? (
                    <Badge variant="secondary" className="text-[11px]">
                      Required
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">{section.summary}</p>
              </div>
              <span className="text-xs text-slate-400">Select</span>
            </summary>
            <div className="mt-3 space-y-2">
              {section.helper ? <p className="text-xs text-slate-500">{section.helper}</p> : null}
              {mergedOptions.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {mergedOptions.map((option) => {
                    const isLegacy = !baseOptionSet.has(option);
                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <Checkbox
                          checked={selections.includes(option)}
                          onCheckedChange={(checked) => onToggle(section.id, option, checked === true)}
                          className="mt-0.5"
                        />
                        <div className="space-y-1">
                          <span className="text-sm text-slate-700">{option}</span>
                          {isLegacy ? (
                            <Badge variant="outline" className="text-[10px] text-slate-500">
                              Imported
                            </Badge>
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No note options configured for this section.</p>
              )}
              {renderFooter ? renderFooter(section.id) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
