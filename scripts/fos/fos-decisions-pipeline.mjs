#!/usr/bin/env node
/*
  FOS Ombudsman Decisions Pipeline
  Stages: discover -> parse -> enrich -> vectorize -> ingest
*/

import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, appendFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..", "..");

const TARGET_URL = "https://www.financial-ombudsman.org.uk/decisions-case-studies/ombudsman-decisions";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DATA_DIR = path.join(ROOT_DIR, "data", "fos");
const INDEX_PATH = path.join(DATA_DIR, "decisions-index.jsonl");
const PDF_DIR = path.join(DATA_DIR, "pdfs");
const PARSED_DIR = path.join(DATA_DIR, "parsed");
const ENRICHED_DIR = path.join(DATA_DIR, "enriched");
const VECTORS_DIR = path.join(DATA_DIR, "vectors");

const DEFAULT_START_DATE = "2013-04-01";
const DEFAULT_ENRICH_MODEL = "gpt-4o-mini";

function log(message) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${message}`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key?.startsWith("--")) continue;
    const stripped = key.slice(2);
    if (stripped.includes("=")) {
      const [name, inlineValue] = stripped.split("=");
      args[name] = inlineValue ?? true;
      continue;
    }
    const name = stripped;
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[name] = true;
    } else {
      args[name] = next;
      i += 1;
    }
  }
  return args;
}

function toBool(value, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function toNumber(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeOutcome(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("part") && text.includes("upheld")) return "partially_upheld";
  if (text.includes("not") && text.includes("upheld")) return "not_upheld";
  if (text.includes("upheld")) return "upheld";
  if (text.includes("settled")) return "settled";
  if (text.includes("not") && text.includes("settled")) return "not_settled";
  return "unknown";
}

function safeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function hashBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function ensureDirs(options = {}) {
  const pdfDir = options.pdfDir || PDF_DIR;
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(pdfDir, { recursive: true });
  await mkdir(PARSED_DIR, { recursive: true });
  await mkdir(ENRICHED_DIR, { recursive: true });
  await mkdir(VECTORS_DIR, { recursive: true });
}

async function readJsonl(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

async function writeJsonl(filePath, rows, { append = false } = {}) {
  const data = rows.map((row) => `${JSON.stringify(row)}\n`).join("");
  if (append) {
    await appendFile(filePath, data, "utf8");
  } else {
    await writeFile(filePath, data, "utf8");
  }
}

function dedupeByKey(items, keyFn) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function extractMetadataFromText(text) {
  const clean = normalizeWhitespace(text || "");
  const decisionRefMatch = clean.match(/Decision Reference\s+([A-Z]{2,3}-\d+)\b/i);
  const fallbackRefMatch = clean.match(/\b(DRN|DRS|DR)\s*[-]?\d+\b/i);
  const dateMatch = clean.match(/\b\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}\b/);
  const outcomeMatch = clean.match(/\b(partially upheld|not upheld|upheld|not settled|settled)\b/i);

  const decisionReference = decisionRefMatch?.[1] || fallbackRefMatch?.[0] || null;
  const decisionDate = dateMatch ? dateMatch[0] : null;
  const outcomeRaw = outcomeMatch ? outcomeMatch[0] : null;

  let businessName = null;
  let productSector = null;

  if (decisionDate && outcomeMatch) {
    const dateIndex = clean.indexOf(decisionDate);
    const outcomeIndex = clean.indexOf(outcomeMatch[0]);
    if (dateIndex !== -1 && outcomeIndex !== -1 && outcomeIndex > dateIndex) {
      businessName = clean.slice(dateIndex + decisionDate.length, outcomeIndex).trim() || null;
      const refIndex = decisionReference ? clean.indexOf(decisionReference, outcomeIndex) : -1;
      if (refIndex !== -1 && refIndex > outcomeIndex) {
        productSector = clean
          .slice(outcomeIndex + outcomeMatch[0].length, refIndex)
          .trim() || null;
      }
    }
  }

  return {
    decision_reference: decisionReference,
    decision_date: decisionDate,
    outcome_raw: outcomeRaw,
    business_name: businessName,
    product_sector: productSector,
  };
}

async function dismissCookieBanners(page) {
  const candidates = [
    { role: "button", name: /accept all|accept cookies|agree/i },
    { role: "button", name: /accept/i },
  ];
  for (const candidate of candidates) {
    try {
      const locator = page.getByRole(candidate.role, { name: candidate.name });
      if (await locator.count()) {
        await locator.first().click({ timeout: 2000 });
        await page.waitForTimeout(500);
        return;
      }
    } catch {
      // ignore
    }
  }
}

async function applyFilters(page, options) {
  const fromDate = options.startDate;
  const toDate = options.endDate;

  if (fromDate) {
    const selectors = [
      'input[type="date"][name*="from" i]',
      'input[type="date"][name*="start" i]',
      '#Form_SearchDecisions_DateFrom',
      'input[placeholder*="From" i]',
      'input[placeholder*="Start" i]',
      'input[name*="from" i]',
    ];
    for (const selector of selectors) {
      const locator = page.locator(selector);
      if (await locator.count()) {
        await locator.first().fill(fromDate);
        break;
      }
    }
  }

  if (toDate) {
    const selectors = [
      'input[type="date"][name*="to" i]',
      'input[type="date"][name*="end" i]',
      '#Form_SearchDecisions_DateTo',
      'input[placeholder*="To" i]',
      'input[placeholder*="End" i]',
      'input[name*="to" i]',
    ];
    for (const selector of selectors) {
      const locator = page.locator(selector);
      if (await locator.count()) {
        await locator.first().fill(toDate);
        break;
      }
    }
  }

  if (options.query) {
    const querySelectors = [
      'input[type="search"]',
      'input[placeholder*="Search" i]',
      'input[name*="search" i]',
      'input[name*="query" i]',
    ];
    for (const selector of querySelectors) {
      const locator = page.locator(selector);
      if (await locator.count()) {
        await locator.first().fill(options.query);
        break;
      }
    }
  }

  const applySelectors = [
    '#Form_SearchDecisions_action_doSearchDecisions',
    'input[type="submit"][value*="Search decisions" i]',
    'button[type="submit"]',
    'input[type="submit"][value*="Search" i]',
    'button:has-text("Apply")',
    'button:has-text("Search")',
  ];
  for (const selector of applySelectors) {
    const locator = page.locator(selector);
    if (await locator.count()) {
      try {
        await locator.first().click({ timeout: 2000 });
        await page.waitForTimeout(1000);
        break;
      } catch {
        // ignore
      }
    }
  }
}

async function extractResultsFromDom(page) {
  return page.evaluate(() => {
    const OUTCOME_RE = /\b(partially upheld|not upheld|upheld|not settled|settled)\b/i;
    const REF_RE = /\b(DRN|DRS|DR)\s*[-]?\s*(\d+)\b/i;
    const pdfLinks = Array.from(document.querySelectorAll('a[href*=".pdf"]'));

    const normalizeSpace = (value) => (value || "").replace(/\s+/g, " ").trim();

    return pdfLinks.map((link) => {
      const container = link.closest("li") || link.closest("article") || link.closest("div");
      const rawText = container?.textContent?.trim() || link.textContent?.trim() || "";
      const text = normalizeSpace(rawText);

      const headingText = normalizeSpace(container?.querySelector("h3")?.textContent || "");
      const refMatch = headingText.match(REF_RE) || text.match(REF_RE);
      const decision_reference = refMatch ? `${refMatch[1].toUpperCase()}${refMatch[2]}` : null;

      const dateText = normalizeSpace(
        container?.querySelector(".search-result__info-main em, em, time")?.textContent || "",
      );

      const mainInfo = container?.querySelector(".search-result__info-main");
      let business_name = null;
      let outcome_raw = null;
      if (mainInfo) {
        const tokens = Array.from(mainInfo.childNodes)
          .map((node) => normalizeSpace(node.textContent))
          .filter(Boolean)
          .filter((token) => token !== dateText);
        for (const token of tokens) {
          if (!outcome_raw && OUTCOME_RE.test(token)) {
            outcome_raw = token;
          } else if (!business_name && token && !OUTCOME_RE.test(token)) {
            business_name = token;
          }
        }
      }

      const product_sector = normalizeSpace(
        container?.querySelector(".tag-type, .search-result__tag")?.textContent || "",
      ) || null;

      const descText = normalizeSpace(container?.querySelector(".search-result__desc")?.textContent || "");
      const pageCountMatch = descText.match(/\((\d+)\s+pages?\)/i);
      const page_count = pageCountMatch ? Number.parseInt(pageCountMatch[1], 10) : null;

      return {
        decision_reference,
        decision_date: dateText || null,
        business_name,
        outcome_raw,
        product_sector,
        page_count,
        snippet: descText || null,
        text,
        pdf_url: link.href,
        source_url: link.href,
        link_text: link.textContent?.trim() || null,
      };
    });
  });
}

async function tryPaginate(page, options) {
  const maxWaitMs = options.pageWaitMs ?? 1200;
  const nextLink = page.locator('a:has-text("Next")');
  if (await nextLink.count()) {
    const href = await nextLink.first().getAttribute("href");
    if (href) {
      const target = href.startsWith("http") ? href : new URL(href, page.url()).toString();
      await page.goto(target, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(maxWaitMs);
      return true;
    }
  }
  const buttons = [
    "button:has-text(\"Load more\")",
    "button:has-text(\"Show more\")",
    "button:has-text(\"More\")",
    "a:has-text(\"Next\")",
    "button[aria-label*='next' i]",
  ];

  for (const selector of buttons) {
    const locator = page.locator(selector);
    if (await locator.count()) {
      try {
        await locator.first().click({ timeout: 2000 });
        await page.waitForTimeout(maxWaitMs);
        return true;
      } catch {
        // ignore and keep trying
      }
    }
  }

  // No paginator found
  return false;
}

async function discoverDecisions(options) {
  log(`Discovering decisions from ${TARGET_URL}`);
  const browser = await chromium.launch({ headless: options.headless });
  const page = await browser.newPage({ userAgent: USER_AGENT });
  const results = [];

  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1000);
    await dismissCookieBanners(page);
    await applyFilters(page, options);
    try {
      await page.waitForSelector('a[href*=".pdf"]', { timeout: 15000 });
    } catch {
      // results may still load; fall through
    }

    let pageCount = 0;
    let previousCount = 0;
    let stallCount = 0;

    while (true) {
      await page.waitForTimeout(1000);
      const batch = await extractResultsFromDom(page);
      results.push(...batch);
      const unique = dedupeByKey(results, (item) => item.pdf_url || item.source_url);
      results.length = 0;
      results.push(...unique);

      if (options.maxResults && results.length >= options.maxResults) break;

      const currentCount = results.length;
      const added = currentCount - previousCount;
      const pageLabel = pageCount + 1;
      if (added > 0 && (pageLabel === 1 || pageLabel % 5 === 0 || added >= 100)) {
        log(`Discovery page ${pageLabel}: +${added} (total ${currentCount})`);
      }
      if (currentCount === previousCount) {
        stallCount += 1;
      } else {
        stallCount = 0;
      }

      if (stallCount >= 2) break;

      const didAdvance = await tryPaginate(page, options);
      if (!didAdvance) break;

      pageCount += 1;
      previousCount = currentCount;
      if (options.maxPages && pageCount >= options.maxPages) break;
    }
  } finally {
    await browser.close();
  }

  const enriched = results.map((item) => {
    const meta = extractMetadataFromText(item.text);
    const decision_reference = item.decision_reference || meta.decision_reference;
    const decision_date = item.decision_date || meta.decision_date;
    const business_name = item.business_name || meta.business_name;
    const product_sector = item.product_sector || meta.product_sector;
    const outcome_raw = item.outcome_raw || meta.outcome_raw;
    return {
      decision_reference,
      decision_date,
      business_name,
      product_sector,
      outcome: normalizeOutcome(outcome_raw),
      outcome_raw,
      page_count: item.page_count ?? null,
      snippet: item.snippet ?? null,
      source_url: item.source_url,
      pdf_url: item.pdf_url,
      link_text: item.link_text,
      raw_text: item.text,
      scraped_at: new Date().toISOString(),
    };
  });

  return dedupeByKey(enriched, (item) => item.pdf_url || item.source_url || item.decision_reference);
}

async function fetchWithRetry(url, options = {}) {
  const {
    retries = 3,
    baseDelayMs = 1000,
    timeoutMs = 30000,
    headers = {},
  } = options;

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          ...headers,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      attempt += 1;
      if (attempt > retries) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  throw new Error("Fetch failed after retries");
}

function resolvePdfFilename(record) {
  const ref = record.decision_reference ? slugify(record.decision_reference) : null;
  const base = ref || slugify(record.business_name || "decision") || "decision";
  const fallback = createHash("md5")
    .update(record.pdf_url || record.source_url || base)
    .digest("hex")
    .slice(0, 8);
  return `${base}-${fallback}.pdf`;
}

async function findPdfUrlFromHtml(html, baseUrl) {
  const matches = Array.from(html.matchAll(/href=["']([^"']+\.pdf[^"']*)["']/gi));
  if (!matches.length) return null;
  const href = matches[0][1];
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) {
    const base = new URL(baseUrl);
    return `${base.origin}${href}`;
  }
  return new URL(href, baseUrl).toString();
}

async function resolvePdfUrl(record) {
  if (record.pdf_url) return record.pdf_url;
  if (!record.source_url) return null;
  try {
    const response = await fetchWithRetry(record.source_url, { retries: 2, baseDelayMs: 1200 });
    const html = await response.text();
    return await findPdfUrlFromHtml(html, record.source_url);
  } catch {
    return null;
  }
}

async function extractTextFromPdf(filePath) {
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    throw new Error(
      `PDF parsing failed. Ensure 'pdf-parse' is installed. ${error instanceof Error ? error.message : ""}`
    );
  }
}

function splitSections(text) {
  const normalized = String(text || "").replace(/\r/g, "");
  const defs = [
    { key: "complaint", patterns: ["the complaint", "complaint", "background", "what happened"] },
    { key: "firm_response", patterns: ["the business's response", "the firm's response", "the business said", "the firm said"] },
    { key: "ombudsman_reasoning", patterns: ["the ombudsman's decision", "my findings", "my analysis", "ombudsman decision", "what i consider"] },
    { key: "final_decision", patterns: ["my final decision", "final decision", "my decision"] },
  ];

  const matches = [];
  for (const def of defs) {
    for (const pattern of def.patterns) {
      const regex = new RegExp(`(^|\\n)\\s*(${pattern})\\s*(\\n|:|\\r)`, "ig");
      let match;
      while ((match = regex.exec(normalized))) {
        matches.push({ key: def.key, index: match.index, label: match[2] });
      }
    }
  }

  matches.sort((a, b) => a.index - b.index);
  const sections = {};

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    if (sections[current.key]) continue;
    const next = matches[i + 1];
    const slice = normalized.slice(current.index, next ? next.index : normalized.length).trim();
    let cleaned = slice;
    const newlineIndex = cleaned.indexOf("\n");
    if (newlineIndex > -1 && newlineIndex < 140) {
      cleaned = cleaned.slice(newlineIndex + 1).trim();
    }
    sections[current.key] = cleaned;
  }

  return sections;
}

function extractOmbudsmanName(text) {
  const match = String(text || "").match(/ombudsman\s*[:\-]\s*([A-Za-z .'-]{2,80})/i);
  return match ? match[1].trim() : null;
}

function extractDecisionReference(text) {
  const match = String(text || "").match(/\b(DRN|DRS|DR)\s*[-]?[A-Z0-9]{3,}\b/i);
  return match ? match[0].trim() : null;
}

async function parseDecisions(options) {
  await ensureDirs(options);
  const index = await readJsonl(options.indexPath);
  const pdfDir = options.pdfDir || PDF_DIR;
  let processed = 0;
  const filtered = index
    .filter((item) => {
      if (!options.startDate && !options.endDate) return true;
      const date = safeDate(item.decision_date || item.decisionDate);
      if (!date) return true;
      if (options.startDate && date < new Date(options.startDate)) return false;
      if (options.endDate && date > new Date(options.endDate)) return false;
      return true;
    });

  log(`Parsing decisions (PDF download + text extraction)`);

  for (let i = 0; i < filtered.length; i += 1) {
    const record = filtered[i];
    const outputName = slugify(record.decision_reference || record.pdf_url || record.source_url || `decision-${i}`);
    const outPath = path.join(PARSED_DIR, `${outputName}.json`);
    if (!options.force) {
      try {
        await stat(outPath);
        continue;
      } catch {
        // file does not exist
      }
    }

    if (options.limit && processed >= options.limit) break;

    const pdfUrl = await resolvePdfUrl(record);
    if (!pdfUrl) {
      log(`Skipping (no PDF): ${record.source_url || record.decision_reference || "unknown"}`);
      continue;
    }

    const filename = resolvePdfFilename({ ...record, pdf_url: pdfUrl });
    const pdfPath = path.join(pdfDir, filename);

    let pdfBuffer;
    try {
      const existing = await readFile(pdfPath);
      pdfBuffer = existing;
    } catch {
      try {
        const response = await fetchWithRetry(pdfUrl, { retries: 3, baseDelayMs: 1200 });
        pdfBuffer = Buffer.from(await response.arrayBuffer());
        await writeFile(pdfPath, pdfBuffer);
        await sleep(options.downloadDelayMs ?? 500);
      } catch (error) {
        log(`Download failed: ${pdfUrl} (${error instanceof Error ? error.message : "unknown"})`);
        continue;
      }
    }

    const pdfHash = hashBuffer(pdfBuffer);
    let text = "";
    try {
      text = await extractTextFromPdf(pdfPath);
    } catch (error) {
      log(`PDF parse failed: ${pdfPath} (${error instanceof Error ? error.message : "unknown"})`);
      continue;
    }
    const sections = splitSections(text);

    const enriched = {
      ...record,
      pdf_url: pdfUrl,
      pdf_path: pdfPath.startsWith(`${ROOT_DIR}${path.sep}`)
        ? path.relative(ROOT_DIR, pdfPath)
        : pdfPath,
      pdf_sha256: pdfHash,
      full_text: text,
      sections,
      decision_reference: record.decision_reference || extractDecisionReference(text),
      ombudsman_name: extractOmbudsmanName(text),
      parsed_at: new Date().toISOString(),
    };

    const finalOutputName = slugify(enriched.decision_reference || path.basename(pdfPath, ".pdf"));
    const finalOutPath = path.join(PARSED_DIR, `${finalOutputName}.json`);
    await writeFile(finalOutPath, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
    processed += 1;
    if (processed % 10 === 0) {
      log(`Parsed ${processed}${options.limit ? `/${options.limit}` : ""}`);
    }
  }
}

function buildEnrichmentPrompt(decision) {
  const sections = decision.sections || {};
  const snippet = [
    `Decision reference: ${decision.decision_reference || "unknown"}`,
    `Decision date: ${decision.decision_date || decision.decisionDate || "unknown"}`,
    `Business name: ${decision.business_name || "unknown"}`,
    `Product/sector: ${decision.product_sector || "unknown"}`,
    `Outcome: ${decision.outcome || decision.outcome_raw || "unknown"}`,
    "",
    "--- Complaint ---",
    sections.complaint || "(missing)",
    "",
    "--- Firm response ---",
    sections.firm_response || "(missing)",
    "",
    "--- Ombudsman reasoning ---",
    sections.ombudsman_reasoning || "(missing)",
    "",
    "--- Final decision ---",
    sections.final_decision || "(missing)",
  ]
    .filter(Boolean)
    .join("\n");

  return snippet.slice(0, 16000);
}

function getOpenRouterKey() {
  const keys = ["OPENROUTER_API_KEY", "OPENROUTER_KEY", "NEXT_PUBLIC_OPENROUTER_API_KEY"];
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }
  return null;
}

function getOpenAiKey() {
  const keys = ["OPENAI_API_KEY", "OPENAI_KEY"];
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }
  return null;
}

function resolveEnrichModel(provider, model) {
  if (provider === "openrouter" && model && !model.includes("/")) {
    return `openai/${model}`;
  }
  return model;
}

async function callOpenAiChat(payload) {
  const apiKey = getOpenAiKey();
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }

  return response.json();
}

async function callOpenRouter(payload) {
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Nasara Connect FOS Scraper",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  return response.json();
}

function extractJsonFromResponse(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function enrichDecisions(options) {
  await ensureDirs(options);
  const files = (await readdir(PARSED_DIR)).filter((file) => file.endsWith(".json"));
  const limit = options.limit ?? files.length;

  log(`Enriching ${Math.min(limit, files.length)} decisions via LLM`);
  const provider = options.enrichProvider;
  const model = resolveEnrichModel(provider, options.enrichModel);

  for (let i = 0; i < files.length && i < limit; i += 1) {
    const file = files[i];
    const parsed = JSON.parse(await readFile(path.join(PARSED_DIR, file), "utf8"));
    const outputName = slugify(parsed.decision_reference || path.basename(file, ".json"));
    const outPath = path.join(ENRICHED_DIR, `${outputName}.json`);

    try {
      if (!options.force) {
        await stat(outPath);
        continue;
      }
    } catch {
      // file does not exist
    }

    const prompt = buildEnrichmentPrompt(parsed);

    const payload = {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are extracting structured fields from anonymized UK Financial Ombudsman final decisions. Return ONLY valid JSON. Do not include extra commentary or markdown.",
        },
        {
          role: "user",
          content:
            `Schema:\n{\n  \"precedents_cited\": string[],\n  \"root_cause_tags\": string[],\n  \"decision_logic\": string,\n  \"vulnerability_flags\": string[],\n  \"ombudsman_name\": string | null,\n  \"outcome\": \"upheld\" | \"not_upheld\" | \"partially_upheld\" | \"settled\" | \"not_settled\" | \"unknown\",\n  \"product_sector\": string | null\n}\n\nDecision text:\n${prompt}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 700,
    };

    let aiResult = null;
    try {
      const response =
        provider === "openai"
          ? await callOpenAiChat(payload)
          : await callOpenRouter(payload);
      const content = response.choices?.[0]?.message?.content;
      aiResult = extractJsonFromResponse(content);
    } catch (error) {
      log(`AI enrichment failed for ${file}: ${error instanceof Error ? error.message : "unknown"}`);
    }

    const enriched = {
      ...parsed,
      ai: aiResult || {
        precedents_cited: [],
        root_cause_tags: [],
        decision_logic: "",
        vulnerability_flags: [],
        ombudsman_name: null,
        outcome: parsed.outcome || "unknown",
        product_sector: parsed.product_sector || null,
      },
      enriched_at: new Date().toISOString(),
    };

    await writeFile(outPath, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
    await sleep(options.enrichDelayMs ?? 1200);

    if ((i + 1) % 10 === 0) {
      log(`Enriched ${i + 1}/${limit}`);
    }
  }
}

