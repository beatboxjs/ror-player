angular.module("beatbox").factory("bbUtils", function(bbConfig, ng, $) {
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
		},

		scrollToElement: function(el, scrollFurther, force) {
			el = el[0];

			if(!el.bbParent) {
				var left = 0;
				var curEl = el.offsetParent;
				function ov(el) {
					var style = getComputedStyle(curEl);
					return style["overflow-x"] || style["overflow"];
				}
				while(curEl && [ "auto", "scroll" ].indexOf(ov(curEl)) == -1) {
					left += curEl.offsetLeft;
					curEl = curEl.offsetParent;
				}

				if(!curEl)
					return;

				el.bbParent = curEl;
				el.bbLeft = left;
				el.bbScrollingDisabled = false;
				el.bbScrollingDisabledTimeout = null;
				var scrollTimeout = null;
				$(el.bbParent).on("scroll", function() {
					el.bbScrollingDisabled = true;
				});
			}

			if(force)
				el.bbScrollingDisabled = false;

			var fac1 = (scrollFurther ? 0.1 : 0);
			var fac2 = (scrollFurther ? 0.4 : 0);

			var left = el.offsetLeft + el.bbLeft;
			if(!el.bbScrollingDisabled) {
				if(left + el.offsetWidth > el.bbParent.scrollLeft + el.bbParent.offsetWidth * (1-fac1))
					$(el.bbParent).not(":animated").animate({ scrollLeft: left + el.offsetWidth - el.bbParent.offsetWidth * (1-fac2) }, 200);
				else if(left < el.bbParent.scrollLeft)
					$(el.bbParent).not(":animated").animate({ scrollLeft: left - el.bbParent.offsetWidth * fac2 }, 200);
			} else if(left >= el.bbParent.scrollLeft && left + el.offsetWidth <= el.bbParent.scrollLeft + el.bbParent.offsetWidth)
				el.bbScrollingDisabled = false;
		}
	};

	return bbUtils;
});