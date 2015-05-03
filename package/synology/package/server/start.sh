#!/bin/sh

export FILEBOT_NODE_HOST='0.0.0.0' # bind to all interfaces
export FILEBOT_NODE_AUTH='SYNO'

export FILEBOT_NODE_HTTP='YES'
export FILEBOT_NODE_HTTP_PORT='5452'

export FILEBOT_NODE_HTTPS='YES'
export FILEBOT_NODE_HTTPS_PORT='5453'
export FILEBOT_NODE_HTTPS_KEY='/usr/syno/etc/ssl/ssl.key/server.key'
export FILEBOT_NODE_HTTPS_CERT='/usr/syno/etc/ssl/ssl.crt/server.crt'

export FILEBOT_NODE_CLIENT='/usr/local/filebot-node/client' 
export FILEBOT_EXECUTABLE='/usr/bin/filebot'

# set working dir
cd '/usr/local/filebot-node/server'

# --max_executable_size (max size of executable memory (in Mbytes))
# (NOT YET SUPPORTED SYNO NODE.JS) --optimize_for_size (Enables optimizations which favor memory size over execution speed.)
# --use_idle_notification (Use idle notification to reduce memory footprint.)
/usr/bin/node --max_executable_size=16 --use_idle_notification app.js
