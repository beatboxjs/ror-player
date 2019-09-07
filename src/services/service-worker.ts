import events from "./events";

const enable = !process.env.DISABLE_SW || process.env.DISABLE_SW === "false";

export function registerServiceWorker() {
	if("serviceWorker" in navigator) {
		if(enable) {
			navigator.serviceWorker.register("./sw.js").catch((err) => {
				console.error("Error registering service worker", err.stack || err);
			});

			navigator.serviceWorker.addEventListener("message", receiveMessage);
		} else {
			navigator.serviceWorker.getRegistrations().then(function(registrations) {
				for(const registration of registrations) {
					registration.unregister()
				}
			});
		}
	} else {
		console.warn("Service worker not supported by browser");
	}
}

function receiveMessage(event: MessageEvent) {
	if(event.data === "bb-refresh") {
		events.$emit("update-available");
	}
}