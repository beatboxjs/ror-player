/// <reference types="vite/client"/>

import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { defineComponent, ref } from "vue";

const DEFAULT_LANGUAGE = "en";

const LANG_LOCAL_STORAGE = "lang";
const LANG_QUERY = "lang";

const resources = Object.fromEntries(Object.entries(import.meta.glob('../../assets/i18n/*.json', { eager: true })).map(([filename, module]) => {
	const lang = filename.match(/([^/\\]*)\.json$/i)![1];

	// This does not seem to work, need to find a different solution
	// if (import.meta.hot) {
	// 	import.meta.hot!.accept(filename, (mod: any) => {
	// 		if (mod) {
	// 			i18n.addResourceBundle(lang, "translation", mod!.default);
	// 		}
	// 	});
	// }

	return [lang, { translation: (module as any).default }];
}));

export const LANGUAGES = Object.keys(resources);

const i18n = createInstance();
i18n.use(LanguageDetector);
i18n.init({
	initAsync: false,
	supportedLngs: Object.keys(resources),
	fallbackLng: DEFAULT_LANGUAGE,
	resources: resources,
	detection: {
		order: ['querystring', 'localStorage', 'navigator'],
		lookupQuerystring: LANG_QUERY,
		lookupLocalStorage: LANG_LOCAL_STORAGE,
		caches: []
	}
}).catch((err) => console.error("Error initializing i18n", err)); // eslint-disable-line no-console

const TUNE_DESCRIPTIONS_NS = "tune-descriptions";
for (const [filename, module] of Object.entries(import.meta.glob('../../assets/tuneDescriptions/*/*.md', { eager: true }))) {
	const m = filename.match(/([^/\\]+)[/\\]([^/\\]+)\.md/)!;
	i18n.addResource(m[2], TUNE_DESCRIPTIONS_NS, m[1], (module as any).html);
}

const APP_INSTRUCTIONS_NS = "app-instructions";
const APP_INSTRUCTIONS_KEY = "app-instructions";
for (const [filename, module] of Object.entries(import.meta.glob('../../assets/appInstructions/*.md', { eager: true }))) {
	const m = filename.match(/([^/\\]+)\.md/)!;
	i18n.addResource(m[1], APP_INSTRUCTIONS_NS, APP_INSTRUCTIONS_KEY, (module as any).html);
}

const i18nResourceChangeCounter = ref(0);
const onI18nResourceChange = () => {
	i18nResourceChangeCounter.value++;
};

i18n.store.on("added", onI18nResourceChange);
i18n.store.on("removed", onI18nResourceChange);
i18n.on("languageChanged", onI18nResourceChange);
i18n.on("loaded", onI18nResourceChange);

let tBkp = i18n.t;
i18n.t = function(this: any, ...args: any) {
	// Consume resource change counter to make calls to t() reactive to i18n resource changes
	i18nResourceChangeCounter.value;

	return tBkp.apply(this, args);
} as any;

export function getI18n(): {
	t: typeof i18n["t"];
	changeLanguage: (lang: string) => Promise<void>;
	currentLanguage: string;
} {
	return {
		t: i18n.t,

		changeLanguage: async (lang) => {
			await i18n.changeLanguage(lang);
		},

		get currentLanguage() {
			// Consume resource change counter to make this reactive to language changes
			i18nResourceChangeCounter.value;
			return i18n.language;
		}
	};
}

export function useI18n(): ReturnType<typeof getI18n> {
	return getI18n();
}

export function getTuneDescriptionHtml(tuneName: string): string {
	return i18n.t(tuneName, { ns: TUNE_DESCRIPTIONS_NS, defaultValue: "" });
}

export function getAppInstructionsHtml(): string {
	return i18n.t(APP_INSTRUCTIONS_KEY, { ns: APP_INSTRUCTIONS_NS });
}

export function getLocalizedDisplayName(name: string): string {
	switch (name) {
		case "General Breaks":
			return getI18n().t("i18n.general-breaks");
		case "Special Breaks":
			return getI18n().t("i18n.special-breaks");
		case "Shouting Breaks":
			return getI18n().t("i18n.shouting-breaks");
		case "Tune":
			return getI18n().t("i18n.tune");
		case "4 Silence":
			return getI18n().t("i18n.silence", { beats: 4 });
		case "8 Silence":
			return getI18n().t("i18n.silence", { beats: 8 });
		case "12 Silence":
			return getI18n().t("i18n.silence", { beats: 12 });
		case "16 Silence":
			return getI18n().t("i18n.silence", { beats: 16 });
		case "Whistle in":
			return getI18n().t("i18n.whistle-in");
		default:
			return name;
	}
}

/**
 * Renders a translated message. Each interpolation variable needs to be specified as a slot, making it possible to interpolate
 * components and rich text.
 */
export const T = defineComponent({
	props: {
		k: { type: String, required: true }
	},
	setup(props, { slots }) {
		const i18n = useI18n();

		return () => {
			const mappedSlots = Object.entries(slots).map(([name, slot], i) => ({ name, placeholder: `%___SLOT_${i}___%`, slot }));
			const placeholderByName = Object.fromEntries(mappedSlots.map(({ name, placeholder }) => [name, placeholder]));
			const slotByPlaceholder = Object.fromEntries(mappedSlots.map(({ placeholder, slot }) => [placeholder, slot]));
			const message = i18n.t(props.k, placeholderByName);
			return message.split(/(%___SLOT_\d+___%)/g).map((v, i) => {
				if (i % 2 === 0) {
					return v;
				} else {
					return slotByPlaceholder[v]!();
				}
			});
		};
	}
});