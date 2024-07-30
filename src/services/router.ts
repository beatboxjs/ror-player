import { computed, ref, Ref, watch } from "vue";
import { match, compile } from "path-to-regexp";

export type Route = {
	tab: "listen";
	tuneName?: string;
	patternName?: string;
} | {
	tab: "compose";
	tuneName?: string;
	patternName?: string;
	importData?: string;
};

const ROUTES = {
	"root": "/",
	"listen-tune": "/listen/:tuneName/",
	"listen-pattern": "/listen/:tuneName/:patternName",
	"compose": "/compose/",
	"compose-tune": "/compose/:tuneName/",
	"compose-pattern": "/compose/:tuneName/:patternName",
	"compose-importAndTune": "/compose/:importData/:tuneName/",
	"compose-importAndPattern": "/compose/:importData/:tuneName/:patternName",
	"compose-import": "/compose/:importData",
	"legacy-tune": "/:tuneName/",
	"legacy-pattern": "/:tuneName/:patternName",
	"legacy-importAndTune": "/:importData/:tuneName/",
	"legacy-importAndPattern": "/:importData/:tuneName/:patternName",
	"legacy-import": "/:importData"
} satisfies Record<string, string>;

const ROUTES_MATCH = Object.fromEntries(Object.entries(ROUTES).map(([name, pattern]) => [name, match(pattern, { decode: decodeURIComponent, trailing: false })]));

const ROUTES_COMPILE = Object.fromEntries(Object.entries(ROUTES).map(([name, pattern]) => [name, compile(pattern, { encode: encodeURIComponent })]));

function pathToRoute(path: string): Route {
	let match: { name: keyof typeof ROUTES; params?: Partial<Record<string, string>> } | undefined;
	if (path) {
		for(const name of Object.keys(ROUTES_MATCH) as Array<keyof typeof ROUTES>) {
			const m = ROUTES_MATCH[name](path);
			if(m) {
				match = { name, params: m.params as Record<string, string> };
				break;
			}
		}
	}
	if (!match) {
		match = { name: 'root' };
	}

	switch (match.name) {
		case "listen-tune":
		case "listen-pattern":
			return {
				tab: "listen",
				tuneName: match.params?.tuneName,
				patternName: match.params?.patternName
			};

		case "compose":
		case "compose-tune":
		case "compose-pattern":
		case "compose-importAndTune":
		case "compose-importAndPattern":
		case "compose-import":
		case "legacy-tune":
		case "legacy-pattern":
		case "legacy-importAndTune":
		case "legacy-importAndPattern":
		case "legacy-import":
			return {
				tab: "compose",
				tuneName: match.params?.tuneName,
				patternName: match.params?.patternName,
				importData: match.params?.importData
			};

		case "root":
			return { tab: "listen" };
	};
}

function routeToPath(route: Route): string {
	let match: { name: keyof typeof ROUTES; params?: Partial<Record<string, string>> } | undefined;
	switch (route?.tab) {
		case "listen":
			if (!route.tuneName) {
				match = { name: "root" };
			} else if (!route.patternName) {
				match = { name: "listen-tune", params: { tuneName: route.tuneName } };
			} else {
				match = { name: "listen-pattern", params: { tuneName: route.tuneName, patternName: route.patternName } };
			}
			break;

		case "compose":
			if (!route.tuneName) {
				match = { name: route.importData ? "compose-import" : "compose", params: { importData: route.importData } };
			} else if (!route.patternName) {
				match = { name: route.importData ? "compose-importAndTune" : "compose-tune", params: { importData: route.importData, tuneName: route.tuneName } };
			} else {
				match = { name: route.importData ? "compose-importAndPattern" : "compose-pattern", params: { importData: route.importData, tuneName: route.tuneName, patternName: route.patternName } };
			}
	}

	if (!match) {
		match = { name: "root" };
	}

	return ROUTES_COMPILE[match.name](match.params);
}

/**
 * Enables a two-directional binding between the specified path reference and the app state. The path represents the current app
 * state, and when the path is set, the app state is adjusted to represent the path. The path ref can be linked to the location
 * hash using {@link reactiveLocationHash}.
 */
