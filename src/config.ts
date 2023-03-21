export type Instrument = "ls" | "ms" | "hs" | "re" | "sn" | "ta" | "ag" | "sh" | "ot";

export type Stroke = string;

export type Category = "core" | "common" | "new" | "onesurdo" | "easy" | "medium" | "tricky" | "custom" | "all";

export type Config = {
	appName: string,
	instruments: {
		[instr in Instrument]: {
			name: string,
			strokes: Array<Stroke>
		}
	},
	instrumentKeys: Array<Instrument>,
	strokes: {
		[stroke in Stroke]: string
	},
	strokesDescription: {
		[stroke in Stroke]?: string
	},
	volumePresets: {
		[name: string]: {
			[instr in Instrument]: number
		}
	},
	times: {
		[idx: number]: string
	},
	filterCats: {
		[cat in Category]: string
	},
	playTime: number,
	tuneOfTheYear: string | string[],
	defaultSpeed: number
};

const config: Config = {
	appName: document.title,

	instruments: {
		ls: {
			name: "Low Surdo",
			strokes: [ "X", "0", "s", "r" ]
		},
		ms: {
			name: "Mid Surdo",
			strokes: [ "X", "0", "s", "r" ]
		},
		hs: {
			name: "High Surdo",
			strokes: [ "X", "0", "s", "r" ]
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
			name: "Tam",
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
			strokes: [ "w", "y", "A", "D", "E"]
		}
	},

	instrumentKeys: [ "ls", "ms", "hs", "re", "sn", "ta", "ag", "sh", "ot" ],

	strokes: {
		"X": "X",
		"h": "0",
		"0": "0",
		"s": "sil",
		"f": "z",
		"r": "ri",
		"o": "l",
		"a": "h",
		".": ".",
		"w" : "Wh",
		"y" : "Wh2", // Long whistle
		"z": "s", // Soft flare
		"A" : "Oi!",
		"D" : "Oo",
		"E" : "Ah"
		// ]
	},

	strokesDescription: {
		"h": "Slap with hand",
		"0": "Damp with hand",
		"s": "Hit while damping with hand",
		"f": "Flare/buzz",
		".": "Quiet hit",
		"w" : "Whistle",
		"y" : "Long whistle",
		"z": "Soft flare/buzz"
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
		2: "2 sub-beats",
		3: "3 sub-beats",
		4: "4 sub-beats",
		5: "5 sub-beats",
		6: "6 sub-beats",
		12: "4 and then 3 sub-beats",
		20: "4 and then 5 sub-beats"
	},
	
	filterCats: {
		core: "Core tunes",
		common: "Common tunes",
		new: "New tunes",
		onesurdo: "One surdo",
		easy: "Easy",
		medium: "Medium",
		tricky: "Tricky",
		custom: "Custom tunes",
		all: "All tunes"
	},

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above
	playTime: 60,

	tuneOfTheYear: ["Bhangra", "Sambasso"],

	defaultSpeed: 100
};

// Check some requirements for export so that we don't forget them at some point in the future
for(const stroke in config.strokes) {
	if(stroke.length != 1)
		throw new Error("Stroke key must be one character for `" + stroke + "`.");
	if(stroke == "+" || stroke == "@")
		throw new Error("Stroke must not be `+` or `@` as it would conflict with pattern encoder.");
}
for(const instr in config.instruments) {
	if(instr.length != 2)
		throw new Error("Instrument key must be 2 characters long for `" + instr + "` due to pattern encoder.");
}

export default config;
