/**
 * Zod validation schemas for all register types
 */

import { z, type ZodIssue } from "zod";

// Common schemas
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uuidSchema = z.string().uuid("Invalid UUID format");
const dateSchema = z.string().datetime().or(z.date()).optional();
const positiveNumberSchema = z.number().min(0, "Must be a positive number").optional();

// Risk rating enum
const riskRatingSchema = z.enum(["low", "medium", "high", "critical"]);

// Priority enum
const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

// Approval status enum
const approvalStatusSchema = z.enum(["pending", "approved", "rejected"]);

// ===========================================
// PEP Register Schema
// ===========================================
export const pepRecordSchema = z.object({
  pep_type: z.enum(["customer", "beneficial_owner", "director", "shareholder"]),
  full_name: z.string().min(1, "Full name is required").max(255),
  date_of_birth: dateSchema,
  nationality: z.string().max(100).optional(),
  position_held: z.string().max(500).optional(),
  pep_category: z.enum(["pep", "rca", "family_member"]),
  relationship_type: z.string().max(100).optional(),
  risk_rating: riskRatingSchema.default("high"),
  status: z.enum(["active", "inactive", "archived", "under_review"]).default("active"),
  identification_date: dateSchema,
  last_review_date: dateSchema,
  next_review_date: dateSchema,
  edd_completed: z.boolean().default(false),
  edd_completed_date: dateSchema,
  source_of_wealth: z.string().max(5000).optional(),
  source_of_funds: z.string().max(5000).optional(),
  approval_status: approvalStatusSchema.default("pending"),
  approved_by: z.string().max(255).optional(),
  notes: z.string().max(10000).optional(),
});

export type PEPRecordInput = z.infer<typeof pepRecordSchema>;

// ===========================================
// Complaints Register Schema
// ===========================================
export const complaintRecordSchema = z.object({
  complainant_name: z.string().min(1, "Complainant name is required").max(255),
  complaint_type: z.enum(["product", "service", "staff_conduct", "fees", "advice", "delay", "communication", "other"]),
  complaint_category: z.enum(["upheld", "partially_upheld", "rejected", "pending"]).default("pending"),
  received_date: dateSchema,
  acknowledged_date: dateSchema,
  resolution_deadline: dateSchema,
  resolved_date: dateSchema,
  root_cause: z.string().max(10000).optional(),
  remedial_action: z.string().max(10000).optional(),
  compensation_amount: positiveNumberSchema,
  fos_referred: z.boolean().default(false),
  fos_outcome: z.string().max(500).optional(),
  status: z.enum(["open", "investigating", "resolved", "closed", "escalated"]).default("open"),
  assigned_to: z.string().max(255).optional(),
  priority: prioritySchema.default("medium"),
  notes: z.string().max(10000).optional(),
  four_week_letter_sent: z.boolean().default(false),
  eight_week_letter_sent: z.boolean().default(false),
  final_response_sent: z.boolean().default(false),
});

export type ComplaintRecordInput = z.infer<typeof complaintRecordSchema>;

