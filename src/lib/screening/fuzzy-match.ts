/**
 * Fuzzy Name Matching for AML/Sanctions Screening
 *
 * Implements multiple matching algorithms commonly used in compliance screening:
 * - Levenshtein distance (edit distance)
 * - Jaro-Winkler similarity
 * - Soundex phonetic matching
 * - Token-based matching for name components
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  const m = s1.length;
  const n = s2.length;

  // Create matrix
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate Levenshtein similarity as a percentage (0-1)
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  return 1 - distance / maxLen;
}

/**
 * Calculate Jaro similarity between two strings
 */
export function jaroSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0;

  const matchDistance = Math.max(Math.floor(Math.max(len1, len2) / 2) - 1, 0);

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3
  );
}

/**
 * Calculate Jaro-Winkler similarity (gives more weight to common prefixes)
 */
export function jaroWinklerSimilarity(str1: string, str2: string, prefixScale = 0.1): number {
  const jaro = jaroSimilarity(str1, str2);

  // Calculate common prefix length (up to 4 characters)
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  let prefixLen = 0;
  const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));

  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefixLen++;
    } else {
      break;
    }
  }

  return jaro + prefixLen * prefixScale * (1 - jaro);
}

/**
 * Generate Soundex code for phonetic matching
 */
export function soundex(name: string): string {
  const s = name.toUpperCase().replace(/[^A-Z]/g, "");

  if (s.length === 0) return "0000";

  const codes: Record<string, string> = {
    B: "1", F: "1", P: "1", V: "1",
    C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2",
    D: "3", T: "3",
    L: "4",
    M: "5", N: "5",
    R: "6",
  };

  let result = s[0];
  let prevCode = codes[s[0]] || "";

  for (let i = 1; i < s.length && result.length < 4; i++) {
    const code = codes[s[i]];
    if (code && code !== prevCode) {
      result += code;
      prevCode = code;
    } else if (!code) {
      prevCode = "";
    }
  }

  return (result + "000").slice(0, 4);
}

/**
 * Check if two names have matching Soundex codes
 */
export function soundexMatch(name1: string, name2: string): boolean {
  return soundex(name1) === soundex(name2);
}

/**
 * Normalize a name for comparison
 * - Remove titles, suffixes
 * - Remove punctuation
 * - Normalize whitespace
 */
export function normalizeName(name: string): string {
  // Common titles and suffixes to remove
  const titlesAndSuffixes = [
    "mr", "mrs", "ms", "miss", "dr", "prof", "sir", "dame", "lord", "lady",
    "jr", "sr", "junior", "senior", "ii", "iii", "iv", "phd", "md", "esq"
  ];

  let normalized = name.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, " ")  // Replace punctuation with spaces
    .replace(/\s+/g, " ")  // Normalize whitespace
    .trim();

  // Remove titles and suffixes
  const words = normalized.split(" ");
  const filtered = words.filter(word => !titlesAndSuffixes.includes(word));

  return filtered.join(" ");
}

/**
 * Split name into tokens for component matching
 */
export function tokenizeName(name: string): string[] {
  return normalizeName(name).split(" ").filter(token => token.length > 0);
}

/**
 * Token-based name matching - checks if name components match
 */
export function tokenMatchScore(name1: string, name2: string): number {
  const tokens1 = tokenizeName(name1);
  const tokens2 = tokenizeName(name2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  let matchedTokens = 0;
  const used = new Set<number>();

  for (const token1 of tokens1) {
    let bestScore = 0;
    let bestIndex = -1;

    for (let i = 0; i < tokens2.length; i++) {
      if (used.has(i)) continue;
      const score = jaroWinklerSimilarity(token1, tokens2[i]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestScore >= 0.85 && bestIndex >= 0) {
      matchedTokens++;
      used.add(bestIndex);
    }
  }

  const maxTokens = Math.max(tokens1.length, tokens2.length);
  return matchedTokens / maxTokens;
}

/**
 * Comprehensive name matching combining multiple algorithms
 * Returns a score between 0 and 1
 */
export function comprehensiveNameMatch(name1: string, name2: string): {
  score: number;
  algorithms: {
    levenshtein: number;
    jaroWinkler: number;
    tokenMatch: number;
    soundexMatch: boolean;
  };
} {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);

  const levenshtein = levenshteinSimilarity(normalized1, normalized2);
  const jaroWinkler = jaroWinklerSimilarity(normalized1, normalized2);
  const tokenMatch = tokenMatchScore(name1, name2);
  const soundexMatched = soundexMatch(normalized1, normalized2);

  // Weighted average with bonus for soundex match
  let score = (levenshtein * 0.25 + jaroWinkler * 0.35 + tokenMatch * 0.4);
  if (soundexMatched) {
    score = Math.min(1, score + 0.05);  // Small bonus for phonetic match
  }

  return {
    score,
    algorithms: {
      levenshtein,
      jaroWinkler,
      tokenMatch,
      soundexMatch: soundexMatched,
    },
  };
}

/**
 * Check if a date of birth matches (with tolerance for partial matches)
 */
export function dobMatch(dob1: string | null, dob2: string | null): {
  matches: boolean;
  confidence: "exact" | "partial" | "year_only" | "none";
} {
  if (!dob1 || !dob2) {
    return { matches: false, confidence: "none" };
  }

  const date1 = new Date(dob1);
  const date2 = new Date(dob2);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return { matches: false, confidence: "none" };
  }

  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const day1 = date1.getDate();

  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  // Exact match
  if (year1 === year2 && month1 === month2 && day1 === day2) {
    return { matches: true, confidence: "exact" };
  }

  // Year and month match
  if (year1 === year2 && month1 === month2) {
    return { matches: true, confidence: "partial" };
  }

  // Year only match
  if (year1 === year2) {
    return { matches: true, confidence: "year_only" };
  }

  return { matches: false, confidence: "none" };
}

/**
 * Country matching with common aliases
 */
const COUNTRY_ALIASES: Record<string, string[]> = {
  "united states": ["usa", "us", "united states of america", "america"],
  "united kingdom": ["uk", "gb", "great britain", "britain", "england"],
  "russia": ["russian federation", "ru"],
  "iran": ["islamic republic of iran", "persia"],
  "north korea": ["dprk", "democratic people's republic of korea"],
  "south korea": ["korea", "republic of korea"],
  "china": ["peoples republic of china", "prc"],
  "taiwan": ["republic of china", "roc"],
  "uae": ["united arab emirates"],
};

export function countryMatch(country1: string | null, country2: string | null): boolean {
  if (!country1 || !country2) return false;

  const c1 = country1.toLowerCase().trim();
  const c2 = country2.toLowerCase().trim();

  if (c1 === c2) return true;

  // Check aliases
  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    const allNames = [canonical, ...aliases];
    if (allNames.includes(c1) && allNames.includes(c2)) {
      return true;
    }
  }

  return false;
}
