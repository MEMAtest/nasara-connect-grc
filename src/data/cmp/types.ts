export type ControlFrequency = "monthly" | "quarterly" | "semi-annually" | "annually";
export type RagStatus = "green" | "amber" | "red";
export type ControlCriticality = "critical" | "high" | "medium" | "low";
export type TestResult = "pass" | "fail" | "partial";
export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "in_progress" | "resolved";

export interface LinkedRisk {
  riskId: string;
  title: string;
  inherentScore: number;
  residualScore: number;
}

export interface CmpControlSummary {
  id: string; // e.g. CMP-001
  title: string;
  objective: string;
  owner: string;
  backupOwner: string;
  frequency: ControlFrequency;
  nextTestDue: string;
  lastTestedAt: string;
  status: "active" | "paused" | "retired";
  ragStatus: RagStatus;
  passRate: number; // 0-1
  automationCoverage: number; // 0-1
  dutyOutcome: string;
  regulatoryReferences: string[];
  linkedRisks: LinkedRisk[];
  consumerDutyNotes?: string;
  criticality: ControlCriticality;
  testsPlanned: number;
  testsExecuted: number;
  issuesOpen: number;
  trend: "improving" | "declining" | "steady";
}

export interface CmpTestPlanStep {
  id: string;
  stepNumber: number;
  objective: string;
  procedure: string;
  sampleSize: number;
  dataSource: string;
  evidenceLocation: string;
  automation: boolean;
  technique: "inspection" | "inquiry" | "re-performance" | "analytics";
  expectedResult: string;
}

export interface CmpTestExecution {
  id: string;
  stepId: string;
  tester: string;
  reviewer: string;
  testedAt: string;
  result: TestResult;
  sampleSize: number;
  evidencePath?: string;
  comments?: string;
}

export interface CmpFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  dueDate: string;
  owner: string;
  rootCause: string;
  businessImpact: string;
  interimControls?: string;
  relatedTestId?: string;
  createdAt: string;
}

export interface CmpKri {
  id: string;
  name: string;
  metric: string;
  target: number;
  actual: number;
  status: RagStatus;
  commentary?: string;
}

export interface CmpControlDetail extends CmpControlSummary {
  controlType: "preventative" | "detective" | "corrective";
  dependencies: string[];
  dataSources: string[];
  testPlan: CmpTestPlanStep[];
  executions: CmpTestExecution[];
  findings: CmpFinding[];
  kris: CmpKri[];
  notes?: string;
}

export interface NewTestExecutionPayload {
  tester: string;
  reviewer: string;
  stepId: string;
  testedAt: string;
  result: TestResult;
  sampleSize: number;
  evidencePath?: string;
  comments?: string;
}

export interface NewFindingPayload {
  title: string;
  description: string;
  severity: FindingSeverity;
  dueDate: string;
  owner: string;
  rootCause: string;
  businessImpact: string;
  interimControls?: string;
  relatedTestId?: string;
}

export interface CmpSummary {
  totalControls: number;
  dueSoon: number;
  overdue: number;
  openFindings: number;
  avgPassRate: number;
}
