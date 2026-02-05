# Firm Module Access Control & User Roles

**Status:** Draft
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
system (sidebar, dashboard cards, middleware, API routes).

| Module ID             | Label                   | Route prefix                       |
|-----------------------|-------------------------|------------------------------------|
| `authPack`            | Authorisation Pack      | `/authorization-pack`              |
| `policies`            | Policy Management       | `/policies`                        |
| `smcr`                | Governance & People     | `/smcr`                            |
| `riskAssessment`      | Risk Assessment         | `/risk-assessment`                 |
| `complianceFramework` | Compliance Framework    | `/compliance-framework`            |
| `reportingPack`       | Reporting Pack          | `/reporting`                       |
| `training`            | Training Library        | `/training-library`                |
| `registers`           | Registers               | `/registers`                       |
| `regulatoryNews`      | Regulatory News         | `/regulatory-news`                 |
| `payments`            | Payments                | `/payments`                        |
| `aiChat`              | AI Assistant            | `/ai-chat`                         |
| `grcHub`              | GRC Control Panel       | `/grc-hub`                         |
| `complaints`          | Complaints              | `/registers/complaints`            |

**Always visible (not gatable):** Dashboard (`/`), Settings (`/settings`),
Support (`/support`), Admin (`/admin` — for firm admins only).

### 1.2 Storage

Enabled modules are stored in the existing `organizations.settings` JSONB
column:

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
| M-1 | **Sidebar hides disabled modules** | Navigation items for disabled modules do not render. If all items in a group are disabled, the entire group header is hidden. |
| M-2 | **Dashboard cards reflect access** | Module cards for disabled modules either do not render or show a "locked" state with no clickable route. |
| M-3 | **Direct URL access is blocked** | Navigating to `/risk-assessment` when `riskAssessment` is not in the firm's `enabledModules` redirects to `/` with a toast: *"Your firm does not have access to this module."* |
| M-4 | **API routes enforce module access** | API calls under a disabled module's prefix (e.g. `/api/risk-assessment/*`) return `403 { error: "Module not enabled" }`. |
| M-5 | **Module config loads once per session** | The enabled modules list is fetched on login/page load via `OrganizationProvider` and cached in React context. No per-navigation refetch. |
| M-6 | **Admin can view module config** | Firm admins can see which modules are enabled in Settings > Organization, but **cannot** self-enable modules (that is a platform-level action). |
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

### 2.2 Permissions Matrix

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
| Edit own records | Yes | Yes | No |
| Edit other users' records | Yes | No | No |
| Delete records | Yes | No | No |
| Submit content for approval | Yes | Yes | No |
| Approve/reject submissions | Yes | No | No |
| Export data (PDF, CSV, PPTX) | Yes | Yes | No |
| Run FCA verification lookups | Yes | Yes | No |

#### Platform Features

| Action | Admin | User | Restricted |
|--------|:-----:|:----:|:----------:|
| Access dashboard | Yes | Yes | Yes |
| Use AI Assistant (if enabled) | Yes | Yes | Yes (read-only) |
| View regulatory news (if enabled) | Yes | Yes | Yes |
| View audit log | Yes | No | No |
| Manage API keys / integrations | Yes | No | No |

### 2.3 Acceptance Criteria — User Roles

| # | Criterion | Detail |
|---|-----------|--------|
| R-1 | **Role stored in DB** | `organization_members.role` stores one of: `owner`, `admin`, `member`, `viewer`. No schema change needed. |
| R-2 | **UI labels** | The UI displays roles as **Admin**, **User**, **Restricted**. `owner` and `admin` both show as "Admin". |
| R-3 | **Role visible in session** | The user's role is included in the session/context so client components can check permissions without extra API calls. |
| R-4 | **Sidebar shows team section** | Settings > Members page lists all firm members with their role, email, and join date. |
| R-5 | **Admin can change roles** | Admin users can promote/demote members between User and Restricted. Only owners can grant Admin. |
| R-6 | **Restricted users see read-only UI** | For Restricted users: create/edit/delete buttons are hidden or disabled. Forms open in view mode. |
| R-7 | **API enforces role permissions** | Mutation endpoints (POST, PUT, PATCH, DELETE) check the caller's role. Restricted users receive `403` on write attempts. |
| R-8 | **Invite respects role assignment** | When inviting a new member, Admin selects the role (User or Restricted). New invitees cannot be assigned Admin unless the inviter is an owner. |
| R-9 | **Cannot remove last Admin** | The system prevents removing or demoting the last owner/admin to avoid orphaned firms. |
| R-10 | **`useUserRole` hook** | A client hook exposes `role: string`, `isAdmin: boolean`, `isUser: boolean`, `isRestricted: boolean`, `canEdit: boolean`, `canDelete: boolean`, `canManageTeam: boolean`. |

