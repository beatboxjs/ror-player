import * as z from "zod";

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
		name: string;
		/** The strokes that this instrument can play. Defines what options the stroke picker will display. */
		strokes: Array<Stroke>;
	}>;

	/** Mapping each stroke to its representation in the notes as displayed to the user. */
	strokes: Record<Stroke, string>;

	/** Optionally defining a tooltip that will describe a particular stroke further. */
	strokesDescription: Partial<Record<Stroke, string>>;

	/** Presets for the values of the instrument volume sliders, by preset name. */
	volumePresets: Record<string, Record<Instrument, number>>;

	/**
	 * The available time signatures. The key is the number of strokes per beat (the number of beats per bar is fixed to 4), the value is
	 * the name of the time measurement as it should be shown in the UI.
	 */
	times: Record<number, string>;

	/**
	 * The stroke resolution that will be used throughout the app, in number of strokes per beat (the number of beats per bar is fixed to 4).
	 * This has to be the least common multiple of the available time signatures. For example, to allow for both rhythms that use 4 strokes
	 * per beat and rhythms that use 3 strokes per beat, the stroke resolution needs to be 12 (or a multiple thereof).
	 */
	playTime: number;

	/** The available tune filter categories mapped to their display name. */
	filterCats: Record<Category, string>;

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
			name: "Low Surdo",
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		ms: {
			name: "Mid Surdo",
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		hs: {
			name: "High Surdo",
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		re: {
			name: "Repi",
			strokes: [ "X", "f", "r", "h", ".", "z", "s" ]
		},
		sn: {
			name: "Snare",
			strokes: [ ".", "X", "r", "f" ]
		},
		ta: {
			name: "Tamborim",
			strokes: [ "X", "r", "f" ]
		},
		ag: {
			name: "Agogô",
			strokes: [ "o", "a", "r", "." ]
		},
		sh: {
			name: "Shaker",
			strokes: [ "X", "." ]
		},
		ot: {
			name: "Shouting",
			strokes: [ "w", "y", "A", "B", "D", "E", "F", "G", "J", "K", "L", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z", "9", "8", "7", "6", "5", "b", "c", "d", "e", "g", "q", "j", "k", "m", "n", "u", "v", "x", "i", "l", "p", "$", "%", "&", "'", "(", ")", "*", ",", "-", "?", ":", ";", "<", "=", ">", "K", "[", "\\", "^", "_", "`", "{", "|", "}", "~", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "İ", "Ǐ", "Ī", "Ĩ", "Į", "Ĳ" ]
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
		"Ĳ": "do"
		// ]
	},

	strokesDescription: {
		"h": "Hand",
		"i": "Slap with hand",
		"0": "Damp with hand",
		"s": "Silent stroke",
		"f": "Flare",
		"t": "Whippy (tamborim) stick",
		".": "Silent stroke",
		"w" : "Whistle",
		"y" : "Long whistle",
		"z": "Soft flare"
	},

	volumePresets: {
		"Defaults": {
			ls: 0.7,
			ms: 0.7,
			hs: 0.7,
			re: 1.6,
			sn: 1.2,
			ta: 1.4,
			ag: 1,
			sh: 0.5,
			ot: 1
		},
		"Shitty speakers": {
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
	},

	times: {
		2: "2⁄4",
		3: "6⁄8",
		4: "4⁄4",
		5: "5⁄8",
		6: "3⁄4",
		12: "4⁄4 with triplets",
		20: "4⁄4 with quintuplets"
	},

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above
	playTime: 60,

	filterCats: {
		all: "All tunes",
		common: "Common tunes",
		uncommon: "Uncommon tunes",
		new: "New tunes",
		proposed: "Proposed tunes",
		custom: "Custom tunes",
		onesurdo: "One Surdo",
		easy: "Easy",
		medium: "Medium",
		tricky: "Tricky",
		western: "Western music",
		"cultural-appropriation": "Cultural appropriation"
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
