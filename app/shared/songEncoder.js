angular.module("beatbox").factory("bbSongEncoder", function(bbConfig, ng, $, bbUtils) {
	var bbSongEncoder = {
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
				var maxIndex = bbUtils.getMaxIndex(songs[songIdx]);
				for(var beatIdx=0; beatIdx<=maxIndex; beatIdx++) {
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
		encodeSongs : function(songs) {
			var index = this._makePatternIndex(songs);

			var encodedSongs = new Array(songs.length);
			for(var songIdx=0; songIdx<songs.length; songIdx++) {
				var maxIndex = bbUtils.getMaxIndex(songs[songIdx]);

				var beatsArr = new Array(maxIndex+1);
				var beatsObj = { };
				for(var beatIdx=0; beatIdx<=maxIndex; beatIdx++) {
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
		decodeSongs : function(encoded) {
			var songs = new Array(encoded.songs.length);
			encoded.songs.forEach(function(song, songIdx) {
				songs[songIdx] = { };
				songs[songIdx].name = song.name;

				var maxIdx = Array.isArray(encoded.songs[songIdx]) ? encoded.songs[songIdx].length-1 : bbUtils.getMaxIndex(encoded.songs[songIdx]);

				for(var beatIdx=0; beatIdx<=maxIdx; beatIdx++) {
					var beat = encoded.songs[songIdx][beatIdx];
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
	};

	return bbSongEncoder;
});