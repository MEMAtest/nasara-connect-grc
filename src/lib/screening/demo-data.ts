/**
 * Demo Sanctions List Data
 *
 * THIS FILE CONTAINS DEMO DATA FOR TESTING PURPOSES ONLY.
 * In production, data should come from external sources (APIs, databases).
 *
 * DO NOT use this data for actual compliance screening.
 */

import { ListEntry } from "./engine";

export const DEMO_LIST_ENTRIES: ListEntry[] = [
  {
    id: "demo-1",
    name: "John Smith",
    type: "individual",
    dob: "1965-03-15",
    countries: ["United States"],
    aliases: ["Johnny Smith", "J. Smith"],
    listName: "OFAC SDN",
    listType: "sanctions",
    reason: "Narcotics trafficking",
    addedDate: "2020-01-15",
  },
  {
    id: "demo-2",
    name: "ABC Trading Ltd",
    type: "company",
    countries: ["United Kingdom", "Cyprus"],
    aliases: ["ABC Trading Limited", "ABC Ltd"],
    listName: "EU Sanctions",
    listType: "sanctions",
    reason: "Sanctions evasion",
    addedDate: "2022-06-01",
  },
  {
    id: "demo-3",
    name: "Maria Garcia Rodriguez",
    type: "individual",
    dob: "1978-11-22",
    countries: ["Spain", "Venezuela"],
    aliases: ["Maria Garcia", "M. Rodriguez"],
    listName: "PEP List",
    listType: "pep",
    reason: "Former government official",
    addedDate: "2019-05-10",
  },
  {
    id: "demo-4",
    name: "Global Finance Corp",
    type: "company",
    countries: ["Russia"],
    aliases: ["GFC", "Global Finance Corporation"],
    listName: "UK HMT Sanctions",
    listType: "sanctions",
    reason: "Financial sector sanctions",
    addedDate: "2023-02-28",
  },
  {
    id: "demo-5",
    name: "Ahmad Hassan Mohammed",
    type: "individual",
    dob: "1970-07-04",
    countries: ["Syria", "Lebanon"],
    aliases: ["Ahmed Hassan", "A.H. Mohammed"],
    listName: "UN Sanctions",
    listType: "sanctions",
    reason: "Terrorism financing",
    addedDate: "2018-09-15",
  },
  {
    id: "demo-6",
    name: "Petromax Industries",
    type: "company",
    countries: ["Iran"],
    aliases: ["Petromax", "Petromax Ind."],
    listName: "OFAC SDN",
    listType: "sanctions",
    reason: "Oil sector sanctions",
    addedDate: "2021-04-20",
  },
  {
    id: "demo-7",
    name: "Wei Chen",
    type: "individual",
    dob: "1982-12-01",
    countries: ["China", "Hong Kong"],
    aliases: ["Chen Wei", "David Chen"],
    listName: "PEP List",
    listType: "pep",
    reason: "State-owned enterprise executive",
    addedDate: "2020-08-12",
  },
  {
    id: "demo-8",
    name: "Northern Star Shipping",
    type: "company",
    countries: ["North Korea", "China"],
    aliases: ["NS Shipping", "Northern Star"],
    listName: "UN Sanctions",
    listType: "sanctions",
    reason: "Sanctions evasion shipping",
    addedDate: "2019-11-30",
  },
];

/**
 * Check if we're using demo data (for warnings/logging)
 */
export function isDemoMode(): boolean {
  return !process.env.SCREENING_DATA_SOURCE;
}

/**
 * Get demo data with appropriate warning
 */
export function getDemoListEntries(): ListEntry[] {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEMO_SCREENING) {
    console.warn(
      "[SCREENING] Demo data is being used in production. " +
      "Set SCREENING_DATA_SOURCE environment variable to configure real data sources."
    );
  }
  return DEMO_LIST_ENTRIES;
}
