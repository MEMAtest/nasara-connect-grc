import { mockRisks } from "@/app/(dashboard)/risk-assessment/lib/mock-data";
import type { RiskKeyRiskIndicator, RiskRecord } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";

const riskStore = new Map<string, RiskRecord[]>();

function cloneRisk(risk: RiskRecord): RiskRecord {
  return JSON.parse(JSON.stringify(risk));
}

export function getRisksForOrganization(organizationId: string): RiskRecord[] {
  if (!riskStore.has(organizationId)) {
    riskStore.set(
      organizationId,
      mockRisks.map((risk) => ({ ...risk, id: `${risk.id}-${organizationId}` })),
    );
  }
  const risks = riskStore.get(organizationId) ?? [];
  return risks.map((risk) => cloneRisk(risk));
}

export function setRisksForOrganization(organizationId: string, risks: RiskRecord[]): void {
  riskStore.set(
    organizationId,
    risks.map((risk) => ({ ...risk })),
  );
}

export function upsertRisk(organizationId: string, risk: RiskRecord): RiskRecord {
  const risks = getRisksForOrganization(organizationId);
  const existingIndex = risks.findIndex((item) => item.id === risk.id);
  const updated = cloneRisk(risk);
  if (existingIndex >= 0) {
    risks[existingIndex] = updated;
  } else {
    risks.unshift(updated);
  }
  setRisksForOrganization(organizationId, risks);
  return updated;
}

export function createRisk(organizationId: string, risk: RiskRecord): RiskRecord {
  const risks = getRisksForOrganization(organizationId);
  const created = cloneRisk(risk);
  risks.unshift(created);
  setRisksForOrganization(organizationId, risks);
  return created;
}

export function updateRiskKris(
  organizationId: string,
  riskId: string,
  kris: RiskKeyRiskIndicator[],
): RiskRecord | null {
  const risks = getRisksForOrganization(organizationId);
  const index = risks.findIndex((risk) => risk.id === riskId || risk.riskId === riskId);
  if (index === -1) return null;
  const updated = {
    ...risks[index],
    keyRiskIndicators: kris.map((kri) => ({ ...kri })),
  };
  risks[index] = updated;
  setRisksForOrganization(organizationId, risks);
  return cloneRisk(updated);
}

export function deleteRisk(organizationId: string, riskId: string): void {
  const risks = getRisksForOrganization(organizationId);
  const filtered = risks.filter((risk) => risk.id !== riskId && risk.riskId !== riskId);
  setRisksForOrganization(organizationId, filtered);
}
