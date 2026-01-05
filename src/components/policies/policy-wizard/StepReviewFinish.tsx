"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Shield,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { POLICY_TEMPLATE_CLAUSES } from "@/lib/policies/templates";
import { applyTiering, estimatePageCount, DETAIL_LEVEL_INFO, type DetailLevel } from "@/lib/policies/clause-tiers";
import type { WizardStepProps } from "./types";

const SMF_ROLES = [
  { value: "SMF1", label: "SMF1 - Chief Executive" },
  { value: "SMF3", label: "SMF3 - Executive Director" },
  { value: "SMF16", label: "SMF16 - Compliance Oversight" },
  { value: "SMF17", label: "SMF17 - Money Laundering Reporting Officer" },
  { value: "SMF24", label: "SMF24 - Chief Operations" },
];

const BOARD_FREQUENCIES = [
  { value: "annual", label: "Annual" },
  { value: "semi-annual", label: "Semi-Annual" },
  { value: "quarterly", label: "Quarterly" },
];

export function StepReviewFinish({
  state,
  updateState,
  onNext,
  onBack,
  isSubmitting,
}: WizardStepProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const detailLevel: DetailLevel = state.detailLevel || "standard";

  // Calculate preview data
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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleApprovalChange = (key: string, value: unknown) => {
    updateState((s) => ({
      ...s,
      approvals: {
        ...s.approvals,
        [key]: value,
      },
    }));
  };

  // Count selected permissions
  const permissionCount = Object.values(state.permissions).filter(Boolean).length;

  if (!state.selectedTemplate) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <p className="mt-2 font-medium text-amber-900">No template selected</p>
        <p className="text-sm text-amber-700">Please go back and select a policy template</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
              <FileText className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {state.selectedTemplate.name}
              </h2>
              <p className="text-sm text-slate-500">
                {state.firmProfile.name || "Your Firm"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {DETAIL_LEVEL_INFO[detailLevel].label}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  ~{previewData?.pageEstimate || 0} pages
                </span>
                <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                  {previewData?.sections.length || 0} sections
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Exports become available after the policy is created.
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Document Structure */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <FileText className="h-5 w-5 text-slate-400" />
            Document Structure
          </h3>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            {/* Cover & Control */}
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-slate-700">Cover Page</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-slate-700">Document Control</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-slate-700">Table of Contents</span>
            </div>

            {/* Sections */}
            {previewData?.sections.map((section, idx) => (
              <div key={section.id} className="border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-xs font-bold text-indigo-700">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-900">{section.title}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        section.sectionType === "procedure"
                          ? "bg-blue-100 text-blue-700"
                          : section.sectionType === "appendix"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {section.sectionType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      {section.clauses.length} clause{section.clauses.length !== 1 ? "s" : ""}
                    </span>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {expandedSections.has(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-9 space-y-1 pb-2"
                  >
                    {section.clauses.map((clause) => (
                      <div
                        key={clause.id}
                        className="flex items-center gap-2 rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <span className="truncate">{clause.title}</span>
                        {clause.isMandatory && (
                          <span className="rounded bg-red-100 px-1 text-xs text-red-600">
                            Required
                          </span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Settings & Summary */}
        <div className="space-y-6">
          {/* Firm Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="h-4 w-4 text-slate-400" />
              Firm Details
            </h4>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">
                  {state.firmProfile.name || "—"}
                </span>
              </div>
              {state.firmProfile.fcaReference && (
                <div className="flex justify-between">
                  <span className="text-slate-500">FCA Ref</span>
                  <span className="font-medium text-slate-900">
                    {state.firmProfile.fcaReference}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Permissions</span>
                <span className="font-medium text-slate-900">{permissionCount} selected</span>
              </div>
            </div>
          </div>

          {/* Approval Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Shield className="h-4 w-4 text-slate-400" />
              Approval Settings
            </h4>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="requiresSMF"
                  checked={state.approvals.requiresSMF}
                  onCheckedChange={(checked) =>
                    handleApprovalChange("requiresSMF", checked === true)
                  }
                />
                <Label htmlFor="requiresSMF" className="text-sm">
                  Requires SMF sign-off
                </Label>
              </div>

              {state.approvals.requiresSMF && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">SMF Role</Label>
                  <Select
                    value={state.approvals.smfRole || "SMF16"}
                    onValueChange={(value) => handleApprovalChange("smfRole", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select SMF role" />
                    </SelectTrigger>
                    <SelectContent>
                      {SMF_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Checkbox
                  id="requiresBoard"
                  checked={state.approvals.requiresBoard}
                  onCheckedChange={(checked) =>
                    handleApprovalChange("requiresBoard", checked === true)
                  }
                />
                <Label htmlFor="requiresBoard" className="text-sm">
                  Board review required
                </Label>
              </div>

              {state.approvals.requiresBoard && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Review Frequency</Label>
                  <Select
                    value={state.approvals.boardFrequency}
                    onValueChange={(value) =>
                      handleApprovalChange("boardFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARD_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Ready indicator */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-900">Ready to generate</span>
            </div>
            <p className="mt-1 text-sm text-emerald-700">
              Your policy document is configured and ready to be created.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={onNext}
            disabled={isSubmitting}
            className="min-w-[160px] gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Policy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