async function createEmbedding(text, options) {
  const provider = options.embeddingProvider;
  const model = options.embeddingModel;

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      const payload = await response.text();
      throw new Error(`OpenAI embeddings error ${response.status}: ${payload}`);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  }

  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Nasara Connect FOS Scraper",
    },
    body: JSON.stringify({
      model,
      input: text,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`OpenRouter embeddings error ${response.status}: ${payload}`);
  }

  const data = await response.json();
  return data.data?.[0]?.embedding || null;
}

async function vectorizeDecisions(options) {
  await ensureDirs(options);
  const files = (await readdir(ENRICHED_DIR)).filter((file) => file.endsWith(".json"));
  const limit = options.limit ?? files.length;
  const provider = options.embeddingProvider;
  const model = options.embeddingModel;

  log(`Vectorizing ${Math.min(limit, files.length)} decisions (${provider}:${model})`);

  for (let i = 0; i < files.length && i < limit; i += 1) {
    const file = files[i];
    const enriched = JSON.parse(await readFile(path.join(ENRICHED_DIR, file), "utf8"));
    const outputName = slugify(enriched.decision_reference || path.basename(file, ".json"));
    const outPath = path.join(VECTORS_DIR, `${outputName}.json`);

    try {
      if (!options.force) {
        await stat(outPath);
        continue;
      }
    } catch {
      // file does not exist
    }

    const reasoning =
      enriched.sections?.ombudsman_reasoning ||
      enriched.sections?.final_decision ||
      enriched.full_text ||
      "";
    const truncated = reasoning.slice(0, 12000);

    let embedding = null;
    try {
      embedding = await createEmbedding(truncated, { embeddingProvider: provider, embeddingModel: model });
    } catch (error) {
      log(`Embedding failed for ${file}: ${error instanceof Error ? error.message : "unknown"}`);
    }

    const vectorized = {
      ...enriched,
      embedding,
      embedding_model: model,
      embedding_dim: embedding ? embedding.length : null,
      vectorized_at: new Date().toISOString(),
    };

    await writeFile(outPath, `${JSON.stringify(vectorized, null, 2)}\n`, "utf8");
    await sleep(options.vectorDelayMs ?? 800);

    if ((i + 1) % 10 === 0) {
      log(`Vectorized ${i + 1}/${limit}`);
    }
  }
}

