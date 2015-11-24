angular.module("beatbox").factory("bbHistory", function(bbConfig, ng, $, $rootScope, bbUtils, bbState) {
	var BbHistory = function() {
		this.state = new bbState();
	};

	BbHistory.prototype = {
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

			if(this._currentKey)
				this._saveCurrentState();

			this._loadFromString(key ? localStorage.getItem("bbState-"+key) : "");
			this._currentKey = key;
			this._saveCurrentState();
		},
		clear : function() {
			this._ensureMaxNumber(1);
		},
		_loadFromString : function(encodedString) {
			try {
				var importData = new bbState();
				var errors = importData.extendFromCompressed(encodedString ? bbUtils.stringToObject(encodedString) : { }, null, null, true, true, true);
				ng.copy(importData, this.state);
				return errors;
			} catch(e) {
				console.error("Error decoding state", e);
				return;
			}
		},
		_getNowKey : function() {
			return Math.floor(new Date().getTime() / 1000);
		},
		_saveCurrentState : function(findSameState) {
			var obj = this.state.compress(null, null, true, true);
			if(Object.keys(obj).length == 0 || (this._currentKey && localStorage.getItem("bbState-"+this._currentKey) && ng.equals(obj, bbUtils.stringToObject(localStorage.getItem("bbState-"+this._currentKey)))))
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

			localStorage.setItem("bbState-"+newKey, bbUtils.objectToString(obj));
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
				if(ng.equals(obj, bbUtils.stringToObject(localStorage.getItem("bbState-"+keys[i]))))
					return keys[i];
			}
			return null;
		}
	};

	var bbHistory = new BbHistory();

	bbHistory.loadHistoricState();

	// Legacy storage

	if(localStorage.song) {
		bbHistory.state.extend({ songs: [ JSON.parse(localStorage.song) ] });
		delete localStorage.song;

		bbHistory._saveCurrentState();
	}

	if(localStorage.myTunes) {
		var tunes = { };
		tunes["My tunes"] = JSON.parse(localStorage.myTunes);
		bbHistory.state.extend({ tunes: tunes });
		delete localStorage.myTunes;

		bbHistory._saveCurrentState();
	}


	$rootScope.$watch(function(){ return bbHistory.state; }, function() {
		bbHistory._saveCurrentState();
	}, true);

	return bbHistory;
});