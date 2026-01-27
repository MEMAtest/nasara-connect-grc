"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DISTRIBUTION_PRESETS, REVIEW_CADENCE_OPTIONS } from "./constants";
import type { GovernanceState } from "./types";

type GovernanceFormProps = {
  governance: GovernanceState;
  onFieldChange: (key: keyof GovernanceState, value: string) => void;
  onAddDistribution: (value: string) => void;
  onRemoveDistribution: (value: string) => void;
};

export function GovernanceForm({
  governance,
  onFieldChange,
  onAddDistribution,
  onRemoveDistribution,
}: GovernanceFormProps) {
  const [distributionInput, setDistributionInput] = useState("");
  const [distributionPreset, setDistributionPreset] = useState("");

  const addDistribution = (value: string) => {
    if (!value.trim()) return;
    onAddDistribution(value);
  };

  const handleDistributionPreset = (value: string) => {
    addDistribution(value);
    setDistributionPreset("");
  };

  return (
    <>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Policy owner *</Label>
          <Input
            value={governance.owner}
            onChange={(event) => onFieldChange("owner", event.target.value)}
            placeholder="e.g. MLRO"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Version *</Label>
          <Input
            value={governance.version}
            onChange={(event) => onFieldChange("version", event.target.value)}
            placeholder="e.g. V1.0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Effective date *</Label>
          <Input
            type="date"
            value={governance.effectiveDate}
            onChange={(event) => onFieldChange("effectiveDate", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Review cadence</Label>
          <Select value={governance.reviewCadence} onValueChange={(value) => onFieldChange("reviewCadence", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cadence" />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_CADENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">Sets the next review date automatically.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Next review date {governance.reviewCadence === "one-off" ? "" : "*"}
          </Label>
          <Input
            type="date"
            value={governance.nextReviewAt}
            onChange={(event) => onFieldChange("nextReviewAt", event.target.value)}
            disabled={governance.reviewCadence === "one-off"}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Scope statement *</Label>
          <Textarea
            value={governance.scopeStatement}
            onChange={(event) => onFieldChange("scopeStatement", event.target.value)}
            placeholder="e.g. Covers payment services, client money, and SME onboarding across UK/EU corridors."
            className="h-24"
          />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Optional</p>
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Distribution list</Label>
            <div className="space-y-2">
              <Select value={distributionPreset} onValueChange={handleDistributionPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a team or role" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTION_PRESETS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={distributionInput}
                  onChange={(event) => setDistributionInput(event.target.value)}
                  placeholder="Add a person or team"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (!distributionInput.trim()) return;
                      addDistribution(distributionInput);
                      setDistributionInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!distributionInput.trim()) return;
                    addDistribution(distributionInput);
                    setDistributionInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {governance.distributionList.length ? (
                <div className="flex flex-wrap gap-2">
                  {governance.distributionList.map((entry) => (
                    <span
                      key={entry}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {entry}
                      <button
                        type="button"
                        onClick={() => onRemoveDistribution(entry)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No distribution list added yet.</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Linked procedures</Label>
            <Textarea
              value={governance.linkedProcedures}
              onChange={(event) => onFieldChange("linkedProcedures", event.target.value)}
              placeholder="e.g. Complaints SOP, FOS escalation, SAR reporting workflow"
              className="h-20"
            />
          </div>
        </div>
      </div>
    </>
  );
}
