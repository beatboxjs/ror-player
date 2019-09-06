import $ from "jquery";
import Navigo from "navigo";
import config from "./config";
import events from "./services/events";
import history from "./services/history";
import { getPatternFromState } from "./state/state";
import Vue from "vue";
import { BModal, BvModalEvent } from "bootstrap-vue";
import PatternEditorDialog from "./ui/pattern-editor-dialog/pattern-editor-dialog";

export function enableRouter(app: Vue) {
	let lastTune: string | null = null;
	let currentState: { name: string, params?: object } | null = null;
	let paused = false;

	const router = new Navigo(`${location.protocol}//${location.host}${location.pathname}${location.search}`, true);

	router.on({
		"*": () => {
			navigate("listen-tune", { tuneName: config.tuneOfTheYear });
		},


		/* Listen */

		"/listen/:tuneName/": { as: "listen-tune", uses: (params) => {
			events.$emit("listen", params.tuneName);

			closeAllDialogs();
		}},

		"/listen/:tuneName/:patternName": { as: "listen-pattern", uses: async (params) => {
			await pause(() => {
				events.$emit("listen", params.tuneName);
				closeAllDialogs();
			});

			events.$emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: true });
		}},


		/* Compose */

		"/compose/": { as: "compose", uses: (params) => {
			events.$emit("compose");

			closeAllDialogs();
		}},

		"/compose/:tuneName/": { as: "compose-tune", uses: async (params) => {
			if(!history.state.tunes[params.tuneName])
				return navigate("compose");

			await pause(() => {
				closeAllDialogs();
				events.$emit("compose");
			});

			events.$emit("pattern-list-open-tune", params.tuneName);
		}},

		"/compose/:tuneName/:patternName": { as: "compose-pattern", uses: async (params) => {
			if(!getPatternFromState(history.state, params.tuneName, params.patternName))
				return navigate("compose");

			await pause(async () => {
				events.$emit("compose");
				await Vue.nextTick();
				events.$emit("pattern-list-open-tune", params.tuneName);

				closeAllDialogs();
			});

			events.$emit("edit-pattern", { pattern: [ params.tuneName, params.patternName ], readonly: false });
		}},

		"/compose/:importData/:tuneName/": { as: "compose-importAndTune", uses: async (params) => {
			closeAllDialogs();

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				app.$bvModal.msgBoxOk("Errors while loading data:\n" + errs.join("\n"));

			await Vue.nextTick();
			navigate("compose-tune", { tuneName: params.tuneName });
		}},

		"/compose/:importData/:tuneName/:patternName": { as: "compose-importAndPattern", uses: async (params) => {
			closeAllDialogs();

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				app.$bvModal.msgBoxOk("Errors while loading data:\n" + errs.join("\n"));

			await Vue.nextTick();
			navigate("compose-pattern", { tuneName: params.tuneName, patternName: params.patternName });
		}},

		"/compose/:importData": { as: "compose-import", uses: async (params) => {
			closeAllDialogs();

			const errs = history.loadEncodedString(params.importData);

			if(errs.length > 0)
				app.$bvModal.msgBoxOk("Errors while loading data:\n" + errs.join("\n"));

			await Vue.nextTick();
			navigate("compose");
		}},


		/* Legacy */

		"/:tuneName/": { as: "legacy-tune", uses: (params) => {
			navigate("listen-tune", params)
		}},

		"/:tuneName/:patternName": { as: "legacy-pattern", uses: (params) => {
			navigate("listen-pattern", params);
		}},

		"/:importData/:tuneName/": { as: "legacy-importAndTune", uses: (params) => {
			navigate("compose-importAndTune", params);
		}},

		"/:importData/:tuneName/:patternName": { as: "legacy-importAndPattern", uses: (params) => {
			navigate("compose-importAndPattern", params);
		}},

		"/:importData": { as: "legacy-import", uses: (params) => {
			navigate("compose-import", params);
		}}
	});

	router.resolve();

	app.$on("bv::modal::show", (bvEvent: BvModalEvent, modalId: string) => {
		if(bvEvent.vueTarget instanceof Vue && (bvEvent.vueTarget as Vue).$parent instanceof PatternEditorDialog) {
			const dialog = (bvEvent.vueTarget as Vue).$parent as PatternEditorDialog;
			setState(dialog.$props.readonly ? "listen-pattern" : "compose-pattern", { tuneName: dialog.$props.tuneName, patternName: dialog.$props.patternName });
		}
	});

	app.$on("bv::modal::hide", (bvEvent: BvModalEvent, modalId: string) => {
		if(bvEvent.vueTarget instanceof Vue && (bvEvent.vueTarget as Vue).$parent instanceof PatternEditorDialog) {
			const dialog = (bvEvent.vueTarget as Vue).$parent as PatternEditorDialog;
			setState(dialog.$props.readonly ? "listen" : "compose");
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
		let isCompose = currentState && currentState.name.match(/^compose($|-)/);
		if(!isCompose)
			setState("compose");
	});

	events.$on("overview-listen", () => {
		let isCompose = currentState && currentState.name.match(/^compose($|-)/);
		if(isCompose) {
			if(lastTune)
				navigate("listen-tune", { tuneName: lastTune });
			else
				navigate("root");
		}
	});

	async function pause(callback: () => void) {
		paused = true;
		try {
			await callback();
		} finally {
			await Vue.nextTick();
			paused = false;
		}
	}

	function navigate(name: string, params?: object) {
		currentState = { name, params };
		router.navigate(router.generate(name, params));
	}

	function setState(name: string, params?: object) {
		if(paused)
			return;

		router.pause();
		navigate(name, params);
		setTimeout(() => {
			router.resume();
		}, 0);
	}

	function closeAllDialogs() {
		for(const id of [...$(".modal")].map((modal) => modal.getAttribute("id")))
			app.$bvModal.hide(id as string);
	}
}