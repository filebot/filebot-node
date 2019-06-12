# FileBot Node
[![Github Releases](https://img.shields.io/github/downloads/filebot/filebot-node/total.svg)](https://github.com/filebot/filebot-node/releases)
[![GitHub release](https://img.shields.io/github/release/filebot/filebot-node.svg)](https://www.filebot.net/linux/syno.html)

## Introduction
FileBot Node is a server-side Node.js application that allows you to make `filebot` calls via a straight-forward ExtJS web application.

![FileBot Node](http://i.imgur.com/HkQkh2h.png)

## User Manual
FileBot Node is available as Synology package via the [FileBot Package Source](https://www.filebot.net/forums/viewtopic.php?f=3&t=1802#p10572) and as generic Linux package for all other devices. Please refer to the [How To](https://www.filebot.net/forums/viewtopic.php?f=13&t=2733) manual if you need help getting started.

## Installation
Add the following __Package Source__ to Synology DSM ► Package Center ► Settings ► Package Sources:

https://get.filebot.net/syno/

FileBot Node will work on any Linux device that can run `filebot` and `node` but some tinkering may be required. You will need to [download](http://sourceforge.net/projects/filebot/files/filebot-node/) and unpack the `tar` package and start the node service yourself. See `start.sh` for details.

A Docker image is available [here](https://hub.docker.com/r/rednoah/filebot/).

## Notes
* Node.js is required for the server-side process
* System authentication is implemented for Synology DSM and QNAP NAS

## Discussion
Please visit the [FileBot Forums](https://www.filebot.net/forums/viewforum.php?f=13) if you need help with setting things up.
