#!/bin/sh
set -eu

APP_DIR="/root/nos-dashboard"
HOST="0.0.0.0"
PORT="3000"
HEALTH_URL="http://127.0.0.1:${PORT}/"
LOG_FILE="/tmp/nos-dashboard-prod.log"
PID_FILE="/tmp/nos-dashboard-prod.pid"

printf '== kill existing port %s ==\n' "$PORT"
fuser -k "${PORT}/tcp" 2>/dev/null || true
rm -f "$PID_FILE"

printf '\n== build app ==\n'
cd "$APP_DIR"
npm run build

printf '\n== start app ==\n'
nohup npm run start -- --hostname "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
APP_PID=$!
printf '%s\n' "$APP_PID" > "$PID_FILE"
printf 'started pid: %s\n' "$APP_PID"

printf '\n== wait for readiness ==\n'
READY=0
for _ in $(seq 1 30); do
  if curl -fsSI "$HEALTH_URL" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  printf 'service failed to become ready\n' >&2
  printf '\n== recent log ==\n' >&2
  tail -n 80 "$LOG_FILE" >&2 || true
  exit 1
fi

printf '\n== local health ==\n'
curl -I "$HEALTH_URL"

printf '\n== nginx health ==\n'
HTTPS_PROXY= HTTP_PROXY= ALL_PROXY= NO_PROXY='*' curl -kI https://127.0.0.1:8051/ -H 'Host: vpn.boos.lat'

printf '\n== done ==\n'
printf 'log: %s\n' "$LOG_FILE"
printf 'pid: %s\n' "$APP_PID"
