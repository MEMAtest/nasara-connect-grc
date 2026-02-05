// ---------------------------------------------------------------------------
// User-facing role labels & assignable role lists
// ---------------------------------------------------------------------------

/** Map DB role values → display labels shown in the UI. */
const ROLE_DISPLAY: Record<string, string> = {
  owner: "Admin",
  admin: "Admin",
  member: "User",
  viewer: "Restricted",
};

/**
 * Return the user-facing label for a DB role value.
 * Falls back to the raw value if unknown.
 */
export function getRoleLabel(dbRole: string): string {
  return ROLE_DISPLAY[dbRole] ?? dbRole;
}

/** Roles that any Admin (owner or admin) can assign to members. */
export const ASSIGNABLE_ROLES = [
  { label: "User", value: "member" },
  { label: "Restricted", value: "viewer" },
] as const;

/** Extended list — only owners can assign the Admin role. */
export const ADMIN_ASSIGNABLE_ROLES = [
  { label: "Admin", value: "admin" },
  ...ASSIGNABLE_ROLES,
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
export type AdminAssignableRole = (typeof ADMIN_ASSIGNABLE_ROLES)[number];
