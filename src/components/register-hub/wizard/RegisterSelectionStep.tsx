"use client";

import { useMemo, useEffect, useRef } from "react";
import { Check, Lock, Star, Circle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FirmType, FIRM_TYPES, REGISTER_CATEGORIES, RegisterCategory } from "@/lib/types/register-hub";
import { getRecommendationsForFirmType } from "@/lib/register-hub/recommendations";
import { REGISTER_DEFINITIONS } from "@/lib/register-hub/definitions";

interface RegisterSelectionStepProps {
  firmType: FirmType;
  selectedRegisters: Set<string>;
  onSelectionChange: (registers: Set<string>) => void;
}

export function RegisterSelectionStep({
  firmType,
  selectedRegisters,
  onSelectionChange,
}: RegisterSelectionStepProps) {
  const recommendations = useMemo(
    () => getRecommendationsForFirmType(firmType),
    [firmType]
  );

  const registersByCategory = useMemo(() => {
    const categories: Record<RegisterCategory, typeof REGISTER_DEFINITIONS> = {
      aml: [],
      conduct: [],
      governance: [],
      market_abuse: [],
      operational: [],
    };

    REGISTER_DEFINITIONS.forEach((reg) => {
      if (reg.isImplemented) {
        categories[reg.category].push(reg);
      }
    });

    return categories;
  }, []);

  const getRecommendationLevel = (code: string) => {
    if (recommendations.mandatory.includes(code)) return "mandatory";
    if (recommendations.recommended.includes(code)) return "recommended";
    return "optional";
  };

  const toggleRegister = (code: string) => {
    const level = getRecommendationLevel(code);
    // Mandatory registers cannot be deselected
    if (level === "mandatory") return;

    const newSet = new Set(selectedRegisters);
    if (newSet.has(code)) {
      newSet.delete(code);
    } else {
      newSet.add(code);
    }
    onSelectionChange(newSet);
  };

  // Auto-select mandatory registers on mount
  // Using a ref to track if we've already initialized to avoid repeated updates
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only auto-select if we haven't initialized yet and no registers are selected
    if (!hasInitializedRef.current && selectedRegisters.size === 0 && recommendations.mandatory.length > 0) {
      hasInitializedRef.current = true;
      const mandatorySet = new Set(recommendations.mandatory);
      onSelectionChange(mandatorySet);
    }
  }, [recommendations.mandatory, selectedRegisters.size, onSelectionChange]);

  const firmInfo = FIRM_TYPES[firmType];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">Select Your Registers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Based on your firm type ({firmInfo.label}), we&apos;ve pre-selected mandatory registers
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-xs">
          <Lock className="h-4 w-4 text-red-500" />
          <span className="text-slate-600">Mandatory (auto-selected)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="text-slate-600">Recommended</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Circle className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">Optional</span>
        </div>
      </div>

      {/* Registers by Category */}
      <div className="space-y-6">
        {(Object.keys(registersByCategory) as RegisterCategory[]).map((category) => {
          const registers = registersByCategory[category];
          if (registers.length === 0) return null;

          const categoryInfo = REGISTER_CATEGORIES[category];
          const hasMandatory = registers.some(
            (r) => getRecommendationLevel(r.code) === "mandatory"
          );
          const hasRecommended = registers.some(
            (r) => getRecommendationLevel(r.code) === "recommended"
          );

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{categoryInfo.label}</h3>
                {hasMandatory && (
                  <Badge variant="destructive" className="text-xs">
                    Has Mandatory
                  </Badge>
                )}
                {!hasMandatory && hasRecommended && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                    Has Recommended
                  </Badge>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {registers.map((register) => {
                  const level = getRecommendationLevel(register.code);
                  const isSelected = selectedRegisters.has(register.code);
                  const isMandatory = level === "mandatory";

                  return (
                    <button
                      key={register.code}
                      onClick={() => toggleRegister(register.code)}
                      disabled={isMandatory}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                        isMandatory
                          ? "cursor-not-allowed border-red-200 bg-red-50"
                          : isSelected
                            ? "border-teal-300 bg-teal-50 ring-1 ring-teal-400"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border",
                          isMandatory
                            ? "border-red-300 bg-red-100"
                            : isSelected
                              ? "border-teal-400 bg-teal-500"
                              : "border-slate-300 bg-white"
                        )}
                      >
                        {isMandatory ? (
                          <Lock className="h-3 w-3 text-red-500" />
                        ) : isSelected ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium truncate",
                              isMandatory
                                ? "text-red-700"
                                : isSelected
                                  ? "text-teal-700"
                                  : "text-slate-700"
                            )}
                          >
                            {register.name}
                          </span>
                          {level === "recommended" && !isSelected && (
                            <Star className="h-3 w-3 flex-shrink-0 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {register.shortDescription}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {selectedRegisters.size} registers selected
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {recommendations.mandatory.length} mandatory + {" "}
            {selectedRegisters.size - recommendations.mandatory.length} additional
          </div>
        </div>
      </div>
    </div>
  );
}
