import { useMemo } from "react";
import type { PersonRecord, FCAVerificationData } from "@/app/(dashboard)/smcr/context/SmcrDataContext";

export type VerificationFreshness = "fresh" | "stale" | "unverified";

export interface PersonVerificationStatus {
  personId: string;
  personName: string;
  irn: string | undefined;
  freshness: VerificationFreshness;
  lastChecked: string | undefined;
  daysSinceCheck: number | null;
}

export interface VerificationSummary {
  totalPeople: number;
  verified: number;
  fresh: number;
  stale: number;
  unverified: number;
  stalePeople: PersonVerificationStatus[];
  unverifiedPeople: PersonVerificationStatus[];
}

function computeFreshness(
  fcaVerification: FCAVerificationData | undefined,
  thresholdDays: number,
): { freshness: VerificationFreshness; daysSinceCheck: number | null } {
  if (!fcaVerification || !fcaVerification.lastChecked) {
    return { freshness: "unverified", daysSinceCheck: null };
  }

  const lastChecked = new Date(fcaVerification.lastChecked);
  if (Number.isNaN(lastChecked.getTime())) {
    return { freshness: "unverified", daysSinceCheck: null };
  }

  const now = new Date();
  // Guard against future dates (invalid data)
  if (lastChecked.getTime() > now.getTime()) {
    return { freshness: "unverified", daysSinceCheck: null };
  }

  const diffMs = now.getTime() - lastChecked.getTime();
  const daysSinceCheck = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    freshness: daysSinceCheck >= thresholdDays ? "stale" : "fresh",
    daysSinceCheck,
  };
}

export function usePersonVerificationStatus(
  person: PersonRecord | undefined,
  thresholdDays = 30,
): PersonVerificationStatus | null {
  return useMemo(() => {
    if (!person) return null;

    const { freshness, daysSinceCheck } = computeFreshness(
      person.fcaVerification,
      thresholdDays,
    );

    return {
      personId: person.id,
      personName: person.name,
      irn: person.irn,
      freshness,
      lastChecked: person.fcaVerification?.lastChecked,
      daysSinceCheck,
    };
  }, [person, thresholdDays]);
}

export function useVerificationStatus(
  people: PersonRecord[],
  thresholdDays = 30,
): VerificationSummary {
  return useMemo(() => {
    const stalePeople: PersonVerificationStatus[] = [];
    const unverifiedPeople: PersonVerificationStatus[] = [];
    let fresh = 0;
    let stale = 0;
    let unverified = 0;
    let verified = 0;

    for (const person of people) {
      const { freshness, daysSinceCheck } = computeFreshness(
        person.fcaVerification,
        thresholdDays,
      );

      const status: PersonVerificationStatus = {
        personId: person.id,
        personName: person.name,
        irn: person.irn,
        freshness,
        lastChecked: person.fcaVerification?.lastChecked,
        daysSinceCheck,
      };

      switch (freshness) {
        case "fresh":
          fresh++;
          verified++;
          break;
        case "stale":
          stale++;
          verified++;
          stalePeople.push(status);
          break;
        case "unverified":
          unverified++;
          unverifiedPeople.push(status);
          break;
      }
    }

    return {
      totalPeople: people.length,
      verified,
      fresh,
      stale,
      unverified,
      stalePeople,
      unverifiedPeople,
    };
  }, [people, thresholdDays]);
}
