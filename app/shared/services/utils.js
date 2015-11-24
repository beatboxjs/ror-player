angular.module("beatbox").factory("bbUtils", function(bbConfig, ng, $, $rootScope) {
	var CHARS = bbConfig.numberToStringChars;

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

		makeAbsoluteUrl : function(url) {
			return $("<a/>").attr("href", url).prop("href");
		},

		binArrayToString : function(binArray) {
			var str = "";
			for(var i=0; i<binArray.length; i++)
				str += String.fromCharCode(binArray[i]);
			return decodeURIComponent(escape(str));
		},

		objectToString : function(object) {
			var uncompressed = JSON.stringify(object);
			var compressed = JSZip.compressions.DEFLATE.compress(uncompressed, { level: 9 });
			compressed.charCodeAt = function(i) { return this[i]; };
			return JSZip.base64.encode(uncompressed.length < compressed.length ? uncompressed : compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
		},

		stringToObject : function(string) {
			var decoded = JSZip.base64.decode(string.replace(/-/g, '+').replace(/_/g, '/'));
			if(decoded.charAt(0) != '{')
				decoded = bbUtils.binArrayToString(JSZip.compressions.DEFLATE.uncompress(decoded));
			if(decoded.charCodeAt(decoded.length-1) == 0) // Happened once, don't know why
				decoded = decoded.substr(0, decoded.length-1);
			return JSON.parse(decoded);
		}
	};

	return bbUtils;
});