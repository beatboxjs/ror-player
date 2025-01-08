import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { ref } from "vue";

const DEFAULT_LANGUAGE = "en";

const LANG_COOKIE = "lang";
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
		lookupCookie: LANG_COOKIE,
		caches: []
	}
});

const TUNE_DESCRIPTIONS_NS = "tune-descriptions";

for (const [filename, module] of Object.entries(import.meta.glob('../../assets/tuneDescriptions/*/*.md', { eager: true }))) {
	const m = filename.match(/([^/\\]+)[/\\]([^/\\]+)\.md/)!;
	i18n.addResource(m[2], TUNE_DESCRIPTIONS_NS, m[1], (module as any).html);
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