// ===========================================
// Incidents Register Schema
// ===========================================
export const incidentRecordSchema = z.object({
  incident_title: z.string().min(1, "Title is required").max(255),
  incident_type: z.enum(["operational", "security", "data_breach", "system_failure", "fraud", "compliance", "human_error", "third_party", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["detected", "investigating", "contained", "resolved", "closed"]).default("detected"),
  detected_date: dateSchema,
  reported_date: dateSchema,
  resolved_date: dateSchema,
  description: z.string().max(10000).optional(),
  root_cause: z.string().max(10000).optional(),
  impact_assessment: z.string().max(10000).optional(),
  remediation_steps: z.string().max(10000).optional(),
  lessons_learned: z.string().max(10000).optional(),
  reported_by: z.string().max(255).optional(),
  assigned_to: z.string().max(255).optional(),
  regulatory_notification_required: z.boolean().default(false),
  regulatory_notification_date: dateSchema,
  customers_affected: z.number().int().min(0).optional(),
  financial_impact_gbp: positiveNumberSchema,
  notes: z.string().max(10000).optional(),
});

export type IncidentRecordInput = z.infer<typeof incidentRecordSchema>;

// ===========================================
// Conflicts of Interest Schema
// ===========================================
export const coiRecordSchema = z.object({
  person_name: z.string().min(1, "Person name is required").max(255),
  person_role: z.string().max(255).optional(),
  conflict_type: z.enum(["personal_interest", "family_relationship", "outside_employment", "financial_interest", "gift_hospitality", "board_membership", "shareholder", "other"]),
  description: z.string().min(1, "Description is required").max(10000),
  identified_date: dateSchema,
  status: z.enum(["active", "mitigated", "resolved", "archived"]).default("active"),
  risk_rating: riskRatingSchema.default("medium"),
  mitigating_controls: z.string().max(10000).optional(),
  review_frequency: z.enum(["annual", "semi_annual", "quarterly", "monthly", "ad_hoc"]).optional(),
  last_review_date: dateSchema,
  next_review_date: dateSchema,
  approved_by: z.string().max(255).optional(),
  notes: z.string().max(10000).optional(),
});

export type COIRecordInput = z.infer<typeof coiRecordSchema>;

// ===========================================
// Gifts & Hospitality Schema
// ===========================================
export const giftHospitalityRecordSchema = z.object({
  person_name: z.string().min(1, "Person name is required").max(255),
  person_role: z.string().max(255).optional(),
  entry_type: z.enum(["gift_received", "gift_given", "hospitality_received", "hospitality_given"]),
  counterparty_name: z.string().min(1, "Counterparty name is required").max(255),
  counterparty_company: z.string().max(255).optional(),
  description: z.string().min(1, "Description is required").max(5000),
  value_gbp: z.number().min(0, "Value must be positive"),
  currency: z.string().max(10).default("GBP"),
  date_given_received: dateSchema,
  reason: z.string().max(5000).optional(),
  approval_status: approvalStatusSchema.default("pending"),
  approved_by: z.string().max(255).optional(),
  declined: z.boolean().default(false),
  declined_reason: z.string().max(5000).optional(),
  notes: z.string().max(10000).optional(),
});

export type GiftHospitalityRecordInput = z.infer<typeof giftHospitalityRecordSchema>;

// ===========================================
// Third-Party Register Schema
// ===========================================
export const thirdPartyRecordSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required").max(255),
  vendor_type: z.enum(["technology", "cloud_services", "payment_processing", "data_provider", "compliance_services", "audit_services", "legal_services", "consulting", "infrastructure", "security", "other"]),
  service_description: z.string().max(5000).optional(),
  criticality: z.enum(["low", "medium", "high", "critical"]),
  is_outsourcing: z.boolean().default(false),
  is_material_outsourcing: z.boolean().default(false),
  regulatory_notification_required: z.boolean().default(false),
  contract_start_date: dateSchema,
  contract_end_date: dateSchema,
  contract_value_gbp: positiveNumberSchema,
  risk_rating: riskRatingSchema.default("medium"),
  status: z.enum(["active", "inactive", "pending", "terminated", "under_review"]).default("pending"),
  primary_contact_name: z.string().max(255).optional(),
  primary_contact_email: z.string().email().optional().or(z.literal("")),
  primary_contact_phone: z.string().max(50).optional(),
  due_diligence_completed: z.boolean().default(false),
  due_diligence_date: dateSchema,
  last_review_date: dateSchema,
  next_review_date: dateSchema,
  exit_strategy_documented: z.boolean().default(false),
  data_processing_agreement: z.boolean().default(false),
  sub_outsourcing_permitted: z.boolean().default(false),
  geographic_location: z.string().max(255).optional(),
  approval_status: approvalStatusSchema.default("pending"),
  notes: z.string().max(10000).optional(),
});

