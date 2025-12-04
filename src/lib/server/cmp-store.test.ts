process.env.USE_IN_MEMORY_CMP = "1";

import { describe, expect, it } from "vitest";
import { getCmpControl, getCmpControls, getCmpSummary, recordCmpFinding, recordCmpTest } from "./cmp-store";

const TEST_ORG = 'test-org-cmp';

describe('cmp-store', () => {
  it('records a new test execution and updates pass rate', async () => {
    const control = (await getCmpControls(TEST_ORG))[0];
    const payload = {
      stepId: control.testPlan[0].id,
      tester: 'QA Analyst',
      reviewer: 'Head of Compliance',
      testedAt: new Date().toISOString(),
      result: 'pass' as const,
      sampleSize: 5,
    };
    const exec = await recordCmpTest(TEST_ORG, control.id, payload);
    expect(exec).not.toBeNull();
    const updated = await getCmpControl(TEST_ORG, control.id);
    expect(updated?.executions[0].tester).toBe('QA Analyst');
    expect(updated?.testsExecuted).toBeGreaterThan(control.testsExecuted);
  });

  it('records a new finding and increments open issues', async () => {
    const control = (await getCmpControls(`${TEST_ORG}-issues`))[0];
    const finding = await recordCmpFinding(`${TEST_ORG}-issues`, control.id, {
      title: 'Test finding',
      description: 'Example issue',
      severity: 'high',
      dueDate: new Date().toISOString(),
      owner: 'Control Owner',
      rootCause: 'Process gap',
      businessImpact: 'Customer outcome risk',
    });
    expect(finding).not.toBeNull();
    const updated = await getCmpControl(`${TEST_ORG}-issues`, control.id);
    expect(updated?.issuesOpen).toBeGreaterThan(control.issuesOpen);
  });

  it('computes summary statistics', async () => {
    const summary = await getCmpSummary(TEST_ORG);
    expect(summary.totalControls).toBeGreaterThan(0);
    expect(summary.avgPassRate).toBeGreaterThan(0);
    expect(summary.dueSoon).toBeGreaterThanOrEqual(0);
  });
});
