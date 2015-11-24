angular.module("beatbox").factory("bbConfig", function(ng, $rootScope, $injector, $timeout) {
	var bbConfig = { };

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
			strokes: [ "X", "f", "r", "h", "s", "." ]
		},
		sn: {
			name: "Snare",
			strokes: [ ".", "X", "r", "f" ]
		},
		ta: {
			name: "Tamborim",
			strokes: [ "X", "r" ]
		},
		ag: {
			name: "Agogo",
			strokes: [ "o", "a", "r", "." ]
		},
		sh: {
			name: "Shaker",
			strokes: [ "X" ]
		},
		ot: {
			name: "Others",
			strokes: [ "w", "y", "A", "B", "C", "D", "F", "G", "J", "K", "L", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z" ]
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
		"Z" : "now"
	};

	bbConfig.times = [ 2, 3, 4, 12 ];

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above
	bbConfig.playTime = 12;

	bbConfig.myTunesKey = "My tunes";

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