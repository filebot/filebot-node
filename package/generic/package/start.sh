#!/bin/sh

export FILEBOT_NODE_HOST="0.0.0.0" # bind to all interfaces

export FILEBOT_NODE_AUTH="BASIC"
export FILEBOT_NODE_AUTH_USER="$USER" # default username is your username
export FILEBOT_NODE_AUTH_PASS="$USER" # default password is your password -> MUST CHANGE

export FILEBOT_NODE_HTTP="YES"
export FILEBOT_NODE_HTTP_PORT="5452"

export FILEBOT_NODE_HTTPS="NO"
export FILEBOT_NODE_HTTPS_PORT="5453"
export FILEBOT_NODE_HTTPS_KEY="/path/to/server.key"
export FILEBOT_NODE_HTTPS_CRT="/path/to/server.crt"

export FILEBOT_CMD="filebot"
export FILEBOT_CMD_CWD="$PWD"
export FILEBOT_CMD_UID=`id -u $USER`
export FILEBOT_CMD_GID=`id -g $USER`

export FILEBOT_NODE_CLIENT="client"

# --max_executable_size (max size of executable memory (in Mbytes))
# --optimize_for_size (Enables optimizations which favor memory size over execution speed.)
# --use_idle_notification (Use idle notification to reduce memory footprint.)
node --max_executable_size=16 --optimize_for_size --use_idle_notification "server/app.js"
