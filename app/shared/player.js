angular.module("beatbox").factory("bbPlayer", function(bbConfig, bbUtils, ng, Beatbox) {
	for(var i in bbConfig.instruments) {
		for(var j=0; j<bbConfig.instruments[i].strokes.length; j++) {
			var k = i+"_"+bbConfig.instruments[i].strokes[j];
			Beatbox.registerInstrument(k, new Howl({
				urls: [ "assets/audio/"+k+".mp3" ]
			}));
		}
	}

	var allPlayers = [ ];

	var bbPlayer = {
		createBeatbox: function(repeat) {
			var ret = new Beatbox([ ], 1, repeat);
			allPlayers.push(ret);
			return ret;
		},

		patternToBeatbox: function(pattern, headphones, mute) {
			if(!mute)
				mute = { };

			var fac = bbConfig.playTime/pattern.time;
			var ret = new Array(pattern.length*pattern.time*fac);
			for(var i=0; i<pattern.length*pattern.time; i++) {
				var stroke = [ ];
				for(var instr in bbConfig.instruments) {
					if((!headphones || headphones == instr) && !mute[instr] && pattern[instr] && pattern[instr][i] && pattern[instr][i] != " ")
						stroke.push(instr+"_"+pattern[instr][i]);
				}
				ret[i*fac] = stroke;
			}
			return ret;
		},

		songToBeatbox: function(song, headphones, mute) {
			if(!mute)
				mute = { };

			var length = bbUtils.getSongLength(song);
			var ret = new Array(length*bbConfig.playTime*4);

			function insertPattern(idx, pattern, instrumentKey) {
				var patternBeatbox = bbPlayer.patternToBeatbox(pattern, instrumentKey);
				idx = idx*bbConfig.playTime*4;
				for(var i=0; i<patternBeatbox.length; i++) {
					ret[i+idx] = (ret[i+idx] || [ ]).filter(function(it) { return it != instrumentKey; }).concat(patternBeatbox[i]);
				}
			}


			for(var i=0; i<length; i++) {
				for(var inst in bbConfig.instruments) {
					if((!headphones || headphones == inst) && !mute[inst] && song[i] && song[i][inst] && bbUtils.getPattern(song[i][inst]))
						insertPattern(i, bbUtils.getPattern(song[i][inst]), inst);
				}
			}

			return ret;
		},

		stopAll : function() {
			allPlayers.forEach(function(it) {
				it.stop();
			});
		}
	};

	return bbPlayer;
});