async function ingestDecisions(options) {
  const { Pool } = await import("pg");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is required for ingestion");

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  const files = (await readdir(VECTORS_DIR)).filter((file) => file.endsWith(".json"));
  const limit = options.limit ?? files.length;

  log(`Ingesting ${Math.min(limit, files.length)} decisions into Postgres`);

  for (let i = 0; i < files.length && i < limit; i += 1) {
    const file = files[i];
    const decision = JSON.parse(await readFile(path.join(VECTORS_DIR, file), "utf8"));

    const payload = {
      decision_reference: decision.decision_reference || null,
      decision_date: decision.decision_date ? new Date(decision.decision_date) : null,
      business_name: decision.business_name || null,
      product_sector: decision.product_sector || decision.ai?.product_sector || null,
      outcome: decision.ai?.outcome || decision.outcome || null,
      ombudsman_name: decision.ombudsman_name || decision.ai?.ombudsman_name || null,
      source_url: decision.source_url || null,
      pdf_url: decision.pdf_url || null,
      pdf_sha256: decision.pdf_sha256 || null,
      full_text: decision.full_text || null,
      complaint_text: decision.sections?.complaint || null,
      firm_response_text: decision.sections?.firm_response || null,
      ombudsman_reasoning_text: decision.sections?.ombudsman_reasoning || null,
      final_decision_text: decision.sections?.final_decision || null,
      decision_summary: decision.ai?.decision_logic || null,
      precedents: decision.ai?.precedents_cited || [],
      root_cause_tags: decision.ai?.root_cause_tags || [],
      vulnerability_flags: decision.ai?.vulnerability_flags || [],
      decision_logic: decision.ai?.decision_logic || null,
      embedding: decision.embedding || null,
      embedding_model: decision.embedding_model || null,
      embedding_dim: decision.embedding_dim || null,
    };

    await pool.query(
      `INSERT INTO fos_decisions (
        decision_reference, decision_date, business_name, product_sector, outcome, ombudsman_name,
        source_url, pdf_url, pdf_sha256, full_text, complaint_text, firm_response_text,
        ombudsman_reasoning_text, final_decision_text, decision_summary, precedents,
        root_cause_tags, vulnerability_flags, decision_logic, embedding, embedding_model, embedding_dim
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      )
      ON CONFLICT (decision_reference) DO UPDATE SET
        decision_date = EXCLUDED.decision_date,
        business_name = EXCLUDED.business_name,
        product_sector = EXCLUDED.product_sector,
        outcome = EXCLUDED.outcome,
        ombudsman_name = EXCLUDED.ombudsman_name,
        source_url = EXCLUDED.source_url,
        pdf_url = EXCLUDED.pdf_url,
        pdf_sha256 = EXCLUDED.pdf_sha256,
        full_text = EXCLUDED.full_text,
        complaint_text = EXCLUDED.complaint_text,
        firm_response_text = EXCLUDED.firm_response_text,
        ombudsman_reasoning_text = EXCLUDED.ombudsman_reasoning_text,
        final_decision_text = EXCLUDED.final_decision_text,
        decision_summary = EXCLUDED.decision_summary,
        precedents = EXCLUDED.precedents,
        root_cause_tags = EXCLUDED.root_cause_tags,
        vulnerability_flags = EXCLUDED.vulnerability_flags,
        decision_logic = EXCLUDED.decision_logic,
        embedding = EXCLUDED.embedding,
        embedding_model = EXCLUDED.embedding_model,
        embedding_dim = EXCLUDED.embedding_dim,
        updated_at = NOW()`,
      [
        payload.decision_reference,
        payload.decision_date,
        payload.business_name,
        payload.product_sector,
        payload.outcome,
        payload.ombudsman_name,
        payload.source_url,
        payload.pdf_url,
        payload.pdf_sha256,
        payload.full_text,
        payload.complaint_text,
        payload.firm_response_text,
        payload.ombudsman_reasoning_text,
        payload.final_decision_text,
        payload.decision_summary,
        JSON.stringify(payload.precedents || []),
        JSON.stringify(payload.root_cause_tags || []),
        JSON.stringify(payload.vulnerability_flags || []),
        payload.decision_logic,
        payload.embedding ? JSON.stringify(payload.embedding) : null,
        payload.embedding_model,
        payload.embedding_dim,
      ]
    );

    if ((i + 1) % 10 === 0) {
      log(`Ingested ${i + 1}/${limit}`);
    }
  }

  await pool.end();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const stageArg = args.stage || "all";
  const stages = stageArg === "all" ? ["discover", "parse", "enrich", "vectorize", "ingest"] : stageArg.split(",");
  const hasOpenAiKey = Boolean(getOpenAiKey());
  const enrichProvider = args["enrich-provider"] || (hasOpenAiKey ? "openai" : "openrouter");
  const enrichModel =
    args["enrich-model"] ||
    (enrichProvider === "openai" ? process.env.OPENAI_MODEL : process.env.OPENROUTER_MODEL) ||
    DEFAULT_ENRICH_MODEL;

  const options = {
    headless: toBool(args.headless, true),
    startDate: args["start-date"] || DEFAULT_START_DATE,
    endDate: args["end-date"],
    query: args.query,
    maxPages: toNumber(args["max-pages"], null),
    maxResults: toNumber(args["max-results"], null),
    limit: toNumber(args.limit, null),
    downloadDelayMs: toNumber(args["download-delay"], 500),
    enrichDelayMs: toNumber(args["enrich-delay"], 1200),
    vectorDelayMs: toNumber(args["vector-delay"], 800),
    pageWaitMs: toNumber(args["page-wait"], 1200),
    force: toBool(args.force, false),
    indexPath: args.index || INDEX_PATH,
    pdfDir: args["pdf-dir"] || PDF_DIR,
    enrichProvider,
    enrichModel,
    embeddingProvider: args["embedding-provider"] || (process.env.OPENAI_API_KEY ? "openai" : "openrouter"),
    embeddingModel: args["embedding-model"] || "text-embedding-3-large",
  };

  await ensureDirs(options);

  if (stages.includes("discover")) {
    const discoveries = await discoverDecisions(options);
    const append = toBool(args.append, false);
    await writeJsonl(options.indexPath, discoveries, { append });
    log(`Discovered ${discoveries.length} decisions → ${options.indexPath}`);
  }

  if (stages.includes("parse")) {
    await parseDecisions(options);
  }

  if (stages.includes("enrich")) {
    await enrichDecisions(options);
  }

  if (stages.includes("vectorize")) {
    await vectorizeDecisions(options);
  }

  if (stages.includes("ingest")) {
    await ingestDecisions(options);
  }

  log("Pipeline complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
