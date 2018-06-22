import pako from "pako";
import app from "../app";

app.factory("bbUtils", function(bbConfig, ng, $, $rootScope, $uibModal, $q, $timeout) {
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

		objectToString : function(object) {
			var uncompressed = JSON.stringify(object);
			var compressed = String.fromCharCode.apply(null, pako.deflateRaw(uncompressed, { level: 9 }));
			return btoa(uncompressed.length < compressed.length ? uncompressed : compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
		},

		stringToObject : function(string) {
			var decoded = atob(string.replace(/-/g, '+').replace(/_/g, '/'));
			if(decoded.charAt(0) != '{')
				decoded = pako.inflateRaw(decoded, { to: "string" });
			if(decoded.charCodeAt(decoded.length-1) == 0) // Happened once, don't know why
				decoded = decoded.substr(0, decoded.length-1);
			return JSON.parse(decoded);
		},

		readableDate : function(tstamp, tstampBefore, tstampAfter) {
			var date = new Date(tstamp*1000);
			var dateBefore = new Date(tstampBefore ? tstampBefore*1000 : 0);
			var dateAfter = new Date(tstampAfter ? tstampAfter*1000 : 0);
			var now = new Date();

			function time(secs) { return pad(date.getHours()) + ":" + pad(date.getMinutes()) + (secs ? ":" + pad(date.getSeconds()) : ""); }
			function daysAgo(d) { return Math.round((now.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime()) / 86400000); }
			function weeksAgo(d) { return Math.round(daysAgo(d)/7); }
			function monthsAgo(d) { return Math.round(daysAgo(d)/30.436875); }
			function yearsAgo(d) { return Math.round(daysAgo(d)/365.2425); }
			function sameMinute(d1, d2) { return sameDay(d1, d2) && d1.getHours() == d2.getHours() && d1.getMinutes() == d2.getMinutes(); }
			function sameDay(d1, d2) { return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate(); }
			function pad(n) {return n<10 ? '0'+n : n}

			if(sameDay(date, now))
				return "Today " + time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter));

			var days = daysAgo(date);
			if(days <= 12)
				return (days == 1 ? "Yesterday" : days + " days ago") + (sameDay(date, dateBefore) || sameDay(date, dateAfter) ? " " + time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter)) : "");

			var weeks = weeksAgo(date);
			if(weeks <= 6 && weeks != weeksAgo(dateBefore) && weeks != weeksAgo(dateAfter))
				return weeks + " weeks ago";

			var months = monthsAgo(date);
			if(weeks > 6 && months <= 10 && months != monthsAgo(dateBefore) && weeks != monthsAgo(dateAfter))
				return months + " months ago";

			var years = yearsAgo(date);
			if(months > 10 && years != yearsAgo(dateBefore) && years != yearsAgo(dateAfter))
				return years + " year" + (years == 1 ? "" : "s") + " ago";

			var str = pad(date.getDate()) + " " + [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ][date.getMonth()];
			if(date.getFullYear() != now.getFullYear())
				str += " " + date.getFullYear();
			if(sameDay(date, dateBefore) || sameDay(date, dateAfter))
				str += " " + time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter));
			return str;
		},

		isoDate : function(tstamp) {
			var d = new Date(tstamp*1000);
			function pad(n) {return n<10 ? '0'+n : n}
		    return d.getFullYear()+'-'
		         + pad(d.getMonth()+1)+'-'
		         + pad(d.getDate())+'T'
		         + pad(d.getHours())+':'
		         + pad(d.getMinutes())+':'
		         + pad(d.getSeconds());
		},

		dialog : function(type, title, value, getError) {
			return $q(function(resolve, reject) {
				var scope = $rootScope.$new();
				scope.type = type;
				scope.title = title;
				scope.value = value;
				scope.getError = function() {
					return getError && getError(this.value);
				};
				scope.ok = function() {
					this.$close();
					resolve(this.value);
				};
				scope.cancel = function() {
					console.log("cancel");
					this.$close();
					reject();
				};

				var dialog = $uibModal.open({
					template: require("./utils-alert.html"),
					scope: scope
				});
				dialog.result.catch(reject);
				dialog.rendered.then(function() {
					$timeout(function() {
						$("#bb-alert-input").focus();
					});
				});
			});
		},

		alert : function(title) {
			return bbUtils.dialog("alert", title);
		},

		confirm : function(title) {
			return bbUtils.dialog("confirm", title);
		},

		prompt : function(title, initialValue, getError) {
			return bbUtils.dialog("prompt", title, initialValue, getError);
		}
	};

	return bbUtils;
});