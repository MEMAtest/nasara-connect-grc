"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { persistDocumentBlob, removeDocumentBlob } from "../utils/document-storage";
import { allSMFs, certificationFunctions, prescribedResponsibilities } from "../data/core-functions";
import { getWorkflowTemplate, WorkflowFieldDefinition } from "../data/workflow-templates";
import { getAllFitnessQuestions } from "../data/fitness-framework";
import { getTrainingModulesForRole, TrainingModuleDefinition, TrainingStatus } from "../data/role-training";

export type DocumentCategory = "cv" | "dbs" | "reference" | "qualification" | "id" | "other";

type AssessmentStatus = "current" | "due" | "overdue" | "not_required";

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

const STORAGE_KEY = "smcr-data-v1";

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
  addFirm: (name: string) => string;
  linkAuthorizationProject: (firmId: string, projectId: string, projectName: string) => void;
  unlinkAuthorizationProject: (firmId: string) => void;
  addPerson: (input: NewPersonInput) => string;
  updatePerson: (id: string, updates: Partial<PersonRecord>) => void;
  removePerson: (id: string) => Promise<void>;
  attachDocuments: (personId: string, payload: DocumentUploadPayload[]) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  assignRole: (input: NewRoleInput) => RoleAssignment;
  updateRole: (id: string, updates: Partial<RoleAssignment>) => void;
  removeRole: (id: string) => void;
  launchWorkflow: (input: WorkflowLaunchInput) => WorkflowInstance;
  updateWorkflowStep: (input: WorkflowStepUpdateInput) => void;
  removeWorkflow: (id: string) => void;
  attachWorkflowEvidence: (workflowId: string, stepId: string, file: File) => Promise<WorkflowDocument>;
  removeWorkflowEvidence: (id: string) => Promise<void>;
  updateWorkflowField: (input: WorkflowFieldUpdateInput) => void;
  updateWorkflowChecklist: (input: WorkflowChecklistUpdateInput) => void;
  updateFpChecklist: (input: FpChecklistUpdateInput) => void;
  updateReferenceRequest: (input: ReferenceRequestUpdateInput) => void;
  updateCriminalCheck: (input: CriminalCheckUpdateInput) => void;
  updateTrainingPlan: (input: TrainingPlanUpdateInput) => void;
  updateStatementOfResponsibilities: (input: StatementOfResponsibilitiesUpdateInput) => void;
  updateTrainingItemStatus: (personId: string, itemId: string, status: TrainingStatus) => void;
  startAssessment: (input: NewAssessmentInput) => FitnessAssessmentRecord;
  updateAssessmentResponse: (input: AssessmentResponseUpdate) => void;
  updateAssessmentStatus: (input: AssessmentStatusUpdate) => void;
  removeAssessment: (id: string) => void;
  // Breach management
  addBreach: (input: NewBreachInput) => ConductBreach;
  updateBreach: (id: string, updates: Partial<ConductBreach>) => void;
  addBreachTimelineEntry: (breachId: string, entry: Omit<BreachTimelineEntry, "id">) => void;
  removeBreach: (id: string) => void;
  // Group entities
  groupEntities: GroupEntity[];
  addGroupEntity: (input: Omit<GroupEntity, "id">) => GroupEntity;
  updateGroupEntity: (id: string, updates: Partial<GroupEntity>) => void;
  removeGroupEntity: (id: string) => void;
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

