# Firm Module Access Control & User Roles

**Status:** Draft (v2 — post code review)
**Branch:** `claude/firm-module-access-control-AdnpW`

---

## Problem Statement

Not all firms should see all modules. Nasara Connect needs to control which
platform sections are available per firm, and which actions each user within a
firm can perform.

---

## Part 1 — Module Access Control

### 1.1 Module Registry

Every gatable module has a canonical ID. These are the IDs used throughout the
system (sidebar, dashboard cards, route guards, API routes).

The `MODULE_REGISTRY` is the single source of truth. It maps each module ID to
its route prefix(es) and the corresponding sidebar navigation item(s).

| Module ID             | Label                   | Page route prefix(es)              | API route prefix(es)                          |
|-----------------------|-------------------------|------------------------------------|-----------------------------------------------|
| `authPack`            | Authorisation Pack      | `/authorization-pack`              | `/api/authorization-pack`                     |
| `policies`            | Policy Management       | `/policies`                        | `/api/policies`                               |
| `smcr`                | Governance & People     | `/smcr`                            | `/api/smcr`                                   |
| `riskAssessment`      | Risk Assessment         | `/risk-assessment`                 | `/api/organizations/*/risks`                  |
| `complianceFramework` | Compliance Framework    | `/compliance-framework`            | `/api/compliance-framework`                   |
| `reportingPack`       | Reporting Pack          | `/reporting`                       | `/api/reporting`                              |
| `training`            | Training Library        | `/training-library`                | `/api/training`                               |
| `registers`           | Registers               | `/registers` (excluding `/registers/complaints`) | `/api/registers` (excluding `/api/registers/complaints`) |
| `complaints`          | Complaints              | `/registers/complaints`            | `/api/registers/complaints`, `/api/complaints`|
| `regulatoryNews`      | Regulatory News         | `/regulatory-news`                 | `/api/regulatory-news`                        |
| `payments`            | Payments                | `/payments`                        | `/api/payments`                               |
| `aiChat`              | AI Assistant            | `/ai-chat`                         | `/api/ai`                                     |
| `grcHub`              | GRC Control Panel       | `/grc-hub`                         | `/api/grc-hub`                                |

**Always visible (not gatable):** Dashboard (`/`), Settings (`/settings`),
Support (`/support`), Admin (`/admin` — for firm admins only).

> **Route matching order (C-3 fix):** When resolving a pathname to a module ID,
> match **most-specific routes first**. `/registers/complaints` must match
> `complaints` before `/registers` matches `registers`. The `resolveModuleId()`
> function sorts route prefixes by length descending before matching.

### 1.2 Storage

Enabled modules are stored in the existing `organizations.settings` JSONB
column (`src/lib/server/organization-store.ts:59`). No schema migration needed.

```jsonc
{
  "enabledModules": ["authPack", "policies", "smcr"]
}
```

- If `enabledModules` is **absent or null**, the firm sees **no gatable
  modules** (fail-closed).
- An explicit empty array `[]` also means no modules.
- A special value `["*"]` means all modules enabled (platform admin override).

### 1.3 Acceptance Criteria — Module Visibility

