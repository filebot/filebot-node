include *.variables

ANT := ant -lib lib

build-production:
	$(ANT) build

run-client:
	open http://localhost:1841/
	cd client-extjs && sencha app watch

run-server:
	cd server-nodejs && npm start

publish: clean build-production
	make qpkg
	$(ANT) tar spk syno-repo

qpkg:
	$(QNAP_SSH) "cd $(QNAP_HOME)/filebot-node && $(QNAP_CLEAN)"
	$(QNAP_SCP) dist $(QNAP_REMOTE_HOME)/filebot-node
	$(QNAP_SSH) "cd $(QNAP_HOME)/filebot-node && $(QNAP_ANT) qpkg"
	$(QNAP_SCP) "$(QNAP_REMOTE_HOME)/filebot-node/*/*.qpkg" $(QNAP_PACKAGES)

qpkg-deps:
	$(QNAP_SSH) "cd $(QNAP_HOME)/java-installer && $(QNAP_CLEAN) && $(QNAP_ANT) qpkg"
	$(QNAP_SSH) "cd $(QNAP_HOME)/ant-installer  && $(QNAP_CLEAN) && $(QNAP_ANT) qpkg"
	$(QNAP_SCP) "$(QNAP_REMOTE_HOME)/*-installer/*/*.qpkg" $(QNAP_PACKAGES)

clean:
	git reset --hard
	git pull
	git log -1
	rm -rf build dist release
	$(ANT) resolve clean
