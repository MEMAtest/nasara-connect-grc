"use client";

import { ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { WizardStepProps } from "./types";

export function StepApprovals({ state, updateState, onNext, onBack }: WizardStepProps) {
  const approvals = state.approvals;

  const handleToggle = (key: keyof typeof approvals) => {
    updateState((current) => ({
      ...current,
      approvals: {
        ...current.approvals,
        [key]: typeof current.approvals[key] === "boolean" ? !current.approvals[key] : current.approvals[key],
      },
    }));
  };

  const handleAdditionalApproversChange = (value: string) => {
    const items = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    updateState((current) => ({
      ...current,
      approvals: {
        ...current.approvals,
        additionalApprovers: items,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Configure approvals & attestations</h2>
        <p className="text-sm text-slate-500">
          Specify who signs off this policy and how often it returns for review. This workflow will drive reminders and
          attestations once published.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <p className="text-sm font-semibold text-slate-900">Senior Management approval</p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Checkbox
                checked={approvals.requiresSMF}
                onCheckedChange={() => handleToggle("requiresSMF")}
              />
              <span className="text-sm text-slate-700">SMF attestation required</span>
            </label>
            {approvals.requiresSMF ? (
              <Input
                placeholder="e.g. SMF16 Compliance Monitoring"
                value={approvals.smfRole ?? ""}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    approvals: { ...current.approvals, smfRole: event.target.value },
                  }))
                }
              />
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <p className="text-sm font-semibold text-slate-900">Board review cadence</p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Checkbox
                checked={approvals.requiresBoard}
                onCheckedChange={() => handleToggle("requiresBoard")}
              />
              <span className="text-sm text-slate-700">Board or committee sign-off</span>
            </label>
            {approvals.requiresBoard ? (
              <Select
                value={approvals.boardFrequency}
                onValueChange={(value) =>
                  updateState((current) => ({
                    ...current,
                    approvals: { ...current.approvals, boardFrequency: value as typeof approvals.boardFrequency },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annual">Semi-annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-slate-900">Additional approvers</p>
        <p className="text-xs text-slate-500">Comma-separated list (e.g. Head of Legal, Head of Operations).</p>
        <Input
          placeholder="Jane Doe, Head of Legal"
          value={approvals.additionalApprovers.join(", ")}
          onChange={(event) => handleAdditionalApproversChange(event.target.value)}
        />
        {approvals.additionalApprovers.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {approvals.additionalApprovers.map((approver) => (
              <Badge key={approver} variant="outline" className="border-slate-200 text-slate-600">
                {approver}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
