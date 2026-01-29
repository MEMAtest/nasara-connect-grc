#!/usr/bin/env node
/*
  Runs the FOS pipeline in smaller date windows (monthly) to avoid
  result caps that can skew yearly counts.
*/

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..", "..");
const PIPELINE = path.join(ROOT_DIR, "scripts", "fos", "fos-decisions-pipeline.mjs");

const DEFAULT_PDF_DIR = "/Users/omosanya_main/Google Drive/My Drive/Nasara/FOS/pdfs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key?.startsWith("--")) continue;
    const eqIndex = key.indexOf("=");
    if (eqIndex !== -1) {
      const name = key.slice(2, eqIndex);
      args[name] = key.slice(eqIndex + 1);
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

function fmtDate(date) {
  return date.toISOString().slice(0, 10);
}

function monthRanges(startDate, endDate) {
  const ranges = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new Error("Invalid date range");
  }

  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor <= end) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));
    const rangeStart = monthStart < start ? start : monthStart;
    const rangeEnd = monthEnd > end ? end : monthEnd;
    ranges.push({ start: fmtDate(rangeStart), end: fmtDate(rangeEnd) });
    cursor = new Date(Date.UTC(year, month + 1, 1));
  }
  return ranges;
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed with exit code ${result.status}`);
  }
}

function dedupeIndex(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const seen = new Set();
  const output = [];
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      const key = row.pdf_url || row.source_url || row.decision_reference;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      output.push(JSON.stringify(row));
    } catch {
      // ignore malformed lines
    }
  }
  writeFileSync(filePath, `${output.join("\n")}\n`, "utf8");
  return output.length;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const startDate = args["start-date"] || "2013-04-01";
  const endDate = args["end-date"] || new Date().toISOString().slice(0, 10);
  const pdfDir = args["pdf-dir"] || DEFAULT_PDF_DIR;
  const downloadDelay = args["download-delay"] || "800";
  const indexPath = args.index || null;

  const ranges = monthRanges(startDate, endDate);
  console.log(`Running monthly chunks from ${startDate} to ${endDate} (${ranges.length} windows)`);

  for (const range of ranges) {
    console.log(`\n=== ${range.start} → ${range.end} ===`);
    const discoverArgs = [
      PIPELINE,
      "--stage",
      "discover",
      "--start-date",
      range.start,
      "--end-date",
      range.end,
      "--append",
    ];
    if (indexPath) {
      discoverArgs.push("--index", indexPath);
    }
    run("node", discoverArgs);

    const parseArgs = [
      PIPELINE,
      "--stage",
      "parse",
      "--start-date",
      range.start,
      "--end-date",
      range.end,
      "--pdf-dir",
      pdfDir,
      "--download-delay",
      downloadDelay,
    ];
    if (indexPath) {
      parseArgs.push("--index", indexPath);
    }
    run("node", parseArgs);

    if (indexPath) {
      const total = dedupeIndex(indexPath);
      console.log(`Deduped index → ${indexPath} (${total} rows)`);
    }
  }
}

main();
