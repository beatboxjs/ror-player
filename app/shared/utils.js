angular.module("ror-simulator").factory("RorUtils", function(RorConstants, ng) {
	var RorUtils = {
		getNumber: function(num) {
			if(isFinite(num) && !isNaN(num))
				return new Array(num);
			else
				return [ ];
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
			var maxIndex = RorUtils.getMaxIndex(song);
			if(maxIndex == null)
				return 0;

			var length = 0;
			for(var i in song[maxIndex]) {
				var pattern = RorConstants.tunes[song[maxIndex][i][0]].patterns[song[maxIndex][i][1]];
				length = Math.max(length, pattern.length/pattern.time);
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
		}
	};

	return RorUtils;
});