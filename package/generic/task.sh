#!/bin/sh

export DATA="`dirname $0`/data"
export TASK="$1"

filebot "@$DATA/task/$TASK.args" 2>&1 | tee -a "$DATA/log/$TASK.log"
