#!/bin/bash
# run-collect.sh — Wegovy Hub 데이터 수집 자동화 (NUC Linux cron 호환)
#
# 사용법:
#   ./scripts/run-collect.sh              # 전체 수집 (RSS + HIRA + Naver)
#   ./scripts/run-collect.sh --rss        # RSS만 수집
#   ./scripts/run-collect.sh --hira       # HIRA 병원만 수집
#   ./scripts/run-collect.sh --naver      # 네이버 뉴스만 수집
#
# crontab 예시 (매일 06:00 KST):
#   0 6 * * * /home/migkjy/.paperclip/instances/default/workspaces/b43bdfa3-8423-4567-bb8f-a59a87a7a107/wegovy-info/scripts/run-collect.sh >> /tmp/wegovy-collect.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$REPO_DIR/.pipeline-logs"

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/collect-$(date +%Y-%m-%d).log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "=== 데이터 수집 시작 ==="

# .env.local 로드
if [ -f "$REPO_DIR/.env.local" ]; then
  set -a && source "$REPO_DIR/.env.local" && set +a
else
  log "ERROR: .env.local 파일 없음"
  exit 1
fi

# nvm 로드 (cron 환경에서 node 접근 보장)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

cd "$REPO_DIR"

ARGS="${*:-}"

run_script() {
  local name="$1"
  local script="$2"
  log "▶ $name 수집기 시작"
  if node "$script" >> "$LOG_FILE" 2>&1; then
    log "✅ $name 완료"
  else
    log "❌ $name 실패 (exit: $?)"
  fi
}

if [ -z "$ARGS" ]; then
  run_script "RSS" "scripts/collect/rss-feeds.mjs"
  run_script "HIRA" "scripts/collect/hira-clinics.mjs"
  run_script "Naver" "scripts/collect/naver-news.mjs"
else
  for arg in $ARGS; do
    case "$arg" in
      --rss)   run_script "RSS" "scripts/collect/rss-feeds.mjs" ;;
      --hira)  run_script "HIRA" "scripts/collect/hira-clinics.mjs" ;;
      --naver) run_script "Naver" "scripts/collect/naver-news.mjs" ;;
      *) log "알 수 없는 옵션: $arg" ;;
    esac
  done
fi

log "=== 데이터 수집 완료 ==="
