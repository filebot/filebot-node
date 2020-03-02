ANT := ant -lib lib

build-production:
	$(ANT) resolve clean
	$(ANT) build

run-client:
	cd client-extjs && sencha app watch

run-server:
	cd server-nodejs && npm start

publish: clean build-production
	$(ANT) tar spk syno-repo qpkg

clean:
	-rm -v $(HOME)/Library/Application Support/Sencha/Cmd/Update/app.properties # SENCHA BUG: https://www.sencha.com/forum/showthread.php?471696
	-rm -rv build dist release
	git reset --hard
	git pull
	git --no-pager log -1
