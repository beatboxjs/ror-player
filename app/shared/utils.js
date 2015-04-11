angular.module("beatbox").factory("bbUtils", function(bbConfig, ng) {
	var bbUtils = {
		getNumber: function(num) {
			if(isFinite(num) && !isNaN(num))
				return new Array(num);
			else
				return [ ];
		},

		getKeys : function(obj) {
			return Object.keys(obj);
		},

		getMaxIndex: function(arr) {
			var keys = Object.keys(arr);
			var ret = null;
			for(var i=0; i<keys.length; i++) {
				var t = parseInt(keys[i]);
				if(ret == null || t > ret)
					ret = t;
			}
			return ret;
		},

		getSongLength: function(song) {
			var maxIndex = bbUtils.getMaxIndex(song);
			if(maxIndex == null)
				return 0;

			var length = 1;
			for(var i in song[maxIndex]) {
				var pattern = bbUtils.getPattern(song[maxIndex][i]);
				if(pattern)
					length = Math.max(length, pattern.length/4);
			}
			return parseInt(maxIndex) + length;
		},

		splitPattern: function(pattern, instrument) {
			var ret = [ ];
			var remaining = ng.copy(pattern[instrument]);
			while(remaining.length > 0) {
				var slice = remaining.slice(0, 4*pattern.time);
				slice.time = pattern.time;
				ret.push(slice);
				remaining = remaining.slice(4*pattern.time);
			}
			return ret;
		},

		getPattern: function(tuneName, patternName) {
			if(Array.isArray(tuneName)) {
				patternName = tuneName[1];
				tuneName = tuneName[0];
			}

			return bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName];
		}
	};

	return bbUtils;
});