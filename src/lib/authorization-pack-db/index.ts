/**
 * Authorization Pack Database Module
 *
 * This module provides database operations for authorization packs.
 * It's organized into sub-modules for better maintainability:
 *
 * - types.ts: Shared TypeScript types and interfaces
 * - utils.ts: Utility functions for data transformation
 * - init.ts: Database initialization and schema management
 * - checklist.ts: Checklist operations
 *
 * For backwards compatibility, this index re-exports all public APIs.
 */

// Re-export types
export type {
  PackTemplateRow,
  PermissionEcosystemRow,
  OpinionPackGenerationJobRow,
  PackRow,
  SectionSummary,
  FullSectionData,
  ProjectAssessmentData,
  ProjectPlan,
  ReadinessSummary,
  ChecklistItemStatus,
  PackChecklistData,
} from "./types";

// Re-export utilities
export {
  normalizeEvidenceName,
  normalizeSectionKey,
  parseAnnexNumber,
  coerceJsonArray,
  coerceJsonObject,
  average,
  calcPercent,
} from "./utils";

// Re-export init functions
export {
  initAuthorizationPackDatabase,
  syncAuthorizationTemplates,
  ensureAuthorizationTemplates,
  syncPermissionEcosystems,
  ensurePermissionEcosystems,
  getPermissionEcosystems,
} from "./init";

// Re-export checklist functions
export {
  getPackChecklist,
  updatePackChecklistItem,
  replacePackChecklist,
} from "./checklist";
