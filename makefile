include *.variables

ANT := ant -lib lib

build:
	$(ANT) build

publish:
	$(ANT) build deploy package-source -lib lib

run-client:
	cd client-extjs && sencha app watch
	# open http://localhost:1841

run-server:
	cd server-nodejs && ./start.sh

clean:
	git reset --hard
	git pull
	git log -1
	rm -rvf build dist release
	$(ANT) resolve clean

purge-cache:
	curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$(CF_ZONE_ID)/purge_cache" -H "X-Auth-Email: $(CF_AUTH_EMAIL)" -H "X-Auth-Key: $(CF_AUTH_KEY)" -H "Content-Type: application/json" --data '{"purge_everything":true}'