export function useRouter(path: Ref<string>): Ref<Route> {
	const route = ref<Route>(pathToRoute(path.value));

	watch(path, () => {
		route.value = pathToRoute(path.value);
	});

	watch(route, () => {
		path.value = routeToPath(route.value);
	}, { immediate: true, deep: true });

	return route;
}

const locationHashTrigger = ref(0);
export const reactiveLocationHash = computed({
	get: () => {
		locationHashTrigger.value;
		return location.hash.replace(/^#/, '');
	},
	set: (hash) => {
		location.hash = `#${hash}`;
	}
});
window.addEventListener('hashchange', () => {
	locationHashTrigger.value++;
});


/* async function navigate(name: string, params: Route['params'] = {}): Promise<void> {
	if (isEqual(route.value, { name, params })) {
		return;
	}

	setRoute(name, params);

	switch (name) {
		case "root":
			navigate("listen-tune", { tuneName: getTuneOfTheYear() });
			break;


		case "listen-tune":
			hideAllModals();
			eventBus.emit("listen", params.tuneName);
			break;

		case "listen-pattern":
			eventBus.emit("listen", params.tuneName);
			hideAllModals();
			eventBus.emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: true });
			break;


		case "compose":
			hideAllModals();
			eventBus.emit("compose");
			break;

		case "compose-tune":
			if(!history.state.value.tunes[params.tuneName]) {
				navigate("compose");
				break;
			}

			hideAllModals();
			eventBus.emit("compose");
			eventBus.emit("pattern-list-open-tune", params.tuneName);
			break;

		case "compose-pattern":
			if(!getPatternFromState(history.state.value, params.tuneName, params.patternName)) {
				navigate("compose");
				break;
			}

			eventBus.emit("compose");
			await nextTick();
			eventBus.emit("pattern-list-open-tune", params.tuneName);
			hideAllModals();
			eventBus.emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: false });

			break;

		case "compose-importAndTune": {
			hideAllModals();

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				showAlert({ title: 'Errors while loading data', message: errs.join("\n"), variant: 'warning' });

			await nextTick();
			navigate("compose-tune", { tuneName: params.tuneName });
			break;
		}

		case "compose-importAndPattern": {
			hideAllModals();

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				showAlert({ title: 'Errors while loading data', message: errs.join("\n"), variant: 'warning' });

			await nextTick();
			navigate("compose-pattern", { tuneName: params.tuneName, patternName: params.patternName });
			break;
		}

		case "compose-import": {
			hideAllModals();

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				showAlert({ title: 'Errors while loading data', message: errs.join("\n"), variant: 'warning' });

			await nextTick();
			navigate("compose");
			break;
		}

		case "legacy-tune":
			navigate("listen-tune", params);
			break;

		case "legacy-pattern":
			navigate("listen-pattern", params);
			break;

		case "legacy-importAndTune":
			navigate("compose-importAndTune", params);
			break;

		case "legacy-importAndPattern":
			navigate("compose-importAndPattern", params);
			break;

		case "legacy-import":
			navigate("compose-import", params);
			break;
	};
} */

/* eventBus.on("pattern-list-tune-opened", (tuneName) => {
	if(["root", "listen-tune"].includes(route.value?.name ?? "root")) {
		setRoute("listen-tune", { tuneName });
	} else if(["compose", "compose-tune"].includes(route.value?.name ?? "root")) {
		setRoute("compose-tune", { tuneName });
	}
});

eventBus.on("pattern-list-tune-closed", (tuneName) => {
	if(route.value?.name === "compose-tune")
		setRoute("compose");
});

eventBus.on("overview-compose", () => {
	let isCompose = route.value?.name.match(/^compose($|-)/);
	if(!isCompose)
		setRoute("compose");
});

eventBus.on("overview-listen", () => {
	let isCompose = route.value?.name.match(/^compose($|-)/);
	if(isCompose) {
		if(route.value?.params.tuneName)
			navigate("listen-tune", { tuneName: route.value.params.tuneName });
		else
			navigate("root");
	}
});

eventBus.on("pattern-editor-opened", ({ pattern, readonly }) => {
	setRoute(readonly ? "listen-pattern" : "compose-pattern", { tuneName: pattern[0], patternName: pattern[1] });
});

eventBus.on("pattern-editor-closed", ({ pattern, readonly }) => {
	if (readonly)
		setRoute("listen-tune", { tuneName: pattern[0] });
	else
		setRoute("compose");
});*/