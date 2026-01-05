"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Shield, CreditCard, Users, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressAutocomplete } from "@/components/inputs/AddressAutocomplete";
import { CompaniesHouseLookup } from "@/components/inputs/CompaniesHouseLookup";
import type { WizardStepProps } from "./types";

const PERMISSION_GROUPS = [
  {
    id: "core",
    title: "Core Activities",
    icon: Building2,
    permissions: [
      { key: "investmentServices", label: "Investment Services", description: "Advising, arranging, managing investments" },
      { key: "paymentServices", label: "Payment Services", description: "Payment initiation, account information" },
      { key: "eMoney", label: "E-Money Issuance", description: "Electronic money institution services" },
      { key: "creditBroking", label: "Credit Broking", description: "Consumer credit intermediation" },
    ],
  },
  {
    id: "assets",
    title: "Client Assets",
    icon: Shield,
    permissions: [
      { key: "clientMoney", label: "Client Money", description: "Hold or control client money (CASS 7)" },
      { key: "clientAssets", label: "Client Assets", description: "Safeguard and administer (CASS 6)" },
      { key: "safeguarding", label: "Safeguarding", description: "Safeguard relevant funds (PSR/EMR)" },
    ],
  },
  {
    id: "mediation",
    title: "Mediation",
    icon: CreditCard,
    permissions: [
      { key: "insuranceMediation", label: "Insurance Mediation", description: "Insurance distribution activities" },
      { key: "mortgageMediation", label: "Mortgage Mediation", description: "Home finance activities" },
    ],
  },
  {
    id: "clients",
    title: "Client Types",
    icon: Users,
    permissions: [
      { key: "retailClients", label: "Retail Clients", description: "Consumer Duty applies" },
      { key: "professionalClients", label: "Professional Clients", description: "Per se or elective professionals" },
      { key: "eligibleCounterparties", label: "Eligible Counterparties", description: "Large institutions" },
      { key: "complexProducts", label: "Complex Products", description: "PRIIPs, derivatives, structured" },
    ],
  },
];

export function StepSetup({ state, updateState, onNext }: WizardStepProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["core"]));

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handlePermissionChange = (key: string, checked: boolean) => {
    updateState((s) => ({
      ...s,
      permissions: {
        ...s.permissions,
        [key]: checked,
      },
    }));
  };

  const handleFirmProfileChange = (key: string, value: string) => {
    updateState((s) => ({
      ...s,
      firmProfile: {
        ...s.firmProfile,
        [key]: value,
      },
    }));
  };

  const handleSicCodesChange = (value: string) => {
    updateState((s) => ({
      ...s,
      firmProfile: {
        ...s.firmProfile,
        sicCodes: value
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      },
    }));
  };

  const selectedPermissionCount = Object.values(state.permissions).filter(Boolean).length;
  const canContinue = state.firmProfile.name.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Firm Details */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Firm Details</h2>
            <p className="text-sm text-slate-500">Basic information about your firm</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Companies House lookup</p>
          <p className="mt-1 text-xs text-slate-500">
            Search the UK register to prefill legal name, company number, SIC, and address.
          </p>
          <div className="mt-3">
            <CompaniesHouseLookup
              onSelect={(company) => {
                updateState((s) => ({
                  ...s,
                  firmProfile: {
                    ...s.firmProfile,
                    name: company.legalName,
                    companyNumber: company.companyNumber,
                    sicCodes: company.sicCodes,
                    registeredAddress: company.registeredAddress,
                  },
                }));
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firmName">
              Firm Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firmName"
              value={state.firmProfile.name}
              onChange={(e) => handleFirmProfileChange("name", e.target.value)}
              placeholder="Acme Financial Services Ltd"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradingName">Trading Name</Label>
            <Input
              id="tradingName"
              value={state.firmProfile.tradingName || ""}
              onChange={(e) => handleFirmProfileChange("tradingName", e.target.value)}
              placeholder="Acme Payments"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fcaReference">FCA Reference Number</Label>
            <Input
              id="fcaReference"
              value={state.firmProfile.fcaReference || ""}
              onChange={(e) => handleFirmProfileChange("fcaReference", e.target.value)}
              placeholder="123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyNumber">Company Number</Label>
            <Input
              id="companyNumber"
              value={state.firmProfile.companyNumber || ""}
              onChange={(e) => handleFirmProfileChange("companyNumber", e.target.value)}
              placeholder="12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={state.firmProfile.website || ""}
              onChange={(e) => handleFirmProfileChange("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sicCodes">SIC Codes</Label>
            <Input
              id="sicCodes"
              value={(state.firmProfile.sicCodes || []).join(", ")}
              onChange={(e) => handleSicCodesChange(e.target.value)}
              placeholder="64999, 66190"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="registeredAddress">Registered Address</Label>
            <AddressAutocomplete
              value={state.firmProfile.registeredAddress || ""}
              onChange={(value) => handleFirmProfileChange("registeredAddress", value)}
              placeholder="Street, City, Postcode"
              countryCodes={["gb"]}
            />
          </div>
        </div>
      </section>

      {/* Permissions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
              <Shield className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">FCA Permissions</h2>
              <p className="text-sm text-slate-500">Select your regulated activities</p>
            </div>
          </div>

          {selectedPermissionCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
              <CheckCircle2 className="h-4 w-4" />
              {selectedPermissionCount} selected
            </div>
          )}
        </div>

        <div className="space-y-3">
          {PERMISSION_GROUPS.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.has(group.id);
            const selectedInGroup = group.permissions.filter(
              (p) => state.permissions[p.key as keyof typeof state.permissions]
            ).length;

            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-900">{group.title}</span>
                    {selectedInGroup > 0 && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {selectedInGroup}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="space-y-3">
                      {group.permissions.map((permission) => (
                        <label
                          key={permission.key}
                          className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-white"
                        >
                          <Checkbox
                            checked={state.permissions[permission.key as keyof typeof state.permissions] ?? false}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(permission.key, checked === true)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{permission.label}</div>
                            <div className="text-sm text-slate-500">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="min-w-[140px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
