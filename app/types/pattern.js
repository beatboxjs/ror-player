import app from "../app";

app.factory("bbPattern", function(bbConfig, ng, $, bbUtils) {
	function bbPattern(data) {
		this.length = data && data.length || 4;
		this.time = data && data.time || 4;
		this.speed = data && data.speed || bbConfig.defaultSpeed;
		this.upbeat = data && data.upbeat || 0;
		this.loop = data && data.loop || false;
		this.displayName = data && data.displayName;
		if(data && data.volumeHack)
			this.volumeHack = data.volumeHack;

		for(var instr in bbConfig.instruments) {
			this[instr] = data && data[instr] ? ng.copy(data[instr]) : [ ];
		}
	}

	bbPattern.prototype = {
		/**
		 * Compresses a pattern object. For each instrument, whichever of the following is the smallest will be taken:
		 * - A diff between the instrument line and any other instrument lines
		 * - (If there is an original version of the pattern) a diff to the original
		 * - The instrument line as is
		 * @param originalPattern {bbPattern?} Optional, a pattern object of the original pattern
		 * @param encode {boolean?} Make is smaller by encoding the pattern
		 * @returns {object} A pattern object where some of the instruments have been replaced by diffs and the time and length
		 *                   properties have been removed if they don't differ from the original. The format is as follows:
		 *                   - If the instrument line starts with a '@', it is followed by a two-char instrument key and
		 *                     a diff to the line of that instrument (as returned by _PatternDiff.getDiffString()
		 *                   - If the instrument line starts with a '+', it is followed by a diff to the original instrument line
		 *                   - Otherwise, the string is the actual instrument line
		 */
		compress : function(originalPattern, encode) {
			var instrumentKeys = Object.keys(bbConfig.instruments);
			var le = this.length * this.time + this.upbeat;
			var ret = { };
			for(var i=0; i<instrumentKeys.length; i++) {
				if(originalPattern != null && ng.equals(this[instrumentKeys[i]], originalPattern[instrumentKeys[i]]))
					continue;

				if(!this[instrumentKeys[i]]) {
					if(originalPattern && originalPattern[instrumentKeys[i]])
						ret[instrumentKeys[i]] = "";
					continue;
				}

				// Try out which is the shortest encoded version
				var original = bbPattern._pattern2str(this[instrumentKeys[i]], le);
				var encoded = original.replace(/ +$/, "");

				if(originalPattern == null && encoded.match(/^ *$/))
					continue;

				for(var i2=0; i2<i; i2++) {
					if(!this[instrumentKeys[i2]])
						continue;

					var thisEncoded = bbPattern._PatternDiff.getDiffString(bbPattern._pattern2str(this[instrumentKeys[i2]], le), original);
					if(thisEncoded.length+3 < encoded.length && (encode || thisEncoded.length == 0)) {
						encoded = "@"+instrumentKeys[i2]+thisEncoded;
					}
				}

				if (encode) {
					var thisEncoded = bbPattern._PatternDiff.getDiffString("", original);
					if(thisEncoded.length+1 < encoded.length)
						encoded = "!" + thisEncoded;

					if(originalPattern != null) {
						var thisEncoded = bbPattern._PatternDiff.getDiffString(bbPattern._pattern2str(originalPattern[instrumentKeys[i]], originalPattern.length*originalPattern.time), original);
						if(thisEncoded.length+1 < encoded.length) {
							encoded = "+"+thisEncoded;
						}
					}
				}

				ret[instrumentKeys[i]] = encoded;
			}

			if(originalPattern == null ? (this.time != 4) : (this.time != originalPattern.time)) {
				ret.time = this.time;
			}
			if(originalPattern == null || this.length != originalPattern.length) {
				ret.length = this.length;
			}
			if(originalPattern == null ? (this.upbeat != 0) : (this.upbeat != originalPattern.upbeat)) {
				ret.upbeat = this.upbeat;
			}

			return ret;
		},

		split: function(instrument) {
			var ret = [ ];
			var remaining = ng.copy(this[instrument]);

			if(remaining.length > 0) {
				var slice = remaining.slice(0, 4*this.time + this.upbeat);
				slice.time = this.time;
				slice.upbeat = this.upbeat;
				remaining = remaining.slice(4*this.time + this.upbeat);
			}

			while(remaining.length > 0) {
				var slice = remaining.slice(0, 4*this.time);
				slice.time = this.time;
				slice.upbeat = 0;
				ret.push(slice);
				remaining = remaining.slice(4*this.time);
			}
			return ret;
		},

		equals: function(pattern2) {
			if(this.length != pattern2.length)
				return false;
			if(this.time != pattern2.time)
				return false;
			if(this.upbeat != pattern2.upbeat)
				return false;
			if(!ng.equals(this.volumeHack, pattern2.volumeHack))
				return false;

			var length = this.length * this.time + this.upbeat;
			for(var instr in bbConfig.instruments) {
				if(bbPattern._pattern2str(this[instr] || [ ], length) != bbPattern._pattern2str(pattern2[instr] || [ ], length))
					return false;
			}
			return true;
		}
	};

	/**
	 * Helper functions to calculate the difference between two patterns.
	 */
	$.extend(bbPattern, {
		_PatternDiff : {
			/**
			 * Returns the difference from pattern1 to pattern2 encoded as a string.
			 *
			 * @param pattern1 {string} A sequence of strokes
			 * @param pattern2 {string} A sequence of strokes
			 * @returns {string} An encoded pattern diff. A concatenated list of strings of the following format:
			 *                   Bytes 0 to a: The start position of the segment encoded by bbUtils.numberToString(). a is the number of bytes returned by _getNumberChars().
			 *                   Bytes a to a+1: The length of the segment, encoded by bbUtils.numberToString()
			 *                   Bytes a+1 to a+1+b: The pattern (a string of strokes). b is the length of the segment as defined in bytes a to a+1.
			 *
			 */
			getDiffString : function(pattern1, pattern2) {
				var segments = this._getDiffSegments(pattern1, pattern2);
				var numberChars = this._getNumberChars(pattern2.length);
				var ret = "";
				for(var i=0; i<segments.length; i++) {
					ret += bbUtils.numberToString(segments[i].start, numberChars) + bbUtils.numberToString(segments[i].data.length, 1) + segments[i].data;
				}
				return ret;
			},

			/**
			 * Applies a diff string as returned by `getDiffString()` to a pattern.
			 *
			 * @param pattern {string} A sequence of strokes
			 * @param diffString {string} A diff string as returned by `getDiffString()`
			 * @param patternLength {number} The length of the encoded pattern. Necessary to know the number of bytes that stroke positions are encoded with.
			 * @returns {string} The modified pattern, a sequence of strokes
			 */
			applyDiffString : function(pattern, diffString, patternLength) {
				return this._applyDiffSegments(pattern, this._getDiffSegmentsFromString(diffString, patternLength == null ? pattern.length : patternLength));
			},

			/**
			 * Returns how many bytes are necessary to represent the number given as `length`. In a pattern diff string,
			 * stroke positions will be encoded using `_getNumberChars(length)` bytes, where `length` is the length
			 * of the new pattern.
			 * @param length {number} The length of the new pattern
			 * @returns {number} The number of bytes necessary to encode stroke positions
			 */
			_getNumberChars : function(length) {
				return bbUtils.numberToString(Math.max(0, length-1)).length;
			},

			/**
			 * Returns segments of strokes that are different in pattern2 compared to pattern1. Note that if the length
			 * of pattern2 is shorter than patten1, the part of pattern1 exceeding pattern2 will be ignored.
			 * @param pattern1 {string} A sequence of strokes
			 * @param pattern2 {string} A sequence of strokes
			 * @returns {Array} An array of segments. The format of a segment is as follows: {
			 *                      start: {number} The position in the pattern where the differing segment starts
			 *                      data: {string} A string of strokes that are differing, maximum length bbConfig.numberToStringChars.length-1
			 *                  }
			 *                  Examples: _getDiffSegments('AAA', 'BAC') == [{start: 0, data: 'B'}, {start: 2, data: 'C'}]
			 *                            _getDiffSegments('AAA', 'AAAAA') == [{start: 3, data: 'AA'}]
			 *                            _getDiffSegments('AAAAA', 'AAA') == []
			 */
			_getDiffSegments : function(pattern1, pattern2) {
				var maxSegmentLength = bbConfig.numberToStringChars.length-1;
				var segments = [ ];
				var currentSegment = null;
				var numberChars = bbUtils.numberToString(pattern2.length).length;
				for(var i=0; i<pattern2.length; i++) {
					if(pattern1.charAt(i) != pattern2.charAt(i) && !(pattern2.charAt(i) == " " && pattern1.charAt(i) == "")) {
						// If the characters since the last segment are few, it will produce less data to connect the segments
						if(currentSegment == null && segments.length > 0 && i - (segments[segments.length-1].start + segments[segments.length-1].data.length) <= numberChars && i - segments[segments.length-1].start < maxSegmentLength) {
							currentSegment = segments[segments.length-1];
							currentSegment.data += pattern2.substring(currentSegment.start + currentSegment.data.length, i);
						}

						if(currentSegment != null && currentSegment.data.length < maxSegmentLength) {
							currentSegment.data += pattern2.charAt(i);
						} else {
							currentSegment = {
								start: i,
								data: pattern2.charAt(i)
							};
							segments.push(currentSegment);
						}
					} else {
						currentSegment = null;
					}
				}

				return segments;
			},

			/**
			 * Decodes a pattern diff string as returned by getDiffString() to an array of diff segments as returned
			 * by _getDiffSegments().
			 * @param diffString {string} A diff string as returned by getDiffString()
			 * @param patternLength {number} The length of the new pattern (in order to know the number of bytes that stroke positions are encoded as)
			 * @returns {Array} An array of stroke segments as returned by _getDiffSegments()
			 */
			_getDiffSegmentsFromString : function(diffString, patternLength) {
				var numberChars = this._getNumberChars(patternLength);
				var segments = [ ];
				var i = 0;
				while(i<diffString.length) {
					var segmentLength = bbUtils.stringToNumber(diffString.substr(i+numberChars, 1));
					segments.push({
						start: bbUtils.stringToNumber(diffString.substr(i, numberChars)),
						data: diffString.substr(i+numberChars+1, segmentLength)
					});
					i += numberChars + segmentLength + 1;
				}
				return segments;
			},

			/**
			 * Applies an array of diff segments to a pattern and returned the modified pattern.
			 * @param pattern {string} A sequence of strokes
			 * @param segments {array} An array of diff segments as returned by _getDiffSegments
			 * @returns {string} The modified pattern
			 */
			_applyDiffSegments : function(pattern, segments) {
				var substr = function(str, start, length) {
					var ret = str.substr(start, length);
					while(ret.length < length)
						ret += " ";
					return ret;
				};

				for(var i=0; i<segments.length; i++) {
					pattern = substr(pattern, 0, segments[i].start) + segments[i].data + pattern.substr(segments[i].start + segments[i].data.length);
				}
				return pattern;
			}
		},

		/**
		 * Uncompresses a pattern object created by `bbPattern.compress()`.
		 * @param encodedPatternObject {object} A compressed pattern object as returned by `bbPattern.compress()`
		 * @param originalPattern {bbPattern} The original pattern object, if it exists
		 * @returns {bbPattern} A pattern object with an array of strokes for each instrument and a length and time property
		 */
		fromCompressed : function(encodedPatternObject, originalPattern) {
			var ret = (originalPattern != null ? ng.copy(originalPattern) : { });

			if(encodedPatternObject.length != null)
				ret.length = encodedPatternObject.length;
			if(encodedPatternObject.time != null)
				ret.time = encodedPatternObject.time;
			else if(!originalPattern)
				ret.time = 4;
			if(encodedPatternObject.upbeat != null)
				ret.upbeat = encodedPatternObject.upbeat;
			else if(!originalPattern)
				ret.upbeat = 0;
			if(encodedPatternObject.volumeHack != null)
				ret.volumeHack = encodedPatternObject.volumeHack;

			if(ret.length == null)
				throw new Error("No pattern length provided.");

			for(var instr in bbConfig.instruments) {
				if(!encodedPatternObject[instr]) {
					if(encodedPatternObject[instr] == "")
						ret[instr] = [ ];

					continue;
				}

				switch(encodedPatternObject[instr].charAt(0)) {
					case "!":
						ret[instr] = bbPattern._PatternDiff.applyDiffString("", encodedPatternObject[instr].substr(1), ret.length*ret.time + ret.upbeat);
						break;

					case "+":
						if(originalPattern == null)
							throw new Error("Could not apply diff as original pattern does not exist.");

						ret[instr] = bbPattern._PatternDiff.applyDiffString(bbPattern._pattern2str(originalPattern[instr], originalPattern.length*originalPattern.time), encodedPatternObject[instr].substr(1), ret.length*ret.time + ret.upbeat);
						break;

					case '@':
						var toInstr = encodedPatternObject[instr].substr(1, 2);
						ret[instr] = bbPattern._PatternDiff.applyDiffString(bbPattern._pattern2str(ret[toInstr] || [ ], ret.length*ret.time), encodedPatternObject[instr].substr(3), ret.length*ret.time + ret.upbeat);
						break;

					default:
						ret[instr] = encodedPatternObject[instr];
						break;
				}

				ret[instr] = bbPattern._str2pattern(ret[instr]);
			}

			return ret;
		},

		_pattern2str : function(pattern, length) {
			// Note: Cannot use pattern.map or pattern.forEach, as it skips undefined values

			var ret = "";
			for(var i=0; i<length; i++) {
				ret += pattern[i] || " ";
			}
			return ret;
		},

		_str2pattern : function(string) {
			return string.split("");
		}
	});

	return bbPattern;
});