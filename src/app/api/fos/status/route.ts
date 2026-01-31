import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data", "fos");
const DEFAULT_STATE = path.join(DATA_DIR, "state", "2017.json");
const DEFAULT_INDEX = path.join(DATA_DIR, "indexes", "2017.jsonl");
const PARSED_DIR = path.join(DATA_DIR, "parsed");

const parsedCache = new Map<number, { ts: number; value: ParsedSummary }>();

type ParsedSummary = { total: number; range: string | null };

function safePath(input: string | null, fallback: string) {
  const candidate = input && input.trim() ? input.trim() : fallback;
  if (path.isAbsolute(candidate)) {
    throw new Error("Absolute paths are not allowed.");
  }
  const resolved = path.resolve(ROOT_DIR, candidate);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) {
    throw new Error("Path is outside data/fos.");
  }
  return resolved;
}

function safeDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function summarizeState(statePath: string) {
  try {
    const raw = readFileSync(statePath, "utf8");
    const state = JSON.parse(raw);
    const counts = { pending: 0, running: 0, done: 0, failed: 0 };
    for (const window of state.windows || []) {
      counts[window.status] = (counts[window.status] || 0) + 1;
    }
    const current = (state.windows || []).find((w: { status: string }) => w.status === "running") || null;
    return {
      counts,
      current,
      updated_at: state.updated_at || null,
    };
  } catch {
    return null;
  }
}

function summarizeIndex(indexPath: string, year: number | null) {
  try {
    const raw = readFileSync(indexPath, "utf8").trim();
    if (!raw) return { total: 0, range: null, unique_days: 0 };
    const lines = raw.split("\n").filter(Boolean);
    let total = 0;
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    const uniqueDays = new Set<string>();

    for (const line of lines) {
      const row = JSON.parse(line);
      const date = safeDate(row.decision_date || row.decisionDate);
      if (!date) continue;
      if (year !== null && date.getUTCFullYear() !== year) continue;
      total += 1;
      const day = date.toISOString().slice(0, 10);
      uniqueDays.add(day);
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    }

    const range = minDate && maxDate ? `${minDate.toISOString().slice(0, 10)}..${maxDate.toISOString().slice(0, 10)}` : null;
    return { total, range, unique_days: uniqueDays.size };
  } catch {
    return { total: 0, range: null, unique_days: 0 };
  }
}

function summarizeParsed(year: number | null) {
  if (!year) return null;
  const cached = parsedCache.get(year);
  const now = Date.now();
  if (cached && now - cached.ts < 60000) return cached.value;
  try {
    if (!PARSED_DIR) return null;
    const files = readdirSync(PARSED_DIR).filter((f) => f.endsWith(".json"));
    let total = 0;
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    for (const file of files) {
      try {
        const data = JSON.parse(readFileSync(path.join(PARSED_DIR, file), "utf8"));
        const date = safeDate(data.decision_date || data.decisionDate);
        if (!date) continue;
        if (date.getUTCFullYear() !== year) continue;
        total += 1;
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      } catch {
        // ignore malformed file
      }
    }
    const range = minDate && maxDate ? `${minDate.toISOString().slice(0, 10)}..${maxDate.toISOString().slice(0, 10)}` : null;
    const summary = { total, range };
    parsedCache.set(year, { ts: now, value: summary });
    return summary;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? Number.parseInt(yearParam, 10) : null;
    const statePath = safePath(searchParams.get("state"), path.relative(ROOT_DIR, DEFAULT_STATE));
    const indexPath = safePath(searchParams.get("index"), path.relative(ROOT_DIR, DEFAULT_INDEX));

    const data = {
      statePath,
      indexPath,
      state: summarizeState(statePath),
      index: summarizeIndex(indexPath, year),
      parsed: summarizeParsed(year),
    };

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: String(error?.message || error) },
      { status: 400 },
    );
  }
}
