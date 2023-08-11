ANT := ant -lib lib

build-production:
	$(ANT) clean build

publish: clean build-production
	$(ANT) tar spk syno-repo spk-dsm6 syno-repo-dsm6 qpkg checksum

run-client:
	docker run --rm -it -v "${PWD}/client-extjs:/src" -p 1841:1841 rednoah/sencha-build app watch

run-server:
	docker run --rm -it -v "${PWD}/server-nodejs:/server-nodejs" -v "${PWD}/dist:/dist" --workdir /server-nodejs -p 5452:5452 node:latest /server-nodejs/start.sh

npm-install:
	docker run --rm -it -v "${PWD}/server-nodejs:/server-nodejs" --workdir /server-nodejs node:latest npm install

sencha-app-upgrade:
	docker run --rm -it -v "${PWD}/client-extjs:/src" rednoah/sencha-build app upgrade

sencha-show-props:
	docker run --rm -it -v "${PWD}/client-extjs:/src" rednoah/sencha-build diag show-props

sencha-bash:
	docker run --rm -it -v "${PWD}/client-extjs:/src" --entrypoint /bin/bash rednoah/sencha-build

resolve: npm-install
	-rm -rvf lib
	$(ANT) resolve

spk:
	$(ANT) clean build spk spk

qpkg:
	$(ANT) clean build qpkg

clean:
	-rm -rvf build dist release
	git reset --hard
	git pull
	git --no-pager log -1
