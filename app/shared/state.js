angular.module("beatbox").factory("bbState", function(bbConfig, ng, $, $rootScope, bbUtils, bbImportExport) {
	var BbState = function() { };

	BbState.prototype = {
		loadEncodedString : function(encodedString) {
			this._saveCurrentState();
			var errs = this._loadFromString(encodedString);

			this._currentKey = null;

			this._saveCurrentState(true);

			return errs;
		},
		getCurrentKey : function() {
			return this._currentKey;
		},
		getHistoricStates : function() {
			var ret = [ ];
			for(var i=0; i<localStorage.length; i++) {
				var m = localStorage.key(i).match(/^bbState-(.*)$/);
				if(m)
					ret.push(m[1]);
			}
			return ret.sort(function(a,b) { return b-a; });
		},
		loadHistoricState : function(key) {
			if(key == null)
				key = localStorage.getItem("bbState");

			this._saveCurrentState();
			this._loadFromString(key ? localStorage.getItem("bbState-"+key) : "");
			this._currentKey = key;
			this._saveCurrentState();
		},
		clear : function() {
			this._ensureMaxNumber(1);
		},
		_loadFromString : function(encodedString) {
			var importData;
			try {
				importData = encodedString ? bbImportExport.decodeString(encodedString) : { };
			} catch(e) {
				console.error("Error decoding state", e);
				return;
			}

			ng.copy(importData.songs || [ ], this.songs);
			ng.copy(bbUtils.mergeTuneObjects(bbConfig.tunes, importData.tunes), this.tunes);

			if(this.songs.length == 0)
				this.songs.push({ });
			if(!this.tunes[bbConfig.myTunesKey])
				this.tunes[bbConfig.myTunesKey] = { patterns: { } };

			return importData.errors;
		},
		_getNowKey : function() {
			return Math.floor(new Date().getTime() / 1000);
		},
		_saveCurrentState : function(findSameState) {
			var obj = bbImportExport.exportObject(this.songs, this.tunes);
			if(Object.keys(obj).length == 0 || (this._currentKey && localStorage.getItem("bbState-"+this._currentKey) && ng.equals(obj, bbImportExport.stringToObject(localStorage.getItem("bbState-"+this._currentKey)))))
				return;

			var newKey = this._getNowKey();
			if(this._currentKey && newKey - this._currentKey < 3600)
				localStorage.removeItem("bbState-" + this._currentKey);

			if(findSameState) {
				var sameState = this._findSameState(obj);
				if(sameState) {
					localStorage.setItem("bbState", sameState);
					this._currentKey = sameState;
					return;
				}
			}

			localStorage.setItem("bbState-"+newKey, bbImportExport.objectToString(obj));
			localStorage.setItem("bbState", newKey);
			this._currentKey = newKey;

			this._ensureMaxNumber();
		},
		_ensureMaxNumber : function(number) {
			this.getHistoricStates().slice(number || 30).forEach(function(key) {
				if(key != this._currentKey)
					localStorage.removeItem("bbState-"+key);
			}.bind(this));
		},
		_findSameState : function(obj) {
			var keys = this.getHistoricStates();
			for(var i=0; i<keys.length; i++) {
				if(ng.equals(obj, bbImportExport.stringToObject(localStorage.getItem("bbState-"+keys[i]))))
					return keys[i];
			}
			return null;
		}
	};

	var bbState = new BbState();

	bbState.songs = [ ];
	bbState.tunes = { };

	bbState.loadHistoricState();

	// Legacy storage

	if(localStorage.song) {
		if(ng.equals(bbState.songs, [ { } ]))
			bbState.songs.pop();

		bbState.songs.push(JSON.parse(localStorage.song));
		delete localStorage.song;

		bbState._saveCurrentState();
	}

	if(localStorage.myTunes) {
		bbState.tunes[bbConfig.myTunesKey] = JSON.parse(localStorage.myTunes);
		delete localStorage.myTunes;

		bbState._saveCurrentState();
	}


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