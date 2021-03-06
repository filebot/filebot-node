ANT := ant -lib lib

build-production:
	$(ANT) clean build

run-client:
	docker run -v '${PWD}/client-extjs:/src' -p 1841:1841 rednoah/sencha-build app watch

run-server:
	cd server-nodejs && npm start

publish: clean build-production
	$(ANT) tar spk syno-repo spk-dsm6 syno-repo-dsm6 qpkg checksum

resolve:
	$(ANT) resolve

spk:
	$(ANT) clean build spk spk

qpkg:
	$(ANT) clean build qpkg

clean:
	-rm -rv build dist release
	git reset --hard
	git pull
	git --no-pager log -1
