/**
 * Shared types for authorization pack database operations
 */

import { PackType } from "@/lib/authorization-pack-templates";
import { PermissionCode } from "@/lib/authorization-pack-ecosystems";
import { QuestionResponse } from "@/lib/assessment-question-bank";
import { BusinessPlanProfile } from "@/lib/business-plan-profile";

// Row types from database tables
export interface PackTemplateRow {
  id: string;
  type: PackType;
  name: string;
  description: string | null;
}

export interface PermissionEcosystemRow {
  id: string;
  permission_code: PermissionCode;
  name: string;
  description: string | null;
  pack_template_type: PackType;
  section_keys: string[];
  policy_templates: string[];
  training_requirements: string[];
  smcr_roles: string[];
  typical_timeline_weeks: number | null;
}

export interface OpinionPackGenerationJobRow {
  id: string;
  pack_id: string;
  status: string;
  progress: number | null;
  current_step: string | null;
  payload: unknown;
  error_message: string | null;
  document_id: string | null;
  document_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackRow {
  id: string;
  template_id: string | null;
  organization_id: string;
  name: string;
  status: string;
  target_submission_date: string | null;
  created_at: string;
  updated_at: string;
  template_type?: PackType;
  template_name?: string;
}

export interface SectionSummary {
  id: string;
  section_key: string;
  title: string;
  display_order: number;
  status: string;
  owner_id: string | null;
  due_date: string | null;
  review_state: string;
  narrativeCompletion: number;
  evidenceCompletion: number;
  reviewCompletion: number;
}

export interface FullSectionData {
  sectionKey: string;
  title: string;
  description: string;
  displayOrder: number;
  prompts: Array<{
    key: string;
    title: string;
    guidance: string | null;
    weight: number;
    response: string | null;
  }>;
  evidence: Array<{
    name: string;
    description: string | null;
    status: string;
    annexNumber: string | null;
  }>;
  narrativeCompletion: number;
  evidenceCompletion: number;
}

export interface ProjectAssessmentData {
  basics?: {
    legalName?: string;
    priorFcaApplications?: string;
    firmType?: string;
    tradingName?: string;
    incorporationDate?: string;
    incorporationPlace?: string;
    companyNumber?: string;
    registeredNumberExists?: string;
    financialYearEnd?: string;
    sicCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    registeredOfficeSameAsHeadOffice?: string;
    headOfficeAddressLine1?: string;
    headOfficeAddressLine2?: string;
    headOfficeCity?: string;
    headOfficePostcode?: string;
    headOfficePhone?: string;
    headOfficeEmail?: string;
    primaryJurisdiction?: string;
    primaryContact?: string;
    contactEmail?: string;
    contactPhone?: string;
    firmStage?: string;
    regulatedActivities?: string;
    headcount?: number;
    website?: string;
    previouslyRegulated?: string;
    tradeAssociations?: string;
    usedProfessionalAdviser?: string;
    adviserFirmName?: string;
    adviserCopyCorrespondence?: string;
    adviserContactDetails?: string;
    timingFactors?: string;
    pspType?: string;
    paymentServicesActivities?: string;
    currentlyProvidingPIS?: string;
    currentlyProvidingAIS?: string;
    pisStartDate?: string;
    aisStartDate?: string;
    certificateOfIncorporation?: string;
    articlesOfAssociation?: string;
    partnershipDeed?: string;
    llpAgreement?: string;
    consultantNotes?: string;
  };
  questionResponses?: Record<string, QuestionResponse>;
  readiness?: Record<string, "missing" | "partial" | "complete">;
  policies?: Record<string, "missing" | "partial" | "complete">;
  training?: Record<string, "missing" | "in-progress" | "complete">;
  smcr?: Record<string, "unassigned" | "assigned">;
  businessPlanProfile?: BusinessPlanProfile;
  meta?: {
    completion?: number;
    updatedAt?: string;
  };
}

export interface ProjectPlan {
  milestones?: Array<{
    id: string;
    name: string;
    targetDate: string;
    status: string;
    dependencies?: string[];
  }>;
  tasks?: Array<{
    id: string;
    milestoneId?: string;
    name: string;
    owner?: string;
    status: string;
    dueDate?: string;
  }>;
  updatedAt?: string;
}

export interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

// Checklist types
export type ChecklistItemStatus =
  | "not_started"
  | "in_progress"
  | "draft_ready"
  | "reviewed"
  | "final_ready"
  | "submitted";

export interface PackChecklistData {
  [itemId: string]: ChecklistItemStatus;
}