| # | Criterion | Detail |
|---|-----------|--------|
| M-1 | **Sidebar hides disabled modules** | Navigation items for disabled modules do not render. Both `navigationGroups` items and `topLevelItems` (GRC Hub, Complaints) are filtered. If all items in a group are disabled, the entire group header is hidden. |
| M-2 | **Dashboard cards reflect access** | Module cards for disabled modules do not render. The existing `DashboardModule.id` field already matches module IDs — no new field needed. |
| M-3 | **Direct URL access is blocked** | Navigating to `/risk-assessment` when `riskAssessment` is not enabled redirects to `/?module_blocked=riskAssessment`. The dashboard page reads this query param and shows a toast: *"Your firm does not have access to this module."* |
| M-4 | **API routes enforce module access** | API calls under a disabled module's prefix return `403 { error: "Module not enabled for this organization" }`. Enforced via a shared `withModuleAccess()` wrapper. |
| M-5 | **Context loads modules + role in one call** | `OrganizationProvider` fetches `GET /api/organization/context` on mount, which returns `{ enabledModules, role }`. Cached in React context. Shows sidebar skeleton while loading. On fetch failure, retries once then shows a "Retry" banner (not fail-closed blank screen). |
| M-6 | **Admin can view module config** | Firm admins can see which modules are enabled in Settings > Organization (displayed as human-readable labels, not raw IDs). Wildcard `["*"]` displays as "All modules". Admins **cannot** self-enable modules. |
| M-7 | **`useModuleAccess` hook** | A client hook exposes `enabledModules: string[]`, `isModuleEnabled(id: string): boolean`, and `isLoading: boolean`. |
| M-8 | **Wildcard override** | If `enabledModules` contains `"*"`, all modules are treated as enabled. |

### 1.4 Example Configuration

A firm that should only see Authorisation Pack, Policies, and Governance &
People:

```json
{ "enabledModules": ["authPack", "policies", "smcr"] }
```

---

## Part 2 — User Roles & Permissions

### 2.1 Role Definitions

The platform has three user-facing roles. These map to the existing database
column `organization_members.role`.

| User-Facing Label | DB Value     | Description |
|-------------------|--------------|-------------|
| **Admin**         | `owner` or `admin` | Full control over the firm's platform. Super user. |
| **User**          | `member`     | Standard team member. Can work within enabled modules. |
| **Restricted**    | `viewer`     | Read-only access. Can view but not create or modify. |

> The existing `owner` role is kept internally to track the original firm
> creator (cannot be demoted). In the UI, both `owner` and `admin` display as
> **"Admin"**.

A display mapping utility is required:

```typescript
// src/lib/role-labels.ts
const ROLE_DISPLAY: Record<string, string> = {
  owner: "Admin",
  admin: "Admin",
  member: "User",
  viewer: "Restricted",
};
export function getRoleLabel(dbRole: string): string {
  return ROLE_DISPLAY[dbRole] ?? dbRole;
}

// For invite/role-change dropdowns (label → value pairs)
export const ASSIGNABLE_ROLES = [
  { label: "User", value: "member" },
  { label: "Restricted", value: "viewer" },
] as const;

// Only owners see this additional option
export const ADMIN_ASSIGNABLE_ROLES = [
  { label: "Admin", value: "admin" },
  ...ASSIGNABLE_ROLES,
] as const;
```

### 2.2 Adding Role to Session & JWT

> **C-2 fix:** The user's role must be available in the client session to avoid
> an extra API call on every page. This requires changes to `src/auth.ts`.

**Changes to `src/auth.ts`:**

1. Extend the JWT type to include `role?: string`:

```typescript
declare module "@auth/core/jwt" {
  interface JWT {
    organizationId?: string;
    role?: string;          // ← new
    roleRefreshedAt?: number; // ← new
  }
}
```

