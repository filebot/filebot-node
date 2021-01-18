ANT := ant -lib lib

build-production:
	$(ANT) clean build

run-client:
	cd client-extjs && sencha app watch

run-server:
	cd server-nodejs && npm start

publish: clean build-production
	$(ANT) tar spk syno-repo qpkg

resolve:
	$(ANT) resolve

spk:
	$(ANT) spk

qpkg:
	$(ANT) qpkg

clean:
	-rm -rv build dist release
	git reset --hard
	git pull
	git --no-pager log -1
	# https://forum.sencha.com/forum/showthread.php?471696
	-rm -v "$(HOME)/Library/Application Support/Sencha/Cmd/Update/app.properties"
