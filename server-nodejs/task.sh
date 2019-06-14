#!/bin/sh

export DATA="$PWD/data"
export TASK="$1"

filebot "@$DATA/task/$TASK.args" 2>&1 | tee -a "$DATA/log/$TASK.log"

exit ${PIPESTATUS[0]} # return filebot exit code (and not tee exit code)
