#!/usr/bin/with-contenv bashio
set -e
export SCHEDULER_DB_PATH="/data/scheduler.db"
export SCHEDULER_OPTIONS_PATH="/data/options.json"
cd /app
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8123
