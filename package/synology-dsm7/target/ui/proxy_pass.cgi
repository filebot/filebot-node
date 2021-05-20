#!/bin/sh

if /usr/syno/synoman/webman/authenticate.cgi > /dev/null; then
	echo 'Status: 200 OK'
	echo ''
	curl --silent --no-buffer "http://127.0.0.1:5452/$1"
	exit 0
else
	echo 'Status: 401 Unauthorized'
	echo ''
	echo 'Unauthorized'
	exit 1
fi
