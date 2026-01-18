const enable = !process?.env?.DISABLE_SW || process.env.DISABLE_SW === "false";

export function registerServiceWorker(): void {
	if("serviceWorker" in navigator) {
		if(enable) {
			navigator.serviceWorker.register("./sw.js").catch((err) => {
				// eslint-disable-next-line no-console
				console.error("Error registering service worker", err.stack || err);
			});
		} else {
			void navigator.serviceWorker.getRegistrations().then(function(registrations) {
				for(const registration of registrations) {
					void registration.unregister();
				}
			});
		}
	} else {
		// eslint-disable-next-line no-console
		console.warn("Service worker not supported by browser");
	}
}