export type ThirdPartyRecordInput = z.infer<typeof thirdPartyRecordSchema>;

// ===========================================
// Sanctions Screening Schema
// ===========================================
export const sanctionsRecordSchema = z.object({
  entity_name: z.string().min(1, "Entity name is required").max(255),
  entity_type: z.enum(["individual", "company", "vessel", "aircraft", "other"]),
  screening_date: dateSchema,
  screening_type: z.enum(["onboarding", "periodic", "transaction", "adhoc"]),
  sanctions_list_checked: z.string().max(500).optional(),
  match_status: z.enum(["no_match", "potential_match", "confirmed_match"]).default("no_match"),
  match_details: z.string().max(10000).optional(),
  risk_score: z.number().min(0).max(100).optional(),
  decision: z.enum(["approved", "rejected", "pending_review", "escalated"]).default("pending_review"),
  decided_by: z.string().max(255).optional(),
  decision_date: dateSchema,
  escalated: z.boolean().default(false),
  escalated_to: z.string().max(255).optional(),
  false_positive_confirmed: z.boolean().default(false),
  notes: z.string().max(10000).optional(),
  next_screening_date: dateSchema,
});

export type SanctionsRecordInput = z.infer<typeof sanctionsRecordSchema>;

// ===========================================
// AML CDD Schema
// ===========================================
export const amlCddRecordSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required").max(255),
  customer_type: z.enum(["individual", "corporate", "trust", "partnership", "other"]),
  customer_reference: z.string().max(100).optional(),
  cdd_level: z.enum(["simplified", "standard", "enhanced"]),
  onboarding_date: dateSchema,
  last_review_date: dateSchema,
  next_review_date: dateSchema,
  risk_rating: riskRatingSchema.default("medium"),
  status: z.enum(["active", "inactive", "pending", "rejected", "archived"]).default("pending"),
  id_verification_completed: z.boolean().default(false),
  id_verification_date: dateSchema,
  address_verification_completed: z.boolean().default(false),
  source_of_funds_verified: z.boolean().default(false),
  source_of_wealth_verified: z.boolean().default(false),
  pep_screening_completed: z.boolean().default(false),
  sanctions_screening_completed: z.boolean().default(false),
  adverse_media_checked: z.boolean().default(false),
  beneficial_owners_identified: z.boolean().default(false),
  risk_assessment_completed: z.boolean().default(false),
  approval_status: approvalStatusSchema.default("pending"),
  notes: z.string().max(10000).optional(),
});

export type AmlCddRecordInput = z.infer<typeof amlCddRecordSchema>;

// ===========================================
// SAR/NCA Reports Schema
// ===========================================
export const sarNcaRecordSchema = z.object({
  subject_name: z.string().min(1, "Subject name is required").max(255),
  subject_type: z.enum(["individual", "corporate", "other"]),
  suspicious_activity: z.string().min(1, "Suspicious activity description is required").max(10000),
  activity_date: dateSchema,
  detection_date: dateSchema,
  detection_method: z.string().max(255).optional(),
  internal_reference: z.string().max(100).optional(),
  sar_submitted: z.boolean().default(false),
  sar_submission_date: dateSchema,
  nca_reference: z.string().max(100).optional(),
  consent_requested: z.boolean().default(false),
  consent_granted: z.boolean().optional(),
  consent_date: dateSchema,
  morla_applied: z.boolean().default(false),
  morla_expiry_date: dateSchema,
  status: z.enum(["draft", "under_review", "submitted", "consent_pending", "closed"]).default("draft"),
  reporter_name: z.string().max(255).optional(),
  mlro_review_date: dateSchema,
  mlro_decision: z.string().max(500).optional(),
  amount_involved_gbp: positiveNumberSchema,
  law_enforcement_contact: z.boolean().default(false),
  notes: z.string().max(10000).optional(),
});

