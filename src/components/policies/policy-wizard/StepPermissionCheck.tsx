"use client";

import { useMemo } from "react";
import { AlertCircle, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddressAutocomplete } from "@/components/inputs/AddressAutocomplete";
import type { WizardStepProps } from "./types";
import { DEFAULT_PERMISSIONS, getRequiredPolicies } from "@/lib/policies";

const CORE_PERMISSIONS: Array<{ key: keyof typeof DEFAULT_PERMISSIONS; label: string }> = [
  { key: "investmentServices", label: "Investment Services" },
  { key: "paymentServices", label: "Payment Services" },
  { key: "eMoney", label: "E-Money" },
  { key: "clientMoney", label: "Client Money (CASS)" },
  { key: "clientAssets", label: "Client Assets" },
  { key: "creditBroking", label: "Credit Broking" },
  { key: "insuranceMediation", label: "Insurance Mediation" },
  { key: "mortgageMediation", label: "Mortgage Mediation" },
];

const CLIENT_FLAGS: Array<{ key: keyof typeof DEFAULT_PERMISSIONS; label: string }> = [
  { key: "retailClients", label: "Serves Retail Clients" },
  { key: "professionalClients", label: "Serves Professional Clients" },
  { key: "eligibleCounterparties", label: "Eligible Counterparties" },
  { key: "complexProducts", label: "Complex Products" },
];

export function StepPermissionCheck({ state, updateState, onNext, onBack }: WizardStepProps) {
  const requiredPolicies = useMemo(() => getRequiredPolicies(state.permissions), [state.permissions]);

  const handleToggle = (key: keyof typeof DEFAULT_PERMISSIONS) => {
    updateState((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [key]: !current.permissions[key],
      },
    }));
  };

  const handleFirmProfileChange = (field: keyof typeof state.firmProfile, value: string) => {
    updateState((current) => ({
      ...current,
      firmProfile: {
        ...current.firmProfile,
        [field]: value,
      },
    }));
  };

  const canContinue = Boolean(state.firmProfile.name.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Confirm your firm permissions</h2>
        <p className="text-sm text-slate-500">
          We tailor the policy pack based on your regulatory permissions. Update the checkboxes below to match your FCA
          profile. You can refine this later in the permission settings area.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">Firm profile</p>
        <p className="mt-1 text-xs text-slate-500">Used to prefill variables across clauses and document headers.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firm-name">Firm name *</Label>
            <Input
              id="firm-name"
              value={state.firmProfile.name}
              onChange={(event) => handleFirmProfileChange("name", event.target.value)}
              placeholder="e.g. Nasara Payments Ltd"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firm-trading-name">Trading name</Label>
            <Input
              id="firm-trading-name"
              value={state.firmProfile.tradingName ?? ""}
              onChange={(event) => handleFirmProfileChange("tradingName", event.target.value)}
              placeholder="e.g. Nasara Connect"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firm-fca-ref">FCA reference</Label>
            <Input
              id="firm-fca-ref"
              value={state.firmProfile.fcaReference ?? ""}
              onChange={(event) => handleFirmProfileChange("fcaReference", event.target.value)}
              placeholder="e.g. 123456"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firm-website">Website</Label>
            <Input
              id="firm-website"
              value={state.firmProfile.website ?? ""}
              onChange={(event) => handleFirmProfileChange("website", event.target.value)}
              placeholder="e.g. https://example.com"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="firm-address">Registered address</Label>
            <AddressAutocomplete
              value={state.firmProfile.registeredAddress ?? ""}
              onChange={(value) => handleFirmProfileChange("registeredAddress", value)}
              placeholder="Street, City, Postcode"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PermissionPanel title="Core activities" icon={Check}>
          <div className="space-y-2">
            {CORE_PERMISSIONS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Checkbox checked={state.permissions[key]} onCheckedChange={() => handleToggle(key)} />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </PermissionPanel>

        <PermissionPanel title="Client & product profile" icon={Info}>
          <div className="space-y-2">
            {CLIENT_FLAGS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Checkbox checked={state.permissions[key]} onCheckedChange={() => handleToggle(key)} />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </PermissionPanel>
      </div>

      <Alert className="border-indigo-200 bg-indigo-50 text-indigo-700">
        <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="h-4 w-4" /> Policy requirements updated
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm">
          {requiredPolicies.length} policies required · {requiredPolicies.filter((policy) => policy.mandatory).length} mandatory
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled>
          Back
        </Button>
        <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700" disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

interface PermissionPanelProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}

function PermissionPanel({ title, icon: Icon, children }: PermissionPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
      </div>
      {children}
    </div>
  );
}
