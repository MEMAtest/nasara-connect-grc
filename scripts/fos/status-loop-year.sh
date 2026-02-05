#!/usr/bin/env bash
set -euo pipefail

YEAR="${1:-2017}"
INTERVAL_SECONDS="${2:-900}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_PATH="${FOS_STATE:-${ROOT_DIR}/data/fos/state/${YEAR}.json}"
INDEX_PATH="${FOS_INDEX:-${ROOT_DIR}/data/fos/indexes/${YEAR}.jsonl}"

while true; do
  date +"%Y-%m-%dT%H:%M:%S%z"
  node "${ROOT_DIR}/scripts/fos/app/status.mjs" \
    --state "${STATE_PATH}" \
    --year "${YEAR}" \
    --index "${INDEX_PATH}"
  echo "----"
  sleep "${INTERVAL_SECONDS}"
done
