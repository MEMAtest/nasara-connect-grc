#!/usr/bin/env node
/*
  Queue-based runner for FOS scraping.
  - Persists state to a JSON file
  - Retries failed windows
  - Resumes safely after interruption
*/

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..", "..", "..");
const PIPELINE = path.join(ROOT_DIR, "scripts", "fos", "fos-decisions-pipeline.mjs");

const DEFAULT_PDF_DIR = "/Users/omosanya_main/Google Drive/My Drive/Nasara/FOS/pdfs";
const DEFAULT_STATE = path.join(ROOT_DIR, "data", "fos", "state", "fos-runner.json");

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

function dayRanges(startDate, endDate, windowDays) {
  const ranges = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new Error("Invalid date range");
  }
  const days = Number.parseInt(windowDays, 10);
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("Invalid window days");
  }

  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  while (cursor <= end) {
    const rangeStart = cursor;
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + days - 1);
    if (rangeEnd > end) rangeEnd.setTime(end.getTime());
    ranges.push({ start: fmtDate(rangeStart), end: fmtDate(rangeEnd) });
    const next = new Date(rangeEnd);
    next.setUTCDate(next.getUTCDate() + 1);
    cursor = next;
  }
  return ranges;
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

function sleep(ms) {
  const buffer = new SharedArrayBuffer(4);
  const view = new Int32Array(buffer);
  Atomics.wait(view, 0, 0, ms);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function ensureDir(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed with exit code ${result.status}`);
  }
}

function runWithRetry(cmd, args, label, { retries = 2, delayMs = 5000 } = {}) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      run(cmd, args);
      return { ok: true };
    } catch (error) {
      attempt += 1;
      if (attempt > retries) {
        return { ok: false, error: error.message };
      }
      console.warn(`${label} failed (attempt ${attempt}/${retries + 1}); retrying in ${delayMs}ms.`);
      sleep(delayMs);
    }
  }
  return { ok: false, error: "unknown failure" };
}

function dedupeIndex(filePath) {
  try {
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
  } catch {
    return null;
  }
}

function initState(options, windows) {
  return {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: options,
    windows: windows.map((window) => ({
      start: window.start,
      end: window.end,
      status: "pending",
      attempts: 0,
      last_error: null,
      updated_at: null,
    })),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const startDate = args["start-date"] || "2013-04-01";
  const endDate = args["end-date"] || new Date().toISOString().slice(0, 10);
  const pdfDir = args["pdf-dir"] || DEFAULT_PDF_DIR;
  const downloadDelay = args["download-delay"] || "800";
  const indexPath = args.index || path.join(ROOT_DIR, "data", "fos", "decisions-index.jsonl");
  const retries = Number.parseInt(args.retries || "2", 10);
  const retryDelay = Number.parseInt(args["retry-delay"] || "5000", 10);
  const windowDays = args["window-days"] ? Number.parseInt(args["window-days"], 10) : null;
  const statePath = args.state || DEFAULT_STATE;
  const force = Boolean(args.force);
  const stopOnError = Boolean(args["stop-on-error"]);

  const windows = windowDays ? dayRanges(startDate, endDate, windowDays) : monthRanges(startDate, endDate);

  ensureDir(statePath);

  let state;
  if (existsSync(statePath)) {
    state = readJson(statePath);
    // If window list differs, rebuild (safe for restarts with new windowing).
    const existing = new Set(state.windows?.map((w) => `${w.start}:${w.end}`));
    const incoming = windows.map((w) => `${w.start}:${w.end}`);
    const mismatch = existing.size !== incoming.length || incoming.some((w) => !existing.has(w));
    if (mismatch) {
      state = initState({ startDate, endDate, windowDays, indexPath, pdfDir }, windows);
      writeJson(statePath, state);
    }
  } else {
    state = initState({ startDate, endDate, windowDays, indexPath, pdfDir }, windows);
    writeJson(statePath, state);
  }

  console.log(
    `Running ${windowDays ? `${windowDays}-day` : "monthly"} windows from ${startDate} to ${endDate} (${state.windows.length} windows)`,
  );

  for (const window of state.windows) {
    if (!force && window.status === "done") continue;

    if (window.status === "running") {
      window.status = "pending";
    }

    window.status = "running";
    window.attempts += 1;
    window.updated_at = new Date().toISOString();
    state.updated_at = window.updated_at;
    writeJson(statePath, state);

    const discoverArgs = [
      PIPELINE,
      "--stage",
      "discover",
      "--start-date",
      window.start,
      "--end-date",
      window.end,
      "--append",
      "--index",
      indexPath,
    ];

    const discovery = runWithRetry(
      "node",
      discoverArgs,
      `Discover ${window.start} → ${window.end}`,
      { retries, delayMs: retryDelay },
    );

    if (!discovery.ok) {
      window.status = "failed";
      window.last_error = discovery.error;
      window.updated_at = new Date().toISOString();
      state.updated_at = window.updated_at;
      writeJson(statePath, state);
      if (stopOnError) break;
      continue;
    }

    const parseArgs = [
      PIPELINE,
      "--stage",
      "parse",
      "--start-date",
      window.start,
      "--end-date",
      window.end,
      "--index",
      indexPath,
      "--pdf-dir",
      pdfDir,
      "--download-delay",
      downloadDelay,
    ];

    const parsed = runWithRetry(
      "node",
      parseArgs,
      `Parse ${window.start} → ${window.end}`,
      { retries, delayMs: retryDelay },
    );

    if (!parsed.ok) {
      window.status = "failed";
      window.last_error = parsed.error;
      window.updated_at = new Date().toISOString();
      state.updated_at = window.updated_at;
      writeJson(statePath, state);
      if (stopOnError) break;
      continue;
    }

    window.status = "done";
    window.last_error = null;
    window.updated_at = new Date().toISOString();
    state.updated_at = window.updated_at;
    writeJson(statePath, state);

    const total = dedupeIndex(indexPath);
    if (total !== null) {
      console.log(`Deduped index → ${indexPath} (${total} rows)`);
    }
  }
}

main();
