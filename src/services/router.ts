import $ from "jquery";
import config from "../config";
import events from "./events";
import history from "./history";
import { getPatternFromState } from "../state/state";
import Vue from "vue";
import { BvModalEvent } from "bootstrap-vue";
import PatternEditorDialog from "../ui/pattern-editor-dialog/pattern-editor-dialog";
import { match, compile, MatchFunction, PathFunction } from "path-to-regexp";
import { getTuneOfTheYear } from "./utils";

const ROUTES: { [key: string]: string } = {
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

const ROUTES_MATCH: { [key: string]: MatchFunction } = Object.keys(ROUTES).reduce((p, c) => ({ ...p, [c]: match(ROUTES[c], { decode: decodeURIComponent, strict: true }) }), {});

const ROUTES_COMPILE: { [key: string]: PathFunction } = {
	root: () => "/",
	...Object.keys(ROUTES).reduce((p, c) => ({ ...p, [c]: compile(ROUTES[c], { encode: encodeURIComponent }) }), {})
};

type Params = { [key: string]: string };

export function enableRouter(app: Vue) {
	const HANDLERS: { [key: string]: (params: Params) => unknown } = {
		"": () => {
			navigate("listen-tune", { tuneName: getTuneOfTheYear() });
		},


		/* Listen */

		"listen-tune": async (params) => {
			await ignoreSetState(closeAllDialogs);

			events.$emit("listen", params.tuneName);
		},

		"listen-pattern": async (params) => {
			await ignoreSetState(() => {
				events.$emit("listen", params.tuneName);
				closeAllDialogs();
			});
			events.$emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: true });
		},


		/* Compose */

		"compose": async (params) => {
			await ignoreSetState(closeAllDialogs);

			events.$emit("compose");
		},

		"compose-tune": async (params) => {
			if(!history.state.tunes[params.tuneName])
				return navigate("compose");

			await ignoreSetState(() => {
				closeAllDialogs();
				events.$emit("compose");
			});

			events.$emit("pattern-list-open-tune", params.tuneName);
		},

		"compose-pattern": async (params) => {
			if(!getPatternFromState(history.state, params.tuneName, params.patternName))
				return navigate("compose");

			await ignoreSetState(async () => {
				events.$emit("compose");
				await Vue.nextTick();
				events.$emit("pattern-list-open-tune", params.tuneName);

				closeAllDialogs();
			});

			events.$emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: false });
		},

		"compose-importAndTune": async (params) => {
			await ignoreSetState(closeAllDialogs);

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				app.$bvModal.msgBoxOk("Errors while loading data:\n" + errs.join("\n"));

			await Vue.nextTick();
			navigate("compose-tune", { tuneName: params.tuneName });
		},

		"compose-importAndPattern": async (params) => {
			await ignoreSetState(closeAllDialogs);

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				app.$bvModal.msgBoxOk("Errors while loading data:\n" + errs.join("\n"));

			await Vue.nextTick();
			navigate("compose-pattern", { tuneName: params.tuneName, patternName: params.patternName });
		},

		"compose-import": async (params) => {
			await ignoreSetState(closeAllDialogs);

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				app.$bvModal.msgBoxOk("Errors while loading data:\n" + errs.join("\n"));

			await Vue.nextTick();
			navigate("compose");
		},


		/* Legacy */

		"legacy-tune": (params) => {
			navigate("listen-tune", params)
		},

		"legacy-pattern": (params) => {
			navigate("listen-pattern", params);
		},

		"legacy-importAndTune": (params) => {
			navigate("compose-importAndTune", params);
		},

		"legacy-importAndPattern": (params) => {
			navigate("compose-importAndPattern", params);
		},

		"legacy-import": (params) => {
			navigate("compose-import", params);
		}
	};


	let lastTune: string | null = null;
	let currentState: { name: string, params: Params } | null = null;
	let setStateIgnored = false;
	let hashChangeIgnored = false;

	function resolve() {
		const hash = location.hash.replace(/^#/, "");

		if(["", "/"].includes(hash)) {
			currentState = null;
			HANDLERS[""]({});
			return;
		}

		for(const key of Object.keys(ROUTES_MATCH)) {
			const match = ROUTES_MATCH[key](hash);
			if(match) {
				currentState = { name: key, params: match.params as any };
				HANDLERS[key](match.params as any);
				return;
			}
		}
	}

	async function ignoreSetState(callback: () => void) {
		setStateIgnored = true;
		try {
			await callback();
		} finally {
			await Vue.nextTick();
			setStateIgnored = false;
		}
	}

	function navigate(name: string, params: Params = { }) {
		setState(name, params);

		resolve();
	}

	function setState(name: string, params: Params = { }) {
		if(setStateIgnored)
			return;

		// no idea what this is for - just seems to fuck it on iphone: hashchange event is synchronous
		// hashChangeIgnored = true;
		// setTimeout(() => {
		// 	hashChangeIgnored = false;
		// }, 0);

		if(name == "") {
			location.hash = "#";
			currentState = null;
		} else {
			location.hash = "#" + ROUTES_COMPILE[name](params);
			currentState = { name, params };
		}
	}

	resolve();
	window.addEventListener("hashchange", () => {
		if(!hashChangeIgnored)
			resolve();
	}, false);

	events.$on("edit-pattern-command", function(data) {
	    setState(data.readonly ? "listen-pattern" : "compose-pattern", { tuneName: data.pattern[0], patternName: data.pattern[1] });
	})

	app.$on("bv::modal::hide", (bvEvent: BvModalEvent, modalId: string) => {
		if(bvEvent.vueTarget instanceof Vue && (bvEvent.vueTarget as Vue).$parent instanceof PatternEditorDialog) {
			const dialog = (bvEvent.vueTarget as Vue).$parent as PatternEditorDialog;
			if(dialog.$props.readonly)
				setState("listen-tune", { tuneName: dialog.$props.tuneName });
			else
				setState("compose");
		}
	});

	events.$on("pattern-list-tune-opened", function(tuneName) {
		lastTune = tuneName;

		if(currentState && ["", "root", "listen-tune"].includes(currentState.name))
			setState("listen-tune", { tuneName: tuneName });
		else if(currentState && ["compose", "compose-tune"].includes(currentState.name))
			setState("compose-tune", { tuneName: tuneName });
	});

	events.$on("pattern-list-tune-closed", function(tuneName) {
		lastTune = null;

		if(currentState && currentState.name == "compose-tune")
			setState("compose");
	});

	events.$on("overview-compose", () => {
		let isCompose = currentState && currentState.name.match(/^compose$/);
		if(!isCompose)
			setState("compose");
	});

	events.$on("overview-listen", () => {
		let isListen = currentState && currentState.name.match(/^listen$/);
		if(!isListen) {
			if(lastTune)
				navigate("listen-tune", { tuneName: lastTune });
			else
				navigate("root");
		}
	});

	function closeAllDialogs() {
		for(const id of [...$(".modal")].map((modal) => modal.getAttribute("id")))
			app.$bvModal.hide(id as string);
	}
}