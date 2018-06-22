import pako from "pako";
import app from "../app";

app.factory("bbPlayer", function(bbConfig, bbUtils, ng, Beatbox, bbAudioFiles, $rootScope, bbPlaybackSettings, bbPattern) {
	for(var i in bbAudioFiles) {
		var decompressed = String.fromCharCode.apply(null, pako.inflateRaw(atob(bbAudioFiles[i])));
		Beatbox.registerInstrument(i.replace(/\.mp3$/i, ""), { src: [ "data:audio/mp3;base64," + btoa(decompressed) ] });
	}

	var allPlayers = [ ];

	var bbPlayer = {
		createBeatbox: function(repeat) {
			var ret = new Beatbox([ ], 1, repeat);
			ret.onplay = ret.onstop = function() {
				if(!$rootScope.$$phase)
					$rootScope.$apply();
			};
			allPlayers.push(ret);
			return ret;
		},

		_isEnabled: function(instr, headphones, mute) {
			if(mute[instr])
				return false;

			if(headphones && headphones.length > 0)
				return headphones.includes(instr);

			return true;
		},

		patternToBeatbox: function(pattern, playbackSettings) {
			var fac = bbConfig.playTime/pattern.time;
			var ret = new Array(pattern.length*pattern.time*fac);
			var vol = 1;
			for(var i=0; i<pattern.length*pattern.time; i++) {
				if(pattern.volumeHack && pattern.volumeHack[i] != null)
					vol = pattern.volumeHack[i];

				var stroke = [ ];

				if(playbackSettings.whistle && i % (4*pattern.time) == 0)
					stroke.push({ instrument: playbackSettings.whistle == 2 ? "ot_y" : "ot_w", volume: playbackSettings.volume});
				else if(playbackSettings.whistle == 2 && i % pattern.time == 0)
					stroke.push({ instrument: "ot_w", volume: playbackSettings.volume});

				for(var instr in bbConfig.instruments) {
					if(bbPlayer._isEnabled(instr, playbackSettings.headphones, playbackSettings.mute) && pattern[instr] && pattern[instr][i] && pattern[instr][i] != " ")
						stroke.push({ instrument: instr+"_"+pattern[instr][i], volume: vol * playbackSettings.volume * (playbackSettings.volumes[instr] == null ? 1 : playbackSettings.volumes[instr]) });
				}

				ret[i*fac] = stroke;
			}
			return ret;
		},

		songToBeatbox: function(state) {
			var song = state.songs[state.songIdx];
			var length = song.getEffectiveLength(state);
			var ret = new Array(length*bbConfig.playTime*4);

			function insertPattern(idx, pattern, instrumentKey, patternLength, whistle) {
				var patternBeatbox = bbPlayer.patternToBeatbox(pattern, new bbPlaybackSettings({
					headphones: [ instrumentKey ],
					volume: state.playbackSettings.volume,
					volumes: state.playbackSettings.volumes,
					whistle
				}));
				idx = idx*bbConfig.playTime*4;
				for(var i=0; i<patternLength*bbConfig.playTime*4; i++) {
					ret[i+idx] = (ret[i+idx] || [ ]).concat(patternBeatbox[i] || [ ]);
				}
			}

			for(var i=0; i<length; i++) {
				for(var inst in bbConfig.instruments) {
					if(bbPlayer._isEnabled(inst, state.playbackSettings.headphones, state.playbackSettings.mute) && song[i] && song[i][inst] && state.getPattern(song[i][inst])) {
						var pattern = state.getPattern(song[i][inst]);
						var patternLength = 1;
						for(var j=i+1; j<i+pattern.length/4 && (!song[j] || !song[j][inst]); j++) // Check if pattern is cut off
							patternLength++;

						insertPattern(i, state.getPattern(song[i][inst]), inst, patternLength, false);
					}
				}

				if(state.playbackSettings.whistle) {
					insertPattern(i, new bbPattern({
						length: 4,
						time: 1,
						ot: '    '
					}), "ot", 1, state.playbackSettings.whistle);
				}
			}

			if(state.playbackSettings.whistle) {
				for(var i=0; i<length; i++) {
					let idx = i*bbConfig.playTime*4;
					if(!ret[idx])
						ret[idx] = [ ];
					ret[idx].push({ instrument: state.playbackSettings.whistle == 1 ? "ot_w" : "ot_y", volume: state.playbackSettings.volume });
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