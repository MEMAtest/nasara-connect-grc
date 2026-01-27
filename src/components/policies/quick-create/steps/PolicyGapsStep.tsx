"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionNotesPicker } from "@/components/policies/SectionNotesPicker";
import type { FirmProfile } from "@/components/policies/policy-wizard/types";
import type { PolicyTemplate } from "@/lib/policies/templates";
import type { QuickAnswer, QuickAnswers, QuickQuestion } from "@/lib/policies/quick-defaults";
import { GovernanceForm } from "../GovernanceForm";
import { FIRM_FIELD_DEFS } from "../constants";
import { formatPlaceholder, humanizeLabel } from "../helpers";
import type { GovernanceState } from "../types";
import type { NoteSectionConfig } from "@/lib/policies/section-notes";

type GapSummary = {
  firm: number;
  governance: number;
  notes: number;
  placeholders: number;
};

type PolicyGapsStepProps = {
  selectedTemplate: PolicyTemplate;
  firmProfile: FirmProfile;
  extraFirmFields: Record<string, string>;
  missingFirmFields: Array<keyof FirmProfile>;
  missingExtraFirmFields: string[];
  gapSummary: GapSummary;
  missingGlobalVariables: string[];
  gapVariables: Record<string, string>;
  noteSections: NoteSectionConfig[];
  sectionNotes: Record<string, string>;
  missingNotes: NoteSectionConfig[];
  hasRequiredNotes: boolean;
  questions: QuickQuestion[];
  answers: QuickAnswers;
  onAnswerChange: (id: string, value: QuickAnswer) => void;
  onMultiToggle: (id: string, option: string, checked: boolean) => void;
  onSectionNoteToggle: (sectionId: string, option: string, checked: boolean) => void;
  onGapVariableChange: (path: string, value: string) => void;
  onFirmProfileChange: (key: keyof FirmProfile, value: string) => void;
  onSicCodesChange: (value: string) => void;
  onExtraFirmFieldChange: (key: string, value: string) => void;
  onEditSetup: () => void;
  onChangePolicy: () => void;
  onCreatePolicy: () => void;
  isSubmitting: boolean;
  isSetupLoading: boolean;
  totalGaps: number;
  showGovernanceSection: boolean;
  missingGovernance: string[];
  onShowGovernance: () => void;
  onHideGovernance: () => void;
  governance: GovernanceState;
  onGovernanceFieldChange: (key: keyof GovernanceState, value: string) => void;
  onAddDistribution: (value: string) => void;
  onRemoveDistribution: (value: string) => void;
  error?: string | null;
};

