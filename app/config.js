import app from "./app";

app.factory("bbConfig", function(ng, $document) {
	var bbConfig = { };

	bbConfig.appName = $document[0].title;

	bbConfig.instruments = {
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
			name: "Others",
			strokes: [ "w", "y", "A", "B", "D", "E", "F", "G", "J", "K", "L", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z", "9", "8", "7", "6", "5", "b", "c", "d", "e", "g", "q", "j", "k", "m", "n", "u", "v", "x" ]
		}
	};

	bbConfig.strokes = {
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
		"K" : "oo",
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
		"!" : "pants",
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
		"x" : "la"
	};

	bbConfig.strokesDescription = {
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
	};

	bbConfig.volumePresets = {
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
	};

	bbConfig.times = {
		2: "2⁄4",
		3: "6⁄8",
		4: "4⁄4",
		5: "5⁄8",
		6: "3⁄4",
		12: "4⁄4 with triplets",
		20: "4⁄4 with quintuplets"
	};

	bbConfig.filterCats = {
		standard: "Standard tunes",
		all: "All tunes",
		common: "Common tunes",
		uncommon: "Uncommon tunes",
		new: "New tunes",
		proposed: "Proposed tunes",
		custom: "Custom tunes",
		onesurdo: "One Surdo",
		easy: "Easy",
		medium: "Medium",
		tricky: "Tricky"
	};

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above
	bbConfig.playTime = 60;

	bbConfig.tuneOfTheYear = "Zurav Love / Truant";

	bbConfig.defaultSpeed = 100;

	bbConfig.numberToStringChars = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

	// Check some requirements for export so that we don't forget them at some point in the future
	for(var stroke in bbConfig.strokes) {
		if(stroke.length != 1)
			throw new Error("Stroke key must be one character for `" + stroke + "`.");
		if(stroke == "+" || stroke == "@")
			throw new Error("Stroke must not be `+` or `@` as it would conflict with pattern encoder.");
	}
	for(var instr in bbConfig.instruments) {
		if(instr.length != 2)
			throw new Error("Instrument key must be 2 characters long for `" + instr + "` due to pattern encoder.");
	}

	return bbConfig;
});