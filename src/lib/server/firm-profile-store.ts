/**
 * Firm Profile Store - Database Operations
 * Handles CRUD operations for firm profiles
 */

import { pool } from '../database';
import type {
  FirmProfile,
  FirmProfileCreate,
  FirmAttributes,
  FirmBranding,
} from '../policies/types';
import type { QueryResult } from 'pg';

// =====================================================
// DATABASE CLIENT
// =====================================================

interface DatabaseClient {
  query: <T = any>(sql: string, params: any[]) => Promise<QueryResult<T>>;
}

const defaultDbClient: DatabaseClient = {
  query: (sql, params) => pool.query(sql, params),
};

let dbClient: DatabaseClient = defaultDbClient;

export function setDatabaseClient(client?: DatabaseClient) {
  dbClient = client ?? defaultDbClient;
}

function getDbClient(): DatabaseClient {
  return dbClient;
}

// =====================================================
// FIRM PROFILE OPERATIONS
// =====================================================

/**
 * Get firm profile by firm ID
 */
export async function getFirmProfile(firmId: string): Promise<FirmProfile | null> {
  const db = getDbClient();

  const result = await db.query(
    `
    SELECT
      firm_id,
      name,
      attributes,
      branding,
      created_at,
      updated_at
    FROM firm_profiles
    WHERE firm_id = $1
    `,
    [firmId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    firm_id: row.firm_id,
    name: row.name,
    attributes: row.attributes as FirmAttributes,
    branding: row.branding as FirmBranding,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Create or update firm profile
 */
export async function upsertFirmProfile(
  profile: FirmProfileCreate
): Promise<FirmProfile> {
  const db = getDbClient();

  const result = await db.query(
    `
    INSERT INTO firm_profiles (firm_id, name, attributes, branding)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (firm_id) DO UPDATE SET
      name = EXCLUDED.name,
      attributes = EXCLUDED.attributes,
      branding = EXCLUDED.branding,
      updated_at = NOW()
    RETURNING
      firm_id,
      name,
      attributes,
      branding,
      created_at,
      updated_at
    `,
    [
      profile.firm_id,
      profile.name,
      JSON.stringify(profile.attributes),
      JSON.stringify(profile.branding),
    ]
  );

  const row = result.rows[0];
  return {
    firm_id: row.firm_id,
    name: row.name,
    attributes: row.attributes as FirmAttributes,
    branding: row.branding as FirmBranding,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Update firm attributes only
 */
export async function updateFirmAttributes(
  firmId: string,
  attributes: Partial<FirmAttributes>
): Promise<FirmProfile> {
  const db = getDbClient();

  // First get existing profile
  const existing = await getFirmProfile(firmId);
  if (!existing) {
    throw new Error(`Firm profile not found: ${firmId}`);
  }

  // Merge attributes
  const updatedAttributes = { ...existing.attributes, ...attributes };

  const result = await db.query(
    `
    UPDATE firm_profiles
    SET
      attributes = $2,
      updated_at = NOW()
    WHERE firm_id = $1
    RETURNING
      firm_id,
      name,
      attributes,
      branding,
      created_at,
      updated_at
    `,
    [firmId, JSON.stringify(updatedAttributes)]
  );

  const row = result.rows[0];
  return {
    firm_id: row.firm_id,
    name: row.name,
    attributes: row.attributes as FirmAttributes,
    branding: row.branding as FirmBranding,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Update firm branding only
 */
export async function updateFirmBranding(
  firmId: string,
  branding: Partial<FirmBranding>
): Promise<FirmProfile> {
  const db = getDbClient();

  // First get existing profile
  const existing = await getFirmProfile(firmId);
  if (!existing) {
    throw new Error(`Firm profile not found: ${firmId}`);
  }

  // Merge branding
  const updatedBranding = { ...existing.branding, ...branding };

  const result = await db.query(
    `
    UPDATE firm_profiles
    SET
      branding = $2,
      updated_at = NOW()
    WHERE firm_id = $1
    RETURNING
      firm_id,
      name,
      attributes,
      branding,
      created_at,
      updated_at
    `,
    [firmId, JSON.stringify(updatedBranding)]
  );

  const row = result.rows[0];
  return {
    firm_id: row.firm_id,
    name: row.name,
    attributes: row.attributes as FirmAttributes,
    branding: row.branding as FirmBranding,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Delete firm profile
 */
export async function deleteFirmProfile(firmId: string): Promise<boolean> {
  const db = getDbClient();

  const result = await db.query(
    `
    DELETE FROM firm_profiles
    WHERE firm_id = $1
    RETURNING firm_id
    `,
    [firmId]
  );

  return result.rows.length > 0;
}

/**
 * List all firm profiles (for admin)
 */
export async function listFirmProfiles(): Promise<FirmProfile[]> {
  const db = getDbClient();

  const result = await db.query(
    `
    SELECT
      firm_id,
      name,
      attributes,
      branding,
      created_at,
      updated_at
    FROM firm_profiles
    ORDER BY name ASC
    `,
    []
  );

  return result.rows.map((row) => ({
    firm_id: row.firm_id,
    name: row.name,
    attributes: row.attributes as FirmAttributes,
    branding: row.branding as FirmBranding,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

// =====================================================
// DEFAULT ANSWERS GENERATION
// =====================================================

/**
 * Generate default answers for wizard based on firm attributes
 * This maps firm attributes to question codes
 */
export function generateDefaultAnswers(
  attributes: FirmAttributes
): Record<string, any> {
  const defaults: Record<string, any> = {};

  // Map firm attributes to common question codes
  // These mappings should align with your actual question codes

  if (attributes.ar_or_principal) {
    defaults.firm_role = attributes.ar_or_principal;
  }

  if (attributes.permissions) {
    defaults.permissions = attributes.permissions;
  }

  if (attributes.client_types) {
    defaults.client_types = attributes.client_types;
  }

  if (attributes.channels) {
    defaults.channels = attributes.channels;
  }

  if (attributes.size) {
    defaults.firm_size = attributes.size;
  }

  if (attributes.outsourcing) {
    defaults.outsourcing = attributes.outsourcing;
  }

  if (attributes.high_risk_jurisdictions) {
    defaults.high_risk_jurisdictions = attributes.high_risk_jurisdictions;
  }

  if (attributes.products) {
    defaults.products = attributes.products;
  }

  return defaults;
}

/**
 * Get default answers for a specific firm
 */
export async function getFirmDefaults(
  firmId: string
): Promise<Record<string, any>> {
  const profile = await getFirmProfile(firmId);

  if (!profile) {
    return {};
  }

  return generateDefaultAnswers(profile.attributes);
}
