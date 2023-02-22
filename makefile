ANT := ant -lib lib

build-production:
	$(ANT) clean build

publish: clean build-production
	$(ANT) tar spk syno-repo spk-dsm6 syno-repo-dsm6 qpkg checksum

run-client:
	docker run -v "${PWD}/client-extjs:/src" -p 1841:1841 rednoah/sencha-build app watch

run-server:
	docker run --rm -it -v "${PWD}/server-nodejs:/src" -p 1841:1841 node:latest start

npm-install:
	docker run -v "${PWD}/server-nodejs:/src" -p 1841:1841 --workdir /src --entrypoint /usr/local/bin/npm node:latest install

resolve: clean npm-install
	$(ANT) resolve

spk:
	$(ANT) clean build spk spk

qpkg:
	$(ANT) clean build qpkg

clean:
	-rm -rv lib build dist release
	git reset --hard
	git pull
	git --no-pager log -1
