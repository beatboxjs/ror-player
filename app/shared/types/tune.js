angular.module("beatbox").factory("bbTune", function(ng, $, bbUtils, bbPattern) {
	function bbTune(data) {
		this.patterns = { };

		if(data)
			this.extend(data);
	}

	bbTune.prototype = {
		extend : function(data, selectPattern) {
			if(data.patterns) {
				for(var patternName in data.patterns) {
					if(selectPattern && !selectPattern(patternName))
						continue;

					this.patterns[patternName] = new bbPattern(data.patterns[patternName]);
				}
			}
		},
		getLength : function() {
			return Object.keys(this.patterns).length;
		},
		createPattern : function(patternName, data) {
			return this.patterns[patternName] = new bbPattern(data);
		},
		removePattern : function(patternName) {
			delete this.patterns[patternName];
		}
	};

	return bbTune;
});