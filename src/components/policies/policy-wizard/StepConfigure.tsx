"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  ChevronRight,
  Check,
  AlertCircle,
  FileCheck,
  Layers,
  Zap,
  Building2,
  BookOpen,
  Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { POLICY_TEMPLATES, POLICY_TEMPLATE_CLAUSES, getApplicableClauses, type PolicyTemplate } from "@/lib/policies/templates";
import { DETAIL_LEVEL_INFO, estimatePageCount, applyTiering, type DetailLevel } from "@/lib/policies/clause-tiers";
import { assembleComplaintsPolicy, DEFAULT_COMPLAINTS_ANSWERS } from "@/lib/policies/assemblers/complaints";
import { getOptionGroupsForSection, type SectionOptionGroup } from "@/lib/policies/section-options";
import type { WizardStepProps } from "./types";
import { toComplaintsDetailLevel } from "./detail-level";

const DETAIL_LEVEL_ICONS = {
  essential: Zap,
  standard: FileCheck,
  comprehensive: Building2,
};

export function StepConfigure({
  state,
  updateState,
  onNext,
  onBack,
  availableTemplates,
}: WizardStepProps & { availableTemplates?: PolicyTemplate[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const templateOptions = availableTemplates?.length ? availableTemplates : POLICY_TEMPLATES;

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templateOptions;
    const query = searchQuery.toLowerCase();
    return templateOptions.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }, [searchQuery, templateOptions]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, PolicyTemplate[]> = {};
    filteredTemplates.forEach((template) => {
      if (!groups[template.category]) {
        groups[template.category] = [];
      }
      groups[template.category].push(template);
    });
    return groups;
  }, [filteredTemplates]);

  // Get current detail level
  const detailLevel: DetailLevel = state.detailLevel || "standard";

  // Calculate preview data when template is selected
  const previewData = useMemo(() => {
    if (!state.selectedTemplate) return null;

    const clauseOverrides =
      state.sectionClauses && Object.keys(state.sectionClauses).length > 0 ? state.sectionClauses : undefined;

    const tieredSections = applyTiering(
      state.selectedTemplate,
      POLICY_TEMPLATE_CLAUSES.filter(
        (c) => c.appliesTo?.includes(state.selectedTemplate!.code) || !c.appliesTo
      ),
      detailLevel,
      clauseOverrides
    );

    const pageEstimate = estimatePageCount(tieredSections);
    const totalClauses = tieredSections.reduce((acc, s) => acc + s.clauses.length, 0);

    return {
      sections: tieredSections,
      pageEstimate,
      totalClauses,
    };
  }, [state.selectedTemplate, detailLevel, state.sectionClauses]);

  const handleSelectTemplate = (template: PolicyTemplate) => {
    const applicableClauses = getApplicableClauses(template.code, state.permissions);
    const complaintsAnswers = {
      ...(state.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS),
      detailLevel: toComplaintsDetailLevel(detailLevel),
    };
    const initialSectionClauses =
      template.code === "COMPLAINTS"
        ? assembleComplaintsPolicy(template, complaintsAnswers).sectionClauses
        : template.sections.reduce<Record<string, string[]>>((acc, section) => {
            acc[section.id] = [...section.suggestedClauses];
            return acc;
          }, {});

    const clauseIds = Array.from(new Set(Object.values(initialSectionClauses).flatMap((ids) => ids)));
    const selectedClauses = clauseIds
      .map((id) => applicableClauses.find((clause) => clause.id === id))
      .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));

    updateState((s) => ({
      ...s,
      selectedTemplate: template,
      complaintsAnswers,
      sectionOptions: {},
      sectionClauses: initialSectionClauses,
      sectionNotes: {},
      clauseVariables: {},
      selectedClauses,
    }));
  };

  const handleDetailLevelChange = (level: DetailLevel) => {
    updateState((s) => {
      const complaintsAnswers = {
        ...(s.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS),
        detailLevel: toComplaintsDetailLevel(level),
      };

      if (!s.selectedTemplate || s.selectedTemplate.code !== "COMPLAINTS") {
        return { ...s, detailLevel: level, complaintsAnswers };
      }

      const sectionClauses = assembleComplaintsPolicy(s.selectedTemplate, complaintsAnswers).sectionClauses;
      const applicableClauses = getApplicableClauses(s.selectedTemplate.code, s.permissions);
      const clauseIds = Array.from(new Set(Object.values(sectionClauses).flatMap((ids) => ids)));
      const selectedClauses = clauseIds
        .map((id) => applicableClauses.find((clause) => clause.id === id))
        .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));

      return {
        ...s,
        detailLevel: level,
        complaintsAnswers,
        sectionClauses,
        selectedClauses,
      };
    });
  };

  const handleOptionChange = (sectionId: string, groupId: string, optionId: string) => {
    updateState((s) => ({
      ...s,
      sectionOptions: {
        ...s.sectionOptions,
        [sectionId]: {
          ...(s.sectionOptions[sectionId] || {}),
          [groupId]: optionId,
        },
      },
    }));
  };

  // Get all option groups for the selected template
  const templateOptionGroups = useMemo(() => {
    if (!state.selectedTemplate) return [];

    const groups: Array<{ sectionId: string; sectionTitle: string; optionGroups: SectionOptionGroup[] }> = [];

    for (const section of state.selectedTemplate.sections) {
      const optionGroups = getOptionGroupsForSection(state.selectedTemplate.code, section.id);
      if (optionGroups.length > 0) {
        groups.push({
          sectionId: section.id,
          sectionTitle: section.title,
          optionGroups,
        });
      }
    }

    return groups;
  }, [state.selectedTemplate]);

  const canContinue = state.selectedTemplate !== undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Left Panel - Template Selection */}
      <div className="space-y-6 lg:col-span-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies..."
            className="pl-10"
          />
        </div>

        {/* Detail Level Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Document Detail Level</label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(DETAIL_LEVEL_INFO) as DetailLevel[]).map((level) => {
              const info = DETAIL_LEVEL_INFO[level];
              const Icon = DETAIL_LEVEL_ICONS[level];
              const isSelected = detailLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleDetailLevelChange(level)}
                  className={cn(
                    "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  {isSelected && (
                    <div className="absolute right-2 top-2">
                      <Check className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <Icon
                    className={cn(
                      "h-6 w-6 mb-2",
                      isSelected ? "text-indigo-600" : "text-slate-400"
                    )}
                  />
                  <div className="font-semibold text-slate-900">{info.label}</div>
                  <div className="text-xs text-slate-500">{info.pageEstimate}</div>
                  <div className="mt-1 text-xs text-slate-400">{info.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Grid */}
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <Layers className="h-4 w-4" />
                {category}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((template) => {
                  const isSelected = state.selectedTemplate?.code === template.code;

                  return (
                    <motion.button
                      key={template.code}
                      type="button"
                      onClick={() => handleSelectTemplate(template)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex w-full items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText
                            className={cn(
                              "h-5 w-5",
                              isSelected ? "text-indigo-600" : "text-slate-400"
                            )}
                          />
                          <span
                            className={cn(
                              "font-semibold",
                              isSelected ? "text-indigo-900" : "text-slate-900"
                            )}
                          >
                            {template.name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-indigo-600" />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {template.description}
                      </p>
                      {template.badges && template.badges.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.badges.map((badge, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                badge.tone === "emerald" && "bg-emerald-100 text-emerald-700",
                                badge.tone === "amber" && "bg-amber-100 text-amber-700",
                                badge.tone === "sky" && "bg-sky-100 text-sky-700"
                              )}
                            >
                              {badge.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">
                No policies match your search
              </p>
            </div>
          )}
        </div>

        {/* Section Options - Show when template is selected */}
        {state.selectedTemplate && templateOptionGroups.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Policy Options</h3>
            </div>
            <p className="text-sm text-slate-500">
              Customize your policy by selecting from the options below. These will be automatically included in your document.
            </p>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
              {templateOptionGroups.map((section) => (
                <div key={section.sectionId} className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">
                    {section.sectionTitle}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.optionGroups.map((group) => {
                      const currentValue = state.sectionOptions[section.sectionId]?.[group.id] || group.defaultOptionId || '';

                      return (
                        <div key={group.id} className="space-y-1.5">
                          <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
                            {group.label}
                            {group.required && <span className="text-red-500">*</span>}
                          </label>
                          <Select
                            value={currentValue}
                            onValueChange={(value) => handleOptionChange(section.sectionId, group.id, value)}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder={`Select ${group.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {group.options.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  <div className="flex flex-col">
                                    <span>{option.label}</span>
                                    {option.description && (
                                      <span className="text-xs text-slate-400">{option.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {group.description && (
                            <p className="text-xs text-slate-400">{group.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Live Preview */}
      <div className="lg:col-span-2">
        <div className="sticky top-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Document Preview
            </div>

            {!state.selectedTemplate ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-6 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  Select a policy template to see preview
                </p>
              </div>
            ) : previewData ? (
              <div className="mt-4 space-y-4">
                {/* Header */}
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-teal-50 p-4 text-center">
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {state.firmProfile.name || "Your Firm"}
                  </div>
                  <div className="mt-1 text-lg font-bold text-indigo-900">
                    {state.selectedTemplate.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Version 1.0
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      ~{previewData.pageEstimate}
                    </div>
                    <div className="text-xs text-slate-500">Pages</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {previewData.sections.length}
                    </div>
                    <div className="text-xs text-slate-500">Sections</div>
                  </div>
                </div>

                {/* Section List */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contents
                  </div>
                  <div className="max-h-[280px] overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                    {previewData.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-xs font-medium text-slate-600">
                          {idx + 1}
                        </span>
                        <span className="flex-1 truncate text-slate-700">
                          {section.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {section.clauses.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail level indicator */}
                <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-3 text-sm">
                  <span className="text-indigo-700">
                    {DETAIL_LEVEL_INFO[detailLevel].label} Detail
                  </span>
                  <span className="font-medium text-indigo-900">
                    {DETAIL_LEVEL_INFO[detailLevel].pageEstimate}
                  </span>
                </div>

                {/* Selected Options Summary */}
                {templateOptionGroups.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Configuration
                    </div>
                    <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2">
                      {templateOptionGroups.map((section) => {
                        const sectionSelections = state.sectionOptions[section.sectionId] || {};
                        const hasSelections = section.optionGroups.some(
                          (g) => sectionSelections[g.id] || g.defaultOptionId
                        );

                        if (!hasSelections) return null;

                        return (
                          <div key={section.sectionId} className="text-xs">
                            {section.optionGroups.map((group) => {
                              const selectedId = sectionSelections[group.id] || group.defaultOptionId;
                              const selectedOption = group.options.find((o) => o.id === selectedId);
                              if (!selectedOption) return null;

                              return (
                                <div
                                  key={group.id}
                                  className="flex items-center justify-between py-1 text-slate-600"
                                >
                                  <span className="truncate">{group.label}</span>
                                  <span className="ml-2 rounded bg-white px-1.5 py-0.5 font-medium text-indigo-700">
                                    {selectedOption.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      {templateOptionGroups.every((section) => {
                        const sectionSelections = state.sectionOptions[section.sectionId] || {};
                        return !section.optionGroups.some(
                          (g) => sectionSelections[g.id] || g.defaultOptionId
                        );
                      }) && (
                        <div className="py-2 text-center text-xs text-slate-400">
                          Using default settings
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext} disabled={!canContinue}>
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
