"use client";

import { useMemo } from "react";
import { Check, Lock, Star, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FirmType, FIRM_TYPES, REGISTER_CATEGORIES, RegisterCategory } from "@/lib/types/register-hub";
import { getRecommendationsForFirmType } from "@/lib/register-hub/recommendations";
import { REGISTER_DEFINITIONS } from "@/lib/register-hub/definitions";

interface ConfirmationStepProps {
  firmType: FirmType;
  selectedRegisters: string[];
}

export function ConfirmationStep({ firmType, selectedRegisters }: ConfirmationStepProps) {
  const recommendations = useMemo(
    () => getRecommendationsForFirmType(firmType),
    [firmType]
  );

  const firmInfo = FIRM_TYPES[firmType];

  const selectedRegisterDetails = useMemo(() => {
    return REGISTER_DEFINITIONS.filter((r) => selectedRegisters.includes(r.code));
  }, [selectedRegisters]);

  const registersByCategory = useMemo(() => {
    const categories: Record<RegisterCategory, typeof selectedRegisterDetails> = {
      aml: [],
      conduct: [],
      governance: [],
      market_abuse: [],
      operational: [],
    };

    selectedRegisterDetails.forEach((reg) => {
      categories[reg.category].push(reg);
    });

    return categories;
  }, [selectedRegisterDetails]);

  const getRecommendationLevel = (code: string) => {
    if (recommendations.mandatory.includes(code)) return "mandatory";
    if (recommendations.recommended.includes(code)) return "recommended";
    return "optional";
  };

  const mandatoryCount = selectedRegisters.filter((r) =>
    recommendations.mandatory.includes(r)
  ).length;
  const recommendedCount = selectedRegisters.filter((r) =>
    recommendations.recommended.includes(r)
  ).length;
  const optionalCount = selectedRegisters.length - mandatoryCount - recommendedCount;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">Confirm Your Selection</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review your registers before completing setup
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100">
            <Building2 className="h-7 w-7 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Your Firm Type</p>
            <h3 className="text-lg font-semibold text-slate-900">{firmInfo.label}</h3>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Lock className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-slate-900">{mandatoryCount}</span>
            </div>
            <p className="text-xs text-slate-500">Mandatory</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-slate-900">{recommendedCount}</span>
            </div>
            <p className="text-xs text-slate-500">Recommended</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Check className="h-4 w-4 text-teal-500" />
              <span className="text-2xl font-bold text-slate-900">{optionalCount}</span>
            </div>
            <p className="text-xs text-slate-500">Optional</p>
          </div>
        </div>
      </div>

      {/* Register List by Category */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-700">
          Selected Registers ({selectedRegisters.length})
        </h3>

        <div className="space-y-4">
          {(Object.keys(registersByCategory) as RegisterCategory[]).map((category) => {
            const registers = registersByCategory[category];
            if (registers.length === 0) return null;

            const categoryInfo = REGISTER_CATEGORIES[category];

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    {categoryInfo.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {registers.length}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {registers.map((register) => {
                    const level = getRecommendationLevel(register.code);
                    const isMandatory = level === "mandatory";
                    const isRecommended = level === "recommended";

                    return (
                      <div
                        key={register.code}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2",
                          isMandatory
                            ? "border-red-200 bg-red-50"
                            : isRecommended
                              ? "border-amber-200 bg-amber-50"
                              : "border-teal-200 bg-teal-50"
                        )}
                      >
                        {isMandatory ? (
                          <Lock className="h-3.5 w-3.5 text-red-500" />
                        ) : isRecommended ? (
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-teal-500" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isMandatory
                              ? "text-red-700"
                              : isRecommended
                                ? "text-amber-700"
                                : "text-teal-700"
                          )}
                        >
                          {register.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg bg-teal-50 p-4">
        <p className="text-sm text-teal-800">
          <strong>What happens next?</strong> After completing setup, you&apos;ll be taken to
          your personalized Register Hub where you can start using your selected registers.
          You can always add or remove registers later from the hub.
        </p>
      </div>
    </div>
  );
}
