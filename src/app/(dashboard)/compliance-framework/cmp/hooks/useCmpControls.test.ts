import { describe, expect, it } from "vitest";
import { filterControls, type CmpFilterState } from "./useCmpControls";
import type { CmpControlDetail } from "@/data/cmp/types";

const baseControl: CmpControlDetail = {
  id: "CMP-001",
  title: "Test Control",
  objective: "Test objective",
  owner: "Owner",
  backupOwner: "Backup",
  frequency: "monthly",
  nextTestDue: new Date().toISOString(),
  lastTestedAt: new Date().toISOString(),
  status: "active",
  ragStatus: "green",
  passRate: 0.95,
  automationCoverage: 0.5,
  dutyOutcome: "Fair Value",
  regulatoryReferences: ["REF"],
  linkedRisks: [],
  criticality: "high",
  testsPlanned: 2,
  testsExecuted: 2,
  issuesOpen: 0,
  trend: "steady",
  controlType: "preventative",
  dependencies: [],
  dataSources: [],
  testPlan: [],
  executions: [],
  findings: [],
  kris: [],
};

describe('filterControls', () => {
  it('returns all controls when filters default', () => {
    const filters: CmpFilterState = { rag: 'all', frequency: 'all', dutyOutcome: 'all', search: '' };
    expect(filterControls([baseControl], filters)).toHaveLength(1);
  });

  it('filters by rag status', () => {
    const amberControl: CmpControlDetail = { ...baseControl, id: 'CMP-002', ragStatus: 'amber' };
    const filters: CmpFilterState = { rag: 'amber', frequency: 'all', dutyOutcome: 'all', search: '' };
    const result = filterControls([baseControl, amberControl], filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('CMP-002');
  });

  it('filters by frequency and duty outcome', () => {
    const quarterly: CmpControlDetail = { ...baseControl, id: 'CMP-003', frequency: 'quarterly', dutyOutcome: 'Consumer Understanding' };
    const filters: CmpFilterState = { rag: 'all', frequency: 'quarterly', dutyOutcome: 'Consumer Understanding', search: '' };
    const result = filterControls([baseControl, quarterly], filters);
    expect(result).toEqual([quarterly]);
  });

  it('applies search matches across key fields', () => {
    const controls = [
      baseControl,
      { ...baseControl, id: 'CMP-004', title: 'AML Control', owner: 'Regina', dutyOutcome: 'Products & Services' },
    ];
    const filters: CmpFilterState = { rag: 'all', frequency: 'all', dutyOutcome: 'all', search: 'aml' };
    const result = filterControls(controls, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('CMP-004');
  });
});
