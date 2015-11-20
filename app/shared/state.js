angular.module("beatbox").factory("bbState", function(bbConfig, ng, $, $rootScope, bbUtils, bbImportExport) {
	var BbState = function() { };

	BbState.prototype = {
		loadEncodedString : function(encodedString) {
			this.archiveCurrentState();
			var importData = encodedString ? bbImportExport.decodeString(encodedString) : { };

			this.songs = importData.songs || [ ];
			this.tunes = bbUtils.mergeTuneObjects(bbConfig.tunes, importData.tunes);
		},
		getHistoricStates : function() {
			var ret = [ ];
			for(var i=0; i<localStorage.length; i++) {
				var m = localStorage.key(i).match(/^bbState-(.*)$/);
				if(m)
					ret.push(m[1]);
			}
			return ret;
		},
		loadHistoricState : function(key) {
			this.loadEncodedString(localStorage.getItem(key ? "bbState-"+key : "bbState"));

			if(!key) {
				// Legacy storage
				if(localStorage.songs) {
					bbState.songs.push.apply(bbState.songs, JSON.parse(localStorage.songs));
					delete localStorage.songs;
				}

				if(localStorage.song) {
					bbState.songs.push(JSON.parse(localStorage.song));
					delete localStorage.song;
				}

				if(localStorage.myTunes) {
					bbState.tunes[bbConfig.myTunesKey] = JSON.parse(localStorage.myTunes);
					delete localStorage.myTunes;
				}
			}
		},
		archiveCurrentState : function() {
			var key = (Math.floor(new Date().getTime() / 1000));
			this._saveCurrentState(key);
			localStorage.removeItem("bbState");
			ng.copy([ ], this.songs);
			ng.copy(bbConfig.tunes, this.tunes);
			return key;
		},
		_saveCurrentState : function(key) {
			var obj = bbImportExport.exportObject(this.songs, this.tunes);
			if(Object.keys(obj).length == 0)
				localStorage.removeItem(key ? "bbState-"+key : "bbState");
			else
				localStorage.setItem(key ? "bbState-"+key : "bbState", bbImportExport.objectToString(obj));
		}
	};

	var bbState = new BbState();

	bbState.songs = [ ];
	bbState.tunes = ng.copy(bbConfig.tunes);

	bbState.loadHistoricState();

	$rootScope.$watch(function(){ return bbState; }, function() {
		bbState._saveCurrentState();

		// Check if all patterns still exist
		// TODO
		/*for(var i=0; i<bbState.songs.length; i++) {
			for(var j in bbState.songs[i]) {
				if(j == "name")
					continue;

				for(var k in bbState.songs[i][j]) {
					if(!bbUtils.getPattern(bbState.tunes, bbState.songs[i][j][k]))
						delete bbState.songs[i][j][k];
				}
				if(Object.keys(bbState.songs[i][j]).length == 0)
					delete bbState.song[i][j];
			}
		}*/
	}, true);

	return bbState;
});