2. Extend the Session type:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      role: string;           // ← new
    } & DefaultSession["user"];
  }
}
```

3. In the `jwt` callback, look up the member's role alongside the org refresh
   (same refresh interval, same DB query — `getOrganizationMemberByUserId`
   already returns the role):

```typescript
// Inside the existing needsRefresh block:
const member = await getOrganizationMemberByUserId(orgId, userId);
token.role = member?.role ?? "viewer";  // fail-closed to lowest privilege
token.roleRefreshedAt = now;
```

4. In the `session` callback, copy it through:

```typescript
session.user.role = token.role as string;
```

**Staleness tradeoff:** Role changes take up to 1 hour to reflect in the JWT.
This is acceptable — role changes are rare administrative actions. For
immediate effect, the admin can ask the user to sign out and back in, or we
can add a "force refresh" mechanism later.

### 2.3 Permissions Matrix

#### Firm & Team Management

| Action | Admin | User | Restricted |
|--------|:-----:|:----:|:----------:|
| View firm profile & settings | Yes | Yes (read-only) | Yes (read-only) |
| Edit firm profile (name, branding) | Yes | No | No |
| View enabled modules list | Yes | Yes | Yes |
| Request module changes (contact support) | Yes | No | No |
| View team members list | Yes | Yes | Yes |
| Invite new team members | Yes | No | No |
| Remove team members | Yes | No | No |
| Change a member's role | Yes | No | No |
| Transfer ownership | Yes (owner only) | No | No |

#### Module Content (applies per enabled module)

| Action | Admin | User | Restricted |
|--------|:-----:|:----:|:----------:|
| View/read all content | Yes | Yes | Yes |
| Create new records (people, policies, assessments, etc.) | Yes | Yes | No |
| Edit records | Yes | Yes | No |
| Delete records | Yes | No | No |
| Submit content for approval | Yes | Yes | No |
| Approve/reject submissions | Yes | No | No |
| Export data (PDF, CSV, PPTX) | Yes | Yes | No |
| Run FCA verification lookups | Yes | Yes | No |

> **S-1 fix:** The previous spec distinguished "edit own records" vs "edit other
> users' records." This has been simplified. Users can **edit any record** within
> their enabled modules. Most tables lack a consistent `created_by` column, and
> adding/backfilling one across all modules is out of scope. Deletes remain
> Admin-only as a sufficient safeguard. If record-level ownership is needed
> later, it can be added per-module incrementally.

#### Platform Features

| Action | Admin | User | Restricted |
|--------|:-----:|:----:|:----------:|
| Access dashboard | Yes | Yes | Yes |
| Use AI Assistant (if enabled) | Yes | Yes | Yes (read-only) |
| View regulatory news (if enabled) | Yes | Yes | Yes |
| View audit log | Yes | No | No |
| Manage API keys / integrations | Yes | No | No |

### 2.4 Acceptance Criteria — User Roles

| # | Criterion | Detail |
|---|-----------|--------|
| R-1 | **Role stored in DB** | `organization_members.role` stores one of: `owner`, `admin`, `member`, `viewer`. No schema change needed. |
| R-2 | **UI labels** | The UI displays roles as **Admin**, **User**, **Restricted** via `getRoleLabel()`. `owner` and `admin` both show as "Admin". Role dropdowns show user-facing labels, not DB values. |
| R-3 | **Role in JWT & session** | The `role` field is added to the JWT (refreshed hourly alongside org ID) and copied to `session.user.role`. Fails closed to `"viewer"` if lookup fails. |
| R-4 | **Members page** | Settings > Members page lists all firm members with their display role, email, and join date. Already exists at `src/app/(dashboard)/settings/members/MembersClient.tsx` but needs role-guard updates. |
| R-5 | **Admin can change roles** | Admin users can promote/demote members between User and Restricted. Only owners can grant Admin. The role dropdown options depend on the current user's own role. |
| R-6 | **Restricted users see read-only UI** | For Restricted users: create/edit/delete buttons are hidden or disabled. Forms open in view mode. Enforced via `useUserRole().canEdit`. |
| R-7 | **API enforces role permissions** | Mutation endpoints (POST, PUT, PATCH, DELETE) check the caller's role. Restricted users (`viewer`) receive `403` on write attempts. This is already partially handled by `requireRole("member")` on most routes — need audit to confirm all routes enforce it. |
| R-8 | **Invite respects role assignment** | When inviting, Admin selects from user-facing labels (User, Restricted). Owners additionally see Admin. The invite dropdown uses `ASSIGNABLE_ROLES` or `ADMIN_ASSIGNABLE_ROLES` based on the inviter's role. |
| R-9 | **Cannot remove last Admin** | The system prevents removing or demoting the last owner/admin. Existing `countOrganizationOwners()` function supports this check. |
| R-10 | **`useUserRole` hook** | A client hook reads `session.user.role` and exposes: `role`, `isAdmin` (owner or admin), `isUser` (member), `isRestricted` (viewer), `canEdit` (!viewer), `canDelete` (admin/owner), `canManageTeam` (admin/owner). |
| R-11 | **MembersClient guards** | `MembersClient.tsx` must conditionally render invite form, role dropdowns, and remove buttons based on `useUserRole().canManageTeam`. Non-admins see a read-only member list. |

---

## Part 3 — Implementation Architecture

### 3.1 Enforcement layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: UI (client)                                   │
│  - Sidebar filtering (useModuleAccess)                  │
│  - Button/form disabling (useUserRole)                  │
│  - Dashboard card visibility                            │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Server-side route guard (layout, NOT middleware)│
│  - Dashboard layout server component checks enabled     │
│    modules and redirects blocked routes                  │
│  - Cannot use middleware (Edge runtime, no DB access)    │
├─────────────────────────────────────────────────────────┤
│  Layer 3: API (server)                                  │
│  - withModuleAccess() wrapper on route handlers         │
│  - Role permission check on mutations via requireRole() │
│  - Fail-closed: deny by default                         │
└─────────────────────────────────────────────────────────┘
```

