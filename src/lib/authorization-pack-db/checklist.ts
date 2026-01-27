/**
 * Checklist operations for authorization packs
 */

import { pool } from "@/lib/database";
import { initAuthorizationPackDatabase } from "./init";
import { coerceJsonObject } from "./utils";
import type { PackChecklistData, ChecklistItemStatus } from "./types";
import type { PoolClient } from "pg";

/**
 * Ensure the checklist_data column exists on the packs table
 */
async function ensureChecklistColumn(client: PoolClient): Promise<void> {
  await client.query(`
    ALTER TABLE packs
    ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT '{}'::jsonb
  `);
}

/**
 * Get the checklist data for a pack
 */
export async function getPackChecklist(packId: string): Promise<PackChecklistData> {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await ensureChecklistColumn(client);
    const result = await client.query(
      `SELECT checklist_data FROM packs WHERE id = $1 AND deleted_at IS NULL`,
      [packId]
    );
    if (result.rows.length === 0) {
      return {};
    }
    return coerceJsonObject<PackChecklistData>(result.rows[0].checklist_data);
  } finally {
    client.release();
  }
}

/**
 * Update a single checklist item status
 */
export async function updatePackChecklistItem(
  packId: string,
  itemId: string,
  status: ChecklistItemStatus
): Promise<void> {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await ensureChecklistColumn(client);
    await client.query(
      `UPDATE packs
       SET checklist_data = COALESCE(checklist_data, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL`,
      [JSON.stringify({ [itemId]: status }), packId]
    );
  } finally {
    client.release();
  }
}

/**
 * Replace entire checklist data for a pack
 */
export async function replacePackChecklist(
  packId: string,
  checklist: PackChecklistData
): Promise<void> {
  await initAuthorizationPackDatabase();
  const client = await pool.connect();
  try {
    await ensureChecklistColumn(client);
    await client.query(
      `UPDATE packs
       SET checklist_data = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL`,
      [JSON.stringify(checklist), packId]
    );
  } finally {
    client.release();
  }
}
