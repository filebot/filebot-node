#!/bin/sh

if /usr/syno/synoman/webman/authenticate.cgi > /dev/null; then
	PROXY_PASS='http://127.0.0.1:5452'
	PROXY_FILE="$(basename "$SCRIPT_NAME" '.cgi')"
	curl --include --silent --no-buffer --header "If-Modified-Since: $HTTP_IF_MODIFIED_SINCE" --header "X-Real-IP: $REMOTE_ADDR" --cookie "$HTTP_COOKIE" "$PROXY_PASS/$PROXY_FILE?$QUERY_STRING"
	exit 0
else
	echo 'Status: 401 Unauthorized'
	echo ''
	echo 'Unauthorized'
	exit 1
fi
