import { pool } from "@/lib/database";
import { logError } from "@/lib/logger";
import type { ModuleId } from "@/lib/module-access-shared";

const DEFAULT_MODULES_BY_PLAN: Record<string, Array<ModuleId | "*">> = {
  starter: ["grcHub", "authPack", "riskAssessment", "policies", "training", "regulatoryNews"],
  growth: [
    "grcHub",
    "authPack",
    "riskAssessment",
    "policies",
    "training",
    "regulatoryNews",
    "smcr",
    "complianceFramework",
    "reportingPack",
    "registers",
    "complaints",
  ],
  scale: ["*"],
  enterprise: ["*"],
};

function getDefaultModulesForPlan(plan: string | null | undefined): Array<ModuleId | "*"> {
  const normalized = (plan ?? "starter").trim().toLowerCase();
  return DEFAULT_MODULES_BY_PLAN[normalized] ?? DEFAULT_MODULES_BY_PLAN.starter;
}

export type OrganizationRole = "owner" | "admin" | "member" | "viewer";

export interface OrganizationRecord {
  id: string;
  name: string;
  domain: string;
  plan: string;
  settings: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationMemberRecord {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: Date;
  updated_at: Date;
  user_email?: string;
  user_name?: string | null;
  avatar_url?: string | null;
}

export interface OrganizationInviteRecord {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  invited_by: string | null;
  expires_at: Date | null;
  accepted_at: Date | null;
  created_at: Date;
}

let initPromise: Promise<void> | null = null;

export async function initOrganizationTables(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE NOT NULL,
        plan TEXT DEFAULT 'starter',
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (organization_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_invites (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
        invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        expires_at TIMESTAMP,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_org_invites_org ON organization_invites(organization_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invites(email)`);
  })().catch((error) => {
    initPromise = null;
    logError(error, "Failed to initialize organization tables");
    throw error;
  });

  return initPromise;
}

export async function getOrganizationById(id: string): Promise<OrganizationRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationRecord>(
    `SELECT * FROM organizations WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getOrganizationEnabledModules(
  organizationId: string,
): Promise<string[] | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<{ settings: Record<string, unknown> | null; plan: string | null }>(
    `SELECT settings, plan FROM organizations WHERE id = $1`,
    [organizationId],
  );
  const record = rows[0];
  if (!record) {
    return process.env.NODE_ENV === "production" ? [] : null;
  }

  const settings = record.settings;
  const modules = settings ? (settings as Record<string, unknown>).enabledModules : undefined;

  if (Array.isArray(modules)) return modules as string[];

  // Dev default: fail-open (everything enabled) when not configured.
  if (process.env.NODE_ENV !== "production") return null;

  // Production default: fall back to plan defaults (prevents "missing key = everything enabled").
  return getDefaultModulesForPlan(record.plan) as string[];
}

export async function setOrganizationEnabledModules(
  organizationId: string,
  enabledModules: string[] | null,
): Promise<boolean> {
  await initOrganizationTables();

  if (enabledModules === null) {
    // Null means "all modules enabled": remove the key to fall back to default behavior.
    const { rowCount } = await pool.query(
      `UPDATE organizations
       SET settings = COALESCE(settings, '{}'::jsonb) - 'enabledModules',
           updated_at = NOW()
       WHERE id = $1`,
      [organizationId],
    );
    return (rowCount ?? 0) > 0;
  }

  const { rowCount } = await pool.query(
    `UPDATE organizations
     SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{enabledModules}', $2::jsonb, true),
         updated_at = NOW()
     WHERE id = $1`,
    [organizationId, JSON.stringify(enabledModules)],
  );
  return (rowCount ?? 0) > 0;
}

export async function getOrganizationByDomain(domain: string): Promise<OrganizationRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationRecord>(
    `SELECT * FROM organizations WHERE domain = $1`,
    [domain]
  );
  return rows[0] ?? null;
}

export async function getOrganizationIdByDomain(domain: string): Promise<string | null> {
  const org = await getOrganizationByDomain(domain);
  return org?.id ?? null;
}

export async function upsertOrganization(params: {
  id: string;
  domain: string;
  name: string;
  plan?: string;
  settings?: Record<string, unknown>;
}): Promise<OrganizationRecord> {
  await initOrganizationTables();
  const { id, domain, name, plan = "starter", settings = {} } = params;
  const { rows } = await pool.query<OrganizationRecord>(
    `INSERT INTO organizations (id, name, domain, plan, settings)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (domain) DO UPDATE
       SET name = COALESCE(NULLIF(organizations.name, ''), EXCLUDED.name),
           plan = COALESCE(NULLIF(organizations.plan, ''), EXCLUDED.plan),
           settings = COALESCE(organizations.settings, EXCLUDED.settings),
           updated_at = NOW()
     RETURNING *`,
    [id, name, domain, plan, settings]
  );
  return rows[0] ?? (await getOrganizationByDomain(domain))!;
}

export async function updateOrganization(
  id: string,
  updates: Partial<Pick<OrganizationRecord, "name" | "plan" | "settings">>
): Promise<OrganizationRecord | null> {
  await initOrganizationTables();
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (typeof updates.name === "string") {
    fields.push(`name = $${index++}`);
    values.push(updates.name);
  }
  if (typeof updates.plan === "string") {
    fields.push(`plan = $${index++}`);
    values.push(updates.plan);
  }
  if (updates.settings !== undefined) {
    fields.push(`settings = $${index++}`);
    values.push(updates.settings);
  }

  if (!fields.length) return getOrganizationById(id);

  values.push(id);
  const { rows } = await pool.query<OrganizationRecord>(
    `UPDATE organizations
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${index}
     RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

export async function upsertUser(params: {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<UserRecord> {
  await initOrganizationTables();
  const { id, email, name = null, avatarUrl = null } = params;
  const { rows } = await pool.query<UserRecord>(
    `INSERT INTO users (id, email, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = NOW()
     RETURNING *`,
    [id, email, name, avatarUrl]
  );
  return rows[0];
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<UserRecord>(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<UserRecord>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function getOrganizationMemberByUserId(
  organizationId: string,
  userId: string
): Promise<OrganizationMemberRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationMemberRecord>(
    `SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
    [organizationId, userId]
  );
  return rows[0] ?? null;
}

export async function getOrganizationMemberById(
  organizationId: string,
  memberId: string
): Promise<OrganizationMemberRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationMemberRecord>(
    `SELECT * FROM organization_members WHERE organization_id = $1 AND id = $2`,
    [organizationId, memberId]
  );
  return rows[0] ?? null;
}

export async function countOrganizationOwners(organizationId: string): Promise<number> {
  await initOrganizationTables();
  const { rows } = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM organization_members WHERE organization_id = $1 AND role = 'owner'`,
    [organizationId]
  );
  return rows[0]?.count ?? 0;
}

export async function upsertOrganizationMember(params: {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
}): Promise<OrganizationMemberRecord> {
  await initOrganizationTables();
  const { organizationId, userId, role } = params;
  const id = crypto.randomUUID();
  const { rows } = await pool.query<OrganizationMemberRecord>(
    `INSERT INTO organization_members (id, organization_id, user_id, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (organization_id, user_id) DO UPDATE
       SET role = CASE
         WHEN organization_members.role = 'owner' THEN 'owner'
         ELSE EXCLUDED.role
       END,
       updated_at = NOW()
     RETURNING *`,
    [id, organizationId, userId, role]
  );
  return rows[0];
}

export async function listOrganizationMembers(organizationId: string): Promise<OrganizationMemberRecord[]> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationMemberRecord>(
    `SELECT m.id,
            m.organization_id,
            m.user_id,
            m.role,
            m.created_at,
            m.updated_at,
            u.email AS user_email,
            u.name AS user_name,
            u.avatar_url
     FROM organization_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.organization_id = $1
     ORDER BY m.created_at ASC`,
    [organizationId]
  );
  return rows;
}

export async function getOrganizationMemberByEmail(
  organizationId: string,
  email: string
): Promise<OrganizationMemberRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationMemberRecord>(
    `SELECT m.id,
            m.organization_id,
            m.user_id,
            m.role,
            m.created_at,
            m.updated_at,
            u.email AS user_email,
            u.name AS user_name,
            u.avatar_url
     FROM organization_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.organization_id = $1 AND u.email = $2`,
    [organizationId, email]
  );
  return rows[0] ?? null;
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  memberId: string,
  role: OrganizationRole
): Promise<OrganizationMemberRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationMemberRecord>(
    `UPDATE organization_members
     SET role = $1, updated_at = NOW()
     WHERE id = $2 AND organization_id = $3
     RETURNING *`,
    [role, memberId, organizationId]
  );
  return rows[0] ?? null;
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string
): Promise<boolean> {
  await initOrganizationTables();
  const { rowCount } = await pool.query(
    `DELETE FROM organization_members WHERE id = $1 AND organization_id = $2`,
    [memberId, organizationId]
  );
  return (rowCount ?? 0) > 0;
}

export async function createOrganizationInvite(params: {
  organizationId: string;
  email: string;
  role: OrganizationRole;
  invitedBy?: string | null;
  expiresAt?: Date | null;
}): Promise<OrganizationInviteRecord> {
  await initOrganizationTables();
  const { organizationId, email, role, invitedBy = null, expiresAt = null } = params;
  const id = crypto.randomUUID();
  const { rows } = await pool.query<OrganizationInviteRecord>(
    `INSERT INTO organization_invites (id, organization_id, email, role, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, organizationId, email, role, invitedBy, expiresAt]
  );
  return rows[0];
}

export async function listOrganizationInvites(organizationId: string): Promise<OrganizationInviteRecord[]> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationInviteRecord>(
    `SELECT * FROM organization_invites WHERE organization_id = $1 ORDER BY created_at DESC`,
    [organizationId]
  );
  return rows;
}

export async function getOrganizationInvite(
  organizationId: string,
  inviteId: string
): Promise<OrganizationInviteRecord | null> {
  await initOrganizationTables();
  const { rows } = await pool.query<OrganizationInviteRecord>(
    `SELECT * FROM organization_invites WHERE organization_id = $1 AND id = $2`,
    [organizationId, inviteId]
  );
  return rows[0] ?? null;
}

export async function acceptOrganizationInvite(params: {
  organizationId: string;
  inviteId: string;
  userId: string;
}): Promise<OrganizationInviteRecord | null> {
  await initOrganizationTables();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inviteResult = await client.query<OrganizationInviteRecord>(
      `SELECT * FROM organization_invites WHERE organization_id = $1 AND id = $2 FOR UPDATE`,
      [params.organizationId, params.inviteId]
    );
    const invite = inviteResult.rows[0];
    if (!invite) {
      await client.query("ROLLBACK");
      return null;
    }
    if (invite.accepted_at) {
      await client.query("ROLLBACK");
      return invite;
    }
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE organization_invites SET accepted_at = NOW() WHERE id = $1`,
      [invite.id]
    );

    await client.query(
      `INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id) DO UPDATE
         SET role = CASE
           WHEN organization_members.role = 'owner' THEN 'owner'
           ELSE EXCLUDED.role
         END,
         updated_at = NOW()`,
      [crypto.randomUUID(), invite.organization_id, params.userId, invite.role]
    );

    await client.query("COMMIT");
    return { ...invite, accepted_at: new Date() };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrganizationsForUser(
  userId: string
): Promise<Array<{ id: string; name: string; domain: string; role: string }>> {
  await initOrganizationTables();
  const { rows } = await pool.query<{ id: string; name: string; domain: string; role: string }>(
    `SELECT o.id, o.name, o.domain, m.role
     FROM organization_members m
     JOIN organizations o ON o.id = m.organization_id
     WHERE m.user_id = $1
     ORDER BY o.name`,
    [userId]
  );
  return rows;
}

export async function ensureOrganizationForUser(params: {
  email: string;
  userId: string;
  name?: string | null;
  avatarUrl?: string | null;
  organizationId?: string;
  organizationName?: string;
  plan?: string;
}): Promise<{ organization: OrganizationRecord; member: OrganizationMemberRecord }> {
  await initOrganizationTables();
  const { email, userId, name, avatarUrl, organizationId, organizationName, plan } = params;
  const domain = email.split("@")[1] || "default.local";
  const orgName = organizationName ?? domain.split(".")[0]?.replace(/-/g, " ").toUpperCase() ?? "Organization";
  const orgId = organizationId ?? crypto.randomUUID();

  const isProduction = process.env.NODE_ENV === "production";
  const normalizedPlan = plan ?? "starter";

  const existingOrg = isProduction ? await getOrganizationByDomain(domain) : null;
  const shouldSeedModules = isProduction && !existingOrg;
  const seededModules = shouldSeedModules
    ? getDefaultModulesForPlan(normalizedPlan)
    : null;

  const organization = await upsertOrganization({
    id: orgId,
    domain,
    name: orgName,
    plan: normalizedPlan,
    settings: seededModules ? { enabledModules: seededModules } : {},
  });

  await upsertUser({
    id: userId,
    email,
    name: name ?? null,
    avatarUrl: avatarUrl ?? null,
  });

  const ownerCount = await countOrganizationOwners(organization.id);
  const role: OrganizationRole = ownerCount === 0 ? "owner" : "member";
  const member = await upsertOrganizationMember({
    organizationId: organization.id,
    userId,
    role,
  });

  return { organization, member };
}
