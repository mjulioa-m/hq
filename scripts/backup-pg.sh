#!/usr/bin/env bash
set -euo pipefail
mkdir -p /opt/backups
STAMP=$(date +%F)
OUT="/opt/backups/hq-${STAMP}.sql.gz"
docker compose exec -T db pg_dump -U hq hq | gzip > "$OUT"
echo "Wrote $OUT"
find /opt/backups -name 'hq-*.sql.gz' -mtime +14 -delete
