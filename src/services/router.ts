import { History } from "./history";
import { getPatternFromState } from "../state/state";
import { computed, nextTick, ref, Ref, watch } from "vue";
import { match, compile } from "path-to-regexp";
import { getTuneOfTheYear } from "./utils";
import { EventBus } from "./events";
import { showAlert } from "../ui/utils/alert";
import { hideAllModals } from "../ui/utils/modal";
import { isEqual } from "lodash-es";

const ROUTES: Record<string, string> = {
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
};

const ROUTES_MATCH = Object.fromEntries(Object.entries(ROUTES).map(([name, pattern]) => [name, match(pattern, { decode: decodeURIComponent, strict: true })]));

const ROUTES_COMPILE = Object.fromEntries(Object.entries(ROUTES).map(([name, pattern]) => [name, compile(pattern, { encode: encodeURIComponent })]));

type Route = { name: string, params: Record<string, string> };

/**
 * Enables a two-directional binding between the specified path reference and the app state. The path represents the current app
 * state, and when the path is set, the app state is adjusted to represent the path. The path ref can be linked to the location
 * hash using {@link reactiveLocationHash}.
 */
export function enableRouter(eventBus: EventBus, history: History, path: Ref<string>): void {
	const route = ref<Route>();

	watch(path, () => {
		if(path.value === '') {
			navigate('root');
		} else {
			for(const key of Object.keys(ROUTES_MATCH)) {
				const match = ROUTES_MATCH[key](path.value);
				if(match) {
					navigate(key, match.params as any);
					break;
				}
			}
		}
	}, { immediate: true });

	function setRoute(name: string, params: Route['params'] = {}): void {
		route.value = { name, params };

		const newPath = ROUTES_COMPILE[name](params);
		if (path.value !== newPath) {
			path.value = newPath;
		}
	}

	async function navigate(name: string, params: Route['params'] = {}): Promise<void> {
		if (isEqual(route.value, { name, params })) {
			return;
		}

		setRoute(name, params);

		switch (name) {
			case "root":
				navigate("listen-tune", { tuneName: getTuneOfTheYear() });
				break;


			/* Listen */

			case "listen-tune":
				hideAllModals();
				eventBus.emit("listen", params.tuneName);
				break;

			case "listen-pattern":
				eventBus.emit("listen", params.tuneName);
				hideAllModals();
				eventBus.emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: true });
				break;


			/* Compose */

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


			/* Legacy */

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
	}

	eventBus.on("pattern-list-tune-opened", (tuneName) => {
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
	});
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