export function SmcrDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SmcrDataState>(emptyState);
  const [isReady, setIsReady] = useState(false);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [activeFirmId, setActiveFirmId] = useState<string | null>(null);
  const isInitialised = useRef(false);

  useEffect(() => {
    if (!isInitialised.current && typeof window !== "undefined") {
      isInitialised.current = true;
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && "data" in parsed && "firms" in parsed) {
            const snapshot = parsed as { data: SmcrDataState; firms: Firm[]; activeFirmId: string | null };
            setState({
              people: (snapshot.data.people ?? []).map((person) => ({
                ...person,
                trainingPlan: person.trainingPlan ?? [],
                assessment: sanitizeAssessment(person.assessment),
              })),
              documents: snapshot.data.documents ?? [],
              roles: snapshot.data.roles ?? [],
              workflows: snapshot.data.workflows ?? [],
              workflowDocuments: snapshot.data.workflowDocuments ?? [],
              assessments: snapshot.data.assessments ?? [],
              breaches: snapshot.data.breaches ?? [],
              groupEntities: (snapshot.data as Partial<SmcrDataState>).groupEntities ?? [],
              settings: { ...defaultSettings, ...snapshot.data.settings },
            });
            setFirms(snapshot.firms ?? []);
            setActiveFirmId(snapshot.activeFirmId ?? snapshot.firms?.[0]?.id ?? null);
          } else if (parsed && typeof parsed === "object" && "people" in parsed) {
            const legacy = parsed as SmcrDataState;
            const defaultFirmId = createId("firm");
            const defaultFirm: Firm = {
              id: defaultFirmId,
              name: "Default Firm",
              createdAt: new Date().toISOString(),
            };
            setState({
              people: (legacy.people ?? []).map((person) => ({
                ...person,
                firmId: (person as PersonRecord).firmId ?? defaultFirmId,
                trainingPlan: (person as PersonRecord).trainingPlan ?? [],
                assessment: sanitizeAssessment(person.assessment),
              })),
              documents: legacy.documents ?? [],
              roles: (legacy.roles ?? []).map((role) => ({
                ...role,
                firmId: (role as RoleAssignment).firmId ?? defaultFirmId,
              })),
              workflows: (legacy.workflows ?? []).map((workflow) => ({
                ...workflow,
                firmId: (workflow as WorkflowInstance).firmId ?? defaultFirmId,
              })),
              workflowDocuments: (legacy.workflowDocuments ?? []).map((doc) => ({
                ...doc,
                firmId: (doc as WorkflowDocument).firmId ?? defaultFirmId,
              })),
              assessments: (legacy.assessments ?? []).map((assessment) => ({
                ...assessment,
                firmId: (assessment as FitnessAssessmentRecord).firmId ?? defaultFirmId,
              })),
              breaches: ((legacy as unknown as { breaches?: ConductBreach[] }).breaches ?? []).map((breach) => ({
                ...breach,
                firmId: breach.firmId ?? defaultFirmId,
              })),
              groupEntities: [],
              settings: defaultSettings,
            });
            setFirms([defaultFirm]);
            setActiveFirmId(defaultFirmId);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to hydrate SMCR store from localStorage", error);
        }
      } finally {
        setIsReady(true);
      }
    } else if (typeof window === "undefined") {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data: state, firms, activeFirmId }),
      );
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to persist SMCR store to localStorage", error);
      }
    }
  }, [state, firms, activeFirmId, isReady]);

  const generateEmployeeId = useCallback(() => {
    const maxCurrent = state.people.reduce((acc, person) => {
      const match = person.employeeId.match(/EMP(\d+)/i);
      if (!match) return acc;
      const parsed = parseInt(match[1], 10);
      return Number.isNaN(parsed) ? acc : Math.max(acc, parsed);
    }, 0);
    const nextNumber = String(maxCurrent + 1).padStart(3, "0");
    return `EMP${nextNumber}`;
  }, [state.people]);

  const addFirm = useCallback((name: string) => {
    const trimmed = name.trim() || "Unnamed Firm";
    const newFirm: Firm = {
      id: createId("firm"),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    setFirms((prev) => [...prev, newFirm]);
    setActiveFirmId(newFirm.id);
    return newFirm.id;
  }, []);

  const setActiveFirm = useCallback((id: string) => {
    setActiveFirmId(id);
  }, []);

  const linkAuthorizationProject = useCallback(
    (firmId: string, projectId: string, projectName: string) => {
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

  const unlinkAuthorizationProject = useCallback((firmId: string) => {
    setFirms((prev) =>
      prev.map((firm) =>
        firm.id === firmId
          ? { ...firm, authorizationProjectId: undefined, authorizationProjectName: undefined }
          : firm
      )
    );
  }, []);

  const addPerson = useCallback(
    (input: NewPersonInput) => {
      if (!activeFirmId) {
        throw new Error("Select a firm before adding a person");
      }
      const id = createId("person");
      const timestamp = new Date().toISOString();
      const employeeId = generateEmployeeId();
      setState((prev) => ({
        ...prev,
        people: [
          ...prev.people,
          {
            id,
            firmId: activeFirmId,
            employeeId,
            name: input.name.trim(),
            email: input.email.trim(),
            department: input.department,
            title: input.title?.trim() || undefined,
            phone: input.phone?.trim() || undefined,
            address: input.address?.trim() || undefined,
            lineManager: input.lineManager?.trim() || undefined,
            irn: input.irn?.trim() || undefined,
            startDate: input.startDate,
            hireDate: input.hireDate ?? input.startDate,
            endDate: input.endDate,
            assessment: sanitizeAssessment(input.assessment),
            createdAt: timestamp,
            updatedAt: timestamp,
            trainingPlan: [],
          },
        ],
      }));
      return id;
    },
    [generateEmployeeId, activeFirmId],
  );

  const updatePerson = useCallback((id: string, updates: Partial<PersonRecord>) => {
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
      const documentsToRemove = state.documents.filter((doc) => doc.personId === id);
      setState((prev) => ({
        ...prev,
        people: prev.people.filter((person) => person.id !== id),
        documents: prev.documents.filter((doc) => doc.personId !== id),
        roles: prev.roles.filter((role) => role.personId !== id),
        breaches: prev.breaches.filter((breach) => breach.personId !== id),
      }));
      await Promise.all(documentsToRemove.map((doc) => removeDocumentBlob(doc.id)));
    },
    [state.documents],
  );

  const attachDocuments = useCallback(
    async (personId: string, payload: DocumentUploadPayload[]) => {
      if (payload.length === 0) return;
      const timestamp = new Date().toISOString();
      const newDocuments: DocumentMetadata[] = [];

      for (const item of payload) {
        const docId = createId("doc");
        await persistDocumentBlob(docId, item.file);
        newDocuments.push({
          id: docId,
          personId,
          category: item.category,
          name: item.file.name,
          type: item.file.type || "application/octet-stream",
          size: item.file.size,
          uploadedAt: timestamp,
          notes: item.notes,
        });
      }

      setState((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments],
      }));
    },
    [],
  );

  const removeDocument = useCallback(async (id: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }));
    await removeDocumentBlob(id);
  }, []);

  const assignRole = useCallback((input: NewRoleInput) => {
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
    const timestamp = new Date().toISOString();
    const role: RoleAssignment = {
      id: createId("role"),
       firmId: activeFirmId,
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
      assignedAt: timestamp,
      updatedAt: timestamp,
    };
    const modules = getTrainingModulesForRole(input.functionId);

    setState((prev) => {
      const updatedRoles = [...prev.roles, role];
      const updatedPeople = prev.people.map((person) => {
        if (person.id !== input.personId) return person;

        let trainingPlan = person.trainingPlan;
        if (modules.length > 0) {
          const additions = buildTrainingPlanItems(role.id, modules);
          trainingPlan = mergeTrainingPlan(trainingPlan, additions);
        }

        return {
          ...person,
          trainingPlan,
          assessment: {
            ...person.assessment,
            trainingCompletion: calculateTrainingCompletion(trainingPlan),
          },
          updatedAt: timestamp,
        };
      });

      return {
        ...prev,
        roles: updatedRoles,
        people: updatedPeople,
      };
    });
    return role;
  }, [activeFirmId]);

  const updateRole = useCallback((id: string, updates: Partial<RoleAssignment>) => {
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

  const removeRole = useCallback((id: string) => {
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

  const launchWorkflow = useCallback((input: WorkflowLaunchInput) => {
    if (!activeFirmId) {
      throw new Error("Select a firm before launching workflows");
    }
    const template = getWorkflowTemplate(input.templateId);
    if (!template) {
      throw new Error(`Workflow template ${input.templateId} not found`);
    }

    const owner = input.ownerPersonId ? state.people.find((person) => person.id === input.ownerPersonId) : undefined;
    const timestamp = new Date().toISOString();

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

    const workflow: WorkflowInstance = {
      id: createId("workflow"),
      firmId: activeFirmId,
      templateId: template.id,
      name: input.customName?.trim() || template.title,
      summary: template.summary,
      ownerPersonId: owner?.id,
      ownerName: owner?.name,
      launchedAt: timestamp,
      dueDate: input.dueDate,
      status: "not_started",
      steps,
      successCriteria: template.successCriteria,
      trigger: template.trigger,
    };

    setState((prev) => ({
      ...prev,
      workflows: [...prev.workflows, workflow],
    }));

    return workflow;
  }, [state.people, activeFirmId]);

  const updateWorkflowStep = useCallback(({ workflowId, stepId, status, notes }: WorkflowStepUpdateInput) => {
    const timestamp = new Date().toISOString();
    setState((prev) => {
      const updatedWorkflows = prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;

        const updatedSteps = workflow.steps.map((step) => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            status: status ?? step.status,
            notes: notes ?? step.notes,
            completedAt: status === "completed" ? timestamp : status ? undefined : step.completedAt,
          };
        });

        const totalSteps = updatedSteps.length;
        const completedSteps = updatedSteps.filter((step) => step.status === "completed").length;

        let workflowStatus: WorkflowStatus = "not_started";
        if (completedSteps === totalSteps && totalSteps > 0) {
          workflowStatus = "completed";
        } else if (completedSteps > 0) {
          workflowStatus = "in_progress";
        }

        return {
          ...workflow,
          steps: updatedSteps,
          status: workflowStatus,
        };
      });

      return {
        ...prev,
        workflows: updatedWorkflows,
      };
    });
  }, []);

  const removeWorkflow = useCallback((id: string) => {
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
    const docId = createId("wdoc");
    await persistDocumentBlob(docId, file);
    const timestamp = new Date().toISOString();
    const lowerName = file.name.toLowerCase();
    let summary = "Awaiting review";
    if (lowerName.includes("dbs")) {
      summary = "Detected DBS certificate";
    } else if (lowerName.includes("cv") || lowerName.includes("resume")) {
      summary = "Detected CV/Resume";
    } else if (lowerName.includes("reference")) {
      summary = "Detected regulatory reference";
    }

    const document: WorkflowDocument = {
      id: docId,
      firmId: workflow.firmId,
      workflowId,
      stepId,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: timestamp,
      status: summary === "Awaiting review" ? "pending" : "reviewed",
      summary,
    };

    setState((prev) => ({
      ...prev,
      workflowDocuments: [...prev.workflowDocuments, document],
    }));

    return document;
  }, [state.workflows]);

  const removeWorkflowEvidence = useCallback(async (id: string) => {
    setState((prev) => ({
      ...prev,
      workflowDocuments: prev.workflowDocuments.filter((doc) => doc.id !== id),
    }));
    await removeDocumentBlob(id);
  }, []);

  const updateWorkflowField = useCallback(({ workflowId, stepId, fieldId, value }: WorkflowFieldUpdateInput) => {
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          steps: workflow.steps.map((step) => {
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
          }),
        };
      }),
    }));
  }, []);

  const updateWorkflowChecklist = useCallback(({ workflowId, stepId, checklistId, completed }: WorkflowChecklistUpdateInput) => {
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          steps: workflow.steps.map((step) => {
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
          }),
        };
      }),
    }));
  }, []);

  const updateFpChecklist = useCallback(({ workflowId, stepId, updater }: FpChecklistUpdateInput) => {
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          steps: workflow.steps.map((step) => {
            if (step.id !== stepId || !step.fpChecklist) return step;
            const nextDraft = updater(step.fpChecklist);
            return {
              ...step,
              fpChecklist: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          }),
        };
      }),
    }));
  }, []);

  const updateReferenceRequest = useCallback(({ workflowId, stepId, updater }: ReferenceRequestUpdateInput) => {
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          steps: workflow.steps.map((step) => {
            if (step.id !== stepId || !step.referenceRequest) return step;
            const nextDraft = updater(step.referenceRequest);
            return {
              ...step,
              referenceRequest: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          }),
        };
      }),
    }));
  }, []);

  const updateCriminalCheck = useCallback(({ workflowId, stepId, updater }: CriminalCheckUpdateInput) => {
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          steps: workflow.steps.map((step) => {
            if (step.id !== stepId || !step.criminalCheck) return step;
            const nextDraft = updater(step.criminalCheck);
            return {
              ...step,
              criminalCheck: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          }),
        };
      }),
    }));
  }, []);

  const updateTrainingPlan = useCallback(({ workflowId, stepId, updater }: TrainingPlanUpdateInput) => {
    setState((prev) => ({
      ...prev,
      workflows: prev.workflows.map((workflow) => {
        if (workflow.id !== workflowId) return workflow;
        return {
          ...workflow,
          steps: workflow.steps.map((step) => {
            if (step.id !== stepId || !step.trainingPlan) return step;
            const nextDraft = updater(step.trainingPlan);
            return {
              ...step,
              trainingPlan: {
                ...nextDraft,
                lastUpdated: new Date().toISOString(),
              },
            };
          }),
        };
      }),
    }));
  }, []);

  const updateStatementOfResponsibilities = useCallback(
    ({ workflowId, stepId, updater }: StatementOfResponsibilitiesUpdateInput) => {
      setState((prev) => ({
        ...prev,
        workflows: prev.workflows.map((workflow) => {
          if (workflow.id !== workflowId) return workflow;
          return {
            ...workflow,
            steps: workflow.steps.map((step) => {
              if (step.id !== stepId || !step.statementOfResponsibilities) return step;
              const nextDraft = updater(step.statementOfResponsibilities);
              return {
                ...step,
                statementOfResponsibilities: {
                  ...nextDraft,
                  lastUpdated: new Date().toISOString(),
                },
              };
            }),
          };
        }),
      }));
    },
    [],
  );

  const updateTrainingItemStatus = useCallback((personId: string, itemId: string, status: TrainingStatus) => {
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
  }, []);

  const startAssessment = useCallback((input: NewAssessmentInput) => {
    if (!activeFirmId) {
      throw new Error("Select a firm before starting assessments");
    }
    const person = state.people.find((p) => p.id === input.personId);
    if (!person) {
      throw new Error(`Person with id ${input.personId} not found`);
    }

    const timestamp = new Date().toISOString();
    const responses: FitnessAssessmentResponse[] = getAllFitnessQuestions().map((question) => ({
      questionId: question.id,
      value: question.type === "text" ? "" : null,
      notes: "",
    }));

    const assessment: FitnessAssessmentRecord = {
      id: createId("assessment"),
      firmId: person.firmId,
      personId: person.id,
      personName: person.name,
      personRole: person.title,
      status: "draft",
      assessmentDate: input.assessmentDate,
      nextDueDate: input.nextDueDate,
      reviewer: input.reviewer,
      overallDetermination: undefined,
      conditions: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      responses,
    };

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
  }, [state.people, activeFirmId]);

  const updateAssessmentResponse = useCallback(({ assessmentId, questionId, value, notes }: AssessmentResponseUpdate) => {
    const timestamp = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      assessments: prev.assessments.map((record) => {
        if (record.id !== assessmentId) return record;
        return {
          ...record,
          responses: record.responses.map((response) =>
            response.questionId === questionId
              ? {
                  ...response,
                  value,
                  notes: notes ?? response.notes,
                }
              : response,
          ),
          updatedAt: timestamp,
        };
      }),
    }));
  }, []);

  const updateAssessmentStatus = useCallback(({ assessmentId, status, overallDetermination, conditions, assessmentDate, nextDueDate, reviewer }: AssessmentStatusUpdate) => {
    const timestamp = new Date().toISOString();
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
  }, []);

  const removeAssessment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assessments: prev.assessments.filter((record) => record.id !== id),
    }));
  }, []);

  // Breach management functions
  const addBreach = useCallback((input: NewBreachInput): ConductBreach => {
    if (!activeFirmId) {
      throw new Error("No active firm selected");
    }
    const timestamp = new Date().toISOString();
    const breach: ConductBreach = {
      id: createId("breach"),
      firmId: activeFirmId,
      personId: input.personId,
      personName: input.personName,
      ruleId: input.ruleId,
      ruleName: input.ruleName,
      dateIdentified: input.dateIdentified,
      dateOccurred: input.dateOccurred,
      description: input.description,
      severity: input.severity,
      status: "open",
      timeline: [
        {
          id: createId("timeline"),
          date: timestamp,
          action: "Breach Reported",
          description: `Breach of ${input.ruleName} reported for ${input.personName}`,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setState((prev) => ({
      ...prev,
      breaches: [...prev.breaches, breach],
    }));

    return breach;
  }, [activeFirmId]);

  const updateBreach = useCallback((id: string, updates: Partial<ConductBreach>) => {
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
    (breachId: string, entry: Omit<BreachTimelineEntry, "id">) => {
      setState((prev) => ({
        ...prev,
        breaches: prev.breaches.map((breach) =>
          breach.id === breachId
            ? {
                ...breach,
                timeline: [
                  ...breach.timeline,
                  { ...entry, id: createId("timeline") },
                ],
                updatedAt: new Date().toISOString(),
              }
            : breach
        ),
      }));
    },
    []
  );

  const removeBreach = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      breaches: prev.breaches.filter((breach) => breach.id !== id),
    }));
  }, []);

  const addGroupEntity = useCallback((input: Omit<GroupEntity, "id">): GroupEntity => {
    const entity: GroupEntity = { ...input, id: createId("entity") };
    setState((prev) => ({
      ...prev,
      groupEntities: [...prev.groupEntities, entity],
    }));
    return entity;
  }, []);

  const updateGroupEntity = useCallback((id: string, updates: Partial<GroupEntity>) => {
    setState((prev) => ({
      ...prev,
      groupEntities: prev.groupEntities.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const removeGroupEntity = useCallback((id: string) => {
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
