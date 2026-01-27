-- ============================================================================
-- PRODUCTION READINESS DATABASE MIGRATION
-- ============================================================================

-- 1. Add soft delete columns
ALTER TABLE packs
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

ALTER TABLE authorization_projects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

ALTER TABLE evidence_items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

ALTER TABLE pack_documents
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) DEFAULT NULL;

-- 2. Add version columns for optimistic locking
ALTER TABLE prompt_responses
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE section_instances
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 3. Create comprehensive audit log table
CREATE TABLE IF NOT EXISTS authorization_pack_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  actor_id VARCHAR(100) NOT NULL,
  organization_id VARCHAR(100) NOT NULL,
  changes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_packs_deleted_at
ON packs(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_authorization_projects_deleted_at
ON authorization_projects(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_items_deleted_at
ON evidence_items(deleted_at) WHERE deleted_at IS NOT NULL;

-- 5. Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
ON authorization_pack_audit_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
ON authorization_pack_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_organization
ON authorization_pack_audit_log(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor
ON authorization_pack_audit_log(actor_id);

-- 6. Create missing performance indexes
CREATE INDEX IF NOT EXISTS idx_packs_organization_id
ON packs(organization_id);

CREATE INDEX IF NOT EXISTS idx_packs_created_at
ON packs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_section_instances_pack_id
ON section_instances(pack_id);

CREATE INDEX IF NOT EXISTS idx_evidence_items_pack_id
ON evidence_items(pack_id);

CREATE INDEX IF NOT EXISTS idx_evidence_items_section_instance_id
ON evidence_items(section_instance_id);

CREATE INDEX IF NOT EXISTS idx_prompt_responses_section_instance_id
ON prompt_responses(section_instance_id);

CREATE INDEX IF NOT EXISTS idx_pack_documents_pack_id
ON pack_documents(pack_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_packs_org_deleted_created
ON packs(organization_id, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_pack_section
ON evidence_items(pack_id, section_instance_id);

-- 7. Add constraint to ensure version is always positive
ALTER TABLE prompt_responses
ADD CONSTRAINT prompt_responses_version_positive CHECK (version > 0);

ALTER TABLE section_instances
ADD CONSTRAINT section_instances_version_positive CHECK (version > 0);