export function PolicyGapsStep({
  selectedTemplate,
  firmProfile,
  extraFirmFields,
  missingFirmFields,
  missingExtraFirmFields,
  gapSummary,
  missingGlobalVariables,
  gapVariables,
  noteSections,
  sectionNotes,
  missingNotes,
  hasRequiredNotes,
  questions,
  answers,
  onAnswerChange,
  onMultiToggle,
  onSectionNoteToggle,
  onGapVariableChange,
  onFirmProfileChange,
  onSicCodesChange,
  onExtraFirmFieldChange,
  onEditSetup,
  onChangePolicy,
  onCreatePolicy,
  isSubmitting,
  isSetupLoading,
  totalGaps,
  showGovernanceSection,
  missingGovernance,
  onShowGovernance,
  onHideGovernance,
  governance,
  onGovernanceFieldChange,
  onAddDistribution,
  onRemoveDistribution,
  error,
}: PolicyGapsStepProps) {
  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        onCreatePolicy();
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-800">{selectedTemplate.name}</p>
            <p className="mt-1">{selectedTemplate.description}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onChangePolicy}>
            Change policy
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Firm summary</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{firmProfile.name || "Firm profile"}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Firm details are pulled from onboarding. Edit them if needed.
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="text-slate-500" onClick={onEditSetup}>
                Edit firm setup
              </Button>
            </div>
          </section>

          {gapSummary.firm > 0 ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Firm gaps</p>
                  <h3 className="mt-2 text-lg font-semibold text-amber-900">Fill missing firm details</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    These placeholders are required by this policy template.
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                  {gapSummary.firm} required
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {missingFirmFields.map((field) => {
                  if (field === "sicCodes") {
                    return (
                      <div key={field} className="space-y-2 sm:col-span-2">
                        <Label className="text-sm font-medium text-amber-900">{FIRM_FIELD_DEFS.sicCodes.label}</Label>
                        <Input
                          value={(firmProfile.sicCodes || []).join(", ")}
                          onChange={(event) => onSicCodesChange(event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.sicCodes.placeholder}
                        />
                      </div>
                    );
                  }

                  const meta = FIRM_FIELD_DEFS[field];
                  return (
                    <div key={field} className="space-y-2">
                      <Label className="text-sm font-medium text-amber-900">{meta.label}</Label>
                      <Input
                        value={(firmProfile[field] as string) ?? ""}
                        onChange={(event) => onFirmProfileChange(field, event.target.value)}
                        placeholder={meta.placeholder}
                        type={meta.type}
                      />
                    </div>
                  );
                })}
              </div>

              {missingExtraFirmFields.length ? (
                <div className="mt-4 border-t border-amber-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
                    Template-specific fields
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {missingExtraFirmFields.map((key) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-sm font-medium text-amber-900">{humanizeLabel(key)}</Label>
                        <Input
                          value={extraFirmFields[key] ?? ""}
                          onChange={(event) => onExtraFirmFieldChange(key, event.target.value)}
                          placeholder={formatPlaceholder(key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {questions.length ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Policy questions</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Answer policy-specific questions</h3>
                  <p className="mt-1 text-sm text-slate-500">These responses tailor scope and wording in the draft.</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {questions.map((question) => {
                  if (question.type === "text") {
                    return (
                      <div key={question.id} className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          {question.label}
                          {question.required ? " *" : ""}
                        </Label>
                        {question.description ? <p className="text-xs text-slate-400">{question.description}</p> : null}
                        <Input
                          value={(answers[question.id] as string) ?? ""}
                          onChange={(event) => onAnswerChange(question.id, event.target.value)}
                          placeholder={question.description ?? ""}
                        />
                      </div>
                    );
                  }

                  if (question.type === "multi") {
                    const selected = Array.isArray(answers[question.id])
                      ? (answers[question.id] as string[])
                      : [];
                    const options = question.options ?? [];
                    return (
                      <div key={question.id} className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          {question.label}
                          {question.required ? " *" : ""}
                        </Label>
                        {question.description ? <p className="text-xs text-slate-400">{question.description}</p> : null}
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {options.length ? (
                            options.map((option) => (
                              <label
                                key={option}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2"
                              >
                                <Checkbox
                                  checked={selected.includes(option)}
                                  onCheckedChange={(checked) => onMultiToggle(question.id, option, checked === true)}
                                  className="mt-0.5"
                                />
                                <span className="text-sm text-slate-700">{option}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400">No options available.</p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const checked = Boolean(answers[question.id]);
                  return (
                    <div
                      key={question.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                    >
                      <div>
                        <Label className="text-sm font-medium text-slate-700">{question.label}</Label>
                        {question.description ? <p className="mt-1 text-xs text-slate-400">{question.description}</p> : null}
                      </div>
                      <Switch checked={checked} onCheckedChange={(value) => onAnswerChange(question.id, value)} />
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Firm notes</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Select firm-specific detail</h3>
                <p className="mt-1 text-sm text-slate-500">Choose the statements that apply to your firm.</p>
              </div>
              {hasRequiredNotes ? (
                missingNotes.length ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {missingNotes.length} required
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Complete
                  </span>
                )
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  Optional
                </span>
              )}
            </div>

            <SectionNotesPicker sections={noteSections} sectionNotes={sectionNotes} onToggle={onSectionNoteToggle} />
          </section>

          {missingGlobalVariables.length ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Template gaps</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Fill remaining placeholders</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    These placeholders are embedded inside clauses and require a value.
                  </p>
                </div>
                {missingGlobalVariables.length ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {missingGlobalVariables.length} required
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Complete
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {missingGlobalVariables.map((path) => (
                  <div key={path} className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">{humanizeLabel(path)} *</Label>
                    <Input
                      value={gapVariables[path] ?? ""}
                      onChange={(event) => onGapVariableChange(path, event.target.value)}
                      placeholder={formatPlaceholder(path)}
                    />
                    <p className="text-xs text-slate-400">Token: {path}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {showGovernanceSection ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Governance</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Quick edit governance</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Defaults come from onboarding. Update them for this policy if needed.
                  </p>
                </div>
                {missingGovernance.length === 0 ? (
                  <Button type="button" variant="ghost" size="sm" className="text-slate-500" onClick={onHideGovernance}>
                    Hide
                  </Button>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {missingGovernance.length} required
                  </span>
                )}
              </div>
              <GovernanceForm
                governance={governance}
                onFieldChange={onGovernanceFieldChange}
                onAddDistribution={onAddDistribution}
                onRemoveDistribution={onRemoveDistribution}
              />
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Governance</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Governance defaults saved</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    You can quickly adjust these for this policy if needed.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onShowGovernance}>
                  Quick edit
                </Button>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Gap summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Firm details</span>
                <span className="font-semibold">{gapSummary.firm}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Governance</span>
                <span className="font-semibold">{gapSummary.governance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Section notes</span>
                <span className="font-semibold">{gapSummary.notes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Template placeholders</span>
                <span className="font-semibold">{gapSummary.placeholders}</span>
              </div>
            </div>
            <Button
              type="submit"
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={Boolean(isSubmitting) || isSetupLoading || totalGaps > 0}
            >
              {isSubmitting ? "Generating..." : "Generate policy"}
            </Button>
            {totalGaps > 0 ? (
              <p className="mt-2 text-xs text-slate-400">Fill the remaining gaps to create the draft.</p>
            ) : null}
          </section>
        </aside>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
