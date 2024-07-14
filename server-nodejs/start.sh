#!/bin/sh


echo "
-------------------- Run $0 (PID: $$) -------------------- $(date)
"


export FILEBOT_NODE_HOST='0.0.0.0' # use 0.0.0.0 to allow external connections
export FILEBOT_NODE_AUTH='NONE'

export FILEBOT_NODE_HTTP='YES'
export FILEBOT_NODE_HTTP_PORT='5452'

export FILEBOT_NODE_DATA="$PWD/data"
export FILEBOT_TASK_CMD="$PWD/task.sh"

export FILEBOT_CMD='filebot'
export FILEBOT_CMD_CWD="$PWD"
export FILEBOT_CMD_UID=$(id -u $USER)
export FILEBOT_CMD_GID=$(id -g $USER)

export FILEBOT_NODE_CLIENT='../dist/generic/client'


# force headless mode
export FILEBOT_OPTS='-Djava.awt.headless=true'


# import user environment
if [ -f "$FILEBOT_NODE_DATA/environment.sh" ]; then
	. "$FILEBOT_NODE_DATA/environment.sh"
fi


node 'app.js'
