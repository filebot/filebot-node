include *.variables

ANT := ant -lib lib

build-production:
	$(ANT) build

run-client:
	cd client-extjs && sencha app watch

run-server:
	cd server-nodejs && npm start

publish: clean build-production
	make qpkg
	$(ANT) tar spk syno-repo

qpkg:
	ssh $(QNAP_USER)@$(QNAP_HOST) "cd $(QNAP_FILEBOT_NODE_MASTER) && git reset --hard && git pull && git log -1 && rm -rvf build dist release"
	scp -r dist $(QNAP_USER)@$(QNAP_HOST):$(QNAP_FILEBOT_NODE_MASTER)
	ssh $(QNAP_USER)@$(QNAP_HOST) "cd $(QNAP_FILEBOT_NODE_MASTER) && export JAVA_HOME=/opt/java && ant qpkg"
	scp -r "$(QNAP_USER)@$(QNAP_HOST):$(QNAP_FILEBOT_NODE_MASTER)/dist/*.qpkg" dist

clean:
	git reset --hard
	git pull
	git log -1
	rm -rvf build dist release
	$(ANT) resolve clean
