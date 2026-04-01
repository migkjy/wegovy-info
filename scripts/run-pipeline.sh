#!/bin/bash
# run-pipeline.sh
# Local pipeline runner for NUC (Windows Task Scheduler or manual)
# Uses Claude Max CLI — no API cost
# Schedule: daily 06:00 KST via Windows Task Scheduler

set -e

REPO_DIR="/c/Projects/wegovy-info"
LOG_FILE="$REPO_DIR/.pipeline-logs/run-$(date +%Y-%m-%d).log"

mkdir -p "$REPO_DIR/.pipeline-logs"

echo "[$(date)] Pipeline starting..." | tee -a "$LOG_FILE"

# Load env vars
set -a && source "$REPO_DIR/.env" && set +a

# Pull latest main before generating
git -C "$REPO_DIR" pull origin main 2>&1 | tee -a "$LOG_FILE"

# Run pipeline
export PATH="$PATH:/c/Users/migkj/.local/bin"
node "$REPO_DIR/scripts/pipeline.mjs" 2>&1 | tee -a "$LOG_FILE"

# Commit and push new posts
cd "$REPO_DIR"
git add content/posts/
if git diff --staged --quiet; then
  echo "[$(date)] No new posts to commit." | tee -a "$LOG_FILE"
else
  git commit -m "feat(pipeline): auto-add GLP-1 news posts [skip ci]"
  git push origin main
  echo "[$(date)] Pushed new posts." | tee -a "$LOG_FILE"
fi

echo "[$(date)] Pipeline done." | tee -a "$LOG_FILE"
