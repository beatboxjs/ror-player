angular.module("beatbox").factory("bbUtils", function(bbConfig, ng, $, $rootScope) {
	var CHARS = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

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
				if(!isNaN(t) && (ret == null || t > ret))
					ret = t;
			}
			return ret;
		},

		getSongLength: function(song, tunes) {
			var maxIndex = bbUtils.getMaxIndex(song);
			if(maxIndex == null)
				return 0;

			var length = 1;
			for(var i in song[maxIndex]) {
				var pattern = bbUtils.getPattern(tunes, song[maxIndex][i]);
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

		getPattern: function(tunes, tuneName, patternName) {
			if(Array.isArray(tuneName)) {
				patternName = tuneName[1];
				tuneName = tuneName[0];
			}

			return tunes[tuneName] && tunes[tuneName].patterns[patternName];
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
		},
		wrapApply: function(func) {
			return function() {
				var t = this;
				var args = arguments;
				var ret;

				$rootScope.$apply(function() {
					ret = func.apply(t, args);
				});

				return ret;
			};
		},

		/**
		 * Encodes a numbers as a string.
		 * @param number {number} The number to encode.
		 * @param length {number?} The number of bytes to use to represent the number (optional).
		 * @returns {string} The number encoded as a string.
		 */
		numberToString : function(number, length) {
			if(number < 0 || isNaN(number) || !isFinite(number))
				throw new Error("Invalid number "+number);

			var ret = "";
			while(number > 0) {
				var newNumber = Math.floor(number / CHARS.length);
				ret = CHARS[number - newNumber*CHARS.length] + ret;
				number = newNumber;
			}

			if(length != null) {
				if(ret.length > length)
					throw new Error("Number "+number+" larger than "+length+" bytes.");

				while(ret.length < length)
					ret = CHARS[0] + ret;
			}
			return ret;
		},

		/**
		 * Decodes a number encoded as a string.
		 * @param string {string} An encoded number as returned by `_numberToString()`.
		 * @returns {number} The decoded number.
		 */
		stringToNumber : function(string) {
			var ret = 0;
			for(var i=string.length-1,fac=1; i>=0; i--,fac*=CHARS.length) {
				var val = CHARS.indexOf(string.charAt(i));
				if(val == -1)
					throw new Error("Unrecognised char "+string.charAt(i));

				ret += val*fac;
			}
			return ret;
		},

		songContainsPattern : function(song, tuneName, patternName) {
			var maxIndex = bbUtils.getMaxIndex(song);

			for(var i=0; i<=maxIndex; i++) {
				if(!song[i])
					continue;

				for(var instr in bbConfig.instruments) {
					if(song[i][instr] && song[i][instr][0] == tuneName && song[i][instr][1] == patternName)
						return true;
				}
			}

			return false;
		},

		makeAbsoluteUrl : function(url) {
			return $("<a/>").attr("href", url).prop("href");
		},

		mergeTuneObjects : function(tunes1, tunes2) {
			var ret = { };
			for(var i=0; i<arguments.length; i++) {
				if(!arguments[i])
					continue;

				for(var tuneName in arguments[i]) {
					if(ret[tuneName] == null)
						ret[tuneName] = ng.copy(arguments[i][tuneName]);
					else if(arguments[i][tuneName].patterns) {
						for(var patternName in arguments[i][tuneName].patterns) {
							ret[tuneName].patterns[patternName] = arguments[i][tuneName].patterns[patternName];
						}
					}
				}
			}
			return ret;
		},

		binArrayToString : function(binArray) {
			var str = "";
			for(var i=0; i<binArray.length; i++)
				str += String.fromCharCode(binArray[i]);
			return decodeURIComponent(escape(str));
		},

		songEquals : function(song1, song2, checkName) {
			if(checkName && song1.name != song2.name)
				return false;

			var maxIndex1 = bbUtils.getMaxIndex(song1);
			var maxIndex2 = bbUtils.getMaxIndex(song2);

			if(maxIndex1 != maxIndex2)
				return false;

			for(var i=0; i<=maxIndex1; i++) {
				if(!ng.equals(song1[i], song2[i]) && (song1[i] != null || song2[i] != null))
					return false;
			}

			return true;
		}
	};

	return bbUtils;
});