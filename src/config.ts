import * as z from "zod";
import { getI18n } from "./services/i18n";

const instrumentKeys = ["ls", "ms", "hs", "re", "sn", "ta", "ag", "sh", "ot"] as const;
export const instrumentValidator = z.enum(instrumentKeys);
export type Instrument = z.infer<typeof instrumentValidator>;

export const strokeValidator = z.string();
/** A stroke is a single sound that an instrument makes. It is identified by a single letter, corresponding to the file name of the audio file in assets/audio/. */
export type Stroke = z.infer<typeof strokeValidator>;

const categoryKeys = ["common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation", "all"] as const;
export const categoryValidator = z.enum(categoryKeys);
/** Categories by which the tune list can be filtered. Each tune can be part of any number of categories. */
export type Category = z.infer<typeof categoryValidator>;

export type Config = {
	/** The name of the app as it should be shown throughout the UI, such as “RoR Player” */
	appName: string;

	/** An array listing the keys of all available instruments. */
	instrumentKeys: Instrument[];

	instruments: Record<Instrument, {
		name: () => string;
		/** The strokes that this instrument can play. Defines what options the stroke picker will display. */
		strokes: Array<Stroke>;
	}>;

	/** Mapping each stroke to its representation in the notes as displayed to the user. */
	strokes: Record<Stroke, string>;

	/** Optionally defining a tooltip that will describe a particular stroke further. */
	strokesDescription: Partial<Record<Stroke, () => string>>;

	/** Presets for the values of the instrument volume sliders, by preset name. */
	volumePresets: Record<string, {
		displayName: () => string;
		volumes: Record<Instrument, number>;
	}>;

	/**
	 * The available time signatures. The key is the number of strokes per beat (the number of beats per bar is fixed to 4), the value is
	 * the name of the time measurement as it should be shown in the UI.
	 */
	times: Record<number, () => string>;

	/**
	 * The stroke resolution that will be used throughout the app, in number of strokes per beat (the number of beats per bar is fixed to 4).
	 * This has to be the least common multiple of the available time signatures. For example, to allow for both rhythms that use 4 strokes
	 * per beat and rhythms that use 3 strokes per beat, the stroke resolution needs to be 12 (or a multiple thereof).
	 */
	playTime: number;

	/** The available tune filter categories mapped to their display name. */
	filterCats: Record<Category, () => string>;

	/**
	 * The current tune of the year. It will be opened by default when the app is opened. If multiple tunes are specified, one of them will be
	 * randomly picked each time.
	 */
	tuneOfTheYear: string | string[];

	/**
	 * The default speed to use for tunes that don't specify a separate default speed, in beats per minute.
	 */
	defaultSpeed: number;
};

