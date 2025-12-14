#!/usr/bin/env node
/**
 * Convert a DOCX policy/procedure into:
 * - a clause library JSON array
 * - a template JSON (sections + suggested clauses)
 *
 * No external dependencies: reads DOCX via `unzip -p`.
 *
 * Usage:
 *   node scripts/docx-to-policy-seed.mjs \
 *     --input "/path/to/file.docx" \
 *     --policyKey "financial_crime" \
 *     --code "AML_CTF" \
 *     --name "Financial Crime Policy & Minimum Standards" \
 *     --category "FinCrime" \
 *     --description "..." \
 *     --outClauses "src/lib/policies/seeds/mfs_financial_crime.clauses.json" \
 *     --outTemplate "src/lib/policies/seeds/mfs_financial_crime.template.json"
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key?.startsWith("--")) continue;
    const value = argv[i + 1];
    args[key.slice(2)] = value ?? true;
    i += 1;
  }
  return args;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_+|_+$)/g, "");
}

function summarise(text) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > 120 ? `${clean.slice(0, 117)}…` : clean;
}

function normaliseHeadingText(value) {
  let text = String(value).replace(/\s+/g, " ").trim();
  // Strip trailing footnote/page markers like "...Services41" or "...Letter 46".
  text = text.replace(/(\D)\d{1,3}$/, "$1").trim();
  text = text.replace(/\s\d{1,3}$/, "").trim();
  return text;
}

function isTocEntry(text) {
  const value = String(text);
  if (/\bcontents\b/i.test(value) && value.length <= 40) return true;
  // Dotted leaders or repeated whitespace with a terminal page number are typical TOC entries.
  if (value.includes("....") || /\.\s*\.\s*\.\s*\./.test(value) || /_{5,}/.test(value)) return true;
  if (/\s\d{1,3}$/.test(value) && /^appendix\b/i.test(value)) return true;
  return false;
}

function unzipDocumentXml(docxPath) {
  return execFileSync("unzip", ["-p", docxPath, "word/document.xml"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
  });
}

function decodeXmlEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'");
}

function extractTextFromParagraphXml(pXml) {
  const texts = [];
  const re = /<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g;
  let match;
  while ((match = re.exec(pXml))) {
    texts.push(decodeXmlEntities(match[1] ?? ""));
  }
  return texts.join("");
}

function paragraphStyle(pXml) {
  const match = /<w:pStyle[^>]*w:val="([^"]+)"/.exec(pXml);
  return match?.[1] ?? null;
}

function isBoldParagraph(pXml) {
  // Heuristic: consider a paragraph "bold" if the majority of text runs include <w:b/>.
  const runRe = /<w:r\b[\s\S]*?<\/w:r>/g;
  let match;
  let totalRuns = 0;
  let boldRuns = 0;
  while ((match = runRe.exec(pXml))) {
    totalRuns += 1;
    const runXml = match[0];
    if (/<w:rPr\b[\s\S]*?<w:b\b/.test(runXml)) {
      boldRuns += 1;
    }
  }
  if (totalRuns === 0) return false;
  return boldRuns / totalRuns >= 0.6;
}

function isListParagraph(pXml) {
  return /<w:numPr\b/.test(pXml);
}

function splitIntoBlocks(documentXml) {
  const blocks = [];
  const re = /<(w:p|w:tbl)\b[\s\S]*?<\/\1>/g;
  let match;
  while ((match = re.exec(documentXml))) {
    blocks.push({ type: match[1], xml: match[0] });
  }
  return blocks;
}

function extractTextFromTableXml(tblXml) {
  // Flatten each row into "cell1 | cell2 | ..."
  const rows = [];
  const rowRe = /<w:tr\b[\s\S]*?<\/w:tr>/g;
  let rowMatch;
  while ((rowMatch = rowRe.exec(tblXml))) {
    const rowXml = rowMatch[0];
    const cells = [];
    const cellRe = /<w:tc\b[\s\S]*?<\/w:tc>/g;
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowXml))) {
      const cellXml = cellMatch[0];
      // Extract paragraph texts within the cell.
      const pRe = /<w:p\b[\s\S]*?<\/w:p>/g;
      const parts = [];
      let pMatch;
      while ((pMatch = pRe.exec(cellXml))) {
        const text = extractTextFromParagraphXml(pMatch[0]).trim();
        if (text) parts.push(text);
      }
      const joined = parts.join("\n").trim();
      cells.push(joined);
    }
    const cleaned = cells.map((c) => c.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (cleaned.length) rows.push(`| ${cleaned.join(" | ")} |`);
  }

  if (rows.length === 0) return "";
  // Add a simple header separator if the first row looks like a header.
  const colCount = Math.max(...rows.map((row) => (row.match(/\|/g)?.length ?? 0) - 1), 1);
  const separator = `|${Array.from({ length: colCount }).map(() => " --- ").join("|")}|`;
  return [rows[0], separator, ...rows.slice(1)].join("\n");
}

function buildSeed({ docxPath, policyKey, code, name, description, category }) {
  const xml = unzipDocumentXml(docxPath);
  const blocks = splitIntoBlocks(xml);

  const sections = [];
  const clauses = [];

  let currentSection = null;
  let currentClause = null;

  const pushClause = () => {
    if (!currentClause) return;
    const body = currentClause.body.join("\n").trim();
    if (!body) return;

    // Convert [Placeholders] into {{placeholders}} variables.
    const variables = [];
    const placeholderRe = /\[([^\]]+)\]/g;
    let renderedBody = body;
    let placeholderMatch;
    while ((placeholderMatch = placeholderRe.exec(body))) {
      const raw = placeholderMatch[1].trim();
      const varName = slugify(raw);
      if (!varName) continue;
      if (!variables.find((v) => v.name === varName)) {
        variables.push({ name: varName, description: raw, type: "text", required: true });
      }
      renderedBody = renderedBody.replaceAll(placeholderMatch[0], `{{${varName}}}`);
    }

    // Replace hard-coded firm names with {{firm.name}}.
    renderedBody = renderedBody
      .replaceAll(/\bMEMA Financial Services\b/g, "{{firm.name}}")
      .replaceAll(/\bMFS\b/g, "{{firm.name}}");

    const clauseId = currentClause.id;
    clauses.push({
      id: clauseId,
      policy_key: policyKey,
      title: currentClause.title,
      body_md: renderedBody,
      tags: { source: ["docx"] },
      variables,
      version: "1.0.0",
      status: "active",
      source_template_filename: docxPath.split("/").pop(),
      source_extracted_at: new Date().toISOString(),
    });
  };

  const startNewClause = ({ title, sectionId }) => {
    pushClause();
    const clauseId = `${policyKey}-${sectionId}-${slugify(title)}`.slice(0, 90);
    currentClause = { id: clauseId, title, body: [] };
  };

  const ensureSection = (title) => {
    const id = slugify(title);
    const existing = sections.find((s) => s.id === id);
    if (existing) return existing;
    const section = { id, title, summary: "", suggestedClauses: [] };
    sections.push(section);
    return section;
  };

  for (const block of blocks) {
    if (block.type === "w:tbl") {
      const tableMd = extractTextFromTableXml(block.xml);
      if (currentClause && tableMd) {
        currentClause.body.push(tableMd);
        currentClause.body.push("");
      }
      continue;
    }

    const pXml = block.xml;
    const style = paragraphStyle(pXml);
    const text = extractTextFromParagraphXml(pXml).trim();
    if (!text) continue;
    if (isTocEntry(text)) continue;

    const isHeading1 = style === "Heading1";
    const isHeading2 = style === "Heading2";
    const isHeading3 = style === "Heading3";
    const isTitle = style === "Title";
    const numericHeading = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?\s+(.+)$/.exec(text);
    const isAllCaps = /^[^a-z]*[A-Z][^a-z]*$/.test(text) && text.length <= 120;
    const boldParagraph = isBoldParagraph(pXml);
    const looksLikeHeading = text.length <= 120 && !/[.]{2,}$/.test(text) && (boldParagraph || isAllCaps);

    if (isTitle && !currentSection && !currentClause) {
      // Ignore first title; used as document name supplied via args.
      continue;
    }

    if (!currentSection && !currentClause && isAllCaps && /\b(MEMA|MFS)\b/i.test(text)) {
      // Ignore firm name splash pages that are not real headings.
      continue;
    }

    const treatAsSectionHeading =
      isHeading1 ||
      (numericHeading && !numericHeading[2]) ||
      /^appendix\b/i.test(text) ||
      (isTitle && Boolean(currentSection || currentClause));

    const treatAsClauseHeading =
      isHeading2 ||
      isHeading3 ||
      (numericHeading && Boolean(numericHeading[2])) ||
      (!treatAsSectionHeading && looksLikeHeading);

    const currentSectionTitle = currentSection?.title ?? "";
    const isAppendixSection = /^appendix\b/i.test(currentSectionTitle);
    const allowPromotionInAppendix = /^appendix\s*5\b/i.test(currentSectionTitle);
    const headingWordCount = normaliseHeadingText(text).split(" ").filter(Boolean).length;
    const promoteBoldHeadingsToSections =
      boldParagraph &&
      !numericHeading &&
      (allowPromotionInAppendix || !isAppendixSection) &&
      text.length <= 90 &&
      text.length >= 24 &&
      headingWordCount >= 4 &&
      !/^step\b/i.test(text) &&
      !/:\s*$/.test(text);

    const useAsSection =
      treatAsSectionHeading ||
      (!numericHeading && looksLikeHeading && currentSection?.id === "general") ||
      promoteBoldHeadingsToSections;

    if (useAsSection) {
      // Start a new section.
      pushClause();
      currentClause = null;
      const titleText = numericHeading ? numericHeading[4].trim() : text;
      currentSection = ensureSection(normaliseHeadingText(titleText));
      continue;
    }

    if (treatAsClauseHeading) {
      // Start a new clause under the current section; if no section yet, create one.
      const sectionTitle = currentSection?.title ?? "General";
      const section = ensureSection(sectionTitle);
      const sectionId = section.id;
      const titleText = numericHeading ? numericHeading[4].trim() : text;
      startNewClause({ title: normaliseHeadingText(titleText), sectionId });
      section.suggestedClauses.push(currentClause.id);
      continue;
    }

    // Normal paragraph content.
    if (!currentSection) {
      currentSection = ensureSection("General");
    }
    if (!currentClause) {
      // If the document doesn't use Heading2 for subsections, create a default clause per section.
      startNewClause({ title: currentSection.title, sectionId: currentSection.id });
      currentSection.suggestedClauses.push(currentClause.id);
    }

    const prefix = isListParagraph(pXml) ? "- " : "";
    currentClause.body.push(`${prefix}${text}`);
  }

  pushClause();

  const postProcessComplaints = () => {
    const orderedClauses = clauses.map((clause) => ({
      id: clause.id,
      title: clause.title,
      body: clause.body_md,
    }));

    const appendixBuckets = new Map(); // appendixNumber -> clauseIds
    const nonAppendixClauseIds = [];

    for (const clause of orderedClauses) {
      const appendixMatch = /appendix[_-](\d+)/i.exec(clause.id);
      if (appendixMatch) {
        const appendixNumber = appendixMatch[1];
        if (!appendixBuckets.has(appendixNumber)) appendixBuckets.set(appendixNumber, []);
        appendixBuckets.get(appendixNumber).push(clause.id);
        continue;
      }
      nonAppendixClauseIds.push(clause.id);
    }

    const pickBucket = (title) => {
      const t = String(title).toLowerCase();
      if (/ombudsman|\bfos\b/.test(t)) return "fos";
      if (/vulnerable/.test(t)) return "vulnerable";
      if (/digital|website|email|twitter|x\/twitter|social media/.test(t)) return "digital";
      if (/monitor|report|root cause|\\brca\\b|training|competence|review|continuous improvement|feedback|action plan|mi\\b/.test(t)) {
        return "governance";
      }
      if (/consumer duty|eligibility|principles|framework|rules/.test(t)) return "overview";
      if (/acknowledg|receipt|investig|resolution|redress|remedial|forward|time-bar|notification|decision/.test(t)) return "process";
      return "process";
    };

    const buckets = new Map([
      ["overview", []],
      ["process", []],
      ["digital", []],
      ["vulnerable", []],
      ["fos", []],
      ["governance", []],
    ]);

    for (const clauseId of nonAppendixClauseIds) {
      const clause = orderedClauses.find((c) => c.id === clauseId);
      if (!clause) continue;
      const bucketKey = pickBucket(clause.title);
      buckets.get(bucketKey).push(clauseId);
    }

    const nextSections = [];
    const addSection = (id, title, clauseIds) => {
      const filtered = clauseIds.filter(Boolean);
      if (!filtered.length) return;
      const firstClause = clauses.find((c) => c.id === filtered[0]);
      nextSections.push({
        id,
        title,
        summary: summarise(firstClause?.body_md ?? ""),
        suggestedClauses: filtered,
      });
    };

    addSection("overview", "Policy overview", buckets.get("overview"));
    addSection("process", "Complaints handling process", buckets.get("process"));
    addSection("digital", "Digital complaints", buckets.get("digital"));
    addSection("vulnerable", "Vulnerable customers", buckets.get("vulnerable"));
    addSection("fos", "FOS escalation", buckets.get("fos"));
    addSection("governance", "Governance, MI & review", buckets.get("governance"));

    const appendixNumbers = Array.from(appendixBuckets.keys()).sort((a, b) => Number(a) - Number(b));
    for (const appendixNumber of appendixNumbers) {
      const clauseIds = appendixBuckets.get(appendixNumber);
      const headingClause = clauses.find((c) => c.id === clauseIds[0] && /^appendix\b/i.test(c.title));
      const title = headingClause?.title ?? `Appendix ${appendixNumber}`;
      addSection(`appendix-${appendixNumber}`, title, clauseIds);
    }

    return nextSections;
  };

  const finalSections = code === "COMPLAINTS" ? postProcessComplaints() : sections.map((section) => {
    const firstClauseId = section.suggestedClauses[0];
    const firstClause = clauses.find((c) => c.id === firstClauseId);
    return {
      ...section,
      summary: summarise(firstClause?.body_md ?? ""),
    };
  });

  const template = {
    code,
    name,
    category,
    description,
    sections: finalSections,
    mandatoryClauses: Array.from(new Set(finalSections.flatMap((s) => s.suggestedClauses))),
  };

  return { clauses, template };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args.input;
  const policyKey = args.policyKey;
  const code = args.code;
  const name = args.name;
  const category = args.category;
  const description = args.description ?? "";
  const outClauses = args.outClauses;
  const outTemplate = args.outTemplate;

  if (!input || !policyKey || !code || !name || !category || !outClauses || !outTemplate) {
    console.error("Missing required args.");
    process.exit(1);
  }

  const { clauses, template } = buildSeed({
    docxPath: input,
    policyKey,
    code,
    name,
    description,
    category,
  });

  mkdirSync(dirname(outClauses), { recursive: true });
  mkdirSync(dirname(outTemplate), { recursive: true });
  writeFileSync(outClauses, `${JSON.stringify(clauses, null, 2)}\n`, "utf8");
  writeFileSync(outTemplate, `${JSON.stringify(template, null, 2)}\n`, "utf8");

  console.log(`Wrote ${clauses.length} clauses → ${outClauses}`);
  console.log(`Wrote template with ${template.sections.length} sections → ${outTemplate}`);
}

main();
