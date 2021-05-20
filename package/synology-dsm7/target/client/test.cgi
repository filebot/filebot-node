#!/bin/sh

if /usr/syno/synoman/webman/authenticate.cgi > /dev/null; then
	echo 'Status: 200 OK'
	echo ''
	printenv
	echo '----------'
	free -h
	echo '----------'
	df -h
	echo '----------'
	id
	echo '----------'
	java -version
	echo '----------'
	filebot -script fn:sysinfo 2>&1
else
	echo 'Status: 401 Unauthorized'
	echo ''
	echo 'Unauthorized'
	exit 1
fi
