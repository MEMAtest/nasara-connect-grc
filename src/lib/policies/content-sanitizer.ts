/**
 * Content Sanitizer for Policy Documents
 *
 * Transforms raw clause content (markdown) into clean prose suitable for
 * professional policy documents. Handles:
 * - Markdown tables → callout boxes
 * - Bullet lists → prose paragraphs (where appropriate)
 * - Excessive bold → plain text
 */

export interface SanitizeOptions {
  /** Remove markdown table syntax and convert to callout text */
  convertMarkdownTables: boolean;
  /** Convert narrative bullet lists to flowing prose */
  convertBulletsToProseText: boolean;
  /** Remove ** bold markers from body text */
  stripBoldFormatting: boolean;
  /** Keep procedural/numbered lists as-is */
  preserveProceduralLists: boolean;
}

export const DEFAULT_SANITIZE_OPTIONS: SanitizeOptions = {
  convertMarkdownTables: true,
  convertBulletsToProseText: true,
  stripBoldFormatting: true,
  preserveProceduralLists: true,
};

/**
 * Action verbs that typically indicate procedural steps (should remain as list)
 */
const PROCEDURAL_VERBS = [
  'acknowledge', 'add', 'allocate', 'analyse', 'apply', 'approve', 'assign',
  'audit', 'calculate', 'capture', 'categorise', 'check', 'classify', 'collect',
  'complete', 'conduct', 'confirm', 'contact', 'create', 'determine', 'document',
  'ensure', 'escalate', 'establish', 'evaluate', 'examine', 'execute', 'file',
  'follow', 'forward', 'gather', 'handle', 'identify', 'implement', 'inform',
  'initiate', 'investigate', 'issue', 'log', 'maintain', 'manage', 'monitor',
  'move', 'notify', 'obtain', 'perform', 'post', 'prepare', 'process', 'provide',
  'record', 'refer', 'register', 'report', 'request', 'respond', 'review',
  'schedule', 'send', 'set', 'submit', 'track', 'update', 'use', 'validate', 'verify',
];

/**
 * Check if a bullet item starts with a procedural verb
 */
function isProceduralItem(text: string): boolean {
  const firstWord = text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  return PROCEDURAL_VERBS.includes(firstWord);
}

function isTocArtifactLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.includes(':')) return false;
  if (/\bby\b/i.test(trimmed)) return false;
  if (/[.!?]$/.test(trimmed)) return false;
  const lastToken = trimmed.split(/\s+/).pop() ?? '';
  return /[A-Za-z]+\d{1,3}$/.test(lastToken);
}

/**
 * Check if a line is a markdown table separator (| --- | --- |)
 */
function isTableSeparator(line: string): boolean {
  return /^\|?\s*[-:]+\s*\|/.test(line.trim());
}

/**
 * Check if a line is a markdown table row (| cell | cell |)
 */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
}

/**
 * Extract content from markdown table cells
 */
function extractTableContent(line: string): string {
  // Remove leading/trailing pipes and split by internal pipes
  const cells = line.trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell && !cell.match(/^[-:]+$/)); // Filter out separator cells

  // Join cells and clean up bullet characters
  let content = cells.join(': ');

  // Replace bullet characters with proper formatting
  // •item •item → item, item (for inline lists)
  content = content.replace(/\s*[•·]\s*/g, ', ').replace(/^,\s*/, '').replace(/,\s*$/, '');

  return content;
}

/**
 * Convert a group of consecutive bullet items to prose
 */
function bulletListToProse(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];

  // Join with appropriate punctuation
  const cleaned = items.map(item => {
    // Remove trailing periods for joining
    let text = item.trim();
    if (text.endsWith('.')) text = text.slice(0, -1);
    return text;
  });

  if (cleaned.length === 2) {
    return `${cleaned[0]} and ${cleaned[1]}.`;
  }

  const last = cleaned.pop();
  return `${cleaned.join(', ')}, and ${last}.`;
}

