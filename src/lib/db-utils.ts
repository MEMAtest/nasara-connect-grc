/**
 * Safe database query utilities
 * Prevents SQL injection by using strict column validation
 */

import { Pool, PoolClient } from 'pg';
import { pool } from './database';

/**
 * Column definition with allowed columns per table
 * This creates a strict whitelist that prevents SQL injection
 */
const TABLE_COLUMNS: Record<string, readonly string[]> = {
  pep_records: [
    'pep_type', 'full_name', 'date_of_birth', 'nationality',
    'position_held', 'pep_category', 'relationship_type',
    'risk_rating', 'status', 'identification_date',
    'last_review_date', 'next_review_date', 'edd_completed',
    'edd_completed_date', 'source_of_wealth', 'source_of_funds',
    'approval_status', 'approved_by', 'approved_at', 'notes'
  ],
  third_party_records: [
    'vendor_name', 'vendor_type', 'service_description', 'criticality',
    'is_outsourcing', 'is_material_outsourcing', 'regulatory_notification_required',
    'contract_start_date', 'contract_end_date', 'contract_value_gbp',
    'risk_rating', 'status', 'primary_contact_name', 'primary_contact_email',
    'primary_contact_phone', 'due_diligence_completed', 'due_diligence_date',
    'last_review_date', 'next_review_date', 'exit_strategy_documented',
    'data_processing_agreement', 'sub_outsourcing_permitted', 'geographic_location',
    'approval_status', 'approved_by', 'approved_at', 'notes'
  ],
  complaints_records: [
    'complainant_name', 'complaint_type', 'complaint_category',
    'received_date', 'acknowledged_date', 'resolution_deadline',
    'resolved_date', 'root_cause', 'remedial_action', 'compensation_amount',
    'fos_referred', 'fos_outcome', 'status', 'assigned_to', 'priority',
    'notes', 'four_week_letter_sent', 'eight_week_letter_sent', 'final_response_sent'
  ],
  incident_records: [
    'incident_title', 'incident_type', 'severity', 'status',
    'detected_date', 'reported_date', 'resolved_date', 'description',
    'root_cause', 'impact_assessment', 'remediation_steps', 'lessons_learned',
    'reported_by', 'assigned_to', 'regulatory_notification_required',
    'regulatory_notification_date', 'customers_affected', 'financial_impact_gbp', 'notes'
  ],
  coi_records: [
    'person_name', 'person_role', 'conflict_type', 'description',
    'identified_date', 'status', 'risk_rating', 'mitigating_controls',
    'review_frequency', 'last_review_date', 'next_review_date',
    'approved_by', 'approved_at', 'notes'
  ],
  gifts_hospitality_records: [
    'person_name', 'person_role', 'entry_type', 'counterparty_name',
    'counterparty_company', 'description', 'value_gbp', 'currency',
    'date_given_received', 'reason', 'approval_status', 'approved_by',
    'approved_at', 'declined', 'declined_reason', 'notes'
  ],
  sanctions_screening_records: [
    'entity_name', 'entity_type', 'screening_date', 'screening_type',
    'sanctions_list_checked', 'match_status', 'match_details', 'risk_score',
    'decision', 'decided_by', 'decision_date', 'escalated', 'escalated_to',
    'false_positive_confirmed', 'notes', 'next_screening_date'
  ],
  aml_cdd_records: [
    'customer_name', 'customer_type', 'customer_reference', 'cdd_level',
    'onboarding_date', 'last_review_date', 'next_review_date', 'risk_rating',
    'status', 'id_verification_completed', 'id_verification_date',
    'address_verification_completed', 'source_of_funds_verified',
    'source_of_wealth_verified', 'pep_screening_completed',
    'sanctions_screening_completed', 'adverse_media_checked',
    'beneficial_owners_identified', 'risk_assessment_completed',
    'approved_by', 'approved_at', 'notes'
  ],
  edd_cases_records: [
    'customer_name', 'customer_reference', 'trigger_reason', 'trigger_date',
    'case_status', 'risk_rating', 'assigned_to', 'edd_measures_applied',
    'enhanced_monitoring_required', 'senior_management_approval',
    'approval_date', 'approved_by', 'review_frequency', 'next_review_date',
    'documentation_collected', 'findings_summary', 'recommendation', 'notes'
  ],
  vulnerable_customers_records: [
    'customer_name', 'customer_reference', 'vulnerability_type', 'vulnerability_details',
    'identified_date', 'identified_by', 'status', 'support_measures',
    'communication_preferences', 'review_frequency', 'last_review_date',
    'next_review_date', 'consent_obtained', 'third_party_contact_name',
    'third_party_contact_phone', 'notes'
  ],
  regulatory_breach_records: [
    'breach_title', 'breach_type', 'regulation_breached', 'severity',
    'status', 'identified_date', 'identified_by', 'description',
    'root_cause', 'impact_assessment', 'remediation_plan', 'remediation_deadline',
    'remediation_completed_date', 'fca_notification_required',
    'fca_notification_date', 'fca_reference', 'financial_penalty_gbp',
    'approved_by', 'approved_at', 'notes'
  ],
  fin_prom_records: [
    'promotion_name', 'promotion_type', 'channel', 'target_audience',
    'product_service', 'status', 'created_date', 'approved_date',
    'live_date', 'withdrawal_date', 'reviewed_by', 'approved_by',
    'compliance_notes', 'risk_warnings_included', 'fair_clear_not_misleading',
    'prominent_risk_warning', 'version', 'previous_version_id', 'notes'
  ],
  sar_nca_records: [
    'subject_name', 'subject_type', 'suspicious_activity', 'activity_date',
    'detection_date', 'detection_method', 'internal_reference', 'sar_submitted',
    'sar_submission_date', 'nca_reference', 'consent_requested', 'consent_granted',
    'consent_date', 'morla_applied', 'morla_expiry_date', 'status',
    'reporter_name', 'mlro_review_date', 'mlro_decision', 'amount_involved_gbp',
    'law_enforcement_contact', 'notes'
  ],
  tx_monitoring_records: [
    'alert_reference', 'alert_date', 'customer_name', 'customer_reference',
    'transaction_type', 'transaction_amount', 'transaction_currency',
    'transaction_date', 'alert_rule_triggered', 'risk_score', 'status',
    'assigned_to', 'investigation_notes', 'outcome', 'outcome_date',
    'sar_raised', 'sar_reference', 'escalated', 'escalated_to', 'notes'
  ],
  pa_dealing_records: [
    'employee_name', 'employee_id', 'department', 'request_date',
    'security_name', 'security_isin', 'transaction_type', 'quantity',
    'estimated_value_gbp', 'broker_name', 'account_details', 'reason',
    'holding_period_acknowledged', 'conflicts_declared', 'status',
    'approved_by', 'approval_date', 'execution_date', 'execution_price',
    'declined_reason', 'notes'
  ],
  insider_list_records: [
    'project_name', 'project_code', 'information_description',
    'information_date', 'person_name', 'person_role', 'company_name',
    'date_added', 'date_removed', 'reason_for_access', 'acknowledgement_received',
    'acknowledgement_date', 'national_id_type', 'national_id_number',
    'personal_phone', 'company_phone', 'personal_address', 'notes'
  ],
  outside_business_records: [
    'employee_name', 'employee_id', 'employee_role', 'smf_holder',
    'smf_roles', 'business_name', 'business_type', 'role_in_business',
    'time_commitment', 'remuneration_received', 'start_date', 'end_date',
    'conflicts_identified', 'conflict_details', 'mitigating_controls',
    'status', 'approved_by', 'approval_date', 'review_frequency',
    'last_review_date', 'next_review_date', 'notes'
  ],
  data_breach_dsar_records: [
    'record_type', 'reference_number', 'subject_name', 'subject_email',
    'subject_type', 'breach_discovery_date', 'breach_occurrence_date',
    'dsar_received_date', 'dsar_deadline', 'description', 'data_categories_affected',
    'individuals_affected_count', 'severity', 'status', 'assigned_to',
    'ico_notification_required', 'ico_notification_date', 'ico_reference',
    'subjects_notified', 'notification_date', 'root_cause', 'remediation_actions',
    'response_sent_date', 'notes'
  ],
  op_resilience_records: [
    'service_name', 'service_type', 'criticality', 'impact_tolerance',
    'impact_tolerance_unit', 'current_capability', 'status',
    'last_test_date', 'next_test_date', 'test_results', 'vulnerabilities_identified',
    'remediation_plan', 'remediation_deadline', 'owner_name', 'owner_role',
    'dependencies', 'third_party_dependencies', 'recovery_time_objective',
    'recovery_point_objective', 'notes'
  ],
  tc_record_records: [
    'employee_name', 'employee_id', 'role', 'department', 'tc_status',
    'tc_start_date', 'tc_completion_date', 'supervisor_name', 'supervisor_id',
    'competencies_assessed', 'assessment_results', 'gaps_identified',
    'development_plan', 'review_frequency', 'last_review_date',
    'next_review_date', 'certification_status', 'certification_expiry', 'notes'
  ],
  smcr_certification_records: [
    'employee_name', 'employee_id', 'certification_function',
    'current_certification_status', 'initial_certification_date',
    'last_certification_date', 'next_certification_due', 'certifier_name',
    'certifier_role', 'fit_and_proper_confirmed', 'regulatory_references_checked',
    'training_completed', 'conduct_rules_acknowledged', 'breaches_on_record',
    'conditions_or_limitations', 'notes'
  ],
  regulatory_returns_records: [
    'return_name', 'return_code', 'regulator', 'frequency',
    'reporting_period_start', 'reporting_period_end', 'due_date',
    'submission_date', 'status', 'preparer_name', 'reviewer_name',
    'approver_name', 'submission_reference', 'submission_method',
    'data_quality_checks_passed', 'issues_identified', 'notes'
  ],
  product_governance_records: [
    'product_name', 'product_code', 'product_type', 'target_market',
    'distribution_strategy', 'negative_target_market', 'status',
    'launch_date', 'last_review_date', 'next_review_date',
    'review_frequency', 'product_owner', 'fair_value_assessment_completed',
    'fair_value_assessment_date', 'price_value_outcome', 'consumer_duty_compliant',
    'vulnerability_considerations', 'distribution_channels', 'mi_requirements', 'notes'
  ],
} as const;

