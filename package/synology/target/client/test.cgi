#!/bin/sh

echo 'Status: 200 OK'
echo 'Content-Type: text/plain; charset=UTF-8'
echo ''

if /usr/syno/synoman/webman/authenticate.cgi; then
	echo '----------'
	printenv
	echo '----------'
	id
	echo '----------'
	node -v 2>&1
	echo '----------'
	java -version 2>&1
	echo '----------'
	filebot -script fn:sysinfo 2>&1
else
	echo $?
fi
