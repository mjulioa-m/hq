#!/bin/sh
set -e

echo "Running database migrations..."
node ./scripts/run-migrate.mjs

echo "Seeding..."
node ./scripts/seed.mjs

echo "Starting HQ..."
exec node server.js