/**
 * Process a markdown string and sanitize content
 */
export function sanitizeClauseContent(
  markdown: string,
  options: SanitizeOptions = DEFAULT_SANITIZE_OPTIONS
): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const artifactCount = lines.filter(isTocArtifactLine).length;
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (artifactCount >= 3 && isTocArtifactLine(trimmed)) {
      i++;
      continue;
    }

    // Handle markdown tables
    if (options.convertMarkdownTables && isTableRow(trimmed)) {
      // Skip separator rows
      if (isTableSeparator(trimmed)) {
        i++;
        continue;
      }

      // Extract table content as prose
      const content = extractTableContent(trimmed);
      if (content && !content.match(/^[-:]+$/)) {
        // Add as a highlighted note/reference
        result.push('');
        result.push(`> ${content}`);
        result.push('');
      }
      i++;
      continue;
    }

    // Handle bullet lists
    if (options.convertBulletsToProseText && /^[\*\-]\s+/.test(trimmed)) {
      const bulletItems: string[] = [];
      const proceduralItems: string[] = [];
      let hasProcedural = false;

      // Collect all consecutive bullet items
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[\*\-]\s+/, '');

        if (options.preserveProceduralLists && isProceduralItem(itemText)) {
          hasProcedural = true;
          proceduralItems.push(itemText);
        } else {
          bulletItems.push(itemText);
        }
        i++;
      }

      // If mostly procedural, keep as list
      if (hasProcedural && proceduralItems.length > bulletItems.length) {
        // Keep all items as numbered list
        const allItems = [...proceduralItems, ...bulletItems];
        allItems.forEach((item, idx) => {
          result.push(`${idx + 1}. ${item}`);
        });
      } else if (bulletItems.length > 0) {
        // Convert to prose
        const prose = bulletListToProse(bulletItems);
        result.push(prose);

        // Add any procedural items as numbered list
        if (proceduralItems.length > 0) {
          result.push('');
          proceduralItems.forEach((item, idx) => {
            result.push(`${idx + 1}. ${item}`);
          });
        }
      } else if (proceduralItems.length > 0) {
        proceduralItems.forEach((item, idx) => {
          result.push(`${idx + 1}. ${item}`);
        });
      }

      continue;
    }

    // Handle bold stripping
    let processedLine = trimmed;
    if (options.stripBoldFormatting) {
      // Remove ** bold markers but keep the text
      processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '$1');
    }

    result.push(processedLine);
    i++;
  }

  // Clean up multiple consecutive empty lines
  let cleanedResult = result.join('\n');
  cleanedResult = cleanedResult.replace(/\n{3,}/g, '\n\n');

  // Clean up stray bullet characters (• or ·) that appear inline
  // Replace "•item" or " •item" with ", item" for inline lists
  cleanedResult = cleanedResult.replace(/\s*[•·]\s*/g, ', ');
  // Clean up leading/trailing commas from the replacement
  cleanedResult = cleanedResult.replace(/^,\s*/gm, '');
  cleanedResult = cleanedResult.replace(/,\s*$/gm, '');
  // Fix double commas
  cleanedResult = cleanedResult.replace(/,\s*,/g, ',');
  // Ensure label/value pairs have a space after colon.
  cleanedResult = cleanedResult.replace(/:([A-Za-z])/g, ': $1');

  return cleanedResult.trim();
}

/**
 * Sanitize multiple clauses in batch
 */
export function sanitizeClauses<T extends { rendered_body?: string; body_md?: string }>(
  clauses: T[],
  options: SanitizeOptions = DEFAULT_SANITIZE_OPTIONS
): T[] {
  return clauses.map(clause => {
    const updated = { ...clause };

    if (updated.rendered_body) {
      updated.rendered_body = sanitizeClauseContent(updated.rendered_body, options);
    }

    if (updated.body_md) {
      updated.body_md = sanitizeClauseContent(updated.body_md, options);
    }

    return updated;
  });
}
