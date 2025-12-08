// Risk Assessment Database Operations
// Migrated from in-memory store to PostgreSQL (Neon)

import { pool } from '@/lib/database';
import type { RiskRecord, RiskKeyRiskIndicator } from '@/app/(dashboard)/risk-assessment/lib/riskConstants';

// Track if tables have been initialized to avoid redundant checks
let tablesInitialized = false;

// Initialize risk tables (only runs once per server instance)
export async function initRiskTables(): Promise<void> {
  if (tablesInitialized) {
    return;
  }
  const client = await pool.connect();

  try {
    // Create risks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS risks (
        id VARCHAR(255) PRIMARY KEY,
        risk_id VARCHAR(50) NOT NULL,
        organization_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'operational',
        sub_category VARCHAR(100),
        likelihood INTEGER DEFAULT 3,
        impact INTEGER DEFAULT 3,
        residual_likelihood INTEGER DEFAULT 3,
        residual_impact INTEGER DEFAULT 3,
        velocity VARCHAR(20) DEFAULT 'medium',
        risk_owner VARCHAR(255) DEFAULT 'Unassigned',
        business_unit VARCHAR(255),
        process VARCHAR(255),
        control_count INTEGER DEFAULT 0,
        control_effectiveness DECIMAL(3,1) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'open',
        review_frequency VARCHAR(50) DEFAULT 'quarterly',
        last_reviewed_at TIMESTAMP,
        next_review_at TIMESTAMP,
        regulatory_category TEXT[],
        reportable_to_fca BOOLEAN DEFAULT false,
        consumer_duty_relevant BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create risk_kris table for Key Risk Indicators
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_kris (
        id VARCHAR(255) PRIMARY KEY,
        risk_id VARCHAR(255) NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        metric VARCHAR(255),
        threshold_green DECIMAL(15,2),
        threshold_amber DECIMAL(15,2),
        threshold_red DECIMAL(15,2),
        current_value DECIMAL(15,2),
        direction VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risks_org ON risks(organization_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risks_category ON risks(category)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risk_kris_risk ON risk_kris(risk_id)
    `);

    tablesInitialized = true;
    console.log('[Risk DB] Tables initialized successfully');
  } catch (error) {
    console.error('[Risk DB] Failed to initialize tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Transform database row to RiskRecord
function transformRiskRow(row: Record<string, unknown>, kris: RiskKeyRiskIndicator[] = []): RiskRecord {
  return {
    id: row.id as string,
    riskId: row.risk_id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as RiskRecord['category'],
    subCategory: row.sub_category as string | undefined,
    likelihood: row.likelihood as number,
    impact: row.impact as number,
    residualLikelihood: row.residual_likelihood as number,
    residualImpact: row.residual_impact as number,
    velocity: row.velocity as RiskRecord['velocity'],
    riskOwner: row.risk_owner as string,
    businessUnit: row.business_unit as string | undefined,
    process: row.process as string | undefined,
    controlCount: row.control_count as number | undefined,
    controlEffectiveness: row.control_effectiveness ? Number(row.control_effectiveness) : undefined,
    status: row.status as RiskRecord['status'],
    reviewFrequency: row.review_frequency as RiskRecord['reviewFrequency'],
    lastReviewedAt: row.last_reviewed_at ? (row.last_reviewed_at as Date).toISOString() : undefined,
    nextReviewAt: row.next_review_at ? (row.next_review_at as Date).toISOString() : undefined,
    regulatoryCategory: row.regulatory_category as string[] | undefined,
    reportableToFCA: row.reportable_to_fca as boolean | undefined,
    consumerDutyRelevant: row.consumer_duty_relevant as boolean | undefined,
    keyRiskIndicators: kris,
  };
}

// Transform database row to KRI
function transformKriRow(row: Record<string, unknown>): RiskKeyRiskIndicator {
  return {
    id: row.id as string,
    name: row.name as string,
    metric: row.metric as string,
    threshold: {
      green: Number(row.threshold_green) || 0,
      amber: Number(row.threshold_amber) || 0,
      red: Number(row.threshold_red) || 0,
    },
    currentValue: Number(row.current_value) || 0,
    direction: row.direction as RiskKeyRiskIndicator['direction'],
  };
}

// Get all risks for an organization
export async function getRisksForOrganization(organizationId: string): Promise<RiskRecord[]> {
  const client = await pool.connect();

  try {
    // Ensure tables exist
    await initRiskTables();

    // Get all risks
    const risksResult = await client.query(`
      SELECT * FROM risks
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `, [organizationId]);

    if (risksResult.rows.length === 0) {
      return [];
    }

    // Get all KRIs for these risks
    const riskIds = risksResult.rows.map(r => r.id);
    const krisResult = await client.query(`
      SELECT * FROM risk_kris
      WHERE risk_id = ANY($1)
      ORDER BY created_at ASC
    `, [riskIds]);

    // Group KRIs by risk_id
    const krisByRisk = new Map<string, RiskKeyRiskIndicator[]>();
    for (const row of krisResult.rows) {
      const riskId = row.risk_id as string;
      if (!krisByRisk.has(riskId)) {
        krisByRisk.set(riskId, []);
      }
      krisByRisk.get(riskId)!.push(transformKriRow(row));
    }

    // Transform risks with their KRIs
    return risksResult.rows.map(row =>
      transformRiskRow(row, krisByRisk.get(row.id as string) || [])
    );
  } finally {
    client.release();
  }
}

// Get a single risk by ID
export async function getRiskById(organizationId: string, riskId: string): Promise<RiskRecord | null> {
  const client = await pool.connect();

  try {
    // Get risk by id or riskId
    const riskResult = await client.query(`
      SELECT * FROM risks
      WHERE organization_id = $1 AND (id = $2 OR risk_id = $2)
    `, [organizationId, riskId]);

    if (riskResult.rows.length === 0) {
      return null;
    }

    const row = riskResult.rows[0];

    // Get KRIs for this risk
    const krisResult = await client.query(`
      SELECT * FROM risk_kris
      WHERE risk_id = $1
      ORDER BY created_at ASC
    `, [row.id]);

    const kris = krisResult.rows.map(transformKriRow);

    return transformRiskRow(row, kris);
  } finally {
    client.release();
  }
}

// Create a new risk
export async function createRisk(organizationId: string, risk: RiskRecord): Promise<RiskRecord> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ensure tables exist
    await initRiskTables();

    // Insert risk
    const result = await client.query(`
      INSERT INTO risks (
        id, risk_id, organization_id, title, description, category, sub_category,
        likelihood, impact, residual_likelihood, residual_impact, velocity,
        risk_owner, business_unit, process, control_count, control_effectiveness,
        status, review_frequency, last_reviewed_at, next_review_at,
        regulatory_category, reportable_to_fca, consumer_duty_relevant
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `, [
      risk.id,
      risk.riskId,
      organizationId,
      risk.title,
      risk.description,
      risk.category,
      risk.subCategory || null,
      risk.likelihood,
      risk.impact,
      risk.residualLikelihood,
      risk.residualImpact,
      risk.velocity,
      risk.riskOwner,
      risk.businessUnit || null,
      risk.process || null,
      risk.controlCount || 0,
      risk.controlEffectiveness || 0,
      risk.status,
      risk.reviewFrequency,
      risk.lastReviewedAt ? new Date(risk.lastReviewedAt) : null,
      risk.nextReviewAt ? new Date(risk.nextReviewAt) : null,
      risk.regulatoryCategory || [],
      risk.reportableToFCA || false,
      risk.consumerDutyRelevant || false,
    ]);

    // Insert KRIs if any
    const kris: RiskKeyRiskIndicator[] = [];
    if (risk.keyRiskIndicators && risk.keyRiskIndicators.length > 0) {
      for (const kri of risk.keyRiskIndicators) {
        // Always generate a new UUID for KRIs to avoid duplicates
        const kriId = crypto.randomUUID();
        const kriResult = await client.query(`
          INSERT INTO risk_kris (id, risk_id, name, metric, threshold_green, threshold_amber, threshold_red, current_value, direction)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
          kriId,
          risk.id,
          kri.name,
          kri.metric,
          kri.threshold?.green || 0,
          kri.threshold?.amber || 0,
          kri.threshold?.red || 0,
          kri.currentValue || 0,
          kri.direction || null,
        ]);
        kris.push(transformKriRow(kriResult.rows[0]));
      }
    }

    await client.query('COMMIT');

    return transformRiskRow(result.rows[0], kris);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Update an existing risk
export async function updateRisk(organizationId: string, riskId: string, updates: Partial<RiskRecord>): Promise<RiskRecord | null> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Find the risk first
    const existingResult = await client.query(`
      SELECT * FROM risks
      WHERE organization_id = $1 AND (id = $2 OR risk_id = $2)
    `, [organizationId, riskId]);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const existing = existingResult.rows[0];

    // Update the risk
    const result = await client.query(`
      UPDATE risks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        sub_category = COALESCE($4, sub_category),
        likelihood = COALESCE($5, likelihood),
        impact = COALESCE($6, impact),
        residual_likelihood = COALESCE($7, residual_likelihood),
        residual_impact = COALESCE($8, residual_impact),
        velocity = COALESCE($9, velocity),
        risk_owner = COALESCE($10, risk_owner),
        business_unit = COALESCE($11, business_unit),
        process = COALESCE($12, process),
        control_count = COALESCE($13, control_count),
        control_effectiveness = COALESCE($14, control_effectiveness),
        status = COALESCE($15, status),
        review_frequency = COALESCE($16, review_frequency),
        regulatory_category = COALESCE($17, regulatory_category),
        reportable_to_fca = COALESCE($18, reportable_to_fca),
        consumer_duty_relevant = COALESCE($19, consumer_duty_relevant),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *
    `, [
      updates.title,
      updates.description,
      updates.category,
      updates.subCategory,
      updates.likelihood,
      updates.impact,
      updates.residualLikelihood,
      updates.residualImpact,
      updates.velocity,
      updates.riskOwner,
      updates.businessUnit,
      updates.process,
      updates.controlCount,
      updates.controlEffectiveness,
      updates.status,
      updates.reviewFrequency,
      updates.regulatoryCategory,
      updates.reportableToFCA,
      updates.consumerDutyRelevant,
      existing.id,
    ]);

    // Update KRIs if provided
    let kris: RiskKeyRiskIndicator[] = [];
    if (updates.keyRiskIndicators !== undefined) {
      // Delete existing KRIs
      await client.query(`DELETE FROM risk_kris WHERE risk_id = $1`, [existing.id]);

      // Insert new KRIs
      if (updates.keyRiskIndicators && updates.keyRiskIndicators.length > 0) {
        for (const kri of updates.keyRiskIndicators) {
          const kriId = crypto.randomUUID();
          const kriResult = await client.query(`
            INSERT INTO risk_kris (id, risk_id, name, metric, threshold_green, threshold_amber, threshold_red, current_value, direction)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `, [
            kriId,
            existing.id,
            kri.name,
            kri.metric,
            kri.threshold?.green || 0,
            kri.threshold?.amber || 0,
            kri.threshold?.red || 0,
            kri.currentValue || 0,
            kri.direction || null,
          ]);
          kris.push(transformKriRow(kriResult.rows[0]));
        }
      }
    } else {
      // Get existing KRIs
      const krisResult = await client.query(`
        SELECT * FROM risk_kris WHERE risk_id = $1 ORDER BY created_at ASC
      `, [existing.id]);
      kris = krisResult.rows.map(transformKriRow);
    }

    await client.query('COMMIT');

    return transformRiskRow(result.rows[0], kris);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Delete a risk
export async function deleteRisk(organizationId: string, riskId: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    // KRIs will be deleted automatically due to CASCADE
    const result = await client.query(`
      DELETE FROM risks
      WHERE organization_id = $1 AND (id = $2 OR risk_id = $2)
    `, [organizationId, riskId]);

    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// Update KRIs for a risk
export async function updateRiskKris(
  organizationId: string,
  riskId: string,
  kris: RiskKeyRiskIndicator[]
): Promise<RiskRecord | null> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Find the risk first
    const existingResult = await client.query(`
      SELECT * FROM risks
      WHERE organization_id = $1 AND (id = $2 OR risk_id = $2)
    `, [organizationId, riskId]);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const existing = existingResult.rows[0];

    // Delete existing KRIs
    await client.query(`DELETE FROM risk_kris WHERE risk_id = $1`, [existing.id]);

    // Insert new KRIs
    const newKris: RiskKeyRiskIndicator[] = [];
    for (const kri of kris) {
      const kriId = crypto.randomUUID();
      const kriResult = await client.query(`
        INSERT INTO risk_kris (id, risk_id, name, metric, threshold_green, threshold_amber, threshold_red, current_value, direction)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        kriId,
        existing.id,
        kri.name,
        kri.metric,
        kri.threshold?.green || 0,
        kri.threshold?.amber || 0,
        kri.threshold?.red || 0,
        kri.currentValue || 0,
        kri.direction || null,
      ]);
      newKris.push(transformKriRow(kriResult.rows[0]));
    }

    // Update the updated_at timestamp
    await client.query(`
      UPDATE risks SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [existing.id]);

    await client.query('COMMIT');

    return transformRiskRow(existing, newKris);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
