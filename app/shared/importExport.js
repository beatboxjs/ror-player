angular.module("beatbox").factory("bbImportExport", function(bbConfig, ng, $, bbUtils, bbPatternEncoder, bbSongEncoder) {
	var bbImportExport = {
		_shouldExportPattern : function(songs, selectedPatterns, tuneName, patternName) {
			if(songs) {
				for(var songIdx=0; songIdx<songs.length; songIdx++) {
					if(songs[songIdx] && bbUtils.songContainsPattern(songs[songIdx], tuneName, patternName))
						return 2;
				}
			}

			return !selectedPatterns || (selectedPatterns[tuneName] && selectedPatterns[tuneName][patternName]) ? 1 : 0;
		},

		exportObject : function(songs, tunes, selectedPatterns) {
			var ret = { patterns: { } };
			if(songs && songs.length > 0)
				ret.songs = bbSongEncoder.encodeSongs(songs);

			for(var tuneName in tunes) {
				var encodedPatterns = { };
				for(var patternName in tunes[tuneName].patterns) {
					if(!this._shouldExportPattern(songs, selectedPatterns, tuneName, patternName))
						continue;

					var originalPattern = bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName];
					var encodedPattern = bbPatternEncoder.getEncodedPatternObject(tunes[tuneName].patterns[patternName], originalPattern);
					if(Object.keys(encodedPattern).length > 0)
						encodedPatterns[patternName] = encodedPattern;
				}
				if(Object.keys(encodedPatterns).length > 0)
					ret.patterns[tuneName] = encodedPatterns;
			}

			if(Object.keys(ret.patterns).length == 0)
				delete ret.patterns;

			return ret;
		},

		objectToString : function(object) {
			var uncompressed = JSON.stringify(object);
			var compressed = JSZip.compressions.DEFLATE.compress(uncompressed, { level: 9 });
			compressed.charCodeAt = function(i) { return this[i]; };
			return JSZip.base64.encode(uncompressed.length < compressed.length ? uncompressed : compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
		},

		exportString : function(songs, tunes, selectedPatterns) {
			return this.objectToString(this.exportObject(songs, tunes, selectedPatterns));
		},

		decodeObject : function(object) {
			var ret = { songs: [ ], tunes: { }, errors: [ ] };
			var errors = [ ];
			if(object.patterns) {
				for(var tuneName in object.patterns) {
					ret.tunes[tuneName] = { patterns: { } };
					for(var patternName in object.patterns[tuneName]) {
						try {
							ret.tunes[tuneName].patterns[patternName] = bbPatternEncoder.applyEncodedPatternObject(object.patterns[tuneName][patternName], bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName]);
						} catch(e) {
							errors.push("Error importing " + patternName + " (" + tuneName + "): " + e.message);
						}
					}
				}
			}

			if(object.songs) {
				ret.songs.push.apply(ret.songs, bbSongEncoder.decodeSongs(object.songs));

				ret.songs.forEach(function(song) {
					var maxIndex = bbUtils.getMaxIndex(song);
					var missing = [ ];
					for(var beatIdx=0; beatIdx<=maxIndex; beatIdx++) {
						if(!song[beatIdx])
							continue;

						for(var instr in bbConfig.instruments) {
							var pattern = song[beatIdx][instr];
							if(!pattern)
								continue;

							if(!bbUtils.getPattern(ret.tunes, pattern) && !bbUtils.getPattern(bbConfig.tunes, pattern) && missing.indexOf(pattern.join(" (") +")") == -1)
								missing.push(pattern.join(" (") +")");
						}
					}

					if(missing.length > 0)
						ret.errors.push("Warning: The following tunes/breaks are used in song “" + (song.name || "Untitled song") + "” but could not be imported: " + missing.join(", "));
				});
			}

			return ret;
		},

		stringToObject : function(string) {
			var decoded = JSZip.base64.decode(string.replace(/-/g, '+').replace(/_/g, '/'));
			if(decoded.charAt(0) != '{')
				decoded = bbUtils.binArrayToString(JSZip.compressions.DEFLATE.uncompress(decoded));
			return JSON.parse(decoded);
		},

		decodeString : function(string) {
			return this.decodeObject(this.stringToObject(string));
		}
	};
	return bbImportExport;
});