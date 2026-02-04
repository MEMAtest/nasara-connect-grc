/**
 * Global Search API Route
 * GET /api/search?q=query - Search across all modules
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { trainingModules } from '@/app/(dashboard)/training-library/content';
import { authenticateRequest } from '@/lib/api-auth';
import { DEFAULT_ORGANIZATION_ID } from '@/lib/constants';
import { logError, logApiRequest } from '@/lib/logger';
import { isValidUUID } from '@/lib/validation';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

export interface SearchResult {
  id: string;
  type: 'assessment' | 'policy' | 'person' | 'case_study' | 'module' | 'register';
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

// Static navigation items that can be searched
const navigationItems: SearchResult[] = [
  { id: 'nav-dashboard', type: 'module', title: 'Dashboard', description: 'Main dashboard overview', url: '/', relevance: 1 },
  { id: 'nav-auth-pack', type: 'module', title: 'Authorization Pack', description: 'FCA authorization readiness assessments', url: '/authorization-pack', relevance: 1 },
  { id: 'nav-risk', type: 'module', title: 'Risk Assessment', description: 'Risk management and assessment tools', url: '/risk-assessment', relevance: 1 },
  { id: 'nav-compliance-builder', type: 'module', title: 'Framework Builder', description: 'Build the compliance framework and mappings', url: '/compliance-framework/builder', relevance: 1 },
  { id: 'nav-compliance-monitoring', type: 'module', title: 'Monitoring Workflows', description: 'CMP monitoring and control testing', url: '/compliance-framework/monitoring', relevance: 1 },
  { id: 'nav-reporting', type: 'module', title: 'Reporting Pack', description: 'Generate board-ready packs across modules', url: '/reporting', relevance: 1 },
  { id: 'nav-smcr', type: 'module', title: 'SM&CR Management', description: 'Senior Managers & Certification Regime', url: '/smcr', relevance: 1 },
  { id: 'nav-smcr-smfs', type: 'module', title: 'SMF Assignments', description: 'Senior Management Function assignments', url: '/smcr/smfs', relevance: 1 },
  { id: 'nav-smcr-fp', type: 'module', title: 'Fitness & Propriety', description: 'F&P assessments and monitoring', url: '/smcr/fitness-propriety', relevance: 1 },
  { id: 'nav-smcr-cert', type: 'module', title: 'Certification Functions', description: 'Certified persons and annual assessments', url: '/smcr/certifications', relevance: 1 },
  { id: 'nav-smcr-conduct', type: 'module', title: 'Conduct Rules', description: 'Conduct rule tracking and breaches', url: '/smcr/conduct-rules', relevance: 1 },
  { id: 'nav-training', type: 'module', title: 'Training Library', description: 'Compliance training and courses', url: '/training-library', relevance: 1 },
  { id: 'nav-policies', type: 'module', title: 'Policies', description: 'Policy management and generation', url: '/policies', relevance: 1 },
  { id: 'nav-payments', type: 'module', title: 'Payments', description: 'Payment services and transactions', url: '/payments', relevance: 1 },
  { id: 'nav-ai', type: 'module', title: 'AI Assistant', description: 'Guided compliance assistant', url: '/ai-chat', relevance: 1 },
  { id: 'nav-settings', type: 'module', title: 'Settings', description: 'Account and organization settings', url: '/settings', relevance: 1 },
];

type RegisterSearchConfig = {
  key: string;
  label: string;
  table: string;
  titleColumn: string;
  referenceColumn?: string;
  searchColumns: string[];
  descriptionColumns?: string[];
  detailRoute?: boolean;
};

const REGISTER_RESULT_LIMIT = 3;

const registerSearchConfigs: RegisterSearchConfig[] = [
  {
    key: 'complaints',
    label: 'Complaints',
    table: 'complaints_records',
    titleColumn: 'complainant_name',
    referenceColumn: 'complaint_reference',
    searchColumns: ['complainant_name', 'complaint_reference', 'complaint_type'],
    descriptionColumns: ['status', 'priority'],
    detailRoute: true,
  },
  {
    key: 'incidents',
    label: 'Incidents',
    table: 'incident_records',
    titleColumn: 'incident_title',
    referenceColumn: 'incident_reference',
    searchColumns: ['incident_title', 'incident_reference', 'incident_type'],
    descriptionColumns: ['status', 'severity'],
  },
  {
    key: 'vulnerable-customers',
    label: 'Vulnerable Customers',
    table: 'vulnerable_customers_records',
    titleColumn: 'customer_name',
    referenceColumn: 'customer_reference',
    searchColumns: ['customer_name', 'customer_reference', 'vulnerability_type'],
    descriptionColumns: ['status', 'risk_level'],
  },
  {
    key: 'sanctions',
    label: 'Sanctions',
    table: 'sanctions_screening_records',
    titleColumn: 'entity_name',
    referenceColumn: 'screening_reference',
    searchColumns: ['entity_name', 'screening_reference', 'entity_type'],
    descriptionColumns: ['status', 'decision'],
  },
  {
    key: 'pep',
    label: 'PEP',
    table: 'pep_records',
    titleColumn: 'full_name',
    searchColumns: ['full_name', 'position_held', 'nationality', 'pep_category'],
    descriptionColumns: ['status', 'risk_rating'],
  },
  {
    key: 'tx-monitoring',
    label: 'Transaction Monitoring',
    table: 'tx_monitoring_records',
    titleColumn: 'customer_name',
    referenceColumn: 'alert_reference',
    searchColumns: ['customer_name', 'customer_reference', 'alert_reference', 'alert_type'],
    descriptionColumns: ['status', 'alert_severity'],
  },
  {
    key: 'edd-cases',
    label: 'EDD Cases',
    table: 'edd_cases_records',
    titleColumn: 'customer_name',
    referenceColumn: 'case_reference',
    searchColumns: ['customer_name', 'customer_reference', 'case_reference'],
    descriptionColumns: ['status'],
  },
  {
    key: 'aml-cdd',
    label: 'AML CDD',
    table: 'aml_cdd_records',
    titleColumn: 'customer_name',
    referenceColumn: 'customer_reference',
    searchColumns: ['customer_name', 'customer_reference', 'customer_type'],
    descriptionColumns: ['overall_status', 'risk_rating'],
  },
  {
    key: 'sar-nca',
    label: 'SAR NCA',
    table: 'sar_nca_records',
    titleColumn: 'subject_name',
    referenceColumn: 'sar_reference',
    searchColumns: ['subject_name', 'sar_reference', 'internal_reference'],
    descriptionColumns: ['status'],
  },
  {
    key: 'fin-prom',
    label: 'Financial Promotions',
    table: 'fin_prom_records',
    titleColumn: 'promotion_title',
    referenceColumn: 'promotion_reference',
    searchColumns: ['promotion_title', 'promotion_reference', 'promotion_type', 'channel'],
    descriptionColumns: ['status'],
  },
  {
    key: 'regulatory-breach',
    label: 'Regulatory Breach',
    table: 'regulatory_breach_records',
    titleColumn: 'breach_title',
    referenceColumn: 'breach_reference',
    searchColumns: ['breach_title', 'breach_reference', 'breach_type', 'regulatory_rule'],
    descriptionColumns: ['status', 'severity'],
  },
  {
    key: 'regulatory-returns',
    label: 'Regulatory Returns',
    table: 'regulatory_returns_records',
    titleColumn: 'return_name',
    referenceColumn: 'return_reference',
    searchColumns: ['return_name', 'return_reference', 'regulator'],
    descriptionColumns: ['status', 'submission_status'],
  },
  {
    key: 'third-party',
    label: 'Third Parties',
    table: 'third_party_records',
    titleColumn: 'vendor_name',
    searchColumns: ['vendor_name', 'vendor_type', 'service_description'],
    descriptionColumns: ['status', 'criticality'],
  },
  {
    key: 'op-resilience',
    label: 'Operational Resilience',
    table: 'op_resilience_records',
    titleColumn: 'service_name',
    referenceColumn: 'service_reference',
    searchColumns: ['service_name', 'service_reference', 'service_owner'],
    descriptionColumns: ['status'],
  },
  {
    key: 'product-governance',
    label: 'Product Governance',
    table: 'product_governance_records',
    titleColumn: 'product_name',
    referenceColumn: 'product_reference',
    searchColumns: ['product_name', 'product_reference', 'product_type', 'manufacturer'],
    descriptionColumns: ['status'],
  },
  {
    key: 'smcr-certification',
    label: 'SMCR Certification',
    table: 'smcr_certification_records',
    titleColumn: 'employee_name',
    referenceColumn: 'employee_reference',
    searchColumns: ['employee_name', 'employee_reference', 'department', 'certification_function'],
    descriptionColumns: ['status', 'certification_status'],
  },
  {
    key: 'tc-record',
    label: 'T&C Records',
    table: 'tc_record_records',
    titleColumn: 'employee_name',
    referenceColumn: 'employee_reference',
    searchColumns: ['employee_name', 'employee_reference', 'department', 'employee_role'],
    descriptionColumns: ['status', 'qualification_status'],
  },
  {
    key: 'pa-dealing',
    label: 'PA Dealing',
    table: 'pa_dealing_records',
    titleColumn: 'employee_name',
    referenceColumn: 'request_reference',
    searchColumns: ['employee_name', 'employee_id', 'request_reference', 'instrument_name', 'isin'],
    descriptionColumns: ['status', 'pre_clearance_status'],
  },
  {
    key: 'insider-list',
    label: 'Insider List',
    table: 'insider_list_records',
    titleColumn: 'insider_name',
    referenceColumn: 'list_reference',
    searchColumns: ['insider_name', 'list_reference', 'project_name', 'issuer_name'],
    descriptionColumns: ['list_status'],
  },
  {
    key: 'outside-business',
    label: 'Outside Business',
    table: 'outside_business_records',
    titleColumn: 'employee_name',
    referenceColumn: 'declaration_reference',
    searchColumns: ['employee_name', 'employee_id', 'organization_name', 'declaration_reference'],
    descriptionColumns: ['status', 'interest_type'],
  },
  {
    key: 'conflicts',
    label: 'Conflicts',
    table: 'coi_records',
    titleColumn: 'declarant_name',
    searchColumns: ['declarant_name', 'declarant_role', 'conflict_type', 'description'],
    descriptionColumns: ['status', 'risk_rating'],
  },
  {
    key: 'gifts-hospitality',
    label: 'Gifts & Hospitality',
    table: 'gifts_hospitality_records',
    titleColumn: 'description',
    searchColumns: ['description', 'provider_name', 'recipient_name', 'provider_organization', 'recipient_organization'],
    descriptionColumns: ['entry_type', 'approval_status'],
  },
  {
    key: 'data-breach-dsar',
    label: 'Data Breach & DSAR',
    table: 'data_breach_dsar_records',
    titleColumn: 'dsar_requester_name',
    referenceColumn: 'record_reference',
    searchColumns: ['record_reference', 'dsar_requester_name', 'breach_description', 'ico_reference'],
    descriptionColumns: ['record_type', 'status'],
  },
];

function searchNavigationItems(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  return navigationItems
    .filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    )
    .map(item => ({
      ...item,
      relevance: item.title.toLowerCase().startsWith(lowerQuery) ? 2 : 1,
    }))
    .sort((a, b) => b.relevance - a.relevance);
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function getTextRelevance(value: string | null | undefined, query: string): number {
  if (!value) return 0;
  const lowerValue = value.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (lowerValue.startsWith(lowerQuery)) return 2;
  if (lowerValue.includes(lowerQuery)) return 1;
  return 0;
}

function getBestRelevance(values: Array<string | null | undefined>, query: string): number {
  const scores = values.map((value) => getTextRelevance(value, query));
  const best = scores.length ? Math.max(...scores) : 1;
  return best > 0 ? best : 1;
}

function buildRegisterDescription(label: string, reference: string | null, extras: string[]): string {
  const parts = [`${label} register`];
  if (reference) parts.push(`Ref ${reference}`);
  const filteredExtras = extras.filter(Boolean).slice(0, 2);
  if (filteredExtras.length) {
    parts.push(filteredExtras.join(' | '));
  }
  return parts.join(' | ');
}

function searchTrainingModules(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const [moduleId, module] of Object.entries(trainingModules)) {
    const haystack = [
      moduleId,
      module.id,
      module.title,
      module.description,
      module.category,
      module.difficulty,
      ...(module.tags ?? []),
      ...(module.targetPersonas ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(lowerQuery)) continue;

    const description = module.description
      || [module.category, module.difficulty].filter(Boolean).join(' | ')
      || 'Training module';

    results.push({
      id: moduleId,
      type: 'module',
      title: module.title,
      description,
      url: `/training-library/lesson/${module.id || moduleId}`,
      relevance: getBestRelevance([module.title, moduleId, module.category], query),
      metadata: { category: module.category, difficulty: module.difficulty },
    });
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

async function searchPolicies(query: string, organizationId: string): Promise<SearchResult[]> {
  const searchPattern = `%${query}%`;

  try {
    const policiesResult = await pool.query(`
      SELECT id, name, description, code, status
      FROM policies
      WHERE organization_id = $2 AND (name ILIKE $1 OR description ILIKE $1 OR code ILIKE $1)
      LIMIT 5
    `, [searchPattern, organizationId]);

    return policiesResult.rows.map((row) => {
      const descriptionParts = [];
      if (row.code) descriptionParts.push(`Code ${row.code}`);
      if (row.status) descriptionParts.push(row.status);
      const description = row.description || (descriptionParts.length ? descriptionParts.join(' | ') : 'Policy');

      return {
        id: row.id,
        type: 'policy',
        title: row.name,
        description,
        url: `/policies/${row.id}`,
        relevance: getBestRelevance([row.name, row.code], query),
        metadata: { status: row.status, code: row.code },
      };
    });
  } catch (error) {
    logError(error, 'Policy search failed');
    return [];
  }
}

async function searchRegisterRecords(query: string, organizationId: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  for (const config of registerSearchConfigs) {
    const selectedColumns = new Set<string>(
      [config.titleColumn, config.referenceColumn, ...(config.descriptionColumns ?? [])]
        .filter(Boolean) as string[]
    );
    const selectList = ['id', ...selectedColumns].join(', ');
    const whereClause = config.searchColumns.map((column) => `${column} ILIKE $1`).join(' OR ');
    const sql = `SELECT ${selectList} FROM ${config.table} WHERE organization_id = $2 AND (${whereClause}) LIMIT ${REGISTER_RESULT_LIMIT}`;

    try {
      const response = await pool.query(sql, [searchPattern, organizationId]);
      for (const row of response.rows) {
        const titleValue = formatValue(row[config.titleColumn]);
        const referenceValue = config.referenceColumn ? formatValue(row[config.referenceColumn]) : null;
        const extraValues = (config.descriptionColumns ?? [])
          .map((column) => formatValue(row[column]))
          .filter(Boolean) as string[];
        const title = titleValue || referenceValue || `${config.label} record`;
        const description = buildRegisterDescription(config.label, referenceValue, extraValues);
        const urlBase = `/registers/${config.key}`;
        const url = config.detailRoute ? `${urlBase}/${row.id}` : urlBase;
        const relevance = getBestRelevance([titleValue, referenceValue, ...extraValues], query);

        results.push({
          id: row.id,
          type: 'register',
          title,
          description,
          url,
          relevance,
          metadata: { register: config.key },
        });
      }
    } catch (error) {
      logError(error, `Register search failed for ${config.key}`);
    }
  }

  return results;
}

async function searchDatabase(query: string, organizationId: string, policyOrganizationId: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  // Search assessments
  try {
    const assessmentsResult = await pool.query(`
      SELECT id, name, description, business_type, status
      FROM assessments
      WHERE organization_id = $2 AND (name ILIKE $1 OR description ILIKE $1)
      LIMIT 5
    `, [searchPattern, organizationId]);

    for (const row of assessmentsResult.rows) {
      results.push({
        id: row.id,
        type: 'assessment',
        title: row.name,
        description: row.description || `${row.business_type} assessment`,
        url: `/authorization-pack?assessment=${row.id}`,
        relevance: getBestRelevance([row.name], query),
        metadata: { status: row.status },
      });
    }
  } catch (error) {
    logError(error, 'Assessment search failed');
  }

  // Search case studies
  try {
    const caseStudiesResult = await pool.query(`
      SELECT id, title, excerpt, industry
      FROM case_studies
      WHERE (title ILIKE $1 OR excerpt ILIKE $1) AND is_published = true
      LIMIT 5
    `, [searchPattern]);

    for (const row of caseStudiesResult.rows) {
      results.push({
        id: row.id,
        type: 'case_study',
        title: row.title,
        description: row.excerpt || `${row.industry} case study`,
        url: `/case-studies/${row.id}`,
        relevance: getBestRelevance([row.title], query),
        metadata: { industry: row.industry },
      });
    }
  } catch (error) {
    logError(error, 'Case study search failed');
  }

  // Search policies
  const policyResults = await searchPolicies(query, policyOrganizationId);
  results.push(...policyResults);

  // Search register records
  const registerResults = await searchRegisterRecords(query, organizationId);
  results.push(...registerResults);

  // Search SMCR people (if table exists)
  try {
    const peopleResult = await pool.query(`
      SELECT people.id, people.name, people.title, people.department, people.employee_id
      FROM smcr_people AS people
      JOIN smcr_firms AS firms ON firms.id = people.firm_id
      WHERE firms.organization_id = $2 AND (people.name ILIKE $1 OR people.title ILIKE $1 OR people.employee_id ILIKE $1)
      LIMIT 5
    `, [searchPattern, organizationId]);

    for (const row of peopleResult.rows) {
      results.push({
        id: row.id,
        type: 'person',
        title: row.name,
        description: `${row.title || 'Employee'} - ${row.department || 'N/A'}`,
        url: `/smcr/people?person=${row.id}`,
        relevance: getBestRelevance([row.name, row.employee_id], query),
        metadata: { employeeId: row.employee_id, department: row.department },
      });
    }
  } catch {
    // SMCR tables might not exist yet
  }

  return results;
}

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/search');

  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    const organizationId = authResult.user.organizationId || 'default-org';
    const policyOrganizationId = isValidUUID(organizationId)
      ? organizationId
      : DEFAULT_ORGANIZATION_ID;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters',
      });
    }

    // Search navigation items (instant, no DB call)
    const navResults = searchNavigationItems(query);

    const trainingResults = searchTrainingModules(query);

    // Search database
    const dbResults = await searchDatabase(query, organizationId, policyOrganizationId);

    // Combine and deduplicate results
    const allResults = [...navResults, ...trainingResults, ...dbResults]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 15);

    return NextResponse.json({
      results: allResults,
      query,
      count: allResults.length,
    });
  } catch (error) {
    logError(error, 'Search failed');
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
