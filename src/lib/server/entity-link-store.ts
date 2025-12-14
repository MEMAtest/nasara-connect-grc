import { pool } from "@/lib/database";

export type EntityType = "policy" | "risk" | "control" | "training" | "evidence";

export interface EntityLink {
  organizationId: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

type EntityLinkRow = {
  organization_id: string;
  from_type: EntityType;
  from_id: string;
  to_type: EntityType;
  to_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string | Date;
  updated_at: string | Date;
};

const memoryLinks = new Map<string, EntityLink[]>();
let linksTablesReady = false;
let fallbackToMemory = false;

function shouldUseMemoryStore(): boolean {
  return fallbackToMemory || process.env.USE_IN_MEMORY_LINKS === "1";
}

function toEntityLink(row: EntityLinkRow): EntityLink {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString();
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString();
  return {
    organizationId: row.organization_id,
    fromType: row.from_type,
    fromId: row.from_id,
    toType: row.to_type,
    toId: row.to_id,
    metadata: row.metadata ?? {},
    createdAt,
    updatedAt,
  };
}

function cloneLink(link: EntityLink): EntityLink {
  return JSON.parse(JSON.stringify(link));
}

function getMemoryLinks(orgId: string): EntityLink[] {
  if (!memoryLinks.has(orgId)) {
    memoryLinks.set(orgId, []);
  }
  return memoryLinks.get(orgId) ?? [];
}

function setMemoryLinks(orgId: string, links: EntityLink[]) {
  memoryLinks.set(
    orgId,
    links.map((link) => cloneLink(link)),
  );
}

async function ensureLinksTables() {
  if (linksTablesReady || shouldUseMemoryStore()) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS entity_links (
        organization_id TEXT NOT NULL,
        from_type TEXT NOT NULL,
        from_id TEXT NOT NULL,
        to_type TEXT NOT NULL,
        to_id TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (organization_id, from_type, from_id, to_type, to_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_entity_links_from ON entity_links (organization_id, from_type, from_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_entity_links_to ON entity_links (organization_id, to_type, to_id)`);
    linksTablesReady = true;
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to initialize entity_links table, using in-memory store", error);
    }
  } finally {
    client.release();
  }
}

export async function listEntityLinks(params: {
  organizationId: string;
  fromType: EntityType;
  fromId: string;
}): Promise<EntityLink[]> {
  const { organizationId, fromType, fromId } = params;

  if (shouldUseMemoryStore()) {
    return getMemoryLinks(organizationId)
      .filter((link) => link.fromType === fromType && link.fromId === fromId)
      .map((link) => cloneLink(link));
  }

  await ensureLinksTables();
  if (shouldUseMemoryStore()) {
    return getMemoryLinks(organizationId)
      .filter((link) => link.fromType === fromType && link.fromId === fromId)
      .map((link) => cloneLink(link));
  }

  const client = await pool.connect();
  try {
    const result = await client.query<EntityLinkRow>(
      `SELECT organization_id, from_type, from_id, to_type, to_id, metadata, created_at, updated_at
       FROM entity_links
       WHERE organization_id = $1 AND from_type = $2 AND from_id = $3
       ORDER BY to_type ASC, to_id ASC`,
      [organizationId, fromType, fromId],
    );
    return result.rows.map(toEntityLink);
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to query entity links, using in-memory store", error);
    }
    return getMemoryLinks(organizationId)
      .filter((link) => link.fromType === fromType && link.fromId === fromId)
      .map((link) => cloneLink(link));
  } finally {
    client.release();
  }
}

export async function listBackLinks(params: {
  organizationId: string;
  toType: EntityType;
  toId: string;
}): Promise<EntityLink[]> {
  const { organizationId, toType, toId } = params;

  if (shouldUseMemoryStore()) {
    return getMemoryLinks(organizationId)
      .filter((link) => link.toType === toType && link.toId === toId)
      .map((link) => cloneLink(link));
  }

  await ensureLinksTables();
  if (shouldUseMemoryStore()) {
    return getMemoryLinks(organizationId)
      .filter((link) => link.toType === toType && link.toId === toId)
      .map((link) => cloneLink(link));
  }

  const client = await pool.connect();
  try {
    const result = await client.query<EntityLinkRow>(
      `SELECT organization_id, from_type, from_id, to_type, to_id, metadata, created_at, updated_at
       FROM entity_links
       WHERE organization_id = $1 AND to_type = $2 AND to_id = $3
       ORDER BY from_type ASC, from_id ASC`,
      [organizationId, toType, toId],
    );
    return result.rows.map(toEntityLink);
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to query entity backlinks, using in-memory store", error);
    }
    return getMemoryLinks(organizationId)
      .filter((link) => link.toType === toType && link.toId === toId)
      .map((link) => cloneLink(link));
  } finally {
    client.release();
  }
}

export async function upsertEntityLink(params: {
  organizationId: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  metadata?: Record<string, unknown>;
}): Promise<EntityLink> {
  const { organizationId, fromType, fromId, toType, toId, metadata } = params;

  if (shouldUseMemoryStore()) {
    const links = getMemoryLinks(organizationId);
    const now = new Date().toISOString();
    const index = links.findIndex(
      (link) => link.fromType === fromType && link.fromId === fromId && link.toType === toType && link.toId === toId,
    );
    const next: EntityLink = {
      organizationId,
      fromType,
      fromId,
      toType,
      toId,
      metadata: metadata ?? {},
      createdAt: index >= 0 ? links[index].createdAt : now,
      updatedAt: now,
    };
    if (index >= 0) {
      links[index] = next;
    } else {
      links.push(next);
    }
    setMemoryLinks(organizationId, links);
    return cloneLink(next);
  }

  await ensureLinksTables();
  if (shouldUseMemoryStore()) {
    return upsertEntityLink({ organizationId, fromType, fromId, toType, toId, metadata });
  }

  const client = await pool.connect();
  try {
    const result = await client.query<EntityLinkRow>(
      `INSERT INTO entity_links (organization_id, from_type, from_id, to_type, to_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (organization_id, from_type, from_id, to_type, to_id)
       DO UPDATE SET metadata = EXCLUDED.metadata, updated_at = NOW()
       RETURNING organization_id, from_type, from_id, to_type, to_id, metadata, created_at, updated_at`,
      [organizationId, fromType, fromId, toType, toId, JSON.stringify(metadata ?? {})],
    );
    return toEntityLink(result.rows[0]);
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to upsert entity link, using in-memory store", error);
    }
    return upsertEntityLink({ organizationId, fromType, fromId, toType, toId, metadata });
  } finally {
    client.release();
  }
}

export async function deleteEntityLink(params: {
  organizationId: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
}): Promise<boolean> {
  const { organizationId, fromType, fromId, toType, toId } = params;

  if (shouldUseMemoryStore()) {
    const links = getMemoryLinks(organizationId);
    const next = links.filter(
      (link) => !(link.fromType === fromType && link.fromId === fromId && link.toType === toType && link.toId === toId),
    );
    const deleted = next.length !== links.length;
    if (deleted) setMemoryLinks(organizationId, next);
    return deleted;
  }

  await ensureLinksTables();
  if (shouldUseMemoryStore()) {
    return deleteEntityLink({ organizationId, fromType, fromId, toType, toId });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM entity_links
       WHERE organization_id = $1 AND from_type = $2 AND from_id = $3 AND to_type = $4 AND to_id = $5`,
      [organizationId, fromType, fromId, toType, toId],
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to delete entity link, using in-memory store", error);
    }
    return deleteEntityLink({ organizationId, fromType, fromId, toType, toId });
  } finally {
    client.release();
  }
}

export async function getLinkCountsForPolicies(params: {
  organizationId: string;
  policyIds: string[];
}): Promise<Record<string, Record<EntityType, number>>> {
  const { organizationId, policyIds } = params;
  const empty: Record<string, Record<EntityType, number>> = {};
  for (const id of policyIds) {
    empty[id] = { policy: 0, risk: 0, control: 0, training: 0, evidence: 0 };
  }

  if (policyIds.length === 0) return empty;

  if (shouldUseMemoryStore()) {
    const links = getMemoryLinks(organizationId);
    for (const link of links) {
      if (link.fromType !== "policy") continue;
      if (!empty[link.fromId]) continue;
      empty[link.fromId][link.toType] = (empty[link.fromId][link.toType] ?? 0) + 1;
    }
    return empty;
  }

  await ensureLinksTables();
  if (shouldUseMemoryStore()) {
    return getLinkCountsForPolicies({ organizationId, policyIds });
  }

  const client = await pool.connect();
  try {
    const result = await client.query<{ from_id: string; to_type: EntityType; count: number }>(
      `SELECT from_id, to_type, COUNT(*)::int AS count
       FROM entity_links
       WHERE organization_id = $1 AND from_type = 'policy' AND from_id = ANY($2)
       GROUP BY from_id, to_type`,
      [organizationId, policyIds],
    );
    for (const row of result.rows) {
      if (!empty[row.from_id]) continue;
      empty[row.from_id][row.to_type] = row.count;
    }
    return empty;
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to compute policy link counts, using in-memory store", error);
    }
    return getLinkCountsForPolicies({ organizationId, policyIds });
  } finally {
    client.release();
  }
}

