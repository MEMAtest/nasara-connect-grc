-- ============================================================================
-- Organizations, RBAC, and Prisma alignment migration
-- ============================================================================

-- Rename legacy Prisma tables if they exist
DO $$
BEGIN
  IF to_regclass('public.organizations') IS NULL AND to_regclass('public."Organization"') IS NOT NULL THEN
    ALTER TABLE "Organization" RENAME TO organizations;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.smcr_group_entities') IS NULL AND to_regclass('public."SmcrGroupEntity"') IS NOT NULL THEN
    ALTER TABLE "SmcrGroupEntity" RENAME TO smcr_group_entities;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.smcr_breaches') IS NULL AND to_regclass('public."SmcrBreach"') IS NOT NULL THEN
    ALTER TABLE "SmcrBreach" RENAME TO smcr_breaches;
  END IF;
END $$;

-- Normalize legacy column names if needed
DO $$
BEGIN
  IF to_regclass('public.organizations') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='organizations' AND column_name='createdAt'
    ) THEN
      ALTER TABLE organizations RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='organizations' AND column_name='updatedAt'
    ) THEN
      ALTER TABLE organizations RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.smcr_group_entities') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_group_entities' AND column_name='organizationId'
    ) THEN
      ALTER TABLE smcr_group_entities RENAME COLUMN "organizationId" TO organization_id;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_group_entities' AND column_name='parentId'
    ) THEN
      ALTER TABLE smcr_group_entities RENAME COLUMN "parentId" TO parent_id;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_group_entities' AND column_name='ownershipPercent'
    ) THEN
      ALTER TABLE smcr_group_entities RENAME COLUMN "ownershipPercent" TO ownership_percent;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_group_entities' AND column_name='createdAt'
    ) THEN
      ALTER TABLE smcr_group_entities RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_group_entities' AND column_name='updatedAt'
    ) THEN
      ALTER TABLE smcr_group_entities RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.smcr_breaches') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_breaches' AND column_name='firmId'
    ) THEN
      ALTER TABLE smcr_breaches RENAME COLUMN "firmId" TO firm_id;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_breaches' AND column_name='personId'
    ) THEN
      ALTER TABLE smcr_breaches RENAME COLUMN "personId" TO person_id;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_breaches' AND column_name='ruleId'
    ) THEN
      ALTER TABLE smcr_breaches RENAME COLUMN "ruleId" TO rule_id;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_breaches' AND column_name='createdAt'
    ) THEN
      ALTER TABLE smcr_breaches RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='smcr_breaches' AND column_name='updatedAt'
    ) THEN
      ALTER TABLE smcr_breaches RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
  END IF;
END $$;

-- Core organization tables
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invites(email);

-- SMCR alignment (ensure expected columns exist)
CREATE TABLE IF NOT EXISTS smcr_group_entities (
  id VARCHAR(255) PRIMARY KEY,
  organization_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  parent_id VARCHAR(255),
  ownership_percent NUMERIC(5,2),
  country VARCHAR(100),
  linked_firm_id VARCHAR(255),
  linked_project_id VARCHAR(255),
  linked_project_name VARCHAR(255),
  regulatory_status VARCHAR(255),
  is_external BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smcr_breaches (
  id VARCHAR(255) PRIMARY KEY,
  firm_id VARCHAR(255) REFERENCES smcr_firms(id) ON DELETE CASCADE,
  person_id VARCHAR(255) REFERENCES smcr_people(id) ON DELETE SET NULL,
  rule_id VARCHAR(255),
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  timeline JSONB DEFAULT '[]',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
