#!/bin/sh

export FILEBOT_NODE_HOST='127.0.0.1'
export FILEBOT_NODE_AUTH='SYNO'

export FILEBOT_NODE_HTTP='YES'
export FILEBOT_NODE_HTTP_PORT='5452'

export FILEBOT_NODE_HTTPS='YES'
export FILEBOT_NODE_HTTPS_PORT='5453'
export FILEBOT_NODE_HTTPS_KEY='/usr/syno/etc/ssl/ssl.key/server.key'
export FILEBOT_NODE_HTTPS_CERT='/usr/syno/etc/ssl/ssl.crt/server.crt'

export FILEBOT_NODE_CLIENT='/var/packages/filebot-node/target/client' 
export FILEBOT_EXECUTABLE='/var/packages/filebot/target/filebot.sh'

# --optimize_for_size (Enables optimizations which favor memory size over execution speed.)
# --max_executable_size (max size of executable memory (in Mbytes))
# --use_idle_notification (Use idle notification to reduce memory footprint.)
node --max_executable_size=16 --optimize_for_size --use_idle_notification app.js