/**
 * Build a safe UPDATE query with validated column names
 * @param tableName - The table to update (must be in TABLE_COLUMNS)
 * @param id - The record ID to update
 * @param data - The data to update (keys will be validated against allowed columns)
 * @returns Query object with text and values, or null if no valid fields
 */
export function buildSafeUpdateQuery(
  tableName: keyof typeof TABLE_COLUMNS,
  id: string,
  data: Record<string, unknown>
): { text: string; values: unknown[] } | null {
  const allowedColumns = TABLE_COLUMNS[tableName];
  if (!allowedColumns) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  // Build SET clause with only allowed columns
  for (const [key, value] of Object.entries(data)) {
    // Strict validation: key must exactly match an allowed column
    if (allowedColumns.includes(key as typeof allowedColumns[number]) && value !== undefined) {
      // Column name is from our predefined list, safe to use
      fields.push(`"${key}" = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    return null;
  }

  // Always update the updated_at timestamp
  fields.push(`updated_at = NOW()`);
  values.push(id);

  const text = `UPDATE ${tableName} SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

  return { text, values };
}

/**
 * Execute a safe update query
 */
export async function executeSafeUpdate<T>(
  tableName: keyof typeof TABLE_COLUMNS,
  id: string,
  data: Record<string, unknown>,
  client?: PoolClient
): Promise<T | null> {
  const query = buildSafeUpdateQuery(tableName, id, data);
  if (!query) {
    return null;
  }

  const dbClient = client || await pool.connect();
  const shouldRelease = !client;

  try {
    const result = await dbClient.query(query.text, query.values);
    return result.rows[0] || null;
  } finally {
    if (shouldRelease) {
      dbClient.release();
    }
  }
}

/**
 * Get the organization_id for a record (for IDOR protection)
 */
export async function getRecordOrganization(
  tableName: string,
  id: string
): Promise<string | null> {
  const client = await pool.connect();
  try {
    // Using a parameterized query with the table name from our known list
    const knownTables = Object.keys(TABLE_COLUMNS);
    if (!knownTables.includes(tableName)) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    const result = await client.query(
      `SELECT organization_id FROM ${tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0]?.organization_id || null;
  } finally {
    client.release();
  }
}

// Export table columns for external use
export { TABLE_COLUMNS };