---

## Part 3 — Implementation Layers

### 3.1 Where enforcement happens

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: UI (client)                                   │
│  - Sidebar filtering (useModuleAccess)                  │
│  - Button/form disabling (useUserRole)                  │
│  - Dashboard card visibility                            │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Route guard (middleware / layout)              │
│  - Redirect if module not enabled                       │
│  - Redirect if role insufficient for route              │
├─────────────────────────────────────────────────────────┤
│  Layer 3: API (server)                                  │
│  - Module access check on every API handler             │
│  - Role permission check on mutations                   │
│  - Fail-closed: deny by default                         │
└─────────────────────────────────────────────────────────┘
```

All three layers must agree. The UI hides things for good UX, but the server
enforces for security. Never rely on client-side checks alone.

### 3.2 New files to create

| File | Purpose |
|------|---------|
| `src/lib/module-access.ts` | Module registry, route-to-module mapping, `getEnabledModules()` server helper |
| `src/hooks/use-module-access.ts` | Client hook: `useModuleAccess()` |
| `src/hooks/use-user-role.ts` | Client hook: `useUserRole()` |
| `src/app/api/organization/modules/route.ts` | GET endpoint returning the firm's enabled modules |
| `src/app/api/organization/members/route.ts` | GET/POST for listing members and inviting (if not already present) |

### 3.3 Files to modify

| File | Change |
|------|--------|
| `src/components/organization-provider.tsx` | Add `enabledModules` and `userRole` to context |
| `src/components/dashboard/sidebar.tsx` | Filter `topLevelItems` and `navigationGroups` through `useModuleAccess()` |
| `src/lib/dashboard-data.ts` | Add `moduleId` field to `DashboardModule` linking to module registry (already has `id`) |
| `src/middleware.ts` | Add module access check for protected route prefixes |
| `src/lib/rbac.ts` | Add helper `requireModuleAccess(moduleId)` alongside existing `requireRole()` |
| `src/lib/server/organization-store.ts` | Add `getOrganizationEnabledModules()` helper |
| Dashboard page | Filter module cards by `useModuleAccess()` |
| Settings/Members page | Show role labels, add role change UI for admins |

---

## Part 4 — Out of Scope (for now)

- **Per-module role overrides** (e.g. "Admin for policies, Restricted for SMCR") — single role per user is sufficient.
- **Plan-based module bundles** (e.g. "Starter plan = X modules") — keep it per-firm for flexibility.
- **Platform super-admin panel** for enabling modules across firms — use direct DB updates or a separate internal tool for now.
- **Granular field-level permissions** — too complex; module + role level is enough.
- **Time-limited module trials** — not needed yet.

---

## Part 5 — Test Scenarios

### Module Access

1. Firm with `["authPack", "policies", "smcr"]` — sidebar shows only those three modules and their parent groups. Risk, Training, etc. are invisible.
2. User at that firm navigates directly to `/risk-assessment` — redirected to `/` with notification.
3. API call to `POST /api/risk-assessment/...` from that firm — returns `403`.
4. Firm with `["*"]` — all modules visible and accessible.
5. Firm with `null`/missing `enabledModules` — no gatable modules visible (fail-closed).

### User Roles

6. Admin invites a new member as "User" — member can create content but cannot invite others.
7. Restricted user opens policies page — sees policy list but all create/edit/delete buttons are hidden.
8. Restricted user sends `POST /api/policies` — receives `403`.
9. Admin demotes a User to Restricted — that user's next page load reflects read-only mode.
10. Attempt to demote the last owner — system rejects with error message.
11. Owner promotes member to Admin — member can now manage team.
12. Non-admin user navigates to Settings > Members — can see the list but invite/role-change controls are hidden.
