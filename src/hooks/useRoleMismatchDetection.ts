import { useMemo } from "react";
import type {
  PersonRecord,
  FCAVerificationData,
  RoleAssignment,
} from "@/app/(dashboard)/smcr/context/SmcrDataContext";
import { allSMFs } from "@/app/(dashboard)/smcr/data/core-functions";

export type MismatchType = "missing_from_fca" | "missing_locally" | "status_conflict";
export type MismatchSeverity = "warning" | "error";

export interface RoleMismatch {
  type: MismatchType;
  severity: MismatchSeverity;
  localRole?: RoleAssignment;
  fcaFunction?: string;
  smfNumber: string;
  description: string;
}

export interface MismatchResult {
  personId: string;
  personName: string;
  mismatches: RoleMismatch[];
  hasMismatches: boolean;
  missingFromFca: RoleMismatch[];
  missingLocally: RoleMismatch[];
  statusConflicts: RoleMismatch[];
}

export interface AllMismatchesResult {
  totalMismatches: number;
  peopleWithMismatches: number;
  byPerson: Map<string, MismatchResult>;
  results: MismatchResult[];
}

const SMF_PATTERN = /^(SMF\d+)/i;

/**
 * Extract SMF number from FCA control function string.
 * FCA format: "SMF1 - Chief Executive function" → "SMF1"
 */
function extractSmfNumber(fcaFunction: string): string | null {
  const match = fcaFunction.match(SMF_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

function normaliseFcaStatus(status: string): string {
  return status.trim().toLowerCase();
}

const ACTIVE_STATUSES = new Set(["active", "current"]);
const CEASED_STATUSES = new Set(["ceased", "inactive"]);

/**
 * Get the SMF number for a local role's functionId.
 * Local format: functionId "smf1" → lookup allSMFs → smf_number "SMF1"
 */
function localFunctionIdToSmfNumber(functionId: string): string | null {
  const smf = allSMFs.find((s) => s.id === functionId);
  return smf ? smf.smf_number : null;
}

export function computeMismatches(
  person: PersonRecord,
  localRoles: RoleAssignment[],
): MismatchResult {
  const mismatches: RoleMismatch[] = [];

  const fcaVerification = person.fcaVerification;

  // Skip if no FCA verification data
  if (!fcaVerification || !fcaVerification.controlFunctions) {
    return {
      personId: person.id,
      personName: person.name,
      mismatches: [],
      hasMismatches: false,
      missingFromFca: [],
      missingLocally: [],
      statusConflicts: [],
    };
  }

  // Build set of active FCA SMF numbers with their status
  const fcaSmfMap = new Map<string, { fcaFunction: string; status: string }>();
  for (const cf of fcaVerification.controlFunctions) {
    const smfNum = extractSmfNumber(cf.function);
    if (!smfNum) continue; // Skip non-SMF functions (CF roles)
    fcaSmfMap.set(smfNum, { fcaFunction: cf.function, status: cf.status });
  }

  // Build set of local active SMF roles
  const localSmfRoles = localRoles.filter(
    (role) => role.functionType === "SMF" && role.approvalStatus !== "rejected",
  );

  const localSmfMap = new Map<string, RoleAssignment>();
  for (const role of localSmfRoles) {
    const smfNum = localFunctionIdToSmfNumber(role.functionId);
    if (smfNum) {
      localSmfMap.set(smfNum, role);
    }
  }

  // Check 1: Local active SMF roles missing from FCA
  for (const [smfNum, role] of localSmfMap) {
    const fcaEntry = fcaSmfMap.get(smfNum);
    if (!fcaEntry) {
      mismatches.push({
        type: "missing_from_fca",
        severity: "warning",
        localRole: role,
        smfNumber: smfNum,
        description: `${smfNum} is assigned locally but not found on FCA Register`,
      });
    }
  }

  // Check 2: Active FCA control functions missing locally
  for (const [smfNum, fcaEntry] of fcaSmfMap) {
    const normStatus = normaliseFcaStatus(fcaEntry.status);
    if (!ACTIVE_STATUSES.has(normStatus)) continue;
    if (!localSmfMap.has(smfNum)) {
      mismatches.push({
        type: "missing_locally",
        severity: "warning",
        fcaFunction: fcaEntry.fcaFunction,
        smfNumber: smfNum,
        description: `${smfNum} is active on FCA Register but has no local assignment`,
      });
    }
  }

  // Check 3: Status conflicts
  for (const [smfNum, role] of localSmfMap) {
    const fcaEntry = fcaSmfMap.get(smfNum);
    if (!fcaEntry) continue;

    const normStatus = normaliseFcaStatus(fcaEntry.status);
    const localApproved = role.approvalStatus === "approved";
    const fcaCeased = CEASED_STATUSES.has(normStatus);
    const fcaActive = ACTIVE_STATUSES.has(normStatus);

    if (localApproved && fcaCeased) {
      mismatches.push({
        type: "status_conflict",
        severity: "error",
        localRole: role,
        fcaFunction: fcaEntry.fcaFunction,
        smfNumber: smfNum,
        description: `${smfNum} is approved locally but shows "${fcaEntry.status}" on FCA Register`,
      });
    } else if (!localApproved && fcaActive && role.approvalStatus !== "pending") {
      mismatches.push({
        type: "status_conflict",
        severity: "warning",
        localRole: role,
        fcaFunction: fcaEntry.fcaFunction,
        smfNumber: smfNum,
        description: `${smfNum} is active on FCA Register but local status is "${role.approvalStatus}"`,
      });
    }
  }

  return {
    personId: person.id,
    personName: person.name,
    mismatches,
    hasMismatches: mismatches.length > 0,
    missingFromFca: mismatches.filter((m) => m.type === "missing_from_fca"),
    missingLocally: mismatches.filter((m) => m.type === "missing_locally"),
    statusConflicts: mismatches.filter((m) => m.type === "status_conflict"),
  };
}

export function useRoleMismatchDetection(
  person: PersonRecord | undefined,
  localRoles: RoleAssignment[],
): MismatchResult | null {
  return useMemo(() => {
    if (!person) return null;
    return computeMismatches(person, localRoles);
  }, [person, localRoles]);
}

export function useAllMismatches(
  people: PersonRecord[],
  roles: RoleAssignment[],
): AllMismatchesResult {
  return useMemo(() => {
    const rolesByPerson = new Map<string, RoleAssignment[]>();
    for (const role of roles) {
      const list = rolesByPerson.get(role.personId) ?? [];
      list.push(role);
      rolesByPerson.set(role.personId, list);
    }

    const byPerson = new Map<string, MismatchResult>();
    const results: MismatchResult[] = [];
    let totalMismatches = 0;
    let peopleWithMismatches = 0;

    for (const person of people) {
      if (!person.fcaVerification) continue;
      const personRoles = rolesByPerson.get(person.id) ?? [];
      const result = computeMismatches(person, personRoles);
      if (result.hasMismatches) {
        byPerson.set(person.id, result);
        results.push(result);
        totalMismatches += result.mismatches.length;
        peopleWithMismatches++;
      }
    }

    return { totalMismatches, peopleWithMismatches, byPerson, results };
  }, [people, roles]);
}