const config: Config = {
	appName: document.title,

	instrumentKeys: [...instrumentKeys],

	instruments: {
		ls: {
			name: () => getI18n().t("config.instruments-ls"),
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		ms: {
			name: () => getI18n().t("config.instruments-ms"),
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		hs: {
			name: () => getI18n().t("config.instruments-hs"),
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		re: {
			name: () => getI18n().t("config.instruments-re"),
			strokes: [ "X", "f", "r", "h", ".", "z", "s" ]
		},
		sn: {
			name: () => getI18n().t("config.instruments-sn"),
			strokes: [ ".", "X", "r", "f" ]
		},
		ta: {
			name: () => getI18n().t("config.instruments-ta"),
			strokes: [ "X", "r", "f" ]
		},
		ag: {
			name: () => getI18n().t("config.instruments-ag"),
			strokes: [ "o", "a", "r", "." ]
		},
		sh: {
			name: () => getI18n().t("config.instruments-sh"),
			strokes: [ "X", "." ]
		},
		ot: {
			name: () => getI18n().t("config.instruments-ot"),
			strokes: [ "w", "y", "A", "B", "D", "E", "F", "G", "J", "K", "L", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z", "9", "8", "7", "6", "5", "b", "c", "d", "e", "g", "q", "j", "k", "m", "n", "u", "v", "x", "i", "l", "p", "$", "%", "&", "'", "(", ")", "*", ",", "-", "?", ":", ";", "<", "=", ">", "K", "[", "\\", "^", "_", "`", "{", "|", "}", "~", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "İ", "Ǐ", "Ī", "Ĩ", "Į", "Ĳ", "Ð", "Ñ", "Ò", "Ó", "Ô" ]
		}
	},

	strokes: {
		"X": "X",
		"h": "hd",
		"0": "0",
		"s": "sil",
		"f": "fl",
		"r": "rim",
		"o": "l",
		"a": "h",
		"t": "w", // Whippy stick (tamborim stick)
		".": ".",
		"w" : "Wh",
		"y" : "Wh2", // Long whistle
		"z": "s", // Soft flare
		"A" : "Oi!",
		"B" : "Ua!",
		"D" : "Oo",
		"E" : "Ah",
		"F" : "Hey!",
		"G" : "Ook!",
		"J" : "Groo",
		"L" : "ve",
		"N" : "Oh",
		"O" : "Shit",
		"P" : "Fuck",
		"Q" : "Off",
		"R": "Hedge",
		"S": "Hog",
		"T" : "E",
		"U" : "very",
		"V" : "bo",
		"W" : "dy",
		"Y" : "dance",
		"Z" : "now",
		"9" : "Kein",
		"8" : "Cent",
		"7" : "für",
		"6" : "Ax",
		"5" : "el",
		"4" : "I’ve",
		"3" : "got",
		"2" : "cus",
		"1" : "tard",
		"C" : "in",
		"H" : "my",
		"I" : "un",
		"M" : "der",
		"#" : "pants",
		"b" : "Tout",
		"c" : "le",
		"d" : "monde",
		"e" : "dé",
		"g" : "tes",
		"q" : "te",
		"j" : "la",
		"k" : "po",
		"m" : "li",
		"n" : "ce",
		"u" : "Te",
		"v" : "qui",
		"x" : "la",
		"i": "The",
		"l": "roof",
		"p": "is",
		"$": "on",
		"%": "fi",
		"&": "re",
		"'": "Burn!",
		"(": "Uh",
		")": "Ah",
		"*": "This",
		",": "is",
		"-": "what",
		"?": "de",
		":": "mo",
		";": "cra",
		"<": "cy",
		"=": "looks",
		">": "like",
		"K": "wir",
		"[": "sind",
		"\\": "hier",
		"^": "laut",
		"_": "weil",
		"`": "ihr",
		"{": "uns",
		"|": "die",
		"}": "Zu",
		"~": "kunft",
		"À": "klaut",
		"Á": "Keep",
		"Â": "it",
		"Ã": "in",
		"Ä": "the",
		"Å": "ground",
		"Æ": "I",
		"Ç": "say",
		"È": "Kei",
		"É": "ne",
		"Ê": "Pro",
		"Ë": "fi",
		"Ì": "te",
		"Í": "mit",
		"Î": "der",
		"Ï": "Mie",
		"İ": "dis",
		"Ǐ": "co",
		"Ī": "barr",
		"Ĩ": "ri",
		"Į": "ca",
		"Ĳ": "do",
		"Ð": "mar",
		"Ñ": "cha",
		"Ò": "que",
		"Ó": "re",
		"Ô": "mos",
		// ]
	},

	strokesDescription: {
		"h": () => getI18n().t("config.stroke-description-hd"),
		"0": () => getI18n().t("config.stroke-description-0"),
		"s": () => getI18n().t("config.stroke-description-sil"),
		"f": () => getI18n().t("config.stroke-description-fl"),
		"t": () => getI18n().t("config.stroke-description-w"),
		".": () => getI18n().t("config.stroke-description-."),
		"w" :() => getI18n().t("config.stroke-description-wh"),
		"y" :() => getI18n().t("config.stroke-description-wh2"),
		"z": () => getI18n().t("config.stroke-description-s")
	},

	volumePresets: {
		"Defaults": {
			displayName: () => getI18n().t("config.stroke-volume-defaults"),
			volumes: {
				ls: 0.7,
				ms: 0.7,
				hs: 0.7,
				re: 1.6,
				sn: 1.2,
				ta: 1.4,
				ag: 1,
				sh: 0.5,
				ot: 1
			}
		},
		"Shitty speakers": {
			displayName: () => getI18n().t("config.stroke-volume-shitty"),
			volumes: {
				ls: 1,
				ms: 1,
				hs: 1.1,
				re: 1.5,
				sn: 1.3,
				ta: 1.2,
				ag: 1,
				sh: 0.45,
				ot: 1
			}
		}
	},

	times: {
		2: () => "2⁄4",
		3: () => "6⁄8",
		4: () => "4⁄4",
		5: () => "5⁄8",
		6: () => "3⁄4",
		8: () => "8⁄8",
		12: () => getI18n().t("config.time-with-triplets", { time: "4⁄4" }),
		20: () => getI18n().t("config.time-with-quintuplets", { time: "4⁄4" })
	},

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above
	playTime: 120,

	filterCats: {
		all: () => getI18n().t("config.category-all"),
		common: () => getI18n().t("config.category-common"),
		uncommon: () => getI18n().t("config.category-uncommon"),
		new: () => getI18n().t("config.category-new"),
		proposed: () => getI18n().t("config.category-proposed"),
		custom: () => getI18n().t("config.category-custom"),
		onesurdo: () => getI18n().t("config.category-onesurdo"),
		easy: () => getI18n().t("config.category-easy"),
		medium: () => getI18n().t("config.category-medium"),
		tricky: () => getI18n().t("config.category-tricky"),
		western: () => getI18n().t("config.category-western"),
		"cultural-appropriation": () => getI18n().t("config.category-cultural-appropriation")
	},

	tuneOfTheYear: "The Roof Is on Fire",

	defaultSpeed: 100
};

// Check some requirements for export so that we don't forget them at some point in the future
for(const stroke of Object.keys(config.strokes)) {
	if(stroke.length != 1)
		throw new Error("Stroke key must be one character for `" + stroke + "`.");
	if(stroke == "+" || stroke == "@")
		throw new Error("Stroke must not be `+` or `@` as it would conflict with pattern encoder.");
}
for(const instr of Object.keys(config.instruments)) {
	if(instr.length != 2)
		throw new Error("Instrument key must be 2 characters long for `" + instr + "` due to pattern encoder.");
}

export default config;
