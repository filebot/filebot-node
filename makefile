include *.variables

ANT := ant -lib lib

build-production:
	$(ANT) clean build

run-client:
	cd client-extjs && sencha app watch

run-server:
	cd server-nodejs && npm start

publish: clean build-production
	$(ANT) tar spk syno-repo qpkg

clean:
	git reset --hard
	git pull
	git log -1
	rm -rf build dist release
	$(ANT) resolve clean
