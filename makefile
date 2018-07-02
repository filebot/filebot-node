ANT := ant -lib lib

build-client:
	$(ANT) build

run-client:
	cd client-extjs && sencha app watch

run-server:
	cd server-nodejs && npm start

publish: clean
	$(ANT) build tar spk package-source

clean:
	git reset --hard
	git pull
	git log -1
	rm -rvf build dist release
	$(ANT) resolve clean
