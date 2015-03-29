angular.module("ror-simulator").factory("RorConstants", function(RorTunes, ng, $rootScope) {
	var RorConstants = { };

	RorConstants.instruments = {
		ls: {
			name: "Low Surdo",
			strokes: [ "X", "0", "s" ]
		},
		ms: {
			name: "Mid Surdo",
			strokes: [ "X", "0", "s" ]
		},
		hs: {
			name: "High Surdo",
			strokes: [ "X", "0", "s" ]
		},
		re: {
			name: "Repi",
			strokes: [ "X", "f", "r", "h" ]
		},
		sn: {
			name: "Snare",
			strokes: [ ".", "X" ]
		},
		ta: {
			name: "Tamborim",
			strokes: [ "X" ]
		},
		ag: {
			name: "Agogo",
			strokes: [ "o", "a" ]
		},
		sh: {
			name: "Shaker",
			strokes: [ "X" ]
		},
		ot: {
			name: "Others",
			strokes: [ "w" ]
		}
	};

	RorConstants.instrumentKeys = Object.keys(RorConstants.instruments);

	RorConstants.strokes = {
		"X": "X",
		"h": "hd",
		"0": "0",
		"s": "sil",
		"f": "fl",
		"r": "rim",
		"o": "l",
		"a": "h",
		".": ".",
		"w" : "whistle"
	};

	RorConstants.tunes = ng.copy(RorTunes);
	for(var i in RorConstants.tunes) {
		var tune = RorConstants.tunes[i];

		for(var j in tune.patterns) {
			var pattern = tune.patterns[j];

			pattern.time = pattern.time || tune.time || 4;
			pattern.length = 0;

			for(var k in RorConstants.instruments) {
				pattern[k] = pattern[k] || "";
				var m = pattern[k].match(/^@([a-z]{2})$/);
				if(m)
					pattern[k] = ng.copy(pattern[m[1]]);
				else {
					pattern[k] = pattern[k].split('');
					pattern.length = Math.max(pattern.length, pattern[k].length);
				}

				if(k == "ag")
					pattern[k] = pattern[k].map(function(it) { return it == "X" ? "o" : it; });
			}

			pattern.length = Math.ceil(pattern.length/pattern.time);
		}

		tune.patternKeys = Object.keys(RorConstants.tunes[i].patterns);
	}

	RorConstants.myTunesKey = "My tunes";
	RorConstants.tunes[RorConstants.myTunesKey] = localStorage.myTunes ? JSON.parse(localStorage.myTunes) : { patterns: { } };

	RorConstants.myTunes = RorConstants.tunes[RorConstants.myTunesKey];
	$rootScope.$watch(function(){ return RorConstants.myTunes; }, function(myTunes) {
		localStorage.myTunes = JSON.stringify(myTunes);
		myTunes.patternKeys = Object.keys(myTunes.patterns);
	}, true);

	RorConstants.tuneKeys = Object.keys(RorConstants.tunes);

	return RorConstants;
});