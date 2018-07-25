#!/bin/sh
CONF="/etc/config/qpkg.conf"
QPKG_NAME="filebot-node"
QPKG_ROOT=$(/sbin/getcfg $QPKG_NAME Install_Path -f $CONF)


case "$1" in
	start)
		ENABLED=$(/sbin/getcfg $QPKG_NAME Enable -u -d FALSE -f $CONF)
		if [ "$ENABLED" != "TRUE" ]; then
			echo "$QPKG_NAME is disabled."
			exit 1
		fi

		# symlink
		/bin/ln -sf "$QPKG_ROOT" "/opt/$QPKG_NAME"

		# start service
		"$QPKG_ROOT/start" > "$QPKG_ROOT/$QPKG_NAME.log" 2>&1 &
		exit $?
	;;

	stop)
		killall "$QPKG_NAME"
		rm "/opt/$QPKG_NAME"
		exit 0
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
