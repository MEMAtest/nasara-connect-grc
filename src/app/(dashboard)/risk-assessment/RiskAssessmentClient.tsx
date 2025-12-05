"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RiskHeatMap, type HeatMapView } from "./components/RiskHeatMap";
import { RiskRegister } from "./components/RiskRegister";
import { RiskForm } from "./components/RiskForm";
import { RiskMetrics } from "./components/RiskMetrics";
import { KRIManager } from "./components/KRIManager";
import { RiskReporting } from "./components/RiskReporting";
import { RiskControlCoverage } from "./components/RiskControlCoverage";
import { RiskDetails } from "./components/RiskDetails";
import { useRiskData } from "./hooks/useRiskData";
import { useRiskCalculations } from "./hooks/useRiskCalculations";
import {
  RISK_CATEGORIES,
  type RiskFiltersState,
  type RiskKeyRiskIndicator,
  type RiskRecord,
} from "./lib/riskConstants";
import type { RiskFormValues } from "./lib/riskValidation";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { useAssistantContext } from "@/components/dashboard/useAssistantContext";

const ORGANIZATION_ID = DEFAULT_ORGANIZATION_ID;

function toFormValues(risk: RiskRecord): RiskFormValues {
  return {
    title: risk.title,
    description: risk.description,
    category: risk.category,
    subCategory: risk.subCategory ?? "",
    likelihood: risk.likelihood,
    impact: risk.impact,
    residualLikelihood: risk.residualLikelihood ?? risk.likelihood,
    residualImpact: risk.residualImpact ?? risk.impact,
    velocity: risk.velocity,
    businessUnit: risk.businessUnit ?? "",
    process: risk.process ?? "",
    riskOwner: risk.riskOwner,
    regulatoryCategory: risk.regulatoryCategory ?? [],
    reportableToFCA: risk.reportableToFCA ?? false,
    consumerDutyRelevant: risk.consumerDutyRelevant ?? false,
    keyRiskIndicators: risk.keyRiskIndicators ?? [],
    reviewFrequency: risk.reviewFrequency,
  };
}

export function RiskAssessmentClient() {
  const {
    risks,
    filteredRisks,
    filters,
    setFilters,
    isLoading,
    error,
    refresh,
  } = useRiskData({ organizationId: ORGANIZATION_ID });

  const metrics = useRiskCalculations(risks);
  const [heatMapView, setHeatMapView] = useState<HeatMapView>("inherent");
  const [selectedRisk, setSelectedRisk] = useState<RiskRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState<string | null>(null);
  const { setContext } = useAssistantContext();

  const categories = useMemo(
    () => (risks.length ? Array.from(new Set(risks.map((risk) => risk.category))) : Array.from(RISK_CATEGORIES)),
    [risks],
  );

  const handleRiskSubmit = async (values: RiskFormValues) => {
    setIsSubmitting(true);
    try {
      const endpoint = editingRisk
        ? `/api/organizations/${ORGANIZATION_ID}/risks/${encodeURIComponent(editingRisk.id)}`
        : `/api/organizations/${ORGANIZATION_ID}/risks`;
      const method = editingRisk ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Failed to save risk");
      }
      await refresh();
      setEditingRisk(null);
    } catch (err) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('risk-save-failed', err);
      } else {
        console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewRisk = (risk: RiskRecord) => {
    setSelectedRisk(risk);
    setContext({ path: "/risk-assessment", cmpId: risk.id });
    setIsDetailsOpen(true);
  };

  const handleEditRisk = (risk: RiskRecord) => {
    setEditingRisk(risk);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggestMitigation = async (risk: RiskRecord) => {
    setSuggestionStatus("Generating mitigation guidance...");
    try {
      const response = await fetch("/api/ai/risk-mitigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ risk }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate AI suggestions");
      }
      const data = await response.json();
      // In production, replace with proper notification system
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper notification/display system
        // showMitigationGuidance(data);
        setSuggestionStatus("AI mitigation guidance generated");
      } else {
        console.info("AI mitigation guidance", data);
        setSuggestionStatus("AI mitigation guidance ready in console");
      }
    } catch (err) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('ai-mitigation-failed', err);
      } else {
        console.error(err);
      }
      setSuggestionStatus("Unable to generate AI suggestions right now");
    }
    setTimeout(() => setSuggestionStatus(null), 4000);
  };

  const handleKriUpdate = async (riskId: string, kris: RiskKeyRiskIndicator[]) => {
    try {
      const response = await fetch(`/api/organizations/${ORGANIZATION_ID}/risks/${encodeURIComponent(riskId)}/kris`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kris),
      });
      if (!response.ok) {
        throw new Error("Failed to update KRIs");
      }
      const updated = (await response.json()) as RiskRecord;
      await refresh();
      setSelectedRisk(updated);
    } catch (err) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('kri-update-failed', err, { riskId });
      } else {
        console.error(err);
      }
    }
  };

  const handleExport = () => {
    const payload = JSON.stringify(filteredRisks, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "risk-register-export.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCreateRisk = () => {
    setEditingRisk(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onFiltersChange = (next: RiskFiltersState) => {
    setFilters(next);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">Risk Assessment</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Governance-grade risk management workspace</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Visualise inherent vs residual exposures, prioritise risks, and collaborate on mitigation plans with regulatory context.
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" size="lg" onClick={handleCreateRisk}>
          Add New Risk
        </Button>
      </header>

      {suggestionStatus ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {suggestionStatus}
        </div>
      ) : null}

      <RiskMetrics summary={metrics} />

      {isLoading ? (
        <div className="h-64 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80" />
      ) : (
        <RiskHeatMap risks={filteredRisks} view={heatMapView} onViewChange={setHeatMapView} />
      )}

      <RiskRegister
        risks={risks}
        filteredRisks={filteredRisks}
        filters={filters}
        onFiltersChange={onFiltersChange}
        isLoading={isLoading}
        error={error}
        categories={categories}
        onCreateRisk={handleCreateRisk}
        onExport={handleExport}
        onViewRisk={handleViewRisk}
        onEditRisk={handleEditRisk}
        onSuggestMitigation={handleSuggestMitigation}
      />

      <Separator />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <RiskForm
            mode={editingRisk ? "edit" : "create"}
            submitLabel={editingRisk ? "Update Risk" : "Save Risk"}
            defaultValues={editingRisk ? toFormValues(editingRisk) : undefined}
            onSubmit={handleRiskSubmit}
            onCancel={editingRisk ? () => setEditingRisk(null) : undefined}
            isSubmitting={isSubmitting}
          />
        </div>
        <div className="space-y-6">
          <RiskReporting />
        </div>
      </section>

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setSelectedRisk(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <RiskDetails risk={selectedRisk} onClose={() => setIsDetailsOpen(false)}>
            {selectedRisk ? (
              <div className="space-y-6">
                <RiskControlCoverage riskId={selectedRisk.riskId} />
                <KRIManager
                  riskId={selectedRisk.id}
                  kris={selectedRisk.keyRiskIndicators ?? []}
                  onUpdate={(next) => handleKriUpdate(selectedRisk.id, next)}
                />
              </div>
            ) : null}
          </RiskDetails>
        </DialogContent>
      </Dialog>
    </div>
  );
}
