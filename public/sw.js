const version = "v1";

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(version).then((cache) => cache.addAll(["/"])));
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(keyList.map((key) => {
				if(key != version)
					return caches.delete(key);
			}));
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(caches.open(version).then((cache) => {
		return cache.match(event.request, { ignoreSearch: true }).then((response) => {
			if(response) {
				refresh(cache, event, response.clone());
				return response;
			} else
				return fetch(event.request);
		})}));
});

function refresh(cache, event, oldResponse) {
	fetch(event.request).then((response) => {
		cache.put(event.request.url, response.clone());

		return Promise.all([ response.text(), oldResponse.text() ]).then(([ r1, r2 ]) => {
			if (r1 === r2)
				console.log("Cache reloaded, nothing changed");
			else {
				console.log("Cache reloaded, publishing changes");
				clients.matchAll().then((clients) => {
					for(const client of clients)
						client.postMessage("bb-refresh");
				});
			}
		});
	}).catch((err) => {
		console.warn("Cache reloading failed", err.stack || err);
	})
}