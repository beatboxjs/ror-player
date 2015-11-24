angular.module("beatbox").factory("bbState", function(bbConfig, ng, $, bbUtils, bbTune, bbSong, bbPattern, bbDefaultTunes) {
	function bbState(data) {
		this.songs = [ ];
		this.tunes = { };
		this.songIdx = 0;
		this.loop = false;
		this.mute = { };
		this.speed = 100;
		this.headphones = null;

		this.extend(data || { tunes: bbDefaultTunes }, null, null, true, true);
	}

	bbState.prototype = {
		extend: function(data, selectSong, selectPattern, keepEmptyTunes, importOptions) {
			if(importOptions) {
				for(var i in {songIdx:1, loop:1, mute:1, speed:1, headphones:1}) {
					if(i in data)
						this[i] = data[i];
				}
			}

			if(data.tunes) {
				for(var tuneName in data.tunes) {
					var e = !!this.tunes[tuneName];
					if(!e)
						this.tunes[tuneName] = new bbTune();

					this.tunes[tuneName].extend(data.tunes[tuneName], function(patternName) {
						return !selectPattern || selectPattern(tuneName, patternName);
					});

					if(!e && this.tunes[tuneName].length == 0 && !keepEmptyTunes)
						delete this.tunes[tuneName];
				}
			}

			if(data.songs) {
				for(var i=0; i<data.songs.length; i++) {
					if(!selectSong || selectSong(i))
						this.songs.push(new bbSong(data.songs[i]));
				}
			}
		},

		extendFromCompressed : function(object, selectSong, selectPattern, keepEmptyTunes, importOptions, ignoreMissingDefaultPatterns) {
			if(importOptions) {
				for(var i in {songIdx:1, loop:1, mute:1, speed:1, headphones:1}) {
					if(i in object)
						this[i] = object[i];
				}
			}

			var errors = [ ];
			if(object.patterns) {
				var tunes = { };
				for(var tuneName in object.patterns) {
					tunes[tuneName] = new bbTune();
					for(var patternName in object.patterns[tuneName]) {
						if(selectPattern && !selectPattern(tuneName, patternName))
							continue;

						try {
							tunes[tuneName].patterns[patternName] = bbPattern.fromCompressed(object.patterns[tuneName][patternName], bbDefaultTunes.getPattern(tuneName, patternName));
						} catch(e) {
							errors.push("Error importing " + patternName + " (" + tuneName + "): " + e.message);
							console.error("Error importing " + patternName + " (" + tuneName + "): ", e);
						}
					}
				}

				this.extend({ tunes: tunes }, null, null, keepEmptyTunes);
			}

			if(object.songs) {
				var songs = bbSong.uncompressSongs(object.songs);

				songs.forEach(function(song) {
					var missing = [ ];
					for(var beatIdx=0,length=song.getLength(); beatIdx<length; beatIdx++) {
						if(!song[beatIdx])
							continue;

						for(var instr in bbConfig.instruments) {
							var pattern = song[beatIdx][instr];
							if(!pattern)
								continue;

							var thisMissing = (!this.getPattern(pattern) && (!ignoreMissingDefaultPatterns || !bbDefaultTunes.getPattern(pattern)));
							if(thisMissing && missing.indexOf(pattern.join(" (") +")") == -1)
								missing.push(pattern.join(" (") +")");
						}
					}

					if(missing.length > 0)
						errors.push("Warning: The following tunes/breaks are used in song “" + (song.name || "Untitled song") + "” but could not be imported: " + missing.join(", "));
				}.bind(this));

				this.extend({ songs: songs });
			}

			return errors;
		},

		containsPattern : function(tuneName, patternName) {
			return this.songs.some(function(song) {
				song.containsPattern(tuneName, patternName);
			});
		},

		getPattern: function(tuneName, patternName) {
			if(Array.isArray(tuneName)) {
				patternName = tuneName[1];
				tuneName = tuneName[0];
			}

			return this.tunes[tuneName] && this.tunes[tuneName].patterns[patternName];
		},

		compress : function(selectSong, selectPattern, keepEmptyTunes, saveOptions) {
			var ret = { patterns: { } };

			var songs = selectSong ? this.songs.filter(function(song, songIdx) { return selectSong(songIdx); }) : this.songs;
			if(songs.length > 0)
				ret.songs = bbSong.compressSongs(songs);

			for(var tuneName in this.tunes) {
				var encodedPatterns = { };
				for(var patternName in this.tunes[tuneName].patterns) {
					if(selectPattern && !selectPattern(tuneName, patternName) && !songs.some(function(song) { song.containsPattern(tuneName, patternName); }))
						continue;

					var originalPattern = bbDefaultTunes.getPattern(tuneName, patternName);
					var encodedPattern = this.tunes[tuneName].patterns[patternName].compress(originalPattern);
					if(Object.keys(encodedPattern).length > 0)
						encodedPatterns[patternName] = encodedPattern;
				}
				if(keepEmptyTunes || Object.keys(encodedPatterns).length > 0)
					ret.patterns[tuneName] = encodedPatterns;
			}

			if(Object.keys(ret.patterns).length == 0)
				delete ret.patterns;

			if(saveOptions) {
				for(var i in {songIdx:1, loop:1, mute:1, speed:1, headphones:1})
					ret[i] = this[i];
			}

			return ret;
		},

		createSong : function(data, idx) {
			if(idx == null)
				idx = this.songs.length;
			this.songs.splice(idx, 0, new bbSong(data));
			return idx;
		},

		removeSong : function(idx) {
			this.songs.splice(idx, 1);

			if(this.songIdx >= this.songs.length)
				this.songIdx = Math.max(0, this.songs.length-1);
		},

		songExists : function(song) {
			for(var i=0; i<this.songs.length; i++) {
				if(this.songs[i].equals(song))
					return true;
			}
			return false
		},

		_replacePattern : function(fromTuneAndName, toTuneAndName) {
			for(var i=0; i<this.songs.length; i++) {
				this.songs[i].replacePattern(fromTuneAndName, toTuneAndName);
			}
		},

		createTune : function(tuneName, data) {
			return this.tunes[tuneName] = new bbTune(data);
		},

		renameTune : function(tuneName, newTuneName) {
			this.tunes[newTuneName] = this.tunes[tuneName];
			delete this.tunes[tuneName];

			this._replacePattern([ tuneName, null ], [ newTuneName, null ]);
		},

		copyTune : function(tuneName, newTuneName) {
			this.createTune(newTuneName, this.tunes[tuneName]);
		},

		removeTune : function(tuneName) {
			delete this.tunes[tuneName];
			this._replacePattern([ tuneName, null ], null);
		},

		createPattern : function(tuneName, patternName, data) {
			if(!this.tunes[tuneName])
				this.createTune(tuneName);

			return this.tunes[tuneName].createPattern(patternName, data);
		},

		renamePattern : function(tuneName, patternName, newPatternName) {
			this.tunes[tuneName].renamePattern(patternName, newPatternName);
			this._replacePattern([ tuneName, patternName ], [ tuneName, newPatternName ]);
		},

		removePattern : function(tuneName, patternName) {
			this.tunes[tuneName].removePattern(patternName);
			this._replacePattern([ tuneName, patternName ], null);
		},

		movePattern : function(fromTuneAndName, toTuneAndName) {
			if(!this.tunes[toTuneAndName[0]])
				this.createTune(toTuneAndName[0]);

			this.tunes[toTuneAndName[0]].createPattern(toTuneAndName[1], this.getPattern(fromTuneAndName));
			this.tunes[fromTuneAndName[0]].removePattern(fromTuneAndName[1]);
			this._replacePattern(fromTuneAndName, toTuneAndName);
		},

		copyPattern : function(fromTuneAndName, toTuneAndName) {
			if(!this.tunes[toTuneAndName[0]])
				this.createTune(toTuneAndName[0]);

			this.tunes[toTuneAndName[0]].createPattern(toTuneAndName[1], this.getPattern(fromTuneAndName));
		},

		getSongName : function(songIdx) {
			if(this.songs[songIdx].name && this.songs[songIdx].name.trim())
				return this.songs[songIdx].name;

			var no = 1;
			for(var i=0; i<songIdx; i++) {
				if(!this.songs[i].name || !this.songs[i].name.trim())
					no++;
			}

			return "Untitled song "+no;
		},

		getSortedTuneList : function() {
			return Object.keys(this.tunes).sort(function(a, b) {
				var idx1 = bbDefaultTunes.firstInSorting.indexOf(a);
				var idx2 = bbDefaultTunes.firstInSorting.indexOf(b);

				if(idx1 != -1 && idx2 != -1)
					return idx1-idx2;
				else if(idx1 != -1)
					return -1;
				else if(idx2 != -1)
					return 1;
				else
					return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
			});
		}
	};

	return bbState;

});