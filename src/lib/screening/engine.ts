/**
 * Screening Engine
 *
 * Provides automated screening against sanctions and PEP lists
 */

import {
  comprehensiveNameMatch,
  dobMatch,
  countryMatch,
} from "./fuzzy-match";
import { getDemoListEntries, isDemoMode } from "./demo-data";

export interface ScreeningRecord {
  id: string;
  name: string;
  type: "individual" | "company";
  dob?: string | null;
  country?: string | null;
  idNumber?: string | null;
  aliases?: string[];
}

export interface ListEntry {
  id: string;
  name: string;
  type: "individual" | "company";
  dob?: string | null;
  countries: string[];
  aliases: string[];
  listName: string;
  listType: "sanctions" | "pep" | "adverse_media";
  reason?: string;
  addedDate?: string;
  sourceUrl?: string;
}

export interface ScreeningMatch {
  recordId: string;
  recordName: string;
  matchScore: number;
  matchedEntry: ListEntry;
  matchDetails: {
    nameScore: number;
    dobMatch: {
      matches: boolean;
      confidence: "exact" | "partial" | "year_only" | "none";
    };
    countryMatch: boolean;
    aliasMatched?: string;
  };
  status: "pending_review" | "confirmed_match" | "false_positive";
}

export interface ScreeningResult {
  recordId: string;
  recordName: string;
  screened: boolean;
  screenedAt: string;
  matches: ScreeningMatch[];
  status: "clear" | "potential_match" | "confirmed_match";
  /** Indicates if demo data was used (results should not be relied upon) */
  isDemoData: boolean;
}

export interface ScreeningOptions {
  threshold: number;  // Minimum score to consider a match (0-1)
  lists: string[];    // List names to screen against
  includeAliases: boolean;
  checkDob: boolean;
  checkCountry: boolean;
  /** Allow demo data in production (not recommended) */
  allowDemoData?: boolean;
}

const DEFAULT_OPTIONS: ScreeningOptions = {
  threshold: 0.7,
  lists: ["ofac", "eu", "uk", "un"],
  includeAliases: true,
  checkDob: true,
  checkCountry: true,
  allowDemoData: false,
};

/**
 * Data source configuration
 * In production, implement these functions to fetch from real data sources
 */
export interface DataSourceConfig {
  /** Fetch entries from OFAC SDN list */
  fetchOFAC?: () => Promise<ListEntry[]>;
  /** Fetch entries from EU sanctions */
  fetchEU?: () => Promise<ListEntry[]>;
  /** Fetch entries from UK HMT */
  fetchUK?: () => Promise<ListEntry[]>;
  /** Fetch entries from UN consolidated list */
  fetchUN?: () => Promise<ListEntry[]>;
  /** Fetch entries from PEP database */
  fetchPEP?: () => Promise<ListEntry[]>;
}

let dataSourceConfig: DataSourceConfig | null = null;

/**
 * Configure external data sources for production use
 */
export function configureDataSources(config: DataSourceConfig): void {
  dataSourceConfig = config;
}

/**
 * Check if real data sources are configured
 */
export function hasRealDataSources(): boolean {
  return dataSourceConfig !== null && Object.keys(dataSourceConfig).length > 0;
}

/**
 * Screen a single record against the list entries
 */
