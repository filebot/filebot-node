#!/bin/sh
git fetch --progress --prune origin && ant clean deploy