All three layers must agree. The UI hides things for good UX, but the server
enforces for security. Never rely on client-side checks alone.

> **C-1 fix:** Module access is **NOT** checked in `src/middleware.ts`.
> Middleware runs on Edge runtime and cannot query the database (it uses `pg`
> which requires Node.js). Middleware remains responsible for:
> authentication, rate limiting, and CSRF only. Module gating is enforced in
> the dashboard layout (server component) and API route handlers.

### 3.2 Route guard implementation (Layer 2)

The current dashboard layout is a thin wrapper:

```
src/app/(dashboard)/layout.tsx  →  DashboardLayoutClient (client component)
```

To add server-side module checking, convert the layout to a **server
component** that checks access before rendering:

```typescript
// src/app/(dashboard)/layout.tsx (revised)
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOrganizationById } from "@/lib/server/organization-store";
import { resolveModuleId } from "@/lib/module-access";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) return redirect("/auth/login");

  // Resolve what module this route belongs to
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") ?? "";
  // Note: Next.js doesn't expose pathname in layouts natively.
  // Alternative: use a middleware header injection, or use per-module
  // layout.tsx files instead of a single check here. See 3.2.1 below.

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
```

**3.2.1 Preferred approach — per-module layout guards:**

Since Next.js App Router doesn't natively expose the pathname in layouts, a
cleaner pattern is to add a lightweight server-side guard in each module's own
layout or page:

```typescript
// src/app/(dashboard)/risk-assessment/layout.tsx
import { requireModuleAccess } from "@/lib/module-access";

export default async function RiskAssessmentLayout({ children }) {
  await requireModuleAccess("riskAssessment"); // redirects if blocked
  return <>{children}</>;
}
```

This is explicit, per-module, and doesn't require pathname hacking. The
`requireModuleAccess()` server function:
1. Calls `auth()` to get the session
2. Queries `organizations.settings` for `enabledModules`
3. Checks if the module ID is in the list
4. If not, calls `redirect("/?module_blocked=riskAssessment")`

Each gatable module route gets a one-line layout file. There are 13 modules,
so 13 small layout files.

> **S-4 fix:** The redirect target `/?module_blocked=riskAssessment` is a query
> param. The dashboard page reads it on mount and fires a toast via
> `useToast()`. Server-side redirects cannot trigger client-side toasts
> directly, so the query param bridges the gap. The dashboard clears the param
> from the URL after showing the toast (via `router.replace("/", { scroll: false })`).

### 3.3 API route enforcement (Layer 3)

