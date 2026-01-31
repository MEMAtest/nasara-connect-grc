# Nasara Connect - Project Knowledge

## Project Overview

Nasara Connect is a GRC (Governance, Risk & Compliance) platform built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, and shadcn/ui components. It uses a light theme with slate accent colors.

## Architecture

- **State management**: React Context (`SmcrDataContext`) — NOT Zustand
- **UI library**: shadcn/ui (Radix-based components)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via `src/lib/smcr-database.ts` and `src/lib/database.ts`
- **Toast notifications**: Custom `useToast()` from `@/components/toast-provider` (NOT shadcn toast)
- **Route structure**: `src/app/(dashboard)/smcr/...` for all SMCR pages

## SMCR Module Structure

### Key Pages
- `/smcr/people/` — People list, detail forms, FCA verification, document library, role management
- `/smcr/org-chart/` — Org chart visualization, add person modal, PPTX/PNG export
- `/smcr/smfs/` — SMF roles management
- `/smcr/forms/` — FCA form generation (Form A, Form C, PSD)

### Key Files
| File | Purpose |
|------|---------|
| `smcr/context/SmcrDataContext.tsx` | All SMCR state: people, roles, firms, documents, assessments. CRUD functions. |
| `smcr/people/PeopleClient.tsx` | People page: list view, detail form, FCA verification sheet, role dialog, generators |
| `smcr/org-chart/OrgChartClient.tsx` | Org chart: tree rendering, add person modal, pan/zoom, export |
| `smcr/data/core-functions.ts` | `allSMFs` array with SMF definitions (id, smf_number, title, description) |
| `smcr/data/role-descriptions.ts` | `getRoleSummary()` for role detail tooltips |
| `smcr/data/role-training.ts` | Training plan templates per role |

### Key Types (from SmcrDataContext)
```typescript
interface PersonRecord {
  id: string; firmId: string; employeeId: string; // auto-generated
  name: string; email: string; department: string;
  title?: string; phone?: string; address?: string;
  lineManager?: string; irn?: string;
  fcaVerification?: FCAVerificationData;
  assessment: PersonAssessment;
  trainingPlan: TrainingPlanItem[];
  // ...dates, createdAt, updatedAt
}

interface FCAVerificationData {
  status: string; lastChecked: string; name?: string; // FCA Register name
  controlFunctions: Array<{ function: string; firmName: string; frn: string; status: string; effectiveFrom: string; effectiveTo?: string }>;
  hasEnforcementHistory: boolean;
}

interface NewPersonInput { name: string; email: string; department: string; title?: string; /* email is required string, NOT optional */ }
interface NewRoleInput { personId: string; functionId: string; functionType: "SMF" | "CF"; startDate: string; approvalStatus: string; }
```

- `addPerson()` auto-generates `employeeId` — no need to collect it from users
- `assignRole()` can throw on overlapping roles or missing firm — always wrap in try-catch
- `RoleType` is `"SMF" | "CF"` (UPPERCASE, not lowercase)

## FCA Register API Integration

### API Configuration
- Base URL: `https://register.fca.org.uk/services/V0.1`
- Auth: `X-AUTH-EMAIL` + `X-AUTH-KEY` headers (env vars: `FCA_REGISTER_EMAIL`, `FCA_REGISTER_API_KEY`)
- Client: `src/lib/fca-register/client.ts` → `createFCAClient()`
- Types: `src/lib/fca-register/types.ts`

### CRITICAL: Correct FCA API Endpoint Paths
| What | Correct Path | WRONG Path |
|------|-------------|------------|
| Individual lookup | `/Individuals/{IRN}` (PLURAL) | ~~/Individual/{IRN}~~ |
| Control functions | `/Individuals/{IRN}/CF` | ~~/Individual/{IRN}/ControlFunctions~~ |
| Firm lookup | `/Firm/{FRN}` (singular) | — |
| Firm address | `/Firm/{FRN}/Address` | — |
| Firm permissions | `/Firm/{FRN}/Permissions` | — |
| Firm individuals | `/Firm/{FRN}/Individuals` | — |
| Search | `/Search?q={query}&type={firm\|individual}` | — |

### FCA API Response Structures

