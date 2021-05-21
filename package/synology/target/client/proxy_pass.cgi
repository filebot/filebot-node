#!/bin/sh

PROXY_PASS='http://127.0.0.1:5452'
PROXY_FILE="$(basename "$SCRIPT_NAME" '.cgi')"

exec -c -a 'proxy_pass.cgi' \
  curl \
  --include \
  --silent \
  --no-buffer \
  --header "If-Modified-Since: $HTTP_IF_MODIFIED_SINCE" \
  --header "X-Syno-Token: $HTTP_X_SYNO_TOKEN" \
  --header "X-Real-IP: $REMOTE_ADDR" \
  --cookie "$HTTP_COOKIE" \
  "$PROXY_PASS/$PROXY_FILE?$QUERY_STRING"
