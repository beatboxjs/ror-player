angular.module("beatbox").factory("bbImportExport", function(bbConfig, ng, $, bbUtils, bbPatternEncoder, bbSongEncoder) {
	var bbImportExport = {
		_shouldExportPattern : function(songs, selectedPatterns, tuneName, patternName) {
			if(songs) {
				for(var songIdx=0; songIdx<songs.length; songIdx++) {
					if(songs[songIdx] && bbUtils.songContainsPattern(songs[songIdx], tuneName, patternName))
						return 2;
				}
			}

			return selectedPatterns && selectedPatterns[tuneName] && selectedPatterns[tuneName][patternName] ? 1 : 0;
		},

		exportObject : function(songs, selectedPatterns) {
			var ret = { patterns: { } };
			if(songs)
				ret.songs = bbSongEncoder.encodeSongs(songs);

			for(var tuneName in bbConfig.tunes) {
				var encodedPatterns = { };
				for(var patternName in bbConfig.tunes[tuneName].patterns) {
					if(!this._shouldExportPattern(songs, selectedPatterns, tuneName, patternName))
						continue;

					var originalPattern = bbConfig.tunesBkp[tuneName] && bbConfig.tunesBkp[tuneName].patterns[patternName];
					encodedPatterns[patternName] = bbPatternEncoder.getEncodedPatternObject(bbConfig.tunes[tuneName].patterns[patternName], originalPattern);
				}
				if(Object.keys(encodedPatterns).length > 0)
					ret.patterns[tuneName] = encodedPatterns;
			}

			if(Object.keys(ret.patterns).length == 0)
				delete ret.patterns;

			return ret;
		},

		exportString : function(song, selectedPatterns) {
			return JSON.stringify(this.exportObject(song, selectedPatterns));
		},

		importObject : function(object) {
			var ret = { songs: [ ], errors: [ ] };
			var errors = [ ];
			if(object.patterns) {
				for(var tuneName in object.patterns) {
					for(var patternName in object.patterns[tuneName]) {
						try {
							bbPatternEncoder.applyEncodedPatternObject(object.patterns[tuneName][patternName], bbConfig.tunesBkp[tuneName] && bbConfig.tunesBkp[tuneName][patternName]);
						} catch(e) {
							errors.push("Error importing " + patternName + " (" + tuneName + "): " + e.message);
						}
					}
				}
			}

			if(object.songs) {
				ret.songs.push.apply(ret.songs, bbSongEncoder.decodeSongs(object.songs));

				ret.songs.forEach(function(song) {
					var length = bbUtils.getSongLength(song);
					var missing = [ ];
					for(var beatIdx=0; beatIdx<length; beatIdx++) {
						if(!song[beatIdx])
							continue;

						for(var instr in bbConfig.intruments) {
							var pattern = song[beatIdx][instr];
							if(!pattern)
								continue;

							if((!bbConfig.tunes[pattern[0]] || !bbConfig.tunes[pattern[0]].patterns[pattern[1]]) && missing.indexOf(pattern[0] + " (" + pattern[1] +")") == -1)
								missing.push(pattern[0] + " (" + pattern[1] +")");
						}
					}

					if(missing.length > 0)
						ret.errors.push("Warning: The following tunes/breaks are used in song “" + (song.name || "Untitled song") + "” but are missing: " + missing.join(", "));
				});
			}

			return ret;
		},

		decodeString : function(string) {
			return JSON.parse(string);
		},

		importString : function(string) {
			return this.importObject(this.decodeString(string));
		}
	};
	return bbImportExport;
});