export type SarNcaRecordInput = z.infer<typeof sarNcaRecordSchema>;

// ===========================================
// FinProm Tracker Schema
// ===========================================
export const finPromRecordSchema = z.object({
  promotion_name: z.string().min(1, "Promotion name is required").max(255),
  promotion_type: z.enum(["advertisement", "website", "email", "social_media", "brochure", "video", "other"]),
  channel: z.string().max(100).optional(),
  target_audience: z.enum(["retail", "professional", "eligible_counterparty", "mixed"]),
  product_service: z.string().max(255).optional(),
  status: z.enum(["draft", "pending_review", "approved", "live", "withdrawn", "expired"]).default("draft"),
  created_date: dateSchema,
  approved_date: dateSchema,
  live_date: dateSchema,
  withdrawal_date: dateSchema,
  reviewed_by: z.string().max(255).optional(),
  approved_by: z.string().max(255).optional(),
  compliance_notes: z.string().max(10000).optional(),
  risk_warnings_included: z.boolean().default(false),
  fair_clear_not_misleading: z.boolean().default(false),
  prominent_risk_warning: z.boolean().default(false),
  version: z.number().int().min(1).default(1),
  notes: z.string().max(10000).optional(),
});

export type FinPromRecordInput = z.infer<typeof finPromRecordSchema>;

// ===========================================
// Vulnerable Customers Schema
// ===========================================
export const vulnerableCustomerRecordSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required").max(255),
  customer_reference: z.string().max(100).optional(),
  vulnerability_type: z.enum(["health", "life_event", "capability", "resilience", "other"]),
  vulnerability_details: z.string().max(10000).optional(),
  identified_date: dateSchema,
  identified_by: z.string().max(255).optional(),
  status: z.enum(["active", "monitoring", "resolved", "closed"]).default("active"),
  support_measures: z.string().max(10000).optional(),
  communication_preferences: z.string().max(5000).optional(),
  review_frequency: z.enum(["annual", "semi_annual", "quarterly", "monthly", "ad_hoc"]).optional(),
  last_review_date: dateSchema,
  next_review_date: dateSchema,
  consent_obtained: z.boolean().default(false),
  third_party_contact_name: z.string().max(255).optional(),
  third_party_contact_phone: z.string().max(50).optional(),
  notes: z.string().max(10000).optional(),
});

export type VulnerableCustomerRecordInput = z.infer<typeof vulnerableCustomerRecordSchema>;

// ===========================================
// Regulatory Breach Schema
// ===========================================
export const regulatoryBreachRecordSchema = z.object({
  breach_title: z.string().min(1, "Title is required").max(255),
  breach_type: z.enum(["conduct", "prudential", "reporting", "operational", "aml", "consumer_duty", "other"]),
  regulation_breached: z.string().max(500).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["identified", "investigating", "remediation", "closed", "reported"]).default("identified"),
  identified_date: dateSchema,
  identified_by: z.string().max(255).optional(),
  description: z.string().max(10000).optional(),
  root_cause: z.string().max(10000).optional(),
  impact_assessment: z.string().max(10000).optional(),
  remediation_plan: z.string().max(10000).optional(),
  remediation_deadline: dateSchema,
  remediation_completed_date: dateSchema,
  fca_notification_required: z.boolean().default(false),
  fca_notification_date: dateSchema,
  fca_reference: z.string().max(100).optional(),
  financial_penalty_gbp: positiveNumberSchema,
  notes: z.string().max(10000).optional(),
});

export type RegulatoryBreachRecordInput = z.infer<typeof regulatoryBreachRecordSchema>;

// ===========================================
// Helper function to validate and parse
// ===========================================
export function validateRegisterInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(
    (err: ZodIssue) => `${err.path.join(".")}: ${err.message}`
  );

  return { success: false, errors };
}
