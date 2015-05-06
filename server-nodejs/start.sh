#!/bin/sh

export FILEBOT_NODE_HOST='127.0.0.1' # use 0.0.0.0 to allow external connections
export FILEBOT_NODE_AUTH='NONE'

export FILEBOT_NODE_HTTP='YES'
export FILEBOT_NODE_HTTP_PORT='5452'

export FILEBOT_CMD='filebot'
export FILEBOT_CMD_CWD="$PWD"
export FILEBOT_CMD_UID=`id -u $USER`
export FILEBOT_CMD_GID=`id -g $USER`

export FILEBOT_NODE_CLIENT='../dist/generic/client'

# --max_executable_size (max size of executable memory (in Mbytes))
# --optimize_for_size (Enables optimizations which favor memory size over execution speed.)
# --use_idle_notification (Use idle notification to reduce memory footprint.)
node --max_executable_size=16 --optimize_for_size --use_idle_notification 'app.js'