**Individual (`/Individuals/{IRN}`):**
```json
{
  "Data": [{
    "Details": {
      "IRN": "JWP00003",
      "Full Name": "John Wilson Page",
      "Status": "Approved by regulator;Certified / assessed by firm",
      "Commonly Used Name": "None"
    }
  }]
}
```
- Data is nested under `Details` key
- Name field is `"Full Name"` NOT `"Name"`
- Status can contain semicolons for multiple statuses

**Control Functions (`/Individuals/{IRN}/CF`):**
```json
{
  "Data": [{
    "Current": {
      "(1)[FCA CF] Significant management": {
        "Name": "[FCA CF] Significant management",
        "Firm Name": "HRI Investments Limited",
        "URL": "https://register.fca.org.uk/services/V0.1/Firm/170637",
        "Effective Date": "03/08/2020"
      }
    },
    "Previous": {
      "(1)CF1 Director": {
        "Name": "CF1 Director",
        "Firm Name": "...",
        "URL": "...",
        "Effective Date": "...",
        "End Date": "08/12/2019"
      }
    }
  }]
}
```
- Grouped into `Current` and `Previous` objects
- Each CF is a key-value pair with numbered key like `(1)SMF3 Executive Director`
- FRN is extracted from the `URL` field (e.g., `/Firm/170637` → `170637`)
- No direct `FRN` field — must parse from URL
- Dates are in DD/MM/YYYY format (UK)

### Internal API Routes
| Route | File |
|-------|------|
| `/api/fca-register/individual/[irn]` | Route handler normalizes to `{ individual: { irn, name, status } }` |
| `/api/fca-register/individual/[irn]/control-functions` | Normalizes to `{ controlFunctions: [{ firmName, frn, function, status, effectiveFrom, effectiveTo }] }` |
| `/api/fca-register/firm/[frn]` | Firm details |
| `/api/fca-register/search` | Search by name |
| `/api/smcr/people/[personId]/fca-verification` | POST to save, GET to retrieve verification data |

### Verification Flow
1. User clicks "Verify on FCA Register" or "Verify" button next to IRN
2. `useFCAVerification` hook or inline fetch calls `/api/fca-register/individual/{IRN}`
3. Results shown in `FCAVerificationSheet` component or inline green box
4. On "Save Verification", data stored in `PersonRecord.fcaVerification`
5. If name mismatch detected, dialog prompts: "Use FCA name" or "Keep current name"
6. Verification also persisted to DB via POST to `/api/smcr/people/{id}/fca-verification`
7. Person cards show badges: FCA Verified, Name Mismatch, Stale, Role Mismatches

### IRN Verification in Create Mode
- Both People "Add New Person" and Org Chart "Add Person" modals support inline IRN verification
- Fetches `/api/fca-register/individual/{IRN}` directly (no person record needed)
- Shows name + status in green inline box below IRN field
- Auto-populates the Name field if it's empty

## Common Patterns

### Adding a Person
```typescript
const personId = addPerson({
  name: "...", email: "..." /* required string, use "" not undefined */,
  department: "...", title: "...", lineManager: "...", irn: "..."
});
```

### Assigning Roles (wrap in try-catch!)
```typescript
try {
  assignRole({
    personId, functionId: smf.id,
    functionType: "SMF", // UPPERCASE
    startDate: new Date().toISOString(),
    approvalStatus: "draft",
  });
} catch { /* handle overlap error */ }
```

### Toast Notifications
```typescript
const toast = useToast(); // from "@/components/toast-provider"
toast.success("Done");
toast.warning("Warning message");
toast.error("Error message");
```

## Build Notes

- Pre-existing TS errors exist in unrelated files (grc-hub, ai-chat, authorization-pack, etc.) — not from SMCR code
- `html2canvas` and `pptxgenjs` are installed for org chart export
- The `quick-questions.ts` file has a pre-existing duplicate export error — not our code
- Always run `npx tsc --noEmit 2>&1 | grep -E "(PeopleClient|OrgChartClient|SmcrDataContext)"` to check only SMCR files

## Related Projects

There is a separate standalone SMCR app at `/Users/omosanya_main/Documents/mema-smcr-tool/smcr-app/` which uses Zustand + dark theme. This is a DIFFERENT project from nasara-connect.
