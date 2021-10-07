#!/bin/sh

echo 'Status: 200 OK'
echo 'Content-Type: text/plain; charset=UTF-8'
echo ''

if /usr/syno/synoman/webman/authenticate.cgi; then
	echo '---------- printenv ----------'
	printenv
	echo '---------- id ----------'
	id
	echo '---------- node ----------'
	node -v 2>&1
	echo '---------- java ----------'
	java -version 2>&1
	echo '---------- filebot ----------'
	filebot -script fn:sysinfo 2>&1
	echo '---------- filebot-node ----------'
	cat /var/packages/filebot-node/target/data/filebot-node.log
else
	echo $?
fi
