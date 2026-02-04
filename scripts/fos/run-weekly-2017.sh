#!/bin/sh
set -e

cd /Users/omosanya_main/Documents/nasara-connect-grc/nasara-connect || exit 1

LOG_DIR="data/fos/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/2017-weekly.log"

echo "=== Run start: $(date -u +\"%Y-%m-%dT%H:%M:%SZ\") ===" >> "$LOG_FILE"

npm run fos:chunked -- \
  --start-date 2017-01-01 \
  --end-date 2017-12-31 \
  --window-days 7 \
  --index data/fos/indexes/2017.jsonl \
  --pdf-dir "/Users/omosanya_main/Google Drive/My Drive/Nasara/FOS/pdfs" \
  --download-delay 1200 \
  --retries 3 \
  --retry-delay 8000 >> "$LOG_FILE" 2>&1

echo "=== Run end: $(date -u +\"%Y-%m-%dT%H:%M:%SZ\") ===" >> "$LOG_FILE"
