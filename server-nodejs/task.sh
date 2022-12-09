#!/bin/bash -u

export FILEBOT_NODE_DATA="$PWD/data"
export FILEBOT_NODE_TASK="$1"


# sanity check
if [ ! -f "$FILEBOT_NODE_DATA/task/$FILEBOT_NODE_TASK.args" ]; then
	echo "$0: Task $FILEBOT_NODE_TASK does not exist"
	exit 1
fi


# import user environment
if [ -f "$FILEBOT_NODE_DATA/environment.sh" ]; then
	source "$FILEBOT_NODE_DATA/environment.sh"
fi


# execute filebot task and record output
filebot "@$FILEBOT_NODE_DATA/task/$FILEBOT_NODE_TASK.args" 2>&1 | tee -a "$FILEBOT_NODE_DATA/log/$FILEBOT_NODE_TASK.log"


# get filebot exit code (and not tee exit code)
STATUS="${PIPESTATUS[0]}"

# treat ExitCode.NOOP as ExitCode.SUCCESS
if [ $STATUS -eq 100 ]; then
	exit 0
fi

exit $STATUS
