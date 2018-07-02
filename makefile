ANT := ant -lib lib

build:
	$(ANT) build

publish:
	$(ANT) build deploy package-source -lib lib

run-client:
	cd client-extjs && sencha app watch
	# open http://localhost:1841

run-server:
	cd server-nodejs && npm start

clean:
	git reset --hard
	git pull
	git log -1
	rm -rvf build dist release
	$(ANT) resolve clean
