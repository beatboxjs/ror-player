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
			var ret = new Array((pattern.length*pattern.time + pattern.upbeat) * fac);
			var vol = 1;
			for(var i=0; i<pattern.length*pattern.time+pattern.upbeat; i++) {
				if(pattern.volumeHack && pattern.volumeHack[i] != null)
					vol = pattern.volumeHack[i];

				var stroke = [ ];

				if(playbackSettings.whistle && i >= pattern.upbeat && (i-pattern.upbeat) % (4*pattern.time) == 0)
					stroke.push({ instrument: playbackSettings.whistle == 2 ? "ot_y" : "ot_w", volume: playbackSettings.volume});
				else if(playbackSettings.whistle == 2 && i >= pattern.upbeat && (i-pattern.upbeat) % pattern.time == 0)
					stroke.push({ instrument: "ot_w", volume: playbackSettings.volume});

				for(var instr in bbConfig.instruments) {
					if(bbPlayer._isEnabled(instr, playbackSettings.headphones, playbackSettings.mute) && pattern[instr]) {
						let strokeType = pattern[instr][i];

						if(playbackSettings.loop) {
							// Put upbeat at the end of pattern

							let upbeatStart = pattern[instr].slice(0, pattern.upbeat).findIndex((stroke) => (stroke && stroke != " "));
							if(upbeatStart != -1 && i >= pattern.length * pattern.time + upbeatStart)
								strokeType = pattern[instr][i - pattern.length * pattern.time];
						}

						if(strokeType && strokeType != " ")
							stroke.push({ instrument: instr+"_"+strokeType, volume: vol * playbackSettings.volume * (playbackSettings.volumes[instr] == null ? 1 : playbackSettings.volumes[instr]) });
					}
				}

				ret[i*fac] = stroke;
			}

			ret.upbeat = pattern.upbeat * fac;

			return ret;
		},

		songToBeatbox: function(state) {
			var song = state.songs[state.songIdx];
			var length = song.getEffectiveLength(state);
			let maxUpbeat = bbConfig.playTime*4;
			var ret = new Array(maxUpbeat + length*bbConfig.playTime*4);
			let upbeat = 0;

			function insertPattern(idx, pattern, instrumentKey, patternLength, whistle) {
				let patternBeatbox = bbPlayer.patternToBeatbox(pattern, new bbPlaybackSettings({
					headphones: [ instrumentKey ],
					volume: state.playbackSettings.volume,
					volumes: state.playbackSettings.volumes,
					whistle
				}));

				let upbeatHasStarted = false;
				let idxOffset = pattern.upbeat * bbConfig.playTime / pattern.time;
				idx = idx*bbConfig.playTime*4;
				for(let i = 0; i<(patternLength*bbConfig.playTime*4 + idxOffset); i++) {
					if((patternBeatbox[i] || []).length > 0)
						upbeatHasStarted = true;

					upbeat = Math.max(upbeat, idxOffset - idx - i);

					let existingStrokes = (ret[maxUpbeat + idx + i - idxOffset] || [ ]);
					if(upbeatHasStarted && i - idxOffset < 0)
						existingStrokes = existingStrokes.filter((instr) => (instr.instrument.split("_", 2)[0] != instrumentKey));
					ret[maxUpbeat + idx + i - idxOffset] = existingStrokes.concat(patternBeatbox[i] || [ ]);
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
						upbeat: 0,
						ot: '    '
					}), "ot", 1, state.playbackSettings.whistle);
				}
			}

			ret = ret.slice(maxUpbeat - upbeat);
			ret.upbeat = upbeat;

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