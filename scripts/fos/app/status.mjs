#!/usr/bin/env node
/*
  Status reporter for the FOS queue runner.
*/

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..", "..", "..");
const DEFAULT_STATE = path.join(ROOT_DIR, "data", "fos", "state", "fos-runner.json");
const DEFAULT_INDEX = path.join(ROOT_DIR, "data", "fos", "decisions-index.jsonl");
const PARSED_DIR = path.join(ROOT_DIR, "data", "fos", "parsed");

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

function safeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function summarizeIndex(indexPath) {
  if (!existsSync(indexPath)) return null;
  const raw = readFileSync(indexPath, "utf8").trim();
  if (!raw) return { total: 0 };
  const items = raw.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  return { total: items.length };
}

function summarizeParsed(year) {
  if (!existsSync(PARSED_DIR)) return null;
  const files = readdirSync(PARSED_DIR).filter((f) => f.endsWith(".json"));
  let total = 0;
  let minDate = null;
  let maxDate = null;
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(path.join(PARSED_DIR, file), "utf8"));
      const dt = safeDate(data.decision_date || data.decisionDate);
      if (!dt) continue;
      if (year && dt.getUTCFullYear() !== year) continue;
      total += 1;
      if (!minDate || dt < minDate) minDate = dt;
      if (!maxDate || dt > maxDate) maxDate = dt;
    } catch {
      // ignore
    }
  }
  return {
    total,
    range: minDate && maxDate ? `${minDate.toISOString().slice(0, 10)}..${maxDate.toISOString().slice(0, 10)}` : null,
  };
}

function summarizeState(state) {
  if (!state?.windows) return null;
  const counts = { pending: 0, running: 0, done: 0, failed: 0 };
  for (const window of state.windows) {
    counts[window.status] = (counts[window.status] || 0) + 1;
  }
  const current = state.windows.find((w) => w.status === "running") || null;
  return { counts, current };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const statePath = args.state || DEFAULT_STATE;
  const year = args.year ? Number.parseInt(args.year, 10) : null;
  const indexPath = args.index || DEFAULT_INDEX;
  const json = Boolean(args.json);

  const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : null;
  const stateSummary = summarizeState(state);
  const indexSummary = summarizeIndex(indexPath);
  const parsedSummary = summarizeParsed(year);

  const output = {
    statePath,
    indexPath,
    state: stateSummary,
    index: indexSummary,
    parsed: parsedSummary,
    updated_at: state?.updated_at || null,
  };

  if (json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`State: ${statePath}`);
  if (stateSummary) {
    console.log(
      `Windows: done=${stateSummary.counts.done} running=${stateSummary.counts.running} pending=${stateSummary.counts.pending} failed=${stateSummary.counts.failed}`,
    );
    if (stateSummary.current) {
      console.log(`Current: ${stateSummary.current.start} → ${stateSummary.current.end}`);
    }
  } else {
    console.log("Windows: n/a");
  }

  console.log(`Index: ${indexSummary?.total ?? 0} rows (${indexPath})`);
  if (parsedSummary) {
    console.log(`Parsed${year ? ` (${year})` : ""}: ${parsedSummary.total} (${parsedSummary.range || "-"})`);
  } else {
    console.log("Parsed: n/a");
  }
}

main();
