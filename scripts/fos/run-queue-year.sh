#!/usr/bin/env bash
set -euo pipefail

YEAR="${1:-2017}"
START_DATE="${2:-${YEAR}-01-01}"
END_DATE="${3:-${YEAR}-12-31}"
WINDOW_DAYS="${4:-7}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PDF_DIR="${FOS_PDF_DIR:-/Users/omosanya_main/Google Drive/My Drive/Nasara/FOS/pdfs}"
STATE_PATH="${FOS_STATE:-${ROOT_DIR}/data/fos/state/${YEAR}.json}"
INDEX_PATH="${FOS_INDEX:-${ROOT_DIR}/data/fos/indexes/${YEAR}.jsonl}"
RETRIES="${FOS_RETRIES:-3}"
RETRY_DELAY="${FOS_RETRY_DELAY:-8000}"
DOWNLOAD_DELAY="${FOS_DOWNLOAD_DELAY:-800}"

export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="${PLAYWRIGHT_HOST_PLATFORM_OVERRIDE:-mac15-arm64}"

node "${ROOT_DIR}/scripts/fos/app/queue-runner.mjs" \
  --start-date "${START_DATE}" \
  --end-date "${END_DATE}" \
  --window-days "${WINDOW_DAYS}" \
  --index "${INDEX_PATH}" \
  --pdf-dir "${PDF_DIR}" \
  --state "${STATE_PATH}" \
  --retries "${RETRIES}" \
  --retry-delay "${RETRY_DELAY}" \
  --download-delay "${DOWNLOAD_DELAY}"
