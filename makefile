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
	rm -rv build dist release
	git reset --hard
	git pull
	git log -1
