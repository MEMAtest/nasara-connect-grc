/**
 * Global Search API Route
 * GET /api/search?q=query - Search across all modules
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { logError, logApiRequest } from '@/lib/logger';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Vtu9NK8ThRbB@ep-royal-queen-abitcphb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

export interface SearchResult {
  id: string;
  type: 'assessment' | 'policy' | 'person' | 'case_study' | 'module';
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
  { id: 'nav-compliance', type: 'module', title: 'Compliance Framework', description: 'Compliance monitoring and controls', url: '/compliance-framework', relevance: 1 },
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

async function searchDatabase(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  try {
    // Search assessments
    const assessmentsResult = await pool.query(`
      SELECT id, name, description, business_type, status
      FROM assessments
      WHERE name ILIKE $1 OR description ILIKE $1
      LIMIT 5
    `, [searchPattern]);

    for (const row of assessmentsResult.rows) {
      results.push({
        id: row.id,
        type: 'assessment',
        title: row.name,
        description: row.description || `${row.business_type} assessment`,
        url: `/authorization-pack?assessment=${row.id}`,
        relevance: row.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 1,
        metadata: { status: row.status },
      });
    }

    // Search case studies
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
        relevance: row.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1,
        metadata: { industry: row.industry },
      });
    }

    // Search SMCR people (if table exists)
    try {
      const peopleResult = await pool.query(`
        SELECT id, name, title, department, employee_id
        FROM smcr_people
        WHERE name ILIKE $1 OR title ILIKE $1 OR employee_id ILIKE $1
        LIMIT 5
      `, [searchPattern]);

      for (const row of peopleResult.rows) {
        results.push({
          id: row.id,
          type: 'person',
          title: row.name,
          description: `${row.title || 'Employee'} - ${row.department || 'N/A'}`,
          url: `/smcr/people?person=${row.id}`,
          relevance: row.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 1,
          metadata: { employeeId: row.employee_id, department: row.department },
        });
      }
    } catch {
      // SMCR tables might not exist yet
    }

  } catch (error) {
    logError(error, 'Database search failed');
    // Return empty results rather than failing
  }

  return results;
}

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/search');

  try {
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

    // Search database
    const dbResults = await searchDatabase(query);

    // Combine and deduplicate results
    const allResults = [...navResults, ...dbResults]
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
