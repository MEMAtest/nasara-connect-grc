#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const PARSED_DIR = path.join("data", "fos", "parsed");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key?.startsWith("--")) continue;
    const eq = key.indexOf("=");
    if (eq !== -1) {
      args[key.slice(2, eq)] = key.slice(eq + 1);
      continue;
    }
    const name = key.slice(2);
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

function safeYear(value) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) ? n : null;
}

function toKeyDate(value) {
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function loadParsed() {
  const files = readdirSync(PARSED_DIR).filter((f) => f.endsWith(".json"));
  const rows = [];
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(path.join(PARSED_DIR, file), "utf8"));
      rows.push(data);
    } catch {
      // ignore broken rows
    }
  }
  return rows;
}

function summarizeYears(rows) {
  const counts = new Map();
  const ranges = new Map();
  for (const row of rows) {
    const dt = toKeyDate(row.decision_date || row.decisionDate);
    if (!dt) continue;
    const year = dt.getUTCFullYear();
    counts.set(year, (counts.get(year) || 0) + 1);
    const current = ranges.get(year) || { min: dt, max: dt };
    if (dt < current.min) current.min = dt;
    if (dt > current.max) current.max = dt;
    ranges.set(year, current);
  }

  const years = Array.from(counts.keys()).sort((a, b) => a - b);
  return years.map((year) => {
    const range = ranges.get(year);
    return {
      year,
      parsed: counts.get(year),
      range: range ? `${range.min.toISOString().slice(0, 10)}..${range.max.toISOString().slice(0, 10)}` : null,
    };
  });
}

function topCounts(values, limit = 5) {
  const counts = new Map();
  for (const value of values) {
    const key = value || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function summarizeYear(rows, year, sampleLimit = 3) {
  const filtered = [];
  let minDate = null;
  let maxDate = null;
  for (const row of rows) {
    const dt = toKeyDate(row.decision_date || row.decisionDate);
    if (!dt || dt.getUTCFullYear() !== year) continue;
    filtered.push(row);
    if (!minDate || dt < minDate) minDate = dt;
    if (!maxDate || dt > maxDate) maxDate = dt;
  }

  const sectors = topCounts(filtered.map((r) => r.product_sector));
  const outcomes = topCounts(filtered.map((r) => r.outcome || r.outcome_raw));

  const samples = filtered.slice(0, sampleLimit).map((row) => {
    const snippetSource =
      row.final_decision_text || row.ombudsman_reasoning_text || row.complaint_text || row.full_text || "";
    return {
      decision_reference: row.decision_reference,
      decision_date: row.decision_date,
      business_name: row.business_name,
      product_sector: row.product_sector,
      outcome: row.outcome || row.outcome_raw || null,
      snippet: normalizeText(snippetSource).slice(0, 200),
    };
  });

  return {
    year,
    total: filtered.length,
    range: minDate && maxDate ? `${minDate.toISOString().slice(0, 10)}..${maxDate.toISOString().slice(0, 10)}` : null,
    topSectors: sectors,
    topOutcomes: outcomes,
    samples,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const year = safeYear(args.year);
  const sampleLimit = safeYear(args.samples) || 3;
  const rows = loadParsed();

  if (year) {
    const summary = summarizeYear(rows, year, sampleLimit);
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const yearly = summarizeYears(rows).filter((row) => row.year >= 2013 && row.year <= 2026);
  console.log(JSON.stringify(yearly, null, 2));
}

main();

