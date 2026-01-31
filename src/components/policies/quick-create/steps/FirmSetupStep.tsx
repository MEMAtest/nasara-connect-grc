"use client";

import { RefreshCw } from "lucide-react";
import { CompaniesHouseLookup } from "@/components/inputs/CompaniesHouseLookup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FirmProfile } from "@/components/policies/policy-wizard/types";
import type { FirmPermissions, PolicyRequirement } from "@/lib/policies/permissions";
import { GovernanceForm } from "../GovernanceForm";
import {
  BUSINESS_PROFILE_FIELDS,
  BUSINESS_PROFILE_OTHER_OPTION,
  FIRM_FIELD_DEFS,
  PERMISSION_GROUPS,
} from "../constants";
import { formatOptionId, formatPlaceholder, humanizeLabel, parseMultiSelectValue } from "../helpers";
import type { AuthorizationProjectSummary, GovernanceState } from "../types";

type FirmSetupStepProps = {
  firmProfile: FirmProfile;
  extraFirmFields: Record<string, string>;
  additionalFirmFieldKeys: string[];
  permissionsDraft: FirmPermissions;
  governance: GovernanceState;
  missingGovernance: string[];
  draftRequiredPolicies: PolicyRequirement[];
  policyProfileError?: string | null;
  error?: string | null;
  isSavingSetup: boolean;
  isApplyingProjects: boolean;
  isProjectsLoading: boolean;
  projectsError?: string | null;
  authorizationProjects: AuthorizationProjectSummary[];
  selectedProjectIds: string[];
  onProjectToggle: (projectId: string, checked: boolean) => void;
  onApplyProjects: () => void;
  onFirmProfileChange: (key: keyof FirmProfile, value: string) => void;
  onSicCodesChange: (value: string) => void;
  onExtraFirmFieldChange: (key: string, value: string) => void;
  onBusinessProfileToggle: (key: string, option: string, checked?: boolean) => void;
  onBusinessProfileOtherChange: (key: string, value: string) => void;
  onPermissionChange: (key: keyof FirmPermissions, checked: boolean) => void;
  onSave: () => void;
  onCompaniesHouseSelect: (data: {
    legalName?: string;
    companyNumber?: string;
    registeredAddress?: string;
    sicCodes: string[];
  }) => void;
  onGovernanceFieldChange: (key: keyof GovernanceState, value: string) => void;
  onAddDistribution: (value: string) => void;
  onRemoveDistribution: (value: string) => void;
};

