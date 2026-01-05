import type { DetailLevel } from "@/lib/policies/clause-tiers";
import type { ComplaintsDetailLevel } from "@/lib/policies/assemblers/complaints";

export function toComplaintsDetailLevel(level: DetailLevel): ComplaintsDetailLevel {
  if (level === "essential") return "focused";
  if (level === "comprehensive") return "enterprise";
  return "standard";
}

export function toPolicyDetailLevel(level: ComplaintsDetailLevel): DetailLevel {
  if (level === "focused") return "essential";
  if (level === "enterprise") return "comprehensive";
  return "standard";
}
