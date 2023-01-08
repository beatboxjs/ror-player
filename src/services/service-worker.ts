import { useEventBus } from "./events";

const enable = !process.env.DISABLE_SW || process.env.DISABLE_SW === "false";

export function registerServiceWorker(): void {
	if("serviceWorker" in navigator) {
		if(enable) {
			navigator.serviceWorker.register("./sw.js").catch((err) => {
				// eslint-disable-next-line no-console
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
		// eslint-disable-next-line no-console
		console.warn("Service worker not supported by browser");
	}
}

function receiveMessage(event: MessageEvent) {
	if(event.data === "bb-refresh") {
		useEventBus("update-available").emit();
	}
}