export function FirmSetupStep({
  firmProfile,
  extraFirmFields,
  additionalFirmFieldKeys,
  permissionsDraft,
  governance,
  missingGovernance,
  draftRequiredPolicies,
  policyProfileError,
  error,
  isSavingSetup,
  isApplyingProjects,
  isProjectsLoading,
  projectsError,
  authorizationProjects,
  selectedProjectIds,
  onProjectToggle,
  onApplyProjects,
  onFirmProfileChange,
  onSicCodesChange,
  onExtraFirmFieldChange,
  onBusinessProfileToggle,
  onBusinessProfileOtherChange,
  onPermissionChange,
  onSave,
  onCompaniesHouseSelect,
  onGovernanceFieldChange,
  onAddDistribution,
  onRemoveDistribution,
}: FirmSetupStepProps) {
  const navItems = [
    { id: "firm-setup-authorization", label: "Authorization projects" },
    { id: "firm-setup-essentials", label: "Firm essentials" },
    { id: "firm-setup-business", label: "Business profile" },
    { id: "firm-setup-permissions", label: "Permissions" },
    { id: "firm-setup-governance", label: "Governance defaults" },
  ];

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Firm setup</p>
        <p className="mt-1">This is your one-time onboarding for policy generation.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)_320px]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Sections</p>
            <div className="mt-3 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-xl border border-transparent px-3 py-2 text-sm text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-6">
          <section id="firm-setup-authorization" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Authorization projects
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Link your permissions work</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use authorization projects to prefill firm details and permissions.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onApplyProjects}
                disabled={isApplyingProjects || !selectedProjectIds.length}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isApplyingProjects ? "animate-spin" : ""}`} />
                {isApplyingProjects ? "Applying" : "Use selected"}
              </Button>
            </div>

            {projectsError ? (
              <p className="mt-4 text-sm text-rose-600">{projectsError}</p>
            ) : isProjectsLoading ? (
              <p className="mt-4 text-sm text-slate-400">Loading authorization projects...</p>
            ) : authorizationProjects.length ? (
              <div className="mt-4 space-y-3">
                {authorizationProjects.map((project) => {
                  const isChecked = selectedProjectIds.includes(project.id);
                  return (
                    <label
                      key={project.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                        isChecked ? "border-indigo-200 bg-indigo-50/70" : "border-slate-200 bg-slate-50/70"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {project.name || project.permissionName || "Authorization project"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {project.permissionCode || project.status || "Select to apply data"}
                        </p>
                      </div>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => onProjectToggle(project.id, checked === true)}
                      />
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No authorization projects available yet.</p>
            )}
          </section>

          <section id="firm-setup-essentials" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Firm essentials</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Capture firm identity</h3>
                <p className="mt-1 text-sm text-slate-500">
                  This is used for policy headers and metadata across every template.
                </p>
              </div>
              {firmProfile.name.trim() ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Prefilled
                </span>
              ) : null}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Companies House</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Search and prefill firm details</p>
              <p className="mt-1 text-xs text-slate-500">
                Look up your legal entity to prefill the registered name, address, and SIC codes.
              </p>
              <div className="mt-3">
                <CompaniesHouseLookup onSelect={onCompaniesHouseSelect} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firmName" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.name.label} *
                </Label>
                <Input
                  id="firmName"
                  value={firmProfile.name}
                  onChange={(event) => onFirmProfileChange("name", event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.name.placeholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradingName" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.tradingName.label}
                </Label>
                <Input
                  id="tradingName"
                  value={firmProfile.tradingName || ""}
                  onChange={(event) => onFirmProfileChange("tradingName", event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.tradingName.placeholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registeredAddress" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.registeredAddress.label}
                </Label>
                <Input
                  id="registeredAddress"
                  value={firmProfile.registeredAddress || ""}
                  onChange={(event) => onFirmProfileChange("registeredAddress", event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.registeredAddress.placeholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNumber" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.companyNumber.label}
                </Label>
                <Input
                  id="companyNumber"
                  value={firmProfile.companyNumber || ""}
                  onChange={(event) => onFirmProfileChange("companyNumber", event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.companyNumber.placeholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fcaReference" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.fcaReference.label}
                </Label>
                <Input
                  id="fcaReference"
                  value={firmProfile.fcaReference || ""}
                  onChange={(event) => onFirmProfileChange("fcaReference", event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.fcaReference.placeholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.website.label}
                </Label>
                <Input
                  id="website"
                  value={firmProfile.website || ""}
                  onChange={(event) => onFirmProfileChange("website", event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.website.placeholder}
                  type="url"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="sicCodes" className="text-sm font-medium text-slate-700">
                  {FIRM_FIELD_DEFS.sicCodes.label}
                </Label>
                <Input
                  id="sicCodes"
                  value={(firmProfile.sicCodes || []).join(", ")}
                  onChange={(event) => onSicCodesChange(event.target.value)}
                  placeholder={FIRM_FIELD_DEFS.sicCodes.placeholder}
                />
              </div>
            </div>

            {additionalFirmFieldKeys.length ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Additional firm fields
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {additionalFirmFieldKeys.map((key) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">{humanizeLabel(key)}</Label>
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

          <section id="firm-setup-business" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Business profile</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Capture what the firm does</h3>
                <p className="mt-1 text-sm text-slate-500">
                  These details help tailor scope and product references across policies.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {BUSINESS_PROFILE_FIELDS.map((field) => {
                const otherKey = `${field.key}Other`;
                const rawSelections = parseMultiSelectValue(extraFirmFields[field.key]);
                const knownOptions = new Set(field.options);
                const unknownSelections = rawSelections.filter(
                  (entry) => !knownOptions.has(entry) && entry !== BUSINESS_PROFILE_OTHER_OPTION,
                );
                const storedOtherValue = extraFirmFields[otherKey] ?? "";
                const derivedOtherValue =
                  storedOtherValue.trim().length > 0
                    ? storedOtherValue
                    : unknownSelections.length
                      ? unknownSelections.join(", ")
                      : "";
                const selections = new Set(rawSelections);
                if (derivedOtherValue.trim()) {
                  selections.add(BUSINESS_PROFILE_OTHER_OPTION);
                }
                const isOtherSelected = selections.has(BUSINESS_PROFILE_OTHER_OPTION);
                return (
                  <div key={field.key} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-900">{field.label}</Label>
                      <p className="mt-1 text-xs text-slate-500">{field.helper}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {field.options.map((option) => {
                        const optionId = formatOptionId(field.key, option);
                        return (
                          <label
                            key={option}
                            htmlFor={optionId}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                          >
                            <Checkbox
                              id={optionId}
                              checked={selections.has(option)}
                              onCheckedChange={(checked) => onBusinessProfileToggle(field.key, option, checked === true)}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-slate-700">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-3 space-y-2">
                      <label
                        htmlFor={formatOptionId(field.key, BUSINESS_PROFILE_OTHER_OPTION)}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <Checkbox
                          id={formatOptionId(field.key, BUSINESS_PROFILE_OTHER_OPTION)}
                          checked={isOtherSelected}
                          onCheckedChange={(checked) =>
                            onBusinessProfileToggle(field.key, BUSINESS_PROFILE_OTHER_OPTION, checked === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm text-slate-700">{BUSINESS_PROFILE_OTHER_OPTION}</span>
                      </label>
                      {isOtherSelected ? (
                        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                          <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {field.otherLabel}
                          </Label>
                          <Input
                            value={derivedOtherValue}
                            onChange={(event) => onBusinessProfileOtherChange(field.key, event.target.value)}
                            placeholder={field.otherPlaceholder}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="firm-setup-permissions" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Permissions</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Confirm regulatory scope</h3>
                <p className="mt-1 text-sm text-slate-500">
                  We use this to work out which policies are required.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                {Object.values(permissionsDraft).filter(Boolean).length} selected
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{group.title}</p>
                  <div className="mt-3 space-y-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <Checkbox
                          checked={permissionsDraft[permission.key]}
                          onCheckedChange={(checked) => onPermissionChange(permission.key, checked === true)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{permission.label}</p>
                          <p className="text-xs text-slate-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="firm-setup-governance" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Governance defaults
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Set policy ownership and review</h3>
                <p className="mt-1 text-sm text-slate-500">
                  These defaults prefill every policy. You can quick-edit them per policy later.
                </p>
              </div>
              {missingGovernance.length ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {missingGovernance.length} required
                </span>
              ) : (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Complete
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
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Setup summary</p>
            <h3 className="mt-2 text-lg font-semibold text-indigo-900">
              {draftRequiredPolicies.length} required policies
            </h3>
            <p className="mt-2 text-sm text-indigo-700">
              Based on your permissions, these policies will be generated after onboarding.
            </p>
            {policyProfileError ? <p className="mt-3 text-xs text-rose-600">{policyProfileError}</p> : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Next step</p>
            <p className="mt-2 text-sm text-slate-600">Save your firm setup to unlock policy generation.</p>
            <Button
              type="submit"
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSavingSetup || !firmProfile.name.trim() || missingGovernance.length > 0}
            >
              {isSavingSetup ? "Saving..." : "Save and continue"}
            </Button>
          </section>
        </aside>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
