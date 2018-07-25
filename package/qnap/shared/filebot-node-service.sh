#!/bin/sh
export QPKG_CONF="/etc/config/qpkg.conf"
export QPKG_NAME="filebot-node"
export QPKG_ROOT=$(/sbin/getcfg $QPKG_NAME Install_Path -f $QPKG_CONF)
export QPKG_DEFAULT_VOLUME=$(/sbin/getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)


case "$1" in
	start)
		ENABLED=$(/sbin/getcfg $QPKG_NAME Enable -u -d FALSE -f $QPKG_CONF)
		if [ "$ENABLED" != "TRUE" ]; then
			echo "$QPKG_NAME is disabled."
			exit 1
		fi

		# start service
		"$QPKG_ROOT/start" > "$QPKG_ROOT/$QPKG_NAME.log" 2>&1 &
		exit $?
	;;

	stop)
		killall "$QPKG_NAME"
		exit $?
	;;

	restart)
		$0 stop
		$0 start
		exit 0
	;;

	*)
		echo "Usage: $0 {start|stop|restart}"
		exit 1
esac