> **S-2 fix:** Instead of manually adding module access checks to all ~200 API
> routes, create a `withModuleAccess()` higher-order function that wraps
> route handlers.

```typescript
// src/lib/module-access.ts (server-side)
import { requireAuth } from "@/lib/auth-utils";
import { getOrganizationById } from "@/lib/server/organization-store";
import { NextResponse } from "next/server";

type ModuleId = string;

// Route prefix → module ID mapping (most-specific first)
const ROUTE_MODULE_MAP: [string, ModuleId][] = [
  ["/api/registers/complaints", "complaints"],
  ["/api/complaints",           "complaints"],
  ["/api/authorization-pack",   "authPack"],
  ["/api/policies",             "policies"],
  ["/api/smcr",                 "smcr"],
  ["/api/organizations/*/risks","riskAssessment"],
  ["/api/compliance-framework", "complianceFramework"],
  ["/api/reporting",            "reportingPack"],
  ["/api/training",             "training"],
  ["/api/registers",            "registers"],
  ["/api/regulatory-news",      "regulatoryNews"],
  ["/api/payments",             "payments"],
  ["/api/ai",                   "aiChat"],
  ["/api/grc-hub",              "grcHub"],
];

export function isModuleEnabledForOrg(
  enabledModules: string[] | null | undefined,
  moduleId: string
): boolean {
  if (!enabledModules || enabledModules.length === 0) return false;
  if (enabledModules.includes("*")) return true;
  return enabledModules.includes(moduleId);
}

export function withModuleAccess(moduleId: ModuleId, handler: Function) {
  return async (req: Request, ctx: any) => {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const org = await getOrganizationById(auth.organizationId);
    const enabledModules = (org?.settings as any)?.enabledModules ?? null;

    if (!isModuleEnabledForOrg(enabledModules, moduleId)) {
      return NextResponse.json(
        { error: "Module not enabled for this organization" },
        { status: 403 }
      );
    }
    return handler(req, ctx, auth);
  };
}
```

**Migration strategy:** Wrap routes module-by-module, starting with the modules
that are being gated first. Routes for always-visible features (settings,
dashboard, auth) don't need the wrapper. This can be done incrementally —
not all 200 routes on day one.

### 3.4 Client context (Layer 1)

> **S-3 fix:** `OrganizationProvider` currently reads everything from
> `useSession()` and makes zero API calls. Adding module data means adding a
> fetch. To avoid two calls, create a single endpoint.

**New endpoint:** `GET /api/organization/context`

Returns:
```json
{
  "enabledModules": ["authPack", "policies", "smcr"],
  "role": "member"
}
```

> The `role` field is a **backup** source. The primary source is
> `session.user.role` from the JWT (instant, no fetch). The API response
> confirms it and allows the UI to self-correct if the JWT is stale. If the
> fetch fails, the hooks fall back to `session.user.role` for the role and
> show no modules for `enabledModules` (fail-closed) with a retry banner.

**`OrganizationProvider` changes:**

```typescript
// After mounting, fetch /api/organization/context
// While loading: sidebar shows skeleton placeholder (not blank, not all items)
// On success: cache enabledModules and confirmedRole in state
// On failure: retry once after 2s, then show non-blocking "Retry" banner
//   - Role falls back to session.user.role (always available)
//   - enabledModules falls back to [] (fail-closed)
```

### 3.5 New files to create

| File | Purpose |
|------|---------|
| `src/lib/module-access.ts` | Module registry, `isModuleEnabledForOrg()`, `withModuleAccess()` wrapper, `requireModuleAccess()` server guard for layouts |
| `src/lib/role-labels.ts` | `getRoleLabel()`, `ASSIGNABLE_ROLES`, `ADMIN_ASSIGNABLE_ROLES` |
| `src/hooks/use-module-access.ts` | Client hook: `useModuleAccess()` — reads from OrganizationProvider context |
| `src/hooks/use-user-role.ts` | Client hook: `useUserRole()` — reads `session.user.role` + optional confirmed role from context |
| `src/app/api/organization/context/route.ts` | `GET` — returns `{ enabledModules, role }` for the authenticated user's org |
| Per-module `layout.tsx` files (13) | e.g. `src/app/(dashboard)/risk-assessment/layout.tsx` — one-line `requireModuleAccess()` call |

