"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { allSMFs, certificationFunctions, prescribedResponsibilities } from "../data/core-functions";
import { getWorkflowTemplate, WorkflowFieldDefinition } from "../data/workflow-templates";
import { getAllFitnessQuestions } from "../data/fitness-framework";
import { getTrainingModulesForRole, TrainingModuleDefinition, TrainingStatus } from "../data/role-training";
import { smcrApi } from "@/lib/smcr-api-client";

export type DocumentCategory = "cv" | "dbs" | "reference" | "qualification" | "id" | "other";

type AssessmentStatus = "current" | "due" | "overdue" | "not_required";
export type PsdStatus = "not_started" | "in_progress" | "complete";

export interface Firm {
  id: string;
  name: string;
  createdAt: string;
  authorizationProjectId?: string;
  authorizationProjectName?: string;
}

export interface PersonAssessment {
  status: AssessmentStatus;
  lastAssessment?: string;
  nextAssessment?: string;
  trainingCompletion?: number;
}

export interface FCAVerificationData {
  status: string;
  lastChecked: string;
  name?: string;
  controlFunctions: Array<{
    function: string;
    firmName: string;
    frn: string;
    status: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }>;
  hasEnforcementHistory: boolean;
}

export interface PersonRecord {
  id: string;
  firmId: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  title?: string;
  phone?: string;
  address?: string;
  lineManager?: string;
  startDate?: string;
  hireDate?: string;
  endDate?: string;
  irn?: string;
  notes?: string;
  isPsd?: boolean;
  psdStatus?: PsdStatus;
  fcaVerification?: FCAVerificationData;
  assessment: PersonAssessment;
  createdAt: string;
  updatedAt: string;
  trainingPlan: TrainingPlanItem[];
}

export interface TrainingPlanItem {
  id: string;
  moduleId: string;
  title: string;
  required: boolean;
  roleContext: string;
  status: TrainingStatus;
  dueDate?: string;
}

export interface DocumentMetadata {
  id: string;
  personId: string;
  category: DocumentCategory;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  notes?: string;
}

type RoleType = "SMF" | "CF";

export type RoleApprovalStatus = "draft" | "pending" | "approved" | "rejected";

export interface RoleAssignment {
  id: string;
  firmId: string;
  personId: string;
  functionId: string;
  functionType: RoleType;
  functionLabel: string;
  entity?: string;
  startDate: string;
  endDate?: string;
  assessmentDate?: string;
  approvalStatus: RoleApprovalStatus;
  notes?: string;
  assignedAt: string;
  updatedAt: string;
}

export type WorkflowStatus = "not_started" | "in_progress" | "completed";
export type WorkflowStepStatus = "pending" | "completed";

export interface WorkflowStepInstance {
  id: string;
  templateStepId?: string;
  title: string;
  description?: string;
  status: WorkflowStepStatus;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
  expectedEvidence?: string[];
  form?: WorkflowStepField[];
  checklist?: WorkflowChecklistItem[];
  fpChecklist?: FpChecklistDraft;
  referenceRequest?: ReferenceRequestDraft;
  criminalCheck?: CriminalCheckDraft;
  trainingPlan?: TrainingPlanDraft;
  statementOfResponsibilities?: StatementOfResponsibilitiesDraft;
}

export interface WorkflowStepField {
  id: string;
  label: string;
  type: WorkflowFieldDefinition["type"];
  required?: boolean;
  helperText?: string;
  options?: { value: string; label: string }[];
  value: string | boolean | null;
}

export interface WorkflowChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WorkflowInstance {
  id: string;
  firmId: string;
  templateId: string;
  name: string;
  summary: string;
  ownerPersonId?: string;
  ownerName?: string;
  launchedAt: string;
  dueDate?: string;
  status: WorkflowStatus;
  steps: WorkflowStepInstance[];
  successCriteria: string[];
  trigger?: string;
}

export interface WorkflowDocument {
  id: string;
  firmId: string;
  workflowId: string;
  stepId: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  summary?: string;
  status: "pending" | "reviewed";
}

export type RiskRating = "low" | "medium" | "high" | "critical";

export interface FpSmfMapping {
  functionId: string;
  assigned: boolean;
  ownerId?: string;
  notes?: string;
}

export interface FpPrescribedMapping {
  responsibilityId: string;
  assigned: boolean;
  ownerId?: string;
  notes?: string;
}

export interface FpChecklistDraft {
  subjectPersonId?: string;
  subjectRoleIds: string[];
  riskRating?: RiskRating;
  keyConsiderations?: string;
  dependencies: string[];
  smfMappings: FpSmfMapping[];
  prescribedMappings: FpPrescribedMapping[];
  lastUpdated: string;
}

export type ReferenceResponseStatus = "pending" | "requested" | "received_clean" | "received_concerns" | "refused" | "no_response";

export interface ReferenceRequestEntry {
  id: string;
  firmName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  requestDate?: string;
  responseDate?: string;
  status: ReferenceResponseStatus;
  followUpDate?: string;
  notes?: string;
}

export interface ReferenceRequestDraft {
  subjectPersonId?: string;
  entries: ReferenceRequestEntry[];
  reminderDate?: string;
  summaryNotes?: string;
  lastUpdated: string;
}

export type CriminalCheckStatus = "not_requested" | "requested" | "in_progress" | "clear" | "adverse";

export interface CriminalCheckDraft {
  subjectPersonId?: string;
  provider?: string;
  requestDate?: string;
  referenceNumber?: string;
  status: CriminalCheckStatus;
  reviewer?: string;
  completionDate?: string;
  adverseDetails?: string;
  followUpActions?: string;
  lastUpdated: string;
}

export type TrainingPlanItemStatus = "not_started" | "scheduled" | "in_progress" | "completed";

export interface TrainingPlanDraftItem {
  id: string;
  moduleId?: string;
  title: string;
  ownerId?: string;
  dueDate?: string;
  status: TrainingPlanItemStatus;
  deliveryMethod?: string;
  notes?: string;
}

export interface TrainingPlanDraft {
  subjectPersonId?: string;
  items: TrainingPlanDraftItem[];
  summary?: string;
  reviewDate?: string;
  lastUpdated: string;
}

export type SorApprovalStatus = "draft" | "submitted" | "approved";

export interface SorResponsibilityDraft {
  id: string;
  reference: string;
  description: string;
  ownerId?: string;
  confirmed: boolean;
  notes?: string;
}

export interface StatementOfResponsibilitiesDraft {
  subjectPersonId?: string;
  effectiveDate?: string;
  responsibilities: SorResponsibilityDraft[];
  approvalStatus: SorApprovalStatus;
  approvalNotes?: string;
  lastUpdated: string;
}

export type FitnessAssessmentStatus = "draft" | "in_review" | "completed";
export type FitnessBooleanAnswer = "yes" | "no" | "not_applicable";

// Conduct Breach types
export type BreachSeverity = "minor" | "serious" | "severe";
export type BreachStatus = "open" | "investigating" | "resolved" | "escalated";

