angular.module("beatbox").factory("bbPlayer", function(bbConfig, bbUtils, ng, Beatbox, bbAudioSprite) {

	var sound = new Howl(bbAudioSprite);

	for(var i in bbAudioSprite.sprite) {
		Beatbox.registerInstrument(i, sound, i);
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
			var vol = 1;
			for(var i=0; i<pattern.length*pattern.time; i++) {
				if(pattern.volumeHack && pattern.volumeHack[i] != null)
					vol = pattern.volumeHack[i];

				var stroke = [ ];
				for(var instr in bbConfig.instruments) {
					if((!headphones || headphones == instr) && !mute[instr] && pattern[instr] && pattern[instr][i] && pattern[instr][i] != " ")
						stroke.push({ instrument: instr+"_"+pattern[instr][i], volume: vol });
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
					ret[i+idx] = (ret[i+idx] || [ ]).filter(function(it) { return it.instrument != instrumentKey; }).concat(patternBeatbox[i]);
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