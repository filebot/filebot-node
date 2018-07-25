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

		/bin/ln -sf "$QPKG_ROOT" "/opt/filebot-node"
		;;

	stop)
		rm -rf "/opt/filebot-node"
		;;

	restart)
		$0 stop
		$0 start
		;;

	*)
		echo "Usage: $0 {start|stop|restart}"
		exit 1
esac


exit 0
