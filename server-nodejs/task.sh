#!/bin/sh

export FILEBOT_NODE_DATA="$PWD/data"
export FILEBOT_NODE_TASK="$1"

# import user environment
source "$FILEBOT_NODE_DATA/environment.sh"

# execute filebot task and record output
filebot "@$FILEBOT_NODE_DATA/task/$FILEBOT_NODE_TASK.args" 2>&1 | tee -a "$FILEBOT_NODE_DATA/log/$FILEBOT_NODE_TASK.log"

exit ${PIPESTATUS[0]} # return filebot exit code (and not tee exit code)
