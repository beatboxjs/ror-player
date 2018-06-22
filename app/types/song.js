import app from "../app";

app.factory("bbSong", function(bbConfig, ng, $, bbUtils, bbTune) {
	function bbSong(data) {
		this.name = "";

		if(data)
			$.extend(this, data);
	}

	bbSong.prototype = {
		getLength : function() {
			var maxIndex = bbUtils.getMaxIndex(this);
			return maxIndex == null ? 0 : maxIndex+1;
		},
		clear : function() {
			for(var i=0,length=this.getLength(); i<length; i++) {
				delete this[i];
			}
		},
		containsPattern : function(tuneName, patternName) {
			for(var i=0,length=this.getLength(); i<=length; i++) {
				if(!this[i])
					continue;

				for(var instr in bbConfig.instruments) {
					if(this[i][instr] && this[i][instr][0] == tuneName && this[i][instr][1] == patternName)
						return true;
				}
			}

			return false;
		},
		getEffectiveLength: function(state) {
			var maxIndex = this.getLength()-1;
			if(maxIndex == -1)
				return 0;

			var length = 1;
			for(var instr in bbConfig.instruments) {
				var pattern = state.getPattern(this[maxIndex][instr]);
				if(pattern)
					length = Math.max(length, pattern.length/4);
			}
			return maxIndex + length;
		},
		replacePattern : function(fromTuneAndName, toTuneAndName) {
			for(var i=0, length=this.getLength(); i<length; i++) {
				if(!this[i])
					continue;

				for(var instr in bbConfig.instruments) {
					if(this[i][instr] && this[i][instr][0] == fromTuneAndName[0] && (fromTuneAndName[1] == null || this[i][instr][1] == fromTuneAndName[1])) {
						if(toTuneAndName == null)
							delete this[i][instr];
						else {
							this[i][instr][0] = toTuneAndName[0];
							if(toTuneAndName[1] != null)
								this[i][instr][1] = toTuneAndName[1];
						}
					}
				}

				if(Object.keys(this[i]).length == 0)
					delete this[i];
			}

			return false;
		},
		equals : function(song2, checkName) {
			if(checkName && this.name != song2.name)
				return false;

			var length = this.getLength();

			if(length != song2.getLength())
				return false;

			for(var i=0; i<length; i++) {
				if(!ng.equals(this[i], song2[i]) && (this[i] != null || song2[i] != null))
					return false;
			}

			return true;
		}
	};

	$.extend(bbSong, {
		/**
		 * Creates an index for the used patterns in the given songs.
		 * @param songs {array} An array of songs
		 * @returns {object} { patterns: {object} A pattern-to-key index, where patterns[songName][patternName] contains the key,
		  *                    keys: {object} A key-to-pattern index, where keys[key] is [songName, patternName]. }
		 */
		_makePatternIndex : function(songs) {
			var number = 0;
			var patterns = { };
			var emptyExists = false;
			for(var songIdx=0; songIdx<songs.length; songIdx++) {
				for(var beatIdx=0,length=songs[songIdx].getLength(); beatIdx<length; beatIdx++) {
					for(var inst in bbConfig.instruments) {
						var pattern = songs[songIdx][beatIdx] && songs[songIdx][beatIdx][inst];
						if(!pattern)
							pattern = [ "", "" ];
						if(!patterns[pattern[0]])
							patterns[pattern[0]] = { };
						if(!patterns[pattern[0]][pattern[1]]) {
							patterns[pattern[0]][pattern[1]] = number++;
						}
					}
				}
			}

			var bytes = bbUtils.numberToString(number).length;
			var keys = { };
			for(var i in patterns) {
				for(var j in patterns[i]) {
					patterns[i][j] = bbUtils.numberToString(patterns[i][j], bytes);
					keys[patterns[i][j]] = (i == "" && j == "" ? null : [ i, j ]);
				}
			}

			return { patterns: patterns, keys: keys };
		},

		compressSongs : function(songs) {
			var index = this._makePatternIndex(songs);

			var encodedSongs = new Array(songs.length);
			for(var songIdx=0; songIdx<songs.length; songIdx++) {
				var length = songs[songIdx].getLength();
				var beatsArr = new Array(length);
				var beatsObj = { };
				for(var beatIdx=0; beatIdx<length; beatIdx++) {
					var patterns = { };
					var allSame = null;
					for(var instr in bbConfig.instruments) {
						var p = songs[songIdx][beatIdx] && songs[songIdx][beatIdx][instr] || [ "", "" ];
						var key = index.patterns[p[0]][p[1]];

						if(allSame == null)
							allSame = key;
						else if(!ng.equals(allSame, key))
							allSame = false;

						if(p[0] != "")
							patterns[instr] = key;
					}

					beatsArr[beatIdx] = allSame ? allSame : patterns;
					if(!allSame || index.keys[allSame] != null)
						beatsObj[beatIdx] = allSame ? allSame : patterns;
				}

				encodedSongs[songIdx] = {
					name: songs[songIdx].name,
					beats: JSON.stringify(beatsObj).length < JSON.stringify(beatsArr).length ? beatsObj : beatsArr
				};
			}

			return { keys: index.keys, songs: encodedSongs };
		},

		uncompressSongs : function(encoded) {
			var songs = new Array(encoded.songs.length);
			encoded.songs.forEach(function(song, songIdx) {
				songs[songIdx] = new bbSong();
				songs[songIdx].name = song.name;

				var maxIdx = Array.isArray(song.beats) ? song.beats.length-1 : bbUtils.getMaxIndex(song.beats);

				for(var beatIdx=0; beatIdx<=maxIdx; beatIdx++) {
					var beat = song.beats[beatIdx];
					if(!beat)
						continue;

					songs[songIdx][beatIdx] = { };
					if(typeof beat == "string") {
						if(encoded.keys[beat] != null) {
							for(var instr in bbConfig.instruments)
								songs[songIdx][beatIdx][instr] = encoded.keys[beat];
						}
					} else {
						for(var instr in beat) {
							if(encoded.keys[beat[instr]] != null)
								songs[songIdx][beatIdx][instr] = encoded.keys[beat[instr]];
						}
					}
				}
			});
			return songs;
		}
	});

	return bbSong;
});