function screenRecord(
  record: ScreeningRecord,
  listEntries: ListEntry[],
  options: ScreeningOptions
): ScreeningMatch[] {
  const matches: ScreeningMatch[] = [];

  for (const entry of listEntries) {
    // Skip if type doesn't match
    if (record.type !== entry.type) continue;

    // Check name match
    const nameMatch = comprehensiveNameMatch(record.name, entry.name);
    let bestScore = nameMatch.score;
    let matchedAlias: string | undefined;

    // Check aliases if enabled
    if (options.includeAliases && entry.aliases.length > 0) {
      for (const alias of entry.aliases) {
        const aliasMatch = comprehensiveNameMatch(record.name, alias);
        if (aliasMatch.score > bestScore) {
          bestScore = aliasMatch.score;
          matchedAlias = alias;
        }
      }

      // Also check record aliases against entry name
      if (record.aliases) {
        for (const recordAlias of record.aliases) {
          const aliasMatch = comprehensiveNameMatch(recordAlias, entry.name);
          if (aliasMatch.score > bestScore) {
            bestScore = aliasMatch.score;
          }
        }
      }
    }

    // Skip if below threshold
    if (bestScore < options.threshold) continue;

    // Check DOB if enabled
    const dobResult = options.checkDob && record.dob && entry.dob
      ? dobMatch(record.dob, entry.dob)
      : { matches: false, confidence: "none" as const };

    // Check country if enabled
    const countryMatched = options.checkCountry && record.country
      ? entry.countries.some(c => countryMatch(record.country, c))
      : false;

    // Adjust score based on additional matches
    let finalScore = bestScore;
    if (dobResult.matches) {
      if (dobResult.confidence === "exact") finalScore = Math.min(1, finalScore + 0.1);
      else if (dobResult.confidence === "partial") finalScore = Math.min(1, finalScore + 0.05);
    }
    if (countryMatched) {
      finalScore = Math.min(1, finalScore + 0.05);
    }

    matches.push({
      recordId: record.id,
      recordName: record.name,
      matchScore: finalScore,
      matchedEntry: entry,
      matchDetails: {
        nameScore: bestScore,
        dobMatch: dobResult,
        countryMatch: countryMatched,
        aliasMatched: matchedAlias,
      },
      status: "pending_review",
    });
  }

  // Sort by score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get list entries based on selected lists
 * Returns demo data if no real sources configured
 */
async function getListEntries(
  listNames: string[],
  allowDemoData: boolean
): Promise<{ entries: ListEntry[]; isDemoData: boolean }> {
  const listMapping: Record<string, string[]> = {
    ofac: ["OFAC SDN"],
    eu: ["EU Sanctions"],
    uk: ["UK HMT Sanctions"],
    un: ["UN Sanctions"],
    pep: ["PEP List"],
  };

  // Check if we have real data sources configured
  if (hasRealDataSources() && dataSourceConfig) {
    const entries: ListEntry[] = [];

    // Fetch from configured sources
    const fetchPromises: Promise<void>[] = [];

    if (listNames.includes("ofac") && dataSourceConfig.fetchOFAC) {
      fetchPromises.push(
        dataSourceConfig.fetchOFAC().then(data => entries.push(...data))
      );
    }
    if (listNames.includes("eu") && dataSourceConfig.fetchEU) {
      fetchPromises.push(
        dataSourceConfig.fetchEU().then(data => entries.push(...data))
      );
    }
    if (listNames.includes("uk") && dataSourceConfig.fetchUK) {
      fetchPromises.push(
        dataSourceConfig.fetchUK().then(data => entries.push(...data))
      );
    }
    if (listNames.includes("un") && dataSourceConfig.fetchUN) {
      fetchPromises.push(
        dataSourceConfig.fetchUN().then(data => entries.push(...data))
      );
    }
    if (listNames.includes("pep") && dataSourceConfig.fetchPEP) {
      fetchPromises.push(
        dataSourceConfig.fetchPEP().then(data => entries.push(...data))
      );
    }

    await Promise.all(fetchPromises);
    return { entries, isDemoData: false };
  }

  // Fall back to demo data
  if (process.env.NODE_ENV === "production" && !allowDemoData) {
    throw new Error(
      "No real data sources configured for screening. " +
      "Configure data sources using configureDataSources() or set allowDemoData option to true (not recommended for production)."
    );
  }

  // Use demo data
  const demoEntries = getDemoListEntries();
  const selectedListNames = listNames.flatMap(name => listMapping[name.toLowerCase()] || []);

  const filteredEntries = selectedListNames.length === 0
    ? demoEntries
    : demoEntries.filter(entry => selectedListNames.includes(entry.listName));

  return { entries: filteredEntries, isDemoData: true };
}

/**
 * Screen a batch of records
 */
export async function screenBatch(
  records: ScreeningRecord[],
  options: Partial<ScreeningOptions> = {}
): Promise<{ results: ScreeningResult[]; isDemoData: boolean; warning?: string }> {
  const opts: ScreeningOptions = { ...DEFAULT_OPTIONS, ...options };

  // Get list entries (may throw in production if no real sources)
  const { entries: listEntries, isDemoData } = await getListEntries(
    opts.lists,
    opts.allowDemoData ?? false
  );

  const results: ScreeningResult[] = [];

  for (const record of records) {
    const matches = screenRecord(record, listEntries, opts);

    let status: ScreeningResult["status"] = "clear";
    if (matches.some(m => m.status === "confirmed_match")) {
      status = "confirmed_match";
    } else if (matches.length > 0) {
      status = "potential_match";
    }

    results.push({
      recordId: record.id,
      recordName: record.name,
      screened: true,
      screenedAt: new Date().toISOString(),
      matches,
      status,
      isDemoData,
    });
  }

  const warning = isDemoData
    ? "Results are based on DEMO DATA and should NOT be used for actual compliance decisions. Configure real data sources for production use."
    : undefined;

  return { results, isDemoData, warning };
}

/**
 * Screen a single name (quick check)
 */
export async function screenName(
  name: string,
  type: "individual" | "company" = "individual",
  options: Partial<ScreeningOptions> = {}
): Promise<{ result: ScreeningResult; isDemoData: boolean; warning?: string }> {
  const record: ScreeningRecord = {
    id: `temp-${Date.now()}`,
    name,
    type,
  };

  const { results, isDemoData, warning } = await screenBatch([record], options);
  return { result: results[0], isDemoData, warning };
}

/**
 * Get available screening lists
 */
export function getAvailableLists(): Array<{
  code: string;
  name: string;
  description: string;
  type: "sanctions" | "pep" | "adverse_media";
  isPremium: boolean;
  isConfigured: boolean;
}> {
  const configured = hasRealDataSources();

  return [
    {
      code: "ofac",
      name: "OFAC SDN List",
      description: "US Office of Foreign Assets Control Specially Designated Nationals",
      type: "sanctions",
      isPremium: false,
      isConfigured: configured && !!dataSourceConfig?.fetchOFAC,
    },
    {
      code: "eu",
      name: "EU Consolidated Sanctions",
      description: "European Union consolidated sanctions list",
      type: "sanctions",
      isPremium: false,
      isConfigured: configured && !!dataSourceConfig?.fetchEU,
    },
    {
      code: "uk",
      name: "UK HMT Sanctions",
      description: "UK Treasury financial sanctions targets",
      type: "sanctions",
      isPremium: false,
      isConfigured: configured && !!dataSourceConfig?.fetchUK,
    },
    {
      code: "un",
      name: "UN Security Council",
      description: "United Nations Security Council consolidated list",
      type: "sanctions",
      isPremium: false,
      isConfigured: configured && !!dataSourceConfig?.fetchUN,
    },
    {
      code: "pep",
      name: "PEP Lists",
      description: "Politically Exposed Persons database",
      type: "pep",
      isPremium: true,
      isConfigured: configured && !!dataSourceConfig?.fetchPEP,
    },
    {
      code: "adverse_media",
      name: "Adverse Media",
      description: "Negative news and adverse media screening",
      type: "adverse_media",
      isPremium: true,
      isConfigured: false, // Not yet implemented
    },
  ];
}

/**
 * Validate screening threshold
 */
export function validateThreshold(threshold: number): number {
  if (threshold < 0) return 0;
  if (threshold > 1) return 1;
  return threshold;
}

/**
 * Check current data source status
 */
export function getDataSourceStatus(): {
  isDemoMode: boolean;
  configuredSources: string[];
  warning?: string;
} {
  const demo = isDemoMode();
  const sources: string[] = [];

  if (dataSourceConfig) {
    if (dataSourceConfig.fetchOFAC) sources.push("ofac");
    if (dataSourceConfig.fetchEU) sources.push("eu");
    if (dataSourceConfig.fetchUK) sources.push("uk");
    if (dataSourceConfig.fetchUN) sources.push("un");
    if (dataSourceConfig.fetchPEP) sources.push("pep");
  }

  return {
    isDemoMode: demo || sources.length === 0,
    configuredSources: sources,
    warning: demo || sources.length === 0
      ? "Screening is using DEMO DATA. Configure real data sources for production compliance."
      : undefined,
  };
}