export interface ConductBreach {
  id: string;
  firmId: string;
  personId: string;
  personName: string;
  ruleId: string;
  ruleName: string;
  dateIdentified: string;
  dateOccurred?: string;
  description: string;
  severity: BreachSeverity;
  status: BreachStatus;
  investigator?: string;
  findings?: string;
  recommendations?: string[];
  disciplinaryAction?: string;
  trainingRequired?: boolean;
  fcaNotification?: boolean;
  fcaNotificationDate?: string;
  resolutionDate?: string;
  lessonsLearned?: string;
  timeline: BreachTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface BreachTimelineEntry {
  id: string;
  date: string;
  action: string;
  description: string;
  performedBy?: string;
}

export interface FitnessAssessmentResponse {
  questionId: string;
  value: FitnessBooleanAnswer | string | null;
  notes?: string;
}

export interface FitnessAssessmentRecord {
  id: string;
  firmId: string;
  personId: string;
  personName: string;
  personRole?: string;
  status: FitnessAssessmentStatus;
  assessmentDate?: string;
  nextDueDate?: string;
  reviewer?: string;
  overallDetermination?: "Fit and Proper" | "Conditional" | "Not Fit and Proper";
  conditions?: string[];
  createdAt: string;
  updatedAt: string;
  responses: FitnessAssessmentResponse[];
}

export interface GroupEntity {
  id: string;
  name: string;
  type: "holding" | "subsidiary" | "parent" | "associate" | "branch";
  linkedFirmId?: string;
  linkedProjectId?: string;
  linkedProjectName?: string;
  parentId?: string;
  ownershipPercent?: number;
  country?: string;
  regulatoryStatus?: string;
  isExternal?: boolean;
}

export interface SmcrSettings {
  verificationStaleThresholdDays: number;
}

interface SmcrDataState {
  people: PersonRecord[];
  documents: DocumentMetadata[];
  roles: RoleAssignment[];
  workflows: WorkflowInstance[];
  workflowDocuments: WorkflowDocument[];
  assessments: FitnessAssessmentRecord[];
  breaches: ConductBreach[];
  groupEntities: GroupEntity[];
  settings: SmcrSettings;
}

const defaultSettings: SmcrSettings = {
  verificationStaleThresholdDays: 30,
};

const emptyState: SmcrDataState = {
  people: [],
  documents: [],
  roles: [],
  workflows: [],
  workflowDocuments: [],
  assessments: [],
  breaches: [],
  groupEntities: [],
  settings: defaultSettings,
};

interface SmcrContextValue {
  state: SmcrDataState;
  isReady: boolean;
  firms: Firm[];
  activeFirmId: string | null;
  setActiveFirm: (id: string) => void;
  addFirm: (name: string) => Promise<string>;
  linkAuthorizationProject: (firmId: string, projectId: string, projectName: string) => Promise<void>;
  unlinkAuthorizationProject: (firmId: string) => Promise<void>;
  addPerson: (input: NewPersonInput) => Promise<string>;
  updatePerson: (id: string, updates: Partial<PersonRecord>) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  attachDocuments: (personId: string, payload: DocumentUploadPayload[]) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  assignRole: (input: NewRoleInput) => Promise<RoleAssignment>;
  updateRole: (id: string, updates: Partial<RoleAssignment>) => Promise<void>;
  removeRole: (id: string) => Promise<void>;
  launchWorkflow: (input: WorkflowLaunchInput) => Promise<WorkflowInstance>;
  updateWorkflowStep: (input: WorkflowStepUpdateInput) => Promise<void>;
  removeWorkflow: (id: string) => Promise<void>;
  attachWorkflowEvidence: (workflowId: string, stepId: string, file: File) => Promise<WorkflowDocument>;
  removeWorkflowEvidence: (id: string) => Promise<void>;
  updateWorkflowField: (input: WorkflowFieldUpdateInput) => Promise<void>;
  updateWorkflowChecklist: (input: WorkflowChecklistUpdateInput) => Promise<void>;
  updateFpChecklist: (input: FpChecklistUpdateInput) => Promise<void>;
  updateReferenceRequest: (input: ReferenceRequestUpdateInput) => Promise<void>;
  updateCriminalCheck: (input: CriminalCheckUpdateInput) => Promise<void>;
  updateTrainingPlan: (input: TrainingPlanUpdateInput) => Promise<void>;
  updateStatementOfResponsibilities: (input: StatementOfResponsibilitiesUpdateInput) => Promise<void>;
  updateTrainingItemStatus: (personId: string, itemId: string, status: TrainingStatus) => Promise<void>;
  startAssessment: (input: NewAssessmentInput) => Promise<FitnessAssessmentRecord>;
  updateAssessmentResponse: (input: AssessmentResponseUpdate) => Promise<void>;
  updateAssessmentStatus: (input: AssessmentStatusUpdate) => Promise<void>;
  removeAssessment: (id: string) => Promise<void>;
  // Breach management
  addBreach: (input: NewBreachInput) => Promise<ConductBreach>;
  updateBreach: (id: string, updates: Partial<ConductBreach>) => Promise<void>;
  addBreachTimelineEntry: (breachId: string, entry: Omit<BreachTimelineEntry, "id">) => Promise<void>;
  removeBreach: (id: string) => Promise<void>;
  // Group entities
  groupEntities: GroupEntity[];
  addGroupEntity: (input: Omit<GroupEntity, "id">) => Promise<GroupEntity>;
  updateGroupEntity: (id: string, updates: Partial<GroupEntity>) => Promise<void>;
  removeGroupEntity: (id: string) => Promise<void>;
  // Settings
  updateSettings: (updates: Partial<SmcrSettings>) => void;
}

type NewPersonInput = {
  name: string;
  email: string;
  department: string;
  title?: string;
  phone?: string;
  address?: string;
  lineManager?: string;
  irn?: string;
  startDate?: string;
  hireDate?: string;
  endDate?: string;
  notes?: string;
  isPsd?: boolean;
  psdStatus?: PsdStatus;
  assessment?: Partial<PersonAssessment>;
};

type DocumentUploadPayload = {
  file: File;
  category: DocumentCategory;
  notes?: string;
};

type NewRoleInput = {
  personId: string;
  functionId: string;
  functionType: RoleType;
  entity?: string;
  startDate: string;
  endDate?: string;
  assessmentDate?: string;
  approvalStatus: RoleApprovalStatus;
  notes?: string;
};

type WorkflowLaunchInput = {
  templateId: string;
  ownerPersonId?: string;
  dueDate?: string;
  customName?: string;
};

type WorkflowStepUpdateInput = {
  workflowId: string;
  stepId: string;
  status?: WorkflowStepStatus;
  notes?: string;
};

type WorkflowFieldUpdateInput = {
  workflowId: string;
  stepId: string;
  fieldId: string;
  value: string | boolean | null;
};

type WorkflowChecklistUpdateInput = {
  workflowId: string;
  stepId: string;
  checklistId: string;
  completed: boolean;
};

type FpChecklistUpdateInput = {
  workflowId: string;
  stepId: string;
  updater: (draft: FpChecklistDraft) => FpChecklistDraft;
};

type ReferenceRequestUpdateInput = {
  workflowId: string;
  stepId: string;
  updater: (draft: ReferenceRequestDraft) => ReferenceRequestDraft;
};

type CriminalCheckUpdateInput = {
  workflowId: string;
  stepId: string;
  updater: (draft: CriminalCheckDraft) => CriminalCheckDraft;
};

type TrainingPlanUpdateInput = {
  workflowId: string;
  stepId: string;
  updater: (draft: TrainingPlanDraft) => TrainingPlanDraft;
};

type StatementOfResponsibilitiesUpdateInput = {
  workflowId: string;
  stepId: string;
  updater: (draft: StatementOfResponsibilitiesDraft) => StatementOfResponsibilitiesDraft;
};

type NewAssessmentInput = {
  personId: string;
  assessmentDate?: string;
  nextDueDate?: string;
  reviewer?: string;
};

type AssessmentResponseUpdate = {
  assessmentId: string;
  questionId: string;
  value: FitnessBooleanAnswer | string | null;
  notes?: string;
};

type AssessmentStatusUpdate = {
  assessmentId: string;
  status: FitnessAssessmentStatus;
  overallDetermination?: FitnessAssessmentRecord["overallDetermination"];
  conditions?: string[];
  assessmentDate?: string;
  nextDueDate?: string;
  reviewer?: string;
};

type NewBreachInput = {
  personId: string;
  personName: string;
  ruleId: string;
  ruleName: string;
  dateIdentified: string;
  dateOccurred?: string;
  description: string;
  severity: BreachSeverity;
};

const SmcrDataContext = createContext<SmcrContextValue | undefined>(undefined);

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultFpChecklistDraft(): FpChecklistDraft {
  const timestamp = new Date().toISOString();
  return {
    subjectPersonId: undefined,
    subjectRoleIds: [],
    riskRating: undefined,
    keyConsiderations: "",
    dependencies: [],
    smfMappings: allSMFs.map((functionDefinition) => ({
      functionId: functionDefinition.id,
      assigned: false,
    })),
    prescribedMappings: prescribedResponsibilities.map((responsibility) => ({
      responsibilityId: responsibility.id,
      assigned: false,
    })),
    lastUpdated: timestamp,
  };
}

function createDefaultReferenceRequestDraft(): ReferenceRequestDraft {
  return {
    subjectPersonId: undefined,
    entries: [],
    reminderDate: undefined,
    summaryNotes: "",
    lastUpdated: new Date().toISOString(),
  };
}

function createDefaultCriminalCheckDraft(): CriminalCheckDraft {
  return {
    subjectPersonId: undefined,
    provider: undefined,
    requestDate: undefined,
    referenceNumber: "",
    status: "not_requested",
    reviewer: "",
    completionDate: undefined,
    adverseDetails: "",
    followUpActions: "",
    lastUpdated: new Date().toISOString(),
  };
}

function createDefaultTrainingPlanDraft(): TrainingPlanDraft {
  return {
    subjectPersonId: undefined,
    items: [],
    summary: "",
    reviewDate: undefined,
    lastUpdated: new Date().toISOString(),
  };
}

function createDefaultStatementOfResponsibilitiesDraft(): StatementOfResponsibilitiesDraft {
  const timestamp = new Date().toISOString();
  const responsibilities: SorResponsibilityDraft[] = prescribedResponsibilities.map((responsibility) => ({
    id: responsibility.id,
    reference: responsibility.pr_number,
    description: responsibility.description,
    ownerId: undefined,
    confirmed: false,
    notes: "",
  }));

  return {
    subjectPersonId: undefined,
    effectiveDate: undefined,
    responsibilities,
    approvalStatus: "draft",
    approvalNotes: "",
    lastUpdated: timestamp,
  };
}

function sanitizeAssessment(assessment?: Partial<PersonAssessment>): PersonAssessment {
  return {
    status: assessment?.status ?? "not_required",
    lastAssessment: assessment?.lastAssessment,
    nextAssessment: assessment?.nextAssessment,
    trainingCompletion: assessment?.trainingCompletion ?? 0,
  };
}

function buildTrainingPlanItems(roleContext: string, modules: TrainingModuleDefinition[]): TrainingPlanItem[] {
  return modules.map((module) => ({
    id: `${roleContext}-${module.id}`,
    moduleId: module.id,
    title: module.title,
    required: module.required,
    roleContext,
    status: "not_started",
    dueDate: module.recommendedDueWithinDays
      ? new Date(Date.now() + module.recommendedDueWithinDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  }));
}

function mergeTrainingPlan(existing: TrainingPlanItem[], additions: TrainingPlanItem[]): TrainingPlanItem[] {
  const map = new Map(existing.map((item) => [item.id, item] as const));
  additions.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

function filterTrainingPlanByRole(plan: TrainingPlanItem[], roleId: string) {
  return plan.filter((item) => item.roleContext !== roleId);
}

function calculateTrainingCompletion(plan: TrainingPlanItem[]): number {
  if (plan.length === 0) return 0;
  const completed = plan.filter((item) => item.status === "completed").length;
  return Math.round((completed / plan.length) * 100);
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function mapFirmRecord(record: Record<string, unknown>): Firm {
  return {
    id: String(record.id),
    name: String(record.name ?? "Unnamed Firm"),
    createdAt: toIsoString(record.created_at) ?? new Date().toISOString(),
    authorizationProjectId: (record.authorization_project_id as string | undefined) ?? undefined,
    authorizationProjectName: (record.authorization_project_name as string | undefined) ?? undefined,
  };
}

function mapTrainingItem(record: Record<string, unknown>): TrainingPlanItem {
  return {
    id: String(record.id),
    moduleId: (record.module_id as string | undefined) ?? "",
    title: String(record.title ?? "Training item"),
    required: Boolean(record.required),
    roleContext: (record.role_context as string | undefined) ?? "",
    status: (record.status as TrainingStatus) ?? "not_started",
    dueDate: toIsoString(record.due_date),
  };
}

function mapPersonRecord(record: Record<string, unknown>, trainingPlan: TrainingPlanItem[]): PersonRecord {
  const computedCompletion = calculateTrainingCompletion(trainingPlan);
  const assessment = sanitizeAssessment({
    status: (record.assessment_status as AssessmentStatus) ?? "not_required",
    lastAssessment: toIsoString(record.last_assessment),
    nextAssessment: toIsoString(record.next_assessment),
    trainingCompletion:
      trainingPlan.length > 0
        ? computedCompletion
        : typeof record.training_completion === "number"
          ? record.training_completion
          : computedCompletion,
  });

  return {
    id: String(record.id),
    firmId: String(record.firm_id),
    employeeId: String(record.employee_id ?? ""),
    name: String(record.name ?? "Unnamed"),
    email: (record.email as string | undefined) ?? "",
    department: (record.department as string | undefined) ?? "",
    title: (record.title as string | undefined) ?? undefined,
    phone: (record.phone as string | undefined) ?? undefined,
    address: (record.address as string | undefined) ?? undefined,
    lineManager: (record.line_manager as string | undefined) ?? undefined,
    startDate: toIsoString(record.start_date),
    hireDate: toIsoString(record.hire_date),
    endDate: toIsoString(record.end_date),
    irn: (record.irn as string | undefined) ?? undefined,
    notes: (record.notes as string | undefined) ?? undefined,
    isPsd: Boolean(record.is_psd ?? record.isPsd),
    psdStatus: record.psd_status ? (record.psd_status as PsdStatus) : undefined,
    fcaVerification: (record.fca_verification as FCAVerificationData | undefined) ?? undefined,
    assessment,
    createdAt: toIsoString(record.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(record.updated_at) ?? new Date().toISOString(),
    trainingPlan,
  };
}

function mapDocumentRecord(record: Record<string, unknown>): DocumentMetadata {
  return {
    id: String(record.id),
    personId: String(record.person_id),
    category: record.category as DocumentCategory,
    name: String(record.name ?? "Document"),
    type: (record.type as string | undefined) ?? "application/octet-stream",
    size: typeof record.size === "number" ? record.size : 0,
    uploadedAt: toIsoString(record.uploaded_at) ?? new Date().toISOString(),
    notes: (record.notes as string | undefined) ?? undefined,
  };
}

function mapRoleRecord(record: Record<string, unknown>): RoleAssignment {
  return {
    id: String(record.id),
    firmId: String(record.firm_id),
    personId: String(record.person_id),
    functionId: String(record.function_id),
    functionType: record.function_type as RoleType,
    functionLabel: (record.function_label as string | undefined) ?? String(record.function_id),
    entity: (record.entity as string | undefined) ?? undefined,
    startDate: toIsoString(record.start_date) ?? new Date().toISOString(),
    endDate: toIsoString(record.end_date),
    assessmentDate: toIsoString(record.assessment_date),
    approvalStatus: (record.approval_status as RoleApprovalStatus) ?? "draft",
    notes: (record.notes as string | undefined) ?? undefined,
    assignedAt: toIsoString(record.assigned_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(record.updated_at) ?? new Date().toISOString(),
  };
}

function mapWorkflowRecord(record: Record<string, unknown>): WorkflowInstance {
  return {
    id: String(record.id),
    firmId: String(record.firm_id),
    templateId: String(record.template_id),
    name: String(record.name ?? "Workflow"),
    summary: (record.summary as string | undefined) ?? "",
    ownerPersonId: (record.owner_person_id as string | undefined) ?? undefined,
    ownerName: (record.owner_name as string | undefined) ?? undefined,
    launchedAt: toIsoString(record.launched_at) ?? new Date().toISOString(),
    dueDate: toIsoString(record.due_date),
    status: (record.status as WorkflowStatus) ?? "not_started",
    steps: parseJsonArray(record.steps) as WorkflowStepInstance[],
    successCriteria: (parseJsonArray(record.success_criteria) as string[]) ?? [],
    trigger: (record.trigger_event as string | undefined) ?? undefined,
  };
}

function mapWorkflowDocumentRecord(record: Record<string, unknown>): WorkflowDocument {
  return {
    id: String(record.id),
    firmId: String(record.firm_id),
    workflowId: String(record.workflow_id),
    stepId: String(record.step_id),
    name: String(record.name ?? "Document"),
    type: (record.type as string | undefined) ?? "application/octet-stream",
    size: typeof record.size === "number" ? record.size : 0,
    uploadedAt: toIsoString(record.uploaded_at) ?? new Date().toISOString(),
    summary: (record.summary as string | undefined) ?? "",
    status: (record.status as "pending" | "reviewed") ?? "pending",
  };
}

function mapAssessmentRecord(record: Record<string, unknown>): FitnessAssessmentRecord {
  return {
    id: String(record.id),
    firmId: String(record.firm_id),
    personId: String(record.person_id),
    personName: String(record.person_name ?? ""),
    personRole: (record.person_role as string | undefined) ?? undefined,
    status: (record.status as FitnessAssessmentStatus) ?? "draft",
    assessmentDate: toIsoString(record.assessment_date),
    nextDueDate: toIsoString(record.next_due_date),
    reviewer: (record.reviewer as string | undefined) ?? undefined,
    overallDetermination: (record.overall_determination as FitnessAssessmentRecord["overallDetermination"]) ?? undefined,
    conditions: parseJsonArray(record.conditions) as string[],
    createdAt: toIsoString(record.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(record.updated_at) ?? new Date().toISOString(),
    responses: parseJsonArray(record.responses) as FitnessAssessmentResponse[],
  };
}

function mapBreachRecord(record: Record<string, unknown>): ConductBreach {
  const details = parseJsonObject(record.details);
  const timeline = parseJsonArray(record.timeline) as BreachTimelineEntry[];
  return {
    id: String(record.id),
    firmId: String(record.firm_id),
    personId: (record.person_id as string | undefined) ?? "",
    personName: String(details.personName ?? details.person_name ?? ""),
    ruleId: String(record.rule_id ?? details.ruleId ?? details.rule_id ?? ""),
    ruleName: String(details.ruleName ?? details.rule_name ?? ""),
    dateIdentified: String(details.dateIdentified ?? details.date_identified ?? toIsoString(record.created_at) ?? ""),
    dateOccurred: details.dateOccurred ? String(details.dateOccurred) : undefined,
    description: String(details.description ?? ""),
    severity: String(record.severity ?? "") as BreachSeverity,
    status: String(record.status ?? "") as BreachStatus,
    investigator: details.investigator ? String(details.investigator) : undefined,
    findings: details.findings ? String(details.findings) : undefined,
    recommendations: Array.isArray(details.recommendations) ? (details.recommendations as string[]) : undefined,
    disciplinaryAction: details.disciplinaryAction ? String(details.disciplinaryAction) : undefined,
    trainingRequired: typeof details.trainingRequired === "boolean" ? details.trainingRequired : undefined,
    fcaNotification: typeof details.fcaNotification === "boolean" ? details.fcaNotification : undefined,
    fcaNotificationDate: details.fcaNotificationDate ? String(details.fcaNotificationDate) : undefined,
    resolutionDate: details.resolutionDate ? String(details.resolutionDate) : undefined,
    lessonsLearned: details.lessonsLearned ? String(details.lessonsLearned) : undefined,
    timeline,
    createdAt: toIsoString(record.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(record.updated_at) ?? new Date().toISOString(),
  };
}

function mapGroupEntityRecord(record: Record<string, unknown>): GroupEntity {
  const ownershipRaw = record.ownership_percent;
  const ownershipPercent =
    typeof ownershipRaw === "number"
      ? ownershipRaw
      : typeof ownershipRaw === "string"
        ? Number(ownershipRaw)
        : undefined;
  return {
    id: String(record.id),
    name: String(record.name ?? "Entity"),
    type: (record.type as GroupEntity["type"]) ?? "holding",
    parentId: (record.parent_id as string | undefined) ?? undefined,
    ownershipPercent: Number.isNaN(ownershipPercent) ? undefined : ownershipPercent,
    country: (record.country as string | undefined) ?? undefined,
    linkedFirmId: (record.linked_firm_id as string | undefined) ?? undefined,
    linkedProjectId: (record.linked_project_id as string | undefined) ?? undefined,
    linkedProjectName: (record.linked_project_name as string | undefined) ?? undefined,
    regulatoryStatus: (record.regulatory_status as string | undefined) ?? undefined,
    isExternal: typeof record.is_external === "boolean" ? record.is_external : undefined,
  };
}

export function SmcrDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SmcrDataState>(emptyState);
  const [isReady, setIsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadError, setLoadError] = useState<string | null>(null);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [activeFirmId, setActiveFirmId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFirms = async () => {
      setIsReady(false);
      setLoadError(null);
      try {
        const firmResponse = await smcrApi.getFirms();
        const firmRecords = Array.isArray(firmResponse) ? firmResponse : [];
        const mapped = firmRecords.map((firm) => mapFirmRecord(firm as Record<string, unknown>));
        if (!isMounted) return;
        setFirms(mapped);
        const initialFirmId = mapped[0]?.id ?? null;
        setActiveFirmId(initialFirmId);
        if (!initialFirmId) {
          setState(emptyState);
          setIsReady(true);
        }
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load SMCR firms");
        setIsReady(true);
      }
    };

    loadFirms();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeFirmId) return;
    let isMounted = true;

    const loadFirmData = async () => {
      setIsReady(false);
      setLoadError(null);
      try {
        const [peopleRaw, rolesRaw, workflowsRaw, assessmentsRaw, breachesRaw, groupEntitiesRaw] =
          await Promise.all([
            smcrApi.getPeople(activeFirmId),
            smcrApi.getRoles(activeFirmId),
            smcrApi.getWorkflows(activeFirmId),
            smcrApi.getAssessments(activeFirmId),
            smcrApi.getBreaches(activeFirmId),
            smcrApi.getGroupEntities(),
          ]);

        const peopleRecords = Array.isArray(peopleRaw) ? peopleRaw : [];
        const roleRecords = Array.isArray(rolesRaw) ? rolesRaw : [];
        const workflowRecords = Array.isArray(workflowsRaw) ? workflowsRaw : [];
        const assessmentRecords = Array.isArray(assessmentsRaw) ? assessmentsRaw : [];
        const breachRecords = Array.isArray(breachesRaw)
          ? breachesRaw
          : Array.isArray((breachesRaw as { breaches?: unknown[] })?.breaches)
            ? (breachesRaw as { breaches?: unknown[] }).breaches ?? []
            : [];
        const groupEntityRecords = Array.isArray(groupEntitiesRaw) ? groupEntitiesRaw : [];

        const documentsByPerson = await Promise.all(
          peopleRecords.map((person) =>
            smcrApi.getPersonDocuments(String((person as Record<string, unknown>).id)).catch(() => [])
          )
        );
        const trainingByPerson = await Promise.all(
          peopleRecords.map((person) =>
            smcrApi.getTrainingItems(String((person as Record<string, unknown>).id)).catch(() => [])
          )
        );
        const workflowDocumentsByWorkflow = await Promise.all(
          workflowRecords.map((workflow) =>
            smcrApi.getWorkflowDocuments(String((workflow as Record<string, unknown>).id)).catch(() => [])
          )
        );

        const documents = documentsByPerson.flatMap((docs) =>
          Array.isArray(docs) ? docs.map((doc) => mapDocumentRecord(doc as Record<string, unknown>)) : []
        );
        const trainingMap = new Map<string, TrainingPlanItem[]>();
        peopleRecords.forEach((person, idx) => {
          const trainingItems = Array.isArray(trainingByPerson[idx])
            ? trainingByPerson[idx].map((item) => mapTrainingItem(item as Record<string, unknown>))
            : [];
          trainingMap.set(String((person as Record<string, unknown>).id), trainingItems);
        });

        const people = peopleRecords.map((person) =>
          mapPersonRecord(
            person as Record<string, unknown>,
            trainingMap.get(String((person as Record<string, unknown>).id)) ?? []
          )
        );
        const roles = roleRecords.map((role) => mapRoleRecord(role as Record<string, unknown>));
        const workflows = workflowRecords.map((workflow) => mapWorkflowRecord(workflow as Record<string, unknown>));
        const workflowDocuments = workflowDocumentsByWorkflow.flatMap((docs) =>
          Array.isArray(docs) ? docs.map((doc) => mapWorkflowDocumentRecord(doc as Record<string, unknown>)) : []
        );
        const assessments = assessmentRecords.map((record) =>
          mapAssessmentRecord(record as Record<string, unknown>)
        );
        const breaches = breachRecords.map((record) => mapBreachRecord(record as Record<string, unknown>));
        const groupEntities = groupEntityRecords.map((entity) =>
          mapGroupEntityRecord(entity as Record<string, unknown>)
        );

        if (!isMounted) return;
        setState({
          people,
          documents,
          roles,
          workflows,
          workflowDocuments,
          assessments,
          breaches,
          groupEntities,
          settings: defaultSettings,
        });
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load SMCR data");
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    loadFirmData();

    return () => {
      isMounted = false;
    };
  }, [activeFirmId]);

  const addFirm = useCallback(async (name: string) => {
    const trimmed = name.trim() || "Unnamed Firm";
    const firmResponse = await smcrApi.createFirm(trimmed);
    const mapped = mapFirmRecord(firmResponse as Record<string, unknown>);
    setFirms((prev) => [...prev, mapped]);
    setActiveFirmId(mapped.id);
    return mapped.id;
  }, []);

  const setActiveFirm = useCallback((id: string) => {
    setActiveFirmId(id);
  }, []);

  const linkAuthorizationProject = useCallback(
    async (firmId: string, projectId: string, projectName: string) => {
      await smcrApi.updateFirm(firmId, {
        authorizationProjectId: projectId,
        authorizationProjectName: projectName,
      });
      setFirms((prev) =>
        prev.map((firm) =>
          firm.id === firmId
            ? { ...firm, authorizationProjectId: projectId, authorizationProjectName: projectName }
            : firm
        )
      );
    },
    []
  );

  const unlinkAuthorizationProject = useCallback(async (firmId: string) => {
    await smcrApi.updateFirm(firmId, {
      authorizationProjectId: null,
      authorizationProjectName: null,
    });
    setFirms((prev) =>
      prev.map((firm) =>
        firm.id === firmId
          ? { ...firm, authorizationProjectId: undefined, authorizationProjectName: undefined }
          : firm
      )
    );
  }, []);

  const addPerson = useCallback(
    async (input: NewPersonInput) => {
      if (!activeFirmId) {
        throw new Error("Select a firm before adding a person");
      }

      const payload = {
        name: input.name.trim(),
        email: input.email.trim(),
        department: input.department,
        title: input.title?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        address: input.address?.trim() || undefined,
        lineManager: input.lineManager?.trim() || undefined,
        irn: input.irn?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        startDate: input.startDate,
        hireDate: input.hireDate ?? input.startDate,
        endDate: input.endDate,
        isPsd: input.isPsd ?? false,
        psdStatus: input.psdStatus ?? undefined,
      };

      const created = await smcrApi.createPerson(activeFirmId, payload);
      const createdRecord = created as Record<string, unknown>;

      if (input.assessment) {
        await smcrApi.updatePerson(String(createdRecord.id), {
          assessmentStatus: input.assessment.status,
          lastAssessment: input.assessment.lastAssessment,
          nextAssessment: input.assessment.nextAssessment,
          trainingCompletion: input.assessment.trainingCompletion,
        });
      }

      const person = mapPersonRecord(
        {
          ...createdRecord,
          assessment_status: input.assessment?.status ?? createdRecord.assessment_status,
          last_assessment: input.assessment?.lastAssessment ?? createdRecord.last_assessment,
          next_assessment: input.assessment?.nextAssessment ?? createdRecord.next_assessment,
          training_completion: input.assessment?.trainingCompletion ?? createdRecord.training_completion,
          is_psd: input.isPsd ?? createdRecord.is_psd,
          psd_status: input.psdStatus ?? createdRecord.psd_status,
        },
        []
      );

      setState((prev) => ({
        ...prev,
        people: [...prev.people, person],
      }));

      return person.id;
    },
    [activeFirmId],
  );

  const updatePerson = useCallback(async (id: string, updates: Partial<PersonRecord>) => {
    await smcrApi.updatePerson(id, {
      name: updates.name,
      email: updates.email,
      department: updates.department,
      title: updates.title,
      phone: updates.phone,
      address: updates.address,
      lineManager: updates.lineManager,
      startDate: updates.startDate,
      hireDate: updates.hireDate,
      endDate: updates.endDate,
      notes: updates.notes,
      assessmentStatus: updates.assessment?.status,
      lastAssessment: updates.assessment?.lastAssessment,
      nextAssessment: updates.assessment?.nextAssessment,
      trainingCompletion: updates.assessment?.trainingCompletion,
      irn: updates.irn,
      fcaVerification: updates.fcaVerification,
      isPsd: updates.isPsd,
      psdStatus: updates.psdStatus,
    });

    const timestamp = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      people: prev.people.map((person) =>
        person.id === id
          ? {
              ...person,
              ...updates,
              assessment: sanitizeAssessment({
                ...person.assessment,
                ...updates.assessment,
              }),
              updatedAt: timestamp,
            }
          : person,
      ),
    }));
  }, []);

  const removePerson = useCallback(
    async (id: string) => {
      await smcrApi.deletePerson(id);
      setState((prev) => ({
        ...prev,
        people: prev.people.filter((person) => person.id !== id),
        documents: prev.documents.filter((doc) => doc.personId !== id),
        roles: prev.roles.filter((role) => role.personId !== id),
        breaches: prev.breaches.filter((breach) => breach.personId !== id),
      }));
    },
    [],
  );

  const attachDocuments = useCallback(
    async (personId: string, payload: DocumentUploadPayload[]) => {
      if (payload.length === 0) return;
      const createdDocs = await Promise.all(
        payload.map((item) =>
          smcrApi.uploadPersonDocument(personId, {
            file: item.file,
            category: item.category,
            notes: item.notes,
          })
        )
      );

      const mapped = createdDocs.map((doc) => mapDocumentRecord(doc as Record<string, unknown>));

      setState((prev) => ({
        ...prev,
        documents: [...prev.documents, ...mapped],
      }));
    },
    [],
  );

  const removeDocument = useCallback(async (id: string) => {
    await smcrApi.deleteDocument(id);
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }));
  }, []);

  const assignRole = useCallback(async (input: NewRoleInput) => {
    if (!activeFirmId) {
      throw new Error("Select a firm before assigning roles");
    }

    // Check for duplicate or overlapping role assignment
    const newStart = new Date(input.startDate);
    const newEnd = input.endDate ? new Date(input.endDate) : new Date("2099-12-31");

    const overlappingRole = state.roles.find((role) => {
      if (
        role.personId !== input.personId ||
        role.functionId !== input.functionId ||
        role.firmId !== activeFirmId
      ) {
        return false;
      }

      // Check for date range overlap
      const existingStart = new Date(role.startDate);
      const existingEnd = role.endDate ? new Date(role.endDate) : new Date("2099-12-31");

      // Overlap occurs if: newStart <= existingEnd AND newEnd >= existingStart
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (overlappingRole) {
      if (!overlappingRole.endDate) {
        throw new Error("This role is already assigned to this person");
      } else {
        throw new Error("This role assignment overlaps with an existing assignment period");
      }
    }

    const library =
      input.functionType === "SMF"
        ? allSMFs
        : certificationFunctions;
    const found = library.find((item) => item.id === input.functionId);
    const label = found
      ? `${"smf_number" in found ? found.smf_number : found.cf_number} - ${found.title}`
      : input.functionId;
    const roleResponse = await smcrApi.createRole(activeFirmId, {
      personId: input.personId,
      functionId: input.functionId,
      functionType: input.functionType,
      functionLabel: label,
      entity: input.entity,
      startDate: input.startDate,
      endDate: input.endDate,
      assessmentDate: input.assessmentDate,
      approvalStatus: input.approvalStatus,
      notes: input.notes,
    });
    const role = mapRoleRecord(roleResponse as Record<string, unknown>);
    const modules = getTrainingModulesForRole(input.functionId);
    let trainingAdditions: TrainingPlanItem[] = [];
    if (modules.length > 0) {
      const draftItems = buildTrainingPlanItems(role.id, modules);
      const created = await smcrApi.createTrainingItems(
        input.personId,
        draftItems.map((item) => ({
          moduleId: item.moduleId,
          title: item.title,
          required: item.required,
          roleContext: item.roleContext,
          status: item.status,
          dueDate: item.dueDate,
        }))
      );
      const createdItems = Array.isArray(created) ? created : [created];
      trainingAdditions = createdItems.map((item) => mapTrainingItem(item as Record<string, unknown>));
    }

    setState((prev) => {
      const updatedRoles = [...prev.roles, role];
      const updatedPeople = prev.people.map((person) => {
        if (person.id !== input.personId) return person;

        let trainingPlan = person.trainingPlan;
        if (trainingAdditions.length > 0) {
          trainingPlan = mergeTrainingPlan(trainingPlan, trainingAdditions);
        }

        return {
          ...person,
          trainingPlan,
          assessment: {
            ...person.assessment,
            trainingCompletion: calculateTrainingCompletion(trainingPlan),
          },
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...prev,
        roles: updatedRoles,
        people: updatedPeople,
      };
    });
    return role;
  }, [activeFirmId, state.roles]);

  const updateRole = useCallback(async (id: string, updates: Partial<RoleAssignment>) => {
    await smcrApi.updateRole(id, {
      functionLabel: updates.functionLabel,
      entity: updates.entity,
      startDate: updates.startDate,
      endDate: updates.endDate,
      assessmentDate: updates.assessmentDate,
      approvalStatus: updates.approvalStatus,
      notes: updates.notes,
    });

    const timestamp = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((role) =>
        role.id === id
          ? {
              ...role,
              ...updates,
              updatedAt: timestamp,
            }
          : role,
      ),
    }));
  }, []);

  const removeRole = useCallback(async (id: string) => {
    await smcrApi.deleteRole(id);
    setState((prev) => {
      const roleToRemove = prev.roles.find((role) => role.id === id);
      const remainingRoles = prev.roles.filter((role) => role.id !== id);

      const updatedPeople = roleToRemove
        ? prev.people.map((person) => {
            if (person.id !== roleToRemove.personId) return person;
            const trainingPlan = filterTrainingPlanByRole(person.trainingPlan, roleToRemove.id);
            return {
              ...person,
              trainingPlan,
              assessment: {
                ...person.assessment,
                trainingCompletion: calculateTrainingCompletion(trainingPlan),
              },
            };
          })
        : prev.people;

      return {
        ...prev,
        roles: remainingRoles,
        people: updatedPeople,
      };
    });
  }, []);

  const launchWorkflow = useCallback(async (input: WorkflowLaunchInput) => {
    if (!activeFirmId) {
      throw new Error("Select a firm before launching workflows");
    }
    const template = getWorkflowTemplate(input.templateId);
    if (!template) {
      throw new Error(`Workflow template ${input.templateId} not found`);
    }

    const owner = input.ownerPersonId ? state.people.find((person) => person.id === input.ownerPersonId) : undefined;

    const steps: WorkflowStepInstance[] = template.steps.map((step) => {
      const fpChecklist = step.id === "generate-fp-checklist" ? createDefaultFpChecklistDraft() : undefined;
      const referenceRequest = step.id === "request-reg-references" ? createDefaultReferenceRequestDraft() : undefined;
      const criminalCheck = step.id === "schedule-criminal-check" ? createDefaultCriminalCheckDraft() : undefined;
      const trainingPlan = step.id === "create-training-plan" ? createDefaultTrainingPlanDraft() : undefined;
      const statementOfResponsibilities = step.id === "draft-sor" ? createDefaultStatementOfResponsibilitiesDraft() : undefined;
      return {
        id: createId("wfstep"),
        templateStepId: step.id,
        title: step.title,
        description: step.description,
        expectedEvidence: step.expectedEvidence,
        status: "pending",
        form: step.form?.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          helperText: field.helperText,
          options: field.options,
          value:
            field.type === "boolean"
              ? false
              : field.type === "select"
              ? field.required
                ? ""
                : field.options?.[0]?.value ?? ""
              : "",
        })),
        checklist: step.checklist?.map((item, index) => ({
          id: `${step.id}-check-${index}`,
          text: item,
          completed: false,
        })),
        fpChecklist,
        referenceRequest,
        criminalCheck,
        trainingPlan,
        statementOfResponsibilities,
      };
    });

      const workflowResponse = await smcrApi.createWorkflow(activeFirmId, {
        templateId: template.id,
        name: input.customName?.trim() || template.title,
        summary: template.summary,
        ownerPersonId: owner?.id,
        ownerName: owner?.name,
        dueDate: input.dueDate,
        steps,
        successCriteria: template.successCriteria,
        triggerEvent: template.trigger,
      });

    const workflow = mapWorkflowRecord(workflowResponse as Record<string, unknown>);

    setState((prev) => ({
      ...prev,
      workflows: [...prev.workflows, workflow],
    }));

    return workflow;
  }, [state.people, activeFirmId]);

  const updateWorkflowStep = useCallback(async ({ workflowId, stepId, status, notes }: WorkflowStepUpdateInput) => {
    const timestamp = new Date().toISOString();
    let updatedSteps: WorkflowStepInstance[] | null = null;
    let nextStatus: WorkflowStatus | null = null;

    setState((prev) => {
      const updatedWorkflows = prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;

        const steps = workflow.steps.map((step) => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            status: status ?? step.status,
            notes: notes ?? step.notes,
            completedAt: status === "completed" ? timestamp : status ? undefined : step.completedAt,
          };
        });

        const totalSteps = steps.length;
        const completedSteps = steps.filter((step) => step.status === "completed").length;

        let workflowStatus: WorkflowStatus = "not_started";
        if (completedSteps === totalSteps && totalSteps > 0) {
          workflowStatus = "completed";
        } else if (completedSteps > 0) {
          workflowStatus = "in_progress";
        }

        updatedSteps = steps;
        nextStatus = workflowStatus;

        return {
          ...workflow,
          steps,
          status: workflowStatus,
        };
      });

      return {
        ...prev,
        workflows: updatedWorkflows,
      };
    });

    if (updatedSteps) {
      await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps, status: nextStatus });
    }
  }, []);

  const removeWorkflow = useCallback(async (id: string) => {
    await smcrApi.deleteWorkflow(id);
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.filter((workflow) => workflow.id !== id),
      workflowDocuments: prev.workflowDocuments.filter((doc) => doc.workflowId !== id),
    }));
  }, []);

  const attachWorkflowEvidence = useCallback(async (workflowId: string, stepId: string, file: File) => {
    const workflow = state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }
    const lowerName = file.name.toLowerCase();
    let summary = "Awaiting review";
    if (lowerName.includes("dbs")) {
      summary = "Detected DBS certificate";
    } else if (lowerName.includes("cv") || lowerName.includes("resume")) {
      summary = "Detected CV/Resume";
    } else if (lowerName.includes("reference")) {
      summary = "Detected regulatory reference";
    }

    const uploaded = await smcrApi.uploadWorkflowDocument(workflowId, {
      file,
      stepId,
      summary,
      status: summary === "Awaiting review" ? "pending" : "reviewed",
    });
    const document = mapWorkflowDocumentRecord(uploaded as Record<string, unknown>);

    setState((prev) => ({
      ...prev,
      workflowDocuments: [...prev.workflowDocuments, document],
    }));

    return document;
  }, [state.workflows]);

  const removeWorkflowEvidence = useCallback(async (id: string) => {
    await smcrApi.deleteDocument(id);
    setState((prev) => ({
      ...prev,
      workflowDocuments: prev.workflowDocuments.filter((doc) => doc.id !== id),
    }));
  }, []);

  const updateWorkflowField = useCallback(
    async ({ workflowId, stepId, fieldId, value }: WorkflowFieldUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.form) return step;
            return {
              ...step,
              form: step.form.map((field) =>
                field.id === fieldId
                  ? {
                      ...field,
                      value,
                    }
                  : field,
              ),
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateWorkflowChecklist = useCallback(
    async ({ workflowId, stepId, checklistId, completed }: WorkflowChecklistUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.checklist) return step;
            return {
              ...step,
              checklist: step.checklist.map((item) =>
                item.id === checklistId
                  ? {
                      ...item,
                      completed,
                    }
                  : item,
              ),
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateFpChecklist = useCallback(
    async ({ workflowId, stepId, updater }: FpChecklistUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.fpChecklist) return step;
            const nextDraft = updater(step.fpChecklist);
            return {
              ...step,
              fpChecklist: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateReferenceRequest = useCallback(
    async ({ workflowId, stepId, updater }: ReferenceRequestUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.referenceRequest) return step;
            const nextDraft = updater(step.referenceRequest);
            return {
              ...step,
              referenceRequest: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateCriminalCheck = useCallback(
    async ({ workflowId, stepId, updater }: CriminalCheckUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.criminalCheck) return step;
            const nextDraft = updater(step.criminalCheck);
            return {
              ...step,
              criminalCheck: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateTrainingPlan = useCallback(
    async ({ workflowId, stepId, updater }: TrainingPlanUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.trainingPlan) return step;
            const nextDraft = updater(step.trainingPlan);
            return {
              ...step,
              trainingPlan: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateStatementOfResponsibilities = useCallback(
    async ({ workflowId, stepId, updater }: StatementOfResponsibilitiesUpdateInput) => {
      let updatedSteps: WorkflowStepInstance[] | null = null;
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          const steps = workflow.steps.map((step) => {
            if (step.id !== stepId || !step.statementOfResponsibilities) return step;
            const nextDraft = updater(step.statementOfResponsibilities);
            return {
              ...step,
              statementOfResponsibilities: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          });
          updatedSteps = steps;
          return {
            ...workflow,
            steps,
          };
        }),
      }));
      if (updatedSteps) {
        await smcrApi.updateWorkflow(workflowId, { steps: updatedSteps });
      }
    },
    [],
  );

  const updateTrainingItemStatus = useCallback(
    async (personId: string, itemId: string, status: TrainingStatus) => {
      await smcrApi.updateTrainingItem(personId, { id: itemId, status });
      setState((prev) => ({
        ...prev,
        people: prev.people.map((person) => {
          if (person.id !== personId) return person;
          const trainingPlan = person.trainingPlan.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status,
                }
              : item,
          );
          return {
            ...person,
            trainingPlan,
            assessment: {
              ...person.assessment,
              trainingCompletion: calculateTrainingCompletion(trainingPlan),
            },
          };
        }),
      }));
    },
    [],
  );

  const startAssessment = useCallback(
    async (input: NewAssessmentInput) => {
      if (!activeFirmId) {
        throw new Error("Select a firm before starting assessments");
      }
      const person = state.people.find((p) => p.id === input.personId);
      if (!person) {
        throw new Error(`Person with id ${input.personId} not found`);
      }

      const responses: FitnessAssessmentResponse[] = getAllFitnessQuestions().map((question) => ({
        questionId: question.id,
        value: question.type === "text" ? "" : null,
        notes: "",
      }));

      const assessmentResponse = await smcrApi.createAssessment(activeFirmId, {
        personId: person.id,
        personName: person.name,
        personRole: person.title,
        assessmentDate: input.assessmentDate,
        nextDueDate: input.nextDueDate,
        reviewer: input.reviewer,
        responses,
      });

      const assessment = mapAssessmentRecord(assessmentResponse as Record<string, unknown>);

      await smcrApi.updatePerson(person.id, {
        assessmentStatus: "due",
        lastAssessment: input.assessmentDate ?? person.assessment.lastAssessment,
        nextAssessment: input.nextDueDate ?? person.assessment.nextAssessment,
      });

      setState((prev) => ({
        ...prev,
        assessments: [...prev.assessments, assessment],
        people: prev.people.map((p) =>
          p.id === person.id
            ? {
                ...p,
                assessment: {
                  ...p.assessment,
                  status: "due",
                  lastAssessment: input.assessmentDate ?? p.assessment.lastAssessment,
                  nextAssessment: input.nextDueDate ?? p.assessment.nextAssessment,
                },
              }
            : p,
        ),
      }));

      return assessment;
    },
    [state.people, activeFirmId],
  );

  const updateAssessmentResponse = useCallback(
    async ({ assessmentId, questionId, value, notes }: AssessmentResponseUpdate) => {
      let updatedResponses: FitnessAssessmentResponse[] | null = null;
      const timestamp = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        assessments: prev.assessments.map((record) => {
          if (record.id !== assessmentId) return record;
          const responses = record.responses.map((response) =>
            response.questionId === questionId
              ? {
                  ...response,
                  value,
                  notes: notes ?? response.notes,
                }
              : response,
          );
          updatedResponses = responses;
          return {
            ...record,
            responses,
            updatedAt: timestamp,
          };
        }),
      }));

      if (updatedResponses) {
        await smcrApi.updateAssessment(assessmentId, { responses: updatedResponses });
      }
    },
    [],
  );

  const updateAssessmentStatus = useCallback(
    async ({ assessmentId, status, overallDetermination, conditions, assessmentDate, nextDueDate, reviewer }: AssessmentStatusUpdate) => {
      const timestamp = new Date().toISOString();
      let personId: string | null = null;

      setState((prev) => {
        let updatedAssessment: FitnessAssessmentRecord | undefined;

        const updatedAssessments = prev.assessments.map((record) => {
          if (record.id !== assessmentId) return record;
          const nextRecord: FitnessAssessmentRecord = {
            ...record,
            status,
            overallDetermination: overallDetermination ?? record.overallDetermination,
            conditions: conditions ?? record.conditions,
            assessmentDate: assessmentDate ?? record.assessmentDate,
            nextDueDate: nextDueDate ?? record.nextDueDate,
            reviewer: reviewer ?? record.reviewer,
            updatedAt: timestamp,
          };
          updatedAssessment = nextRecord;
          return nextRecord;
        });

        let updatedPeople = prev.people;
        if (updatedAssessment) {
          personId = updatedAssessment.personId;
          updatedPeople = prev.people.map((person) => {
            if (person.id !== updatedAssessment!.personId) return person;

            let nextStatus = person.assessment.status;
            if (status === "completed") {
              if (updatedAssessment!.overallDetermination === "Fit and Proper") {
                nextStatus = "current";
              } else if (updatedAssessment!.overallDetermination === "Conditional") {
                nextStatus = "due";
              } else if (updatedAssessment!.overallDetermination === "Not Fit and Proper") {
                nextStatus = "overdue";
              }
            } else if (status === "in_review") {
              nextStatus = "due";
            }

            return {
              ...person,
              assessment: {
                ...person.assessment,
                status: nextStatus,
                lastAssessment: updatedAssessment!.assessmentDate ?? person.assessment.lastAssessment,
                nextAssessment: updatedAssessment!.nextDueDate ?? person.assessment.nextAssessment,
              },
            };
          });
        }

        return {
          ...prev,
          assessments: updatedAssessments,
          people: updatedPeople,
        };
      });

      await smcrApi.updateAssessment(assessmentId, {
        status,
        overall_determination: overallDetermination,
        conditions,
        assessment_date: assessmentDate,
        next_due_date: nextDueDate,
        reviewer,
      });

      if (personId) {
        await smcrApi.updatePerson(personId, {
          assessmentStatus: status === "completed" ? "current" : status === "in_review" ? "due" : undefined,
          lastAssessment: assessmentDate,
          nextAssessment: nextDueDate,
        });
      }
    },
    [],
  );

  const removeAssessment = useCallback(async (id: string) => {
    await smcrApi.deleteAssessment(id);
    setState((prev) => ({
      ...prev,
      assessments: prev.assessments.filter((record) => record.id !== id),
    }));
  }, []);

  // Breach management functions
  const addBreach = useCallback(
    async (input: NewBreachInput): Promise<ConductBreach> => {
      if (!activeFirmId) {
        throw new Error("No active firm selected");
      }
      const timestamp = new Date().toISOString();
      const timeline = [
        {
          id: createId("timeline"),
          date: timestamp,
          action: "Breach Reported",
          description: `Breach of ${input.ruleName} reported for ${input.personName}`,
        },
      ];

      const breachResponse = await smcrApi.createBreach(activeFirmId, {
        person_id: input.personId,
        rule_id: input.ruleId,
        severity: input.severity,
        status: "open",
        timeline,
        details: {
          personName: input.personName,
          ruleName: input.ruleName,
          dateIdentified: input.dateIdentified,
          dateOccurred: input.dateOccurred,
          description: input.description,
        },
      });

      const breach = mapBreachRecord(breachResponse as Record<string, unknown>);

      setState((prev) => ({
        ...prev,
        breaches: [...prev.breaches, breach],
      }));

      return breach;
    },
    [activeFirmId],
  );

  const updateBreach = useCallback(async (id: string, updates: Partial<ConductBreach>) => {
    await smcrApi.updateBreach(id, {
      person_id: updates.personId,
      rule_id: updates.ruleId,
      severity: updates.severity,
      status: updates.status,
      timeline: updates.timeline,
      details: {
        personName: updates.personName,
        ruleName: updates.ruleName,
        dateIdentified: updates.dateIdentified,
        dateOccurred: updates.dateOccurred,
        description: updates.description,
        investigator: updates.investigator,
        findings: updates.findings,
        recommendations: updates.recommendations,
        disciplinaryAction: updates.disciplinaryAction,
        trainingRequired: updates.trainingRequired,
        fcaNotification: updates.fcaNotification,
        fcaNotificationDate: updates.fcaNotificationDate,
        resolutionDate: updates.resolutionDate,
        lessonsLearned: updates.lessonsLearned,
      },
    });

    setState((prev) => ({
      ...prev,
      breaches: prev.breaches.map((breach) =>
        breach.id === id
          ? { ...breach, ...updates, updatedAt: new Date().toISOString() }
          : breach
      ),
    }));
  }, []);

  const addBreachTimelineEntry = useCallback(
    async (breachId: string, entry: Omit<BreachTimelineEntry, "id">) => {
      const updated = await smcrApi.addBreachTimelineEntry(breachId, entry as Record<string, unknown>);
      const mapped = mapBreachRecord(updated as Record<string, unknown>);
      setState((prev) => ({
        ...prev,
        breaches: prev.breaches.map((breach) =>
          breach.id === breachId ? mapped : breach
        ),
      }));
    },
    [],
  );

  const removeBreach = useCallback(async (id: string) => {
    await smcrApi.deleteBreach(id);
    setState((prev) => ({
      ...prev,
      breaches: prev.breaches.filter((breach) => breach.id !== id),
    }));
  }, []);

  const addGroupEntity = useCallback(async (input: Omit<GroupEntity, "id">): Promise<GroupEntity> => {
    const created = await smcrApi.createGroupEntity({
      name: input.name,
      type: input.type,
      parentId: input.parentId,
      ownershipPercent: input.ownershipPercent,
      country: input.country,
      linkedFirmId: input.linkedFirmId,
      linkedProjectId: input.linkedProjectId,
      linkedProjectName: input.linkedProjectName,
      regulatoryStatus: input.regulatoryStatus,
      isExternal: input.isExternal,
    });
    const entity = mapGroupEntityRecord(created as Record<string, unknown>);
    setState((prev) => ({
      ...prev,
      groupEntities: [...prev.groupEntities, entity],
    }));
    return entity;
  }, []);

  const updateGroupEntity = useCallback(async (id: string, updates: Partial<GroupEntity>) => {
    await smcrApi.updateGroupEntity(id, {
      name: updates.name,
      type: updates.type,
      parentId: updates.parentId,
      ownershipPercent: updates.ownershipPercent,
      country: updates.country,
      linkedFirmId: updates.linkedFirmId,
      linkedProjectId: updates.linkedProjectId,
      linkedProjectName: updates.linkedProjectName,
      regulatoryStatus: updates.regulatoryStatus,
      isExternal: updates.isExternal,
    });
    setState((prev) => ({
      ...prev,
      groupEntities: prev.groupEntities.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const removeGroupEntity = useCallback(async (id: string) => {
    await smcrApi.deleteGroupEntity(id);
    setState((prev) => ({
      ...prev,
      groupEntities: prev.groupEntities.filter((e) => e.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<SmcrSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const value = useMemo<SmcrContextValue>(
    () => ({
      state,
      isReady,
      firms,
      activeFirmId,
      setActiveFirm,
      addFirm,
      linkAuthorizationProject,
      unlinkAuthorizationProject,
      addPerson,
      updatePerson,
      removePerson,
      attachDocuments,
      removeDocument,
      assignRole,
      updateRole,
      removeRole,
      launchWorkflow,
      updateWorkflowStep,
      removeWorkflow,
      attachWorkflowEvidence,
      removeWorkflowEvidence,
      updateWorkflowField,
      updateWorkflowChecklist,
      updateFpChecklist,
      updateReferenceRequest,
      updateCriminalCheck,
      updateTrainingPlan,
      updateStatementOfResponsibilities,
      updateTrainingItemStatus,
      startAssessment,
      updateAssessmentResponse,
      updateAssessmentStatus,
      removeAssessment,
      addBreach,
      updateBreach,
      addBreachTimelineEntry,
      removeBreach,
      groupEntities: state.groupEntities,
      addGroupEntity,
      updateGroupEntity,
      removeGroupEntity,
      updateSettings,
    }),
    [
      state,
      isReady,
      firms,
      activeFirmId,
      setActiveFirm,
      addFirm,
      linkAuthorizationProject,
      unlinkAuthorizationProject,
      addPerson,
      updatePerson,
      removePerson,
      attachDocuments,
      removeDocument,
      assignRole,
      updateRole,
      removeRole,
      launchWorkflow,
      updateWorkflowStep,
      removeWorkflow,
      attachWorkflowEvidence,
      removeWorkflowEvidence,
      updateWorkflowField,
      updateWorkflowChecklist,
      updateFpChecklist,
      updateReferenceRequest,
      updateCriminalCheck,
      updateTrainingPlan,
      updateStatementOfResponsibilities,
      updateTrainingItemStatus,
      startAssessment,
      updateAssessmentResponse,
      updateAssessmentStatus,
      removeAssessment,
      addBreach,
      updateBreach,
      addBreachTimelineEntry,
      removeBreach,
      addGroupEntity,
      updateGroupEntity,
      removeGroupEntity,
      updateSettings,
    ],
  );

  return <SmcrDataContext.Provider value={value}>{children}</SmcrDataContext.Provider>;
}

export function useSmcrData() {
  const context = useContext(SmcrDataContext);
  if (!context) {
    throw new Error("useSmcrData must be used within a SmcrDataProvider");
  }
  return context;
}