### 3.6 Files to modify

| File | Change |
|------|--------|
| `src/auth.ts` | Add `role` to JWT type, look up role in `jwt` callback, copy to session |
| `src/components/organization-provider.tsx` | Fetch `/api/organization/context` on mount, expose `enabledModules` and `confirmedRole` in context |
| `src/components/dashboard/sidebar.tsx` | Filter `topLevelItems` and `navigationGroups` items through `useModuleAccess()`. Add sidebar loading skeleton. |
| `src/lib/rbac.ts` | No change needed — `requireRole()` already does what we need for API role enforcement |
| `src/lib/server/organization-store.ts` | Add `getOrganizationEnabledModules(orgId)` helper (reads `settings.enabledModules`) |
| `src/app/(dashboard)/page.tsx` (Dashboard) | Filter module cards by `useModuleAccess()`. Read `module_blocked` query param and show toast. |
| `src/app/(dashboard)/settings/members/MembersClient.tsx` | Add `useUserRole()` guard: hide invite form, role dropdowns, remove buttons for non-admins. Use `getRoleLabel()` for display. Use `ASSIGNABLE_ROLES` / `ADMIN_ASSIGNABLE_ROLES` for dropdowns. |
| `src/lib/dashboard-data.ts` | No change — `DashboardModule.id` already matches module IDs |

### 3.7 Sidebar filtering detail

The sidebar has two data structures that need filtering:

1. **`topLevelItems`** — contains Dashboard (always visible), GRC Hub (`grcHub`), Complaints (`complaints`)
2. **`navigationGroups`** — groups containing module nav items

Each nav item needs a `moduleId` mapping. This can be a lookup object:

```typescript
// Map sidebar hrefs to module IDs
const HREF_TO_MODULE: Record<string, string> = {
  "/grc-hub": "grcHub",
  "/registers/complaints": "complaints",
  "/authorization-pack": "authPack",
  "/compliance-framework/builder": "complianceFramework",
  "/compliance-framework/monitoring": "complianceFramework",
  "/reporting": "reportingPack",
  "/policies": "policies",
  "/smcr": "smcr",
  "/risk-assessment": "riskAssessment",
  "/registers": "registers",
  "/training-library": "training",
  "/regulatory-news": "regulatoryNews",
  "/payments": "payments",
  "/ai-chat": "aiChat",
};
// Items with no entry (Dashboard, Settings, Support) are always visible
```

Filter logic:
- For each item, if `HREF_TO_MODULE[item.href]` exists and
  `!isModuleEnabled(moduleId)`, hide the item.
- For each group, filter its items array. If the filtered array is empty,
  hide the entire group.

---

## Part 4 — Out of Scope (for now)

