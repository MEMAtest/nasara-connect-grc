#!/bin/sh
set -e

cd /Users/omosanya_main/Documents/nasara-connect-grc/nasara-connect || exit 1

INDEX_PATH="data/fos/indexes/2017.jsonl"
idx=$(wc -l < "$INDEX_PATH" 2>/dev/null || echo 0)
mtime=$(stat -f "%Sm" "$INDEX_PATH" 2>/dev/null || echo "n/a")

summary=$(node scripts/fos/report-progress.mjs --year 2017 2>/dev/null | node -e 'const fs=require("fs"); const input=fs.readFileSync(0,"utf8"); try { const d=JSON.parse(input); const range=d.range||"-"; console.log(`parsed=${d.total||0} range=${range}`); } catch(e){ console.log("parsed=0 range=-"); }')

echo "index=$idx $summary mtime=\"$mtime\""
