# FOS Ombudsman Decisions Pipeline

Scrapes anonymized final decisions from the Financial Ombudsman Service (FOS) portal, parses PDFs, enriches with AI tags, and prepares data for RAG.

## What it does

Stage A (discover):
- Crawls the decisions portal
- Extracts metadata (reference, date, business name, product/sector, outcome)
- Saves to `data/fos/decisions-index.jsonl`

Stage B (parse):
- Downloads PDFs
- Extracts text (via `pdf-parse`)
- Splits into sections (Complaint, Firm response, Ombudsman reasoning, Final decision)
- Saves per-decision JSON to `data/fos/parsed/`

Stage C (enrich):
- Calls OpenRouter to generate smart tags
- Saves to `data/fos/enriched/`

Stage D (vectorize):
- Creates embeddings for reasoning/decision text
- Saves to `data/fos/vectors/`

Stage E (ingest):
- Upserts decisions into `fos_decisions` Postgres table

## Setup

Install dependencies:

```bash
npm install
```

Optional: install Playwright browsers if missing.

```bash
npx playwright install
```

Set environment variables:

```bash
# Required for AI enrichment (OpenAI)
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini

# Or use OpenRouter instead
# OPENROUTER_API_KEY=...
# OPENROUTER_MODEL=openai/gpt-4o-mini

# Required for vectorization (OpenAI) - optional
OPENAI_API_KEY=...
EMBEDDING_MODEL=text-embedding-3-large

# Required for DB ingestion
DATABASE_URL=postgres://...
```

## Usage

Run the full pipeline:

```bash
node scripts/fos/fos-decisions-pipeline.mjs --stage=all
```

Discover only:

```bash
node scripts/fos/fos-decisions-pipeline.mjs --stage=discover --start-date=2013-04-01
```

Parse PDFs (from existing index):

```bash
node scripts/fos/fos-decisions-pipeline.mjs --stage=parse --limit=50
```

Enrich with AI:

```bash
node scripts/fos/fos-decisions-pipeline.mjs --stage=enrich --limit=50
```

Vectorize:

```bash
node scripts/fos/fos-decisions-pipeline.mjs --stage=vectorize --limit=50
```

Ingest into Postgres:

```bash
node scripts/fos/fos-decisions-pipeline.mjs --stage=ingest --limit=50
```

Before ingesting, ensure the database schema is initialized (the app calls `initDatabase()` on startup, or use `/api/init-db`).

## Mini app (queue runner)

For long runs, use the queue-based runner so it resumes cleanly and persists progress:

```bash
node scripts/fos/app/queue-runner.mjs \
  --start-date 2017-01-01 \
  --end-date 2017-12-31 \
  --window-days 7 \
  --index data/fos/indexes/2017.jsonl \
  --pdf-dir "/Users/omosanya_main/Google Drive/My Drive/Nasara/FOS/pdfs" \
  --state data/fos/state/2017.json
```

Check status at any time:

```bash
node scripts/fos/app/status.mjs --state data/fos/state/2017.json --year 2017
```

## Useful flags

- `--headless=false` to watch the browser
- `--max-pages=5` or `--max-results=200`
- `--append` to append to the index file
- `--index /path/to/index.jsonl` to keep per-year or per-run indexes
- `--force` to overwrite enriched/vector files
- `--pdf-dir /path/to/pdfs` to store PDFs outside the repo
- `--enrich-provider openai|openrouter`
- `--enrich-model gpt-4o-mini`
- `--embedding-provider=openai|openrouter`
- `--embedding-model=text-embedding-3-large`
- `--window-days 7` to chunk discovery into smaller date windows (avoid portal caps)

## Notes

- The portal is dynamic; if selectors change, update the DOM extraction in the script.
- PDF parsing uses `pdf-parse`. If PDFs include scanned images, swap in OCR (e.g., Textract).
- Rate limiting is built in via delays; increase delays for gentler crawling.
