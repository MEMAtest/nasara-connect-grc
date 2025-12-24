"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { renderPolicyMarkdown } from "@/lib/policies/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { renderClause } from "@/lib/policies/liquid-renderer";
import { getApplicableClauses } from "@/lib/policies/templates";
import type { PolicyClause } from "@/lib/policies/templates";
import type { WizardStepProps } from "./types";
import { PolicyReaderClient } from "@/components/policies/PolicyReaderClient";
import type { PolicyReaderOverview, PolicyReaderSection } from "@/components/policies/PolicyReaderClient";
import {
  assembleComplaintsPolicy,
  DEFAULT_COMPLAINTS_ANSWERS,
  type ComplaintsAssemblerAnswers,
  type ComplaintsModule,
} from "@/lib/policies/assemblers/complaints";

function renderMarkdown(value: string) {
  if (!value) return "";
  return renderPolicyMarkdown(value);
}

function toExcerpt(value: string, maxLength = 180) {
  const cleaned = value
    .replace(/\r?\n/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[\\#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function modulesBySection(modules: ComplaintsModule[]) {
  return modules.reduce<Record<string, ComplaintsModule[]>>((acc, module) => {
    acc[module.sectionId] = acc[module.sectionId] ? [...acc[module.sectionId], module] : [module];
    return acc;
  }, {});
}

function toDisplay(value: string) {
  return value.replace(/-/g, " ");
}

export function StepContentBuilder({ state, updateState, onNext, onBack }: WizardStepProps) {
  const template = state.selectedTemplate;
  const [activeSectionId, setActiveSectionId] = useState("");

  const complaintsAnswers = state.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS;

  const applicableClauses = useMemo(() => {
    if (!template) return [] as PolicyClause[];
    return getApplicableClauses(template.code, state.permissions);
  }, [template, state.permissions]);

  const clauseById = useMemo(() => {
    const map = new Map<string, PolicyClause>();
    applicableClauses.forEach((clause) => map.set(clause.id, clause));
    return map;
  }, [applicableClauses]);

  const assembly = useMemo(() => {
    if (!template || template.code !== "COMPLAINTS") {
      return { modules: [], sectionClauses: state.sectionClauses };
    }
    return assembleComplaintsPolicy(template, complaintsAnswers);
  }, [template, complaintsAnswers, state.sectionClauses]);

  const assemblyKey = useMemo(() => JSON.stringify(assembly.sectionClauses), [assembly.sectionClauses]);

  useEffect(() => {
    if (!template || template.code !== "COMPLAINTS") return;
    if (assemblyKey === JSON.stringify(state.sectionClauses)) return;
    const clauseIds = Array.from(new Set(Object.values(assembly.sectionClauses).flatMap((ids) => ids)));
    const selectedClauses = clauseIds
      .map((id) => clauseById.get(id))
      .filter((clause): clause is PolicyClause => Boolean(clause));

    updateState((current) => ({
      ...current,
      sectionClauses: assembly.sectionClauses,
      selectedClauses,
    }));
  }, [assemblyKey, clauseById, template, updateState, state.sectionClauses]);

  useEffect(() => {
    if (!template?.sections?.length) return;
    setActiveSectionId(template.sections[0].id);
  }, [template?.code]);

  const firmContext = useMemo(() => {
    return {
      firm: {
        name: state.firmProfile.name,
        tradingName: state.firmProfile.tradingName || undefined,
        registeredAddress: state.firmProfile.registeredAddress || undefined,
        fcaReference: state.firmProfile.fcaReference || undefined,
        website: state.firmProfile.website || undefined,
      },
      firm_name: state.firmProfile.name,
      permissions: state.permissions,
    };
  }, [state.firmProfile, state.permissions]);

  const renderClauseHtml = (clause: PolicyClause) => {
    const answers = state.clauseVariables[clause.id] ?? {};
    const renderedMd = renderClause(clause.content, firmContext, answers);
    return renderMarkdown(renderedMd);
  };

  if (!template) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
        Select a template in the previous step to start composing content.
      </div>
    );
  }

  if (template.code !== "COMPLAINTS") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
          The modular policy assembler is available for the Complaints policy first. Other templates will be migrated next.
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={onNext}>
            <Plus className="h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  const modules = assembly.modules;
  const sectionIds = Object.keys(assembly.sectionClauses);
  const overview: PolicyReaderOverview | null = {
    timeline: [
      { label: "3-day SRC", description: "DISP 1.5" },
      { label: "15 days (PSD)", description: "PSR" },
      { label: "35 days (PSD exception)", description: "PSR" },
      { label: "8 weeks (Non-PSD)", description: "DISP" },
    ],
    metrics: [
      { label: "% on-time final responses" },
      { label: "Avg days to resolve (PSD)", suffix: "days" },
      { label: "FOS overturn rate" },
      { label: "Vulnerable complaints on time" },
    ],
  };

  const readerSections: PolicyReaderSection[] = sectionIds
    .map((sectionId) => {
      const section = template.sections.find((item) => item.id === sectionId);
      const clauseIds = assembly.sectionClauses[sectionId] ?? [];
      const clauses = clauseIds.map((id) => clauseById.get(id)).filter((c): c is PolicyClause => Boolean(c));
      const customText = state.sectionNotes[sectionId] ?? "";
      return {
        id: sectionId,
        title: section?.title ?? sectionId,
        summary: section?.summary ?? "",
        sectionType: section?.sectionType ?? "policy",
        requiresFirmNotes: section?.requiresFirmNotes ?? false,
        customTextHtml: customText ? renderMarkdown(customText) : undefined,
        customTextExcerpt: customText ? toExcerpt(customText) : undefined,
        clauseCount: clauses.length,
        clauseHighlights: clauses.slice(0, 3).map((clause) => ({ id: clause.id, title: clause.title })),
        clauses: clauses.map((clause) => ({
          id: clause.id,
          title: clause.title,
          summary: clause.summary,
          isMandatory: clause.isMandatory,
          contentHtml: renderClauseHtml(clause),
        })),
      };
    })
    .filter((section) => section.clauseCount > 0);

  const groupedModules = modulesBySection(modules);
  const activeSection = activeSectionId || sectionIds[0];

  const updateComplaintsAnswers = (updates: Partial<ComplaintsAssemblerAnswers>) => {
    updateState((current) => ({
      ...current,
      complaintsAnswers: {
        ...(current.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS),
        ...updates,
      },
    }));
  };

  return (
    <Tabs defaultValue="assembler" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Complaints policy assembler</h2>
          <p className="text-sm text-slate-500">
            Answer the firm questions and we assemble a tailored complaints policy from static modules and dynamic fragments.
          </p>
        </div>
        <TabsList className="bg-slate-100 text-slate-500">
          <TabsTrigger value="assembler">Assembler</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="assembler" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Firm profile</p>
                <p className="mt-1 text-sm text-slate-500">These answers drive dynamic policy fragments.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Policy depth</Label>
                  <Select value={complaintsAnswers.detailLevel} onValueChange={(value) => updateComplaintsAnswers({ detailLevel: value as ComplaintsAssemblerAnswers["detailLevel"] })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focused">Focused (lean, targeted)</SelectItem>
                      <SelectItem value="standard">Standard (balanced)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (full coverage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select value={complaintsAnswers.jurisdiction} onValueChange={(value) => updateComplaintsAnswers({ jurisdiction: value as ComplaintsAssemblerAnswers["jurisdiction"] })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">UK domestic only</SelectItem>
                      <SelectItem value="uk-eea">UK + EEA passporting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment rails</Label>
                  <div className="space-y-2">
                    {(["stripe", "thunes", "swift", "other"] as const).map((rail) => (
                      <label key={rail} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                        <Checkbox
                          checked={complaintsAnswers.paymentRails.includes(rail)}
                          onCheckedChange={() => {
                            const next = complaintsAnswers.paymentRails.includes(rail)
                              ? complaintsAnswers.paymentRails.filter((value) => value !== rail)
                              : [...complaintsAnswers.paymentRails, rail];
                            updateComplaintsAnswers({ paymentRails: next });
                          }}
                        />
                        <span className="text-sm text-slate-700 capitalize">{rail}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ID method</Label>
                  <Select value={complaintsAnswers.idMethod} onValueChange={(value) => updateComplaintsAnswers({ idMethod: value as ComplaintsAssemblerAnswers["idMethod"] })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual agent review</SelectItem>
                      <SelectItem value="hybrid">Hybrid (manual + AI)</SelectItem>
                      <SelectItem value="ai">AI-assisted review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Oversight depth</Label>
                  <Select value={complaintsAnswers.oversight} onValueChange={(value) => updateComplaintsAnswers({ oversight: value as ComplaintsAssemblerAnswers["oversight"] })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard oversight</SelectItem>
                      <SelectItem value="enhanced">Enhanced audit & board reporting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vulnerability focus</Label>
                  <Select value={complaintsAnswers.vulnerabilityFocus} onValueChange={(value) => updateComplaintsAnswers({ vulnerabilityFocus: value as ComplaintsAssemblerAnswers["vulnerabilityFocus"] })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard vulnerability coverage</SelectItem>
                      <SelectItem value="high">High vulnerability focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Channels supported</Label>
                  <div className="space-y-2">
                    {(["web", "email", "social", "phone", "branch"] as const).map((channel) => (
                      <label key={channel} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                        <Checkbox
                          checked={complaintsAnswers.channels.includes(channel)}
                          onCheckedChange={() => {
                            const next = complaintsAnswers.channels.includes(channel)
                              ? complaintsAnswers.channels.filter((value) => value !== channel)
                              : [...complaintsAnswers.channels, channel];
                            updateComplaintsAnswers({ channels: next });
                          }}
                        />
                        <span className="text-sm text-slate-700 capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Governance additions</Label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                    <Checkbox
                      checked={complaintsAnswers.vulnerabilityChampion}
                      onCheckedChange={() =>
                        updateComplaintsAnswers({ vulnerabilityChampion: !complaintsAnswers.vulnerabilityChampion })
                      }
                    />
                    <span className="text-sm text-slate-700">Board-level vulnerability champion</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                    <Checkbox
                      checked={complaintsAnswers.includeAppendices}
                      onCheckedChange={() => updateComplaintsAnswers({ includeAppendices: !complaintsAnswers.includeAppendices })}
                    />
                    <span className="text-sm text-slate-700">Include letter templates & appendices</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Assembled modules</p>
                <p className="mt-1 text-sm text-slate-500">Each module is included because of your selections.</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  {modules.filter((module) => module.kind === "static").length} static
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {modules.filter((module) => module.kind === "dynamic").length} dynamic
                </Badge>
              </div>
            </div>

            <ScrollArea className="mt-4 h-[58vh]">
              <div className="space-y-4 pr-4">
                {Object.keys(groupedModules).map((sectionId) => (
                  <div key={sectionId} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {toDisplay(sectionId)}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {template.sections.find((section) => section.id === sectionId)?.title ?? toDisplay(sectionId)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {template.sections.find((section) => section.id === sectionId)?.summary ?? ""}
                      </p>
                    </div>

                    <div className="mt-3 space-y-3">
                      {groupedModules[sectionId].map((module) => (
                        <div key={module.id} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                              <p className="text-xs text-slate-500">{module.summary}</p>
                            </div>
                            <Badge variant="outline" className="text-[11px]">
                              {module.kind === "static" ? "Static module" : "Dynamic fragment"}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                            {module.reasons.map((reason) => (
                              <span key={`${module.id}-${reason}`} className="rounded-full bg-slate-100 px-2 py-1">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </section>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="space-y-4">
        <PolicyReaderClient sections={readerSections} defaultSectionId={activeSection} overview={overview} />
      </TabsContent>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={onNext}>
          <Plus className="h-4 w-4" />
          Continue
        </Button>
      </div>
    </Tabs>
  );
}
