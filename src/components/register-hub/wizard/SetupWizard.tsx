"use client";

import { useState } from "react";
import { Sparkles, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FirmType } from "@/lib/types/register-hub";
import { FirmTypeStep } from "./FirmTypeStep";
import { RegisterSelectionStep } from "./RegisterSelectionStep";
import { ConfirmationStep } from "./ConfirmationStep";

export type WizardStep = "firm-type" | "registers" | "confirm";

const STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: "firm-type", label: "Firm Type", description: "Select your firm type" },
  { id: "registers", label: "Registers", description: "Choose your registers" },
  { id: "confirm", label: "Confirm", description: "Review and confirm" },
];

interface SetupWizardProps {
  onComplete: (firmType: FirmType, selectedRegisters: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function SetupWizard({ onComplete, isLoading = false }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("firm-type");
  const [selectedFirmType, setSelectedFirmType] = useState<FirmType | null>(null);
  const [selectedRegisters, setSelectedRegisters] = useState<Set<string>>(new Set());

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const canGoNext = () => {
    switch (currentStep) {
      case "firm-type":
        return selectedFirmType !== null;
      case "registers":
        return selectedRegisters.size > 0;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStep === "firm-type" && selectedFirmType) {
      setCurrentStep("registers");
    } else if (currentStep === "registers") {
      setCurrentStep("confirm");
    }
  };

  const goBack = () => {
    if (currentStep === "registers") {
      setCurrentStep("firm-type");
    } else if (currentStep === "confirm") {
      setCurrentStep("registers");
    }
  };

  const handleComplete = async () => {
    if (selectedFirmType && selectedRegisters.size > 0) {
      await onComplete(selectedFirmType, Array.from(selectedRegisters));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome to Register Hub</h1>
        <p className="mt-2 text-lg text-slate-500">
          Let&apos;s set up your compliance registers based on your firm type
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted
                      ? "border-teal-500 bg-teal-500 text-white"
                      : isCurrent
                        ? "border-teal-500 bg-white text-teal-500"
                        : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCurrent ? "text-teal-600" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-0.5 w-12 sm:w-20",
                    index < currentStepIndex ? "bg-teal-500" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          {currentStep === "firm-type" && (
            <FirmTypeStep
              selectedFirmType={selectedFirmType}
              onSelect={(firmType) => {
                setSelectedFirmType(firmType);
                // Reset register selection when firm type changes
                setSelectedRegisters(new Set());
              }}
            />
          )}

          {currentStep === "registers" && selectedFirmType && (
            <RegisterSelectionStep
              firmType={selectedFirmType}
              selectedRegisters={selectedRegisters}
              onSelectionChange={setSelectedRegisters}
            />
          )}

          {currentStep === "confirm" && selectedFirmType && (
            <ConfirmationStep
              firmType={selectedFirmType}
              selectedRegisters={Array.from(selectedRegisters)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === "firm-type"}
          className={currentStep === "firm-type" ? "invisible" : ""}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep === "confirm" ? (
          <Button
            onClick={handleComplete}
            disabled={!canGoNext() || isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canGoNext()}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
