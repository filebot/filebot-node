#!/bin/sh

export FILEBOT_NODE_HOST='127.0.0.1'
export FILEBOT_NODE_PORT='5452'
export FILEBOT_NODE_AUTH='SYNO'

export FILEBOT_NODE_CLIENT='../client-extjs/build/production/FileBot'
export FILEBOT_EXECUTABLE='filebot'

# --optimize_for_size (Enables optimizations which favor memory size over execution speed.)
# --max_executable_size (max size of executable memory (in Mbytes))
# --use_idle_notification (Use idle notification to reduce memory footprint.)
node --max_executable_size=16 --optimize_for_size --use_idle_notification ./app.js