- **Per-module role overrides** (e.g. "Admin for policies, Restricted for
  SMCR") — single role per user is sufficient.
- **Plan-based module bundles** (e.g. "Starter plan = X modules") — keep it
  per-firm for flexibility.
- **Platform super-admin panel** for enabling modules across firms — use direct
  DB updates or a separate internal tool for now.
- **Granular field-level permissions** — too complex; module + role level is
  enough.
- **Time-limited module trials** — not needed yet.
- **Record-level ownership ("edit own" vs "edit others")** — requires
  `created_by` column across all tables. Can be added per-module later if
  needed.

---

## Part 5 — Test Scenarios

### Module Access

1. Firm with `["authPack", "policies", "smcr"]` — sidebar shows only
   Authorisation Pack, Policy Management, and Governance & People. Their
   parent group headers show. Risk, Training, Registers, etc. are invisible.
   GRC Hub and Complaints are also hidden from `topLevelItems`.
2. User at that firm navigates directly to `/risk-assessment` — server layout
   guard redirects to `/?module_blocked=riskAssessment`, dashboard shows toast.
3. API call to `POST /api/organizations/{orgId}/risks` from that firm —
   returns `403 { error: "Module not enabled for this organization" }`.
4. Firm with `["*"]` — all modules visible and accessible.
5. Firm with `null`/missing `enabledModules` — no gatable modules visible
   (fail-closed). Dashboard, Settings, Support remain accessible.
6. Firm with `["complaints"]` but not `["registers"]` — Complaints nav item
   visible, Register Hub hidden. `/registers/complaints` accessible,
   `/registers` blocked. Route matching resolves correctly due to
   most-specific-first ordering.
7. `/api/organization/context` fetch fails — sidebar shows skeleton briefly,
   then retry banner. Role falls back to JWT value. No modules shown.
8. `/api/organization/context` fetch succeeds — sidebar renders with only
   enabled modules. No flash of all-then-filter.

### User Roles

9. Admin invites a new member as "User" — member can create and edit content
    but cannot invite others or delete records.
10. Restricted user opens policies page — sees policy list but all
    create/edit/delete buttons are hidden. No "Add Policy" button visible.
11. Restricted user sends `POST /api/policies` via direct API call — receives
    `403`.
12. Admin demotes a User to Restricted — that user's next page load (after JWT
    refresh or re-login) reflects read-only mode.
13. Attempt to demote the last owner — system rejects with error: *"Cannot
    remove the last admin."*
14. Owner promotes member to Admin — member can now manage team, sees invite
    form and role dropdowns on Members page.
15. Non-admin user navigates to Settings > Members — sees the member list
    (read-only) but invite form, role dropdowns, and remove buttons are hidden.
16. Owner sees "Admin" option in role dropdown. Admin (non-owner) only sees
    "User" and "Restricted" options.

---

## Appendix A — Issues Addressed (from code review)

| # | Issue | Resolution |
|---|-------|------------|
| C-1 | Middleware runs on Edge, can't query DB | Module checks moved to per-module layout server components and API wrappers. Middleware unchanged. |
| C-2 | Role not in session/JWT | `role` added to JWT + Session types. Looked up during hourly org refresh. Fail-closed to `viewer`. |
| C-3 | `/registers/complaints` sub-path conflict | Route matching uses most-specific-first ordering. Complaints checked before registers. |
| C-4 | MembersClient has no role guards | Added R-11 criterion. Invite form, role dropdowns, remove buttons gated by `useUserRole().canManageTeam`. |
| S-1 | "Edit own" requires `created_by` column | Simplified: Users can edit any record, only Admins can delete. Record ownership deferred. |
| S-2 | 200+ API routes need individual changes | `withModuleAccess()` wrapper. Migrated incrementally per module, not all at once. |
| S-3 | OrganizationProvider has no loading strategy | Single `/api/organization/context` endpoint. Sidebar skeleton while loading. Retry once on failure, then banner. |
| S-4 | Server redirect can't show toast | Redirect to `/?module_blocked=<id>`, dashboard reads query param and shows toast. |
| S-5 | `grcHub` not in dashboard cards, top-level items need filtering | `topLevelItems` explicitly filtered alongside `navigationGroups`. |
| M-1 | Spec said add `moduleId` to DashboardModule | Removed — `DashboardModule.id` already matches module IDs. |
| M-2 | Role labels show raw DB values | `getRoleLabel()` utility + `ASSIGNABLE_ROLES` for dropdowns with user-facing labels. |
| M-3 | `["*"]` confusing if shown raw | Settings UI interprets `*` and displays "All modules". |
