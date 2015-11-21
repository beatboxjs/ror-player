/**
 * Provides functions to compress pattern objects in order for them to be saved. The compression is done by comparing
 * the lines of the individual instruments to each other and to the original version of the pattern (if there is one)
 * and, in case the differences are small, only saving the beats that differ.
 */

angular.module("beatbox").factory("bbPatternEncoder", function(bbConfig, ng, $, bbUtils) {
	var bbPatternEncoder = {
		/**
		 * Helper functions to calculate the difference between two patterns.
		 */
		_PatternDiff : {
			/**
			 * Returns the difference from pattern1 to pattern2 encoded as a string.
			 *
			 * @param pattern1 {array} A sequence of strokes
			 * @param pattern2 {array} A sequence of strokes
			 * @returns {string} An encoded pattern diff. A concatenated list of strings of the following format:
			 *                   Bytes 0 to a: The start position of the segment encoded by bbUtils.numberToString(). a is the number of bytes returned by _getNumberChars().
			 *                   Bytes a to a+1: The length of the segment, encoded by bbUtils.numberToString()
			 *                   Bytes a+1 to a+1+b: The pattern (a string of strokes). b is the length of the segment as defined in bytes a to a+1.
			 *
			 */
			getDiffString : function(pattern1, pattern2) {
				var segments = this._getDiffSegments(pattern1.join(""), pattern2.join(""));
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
			 * @param pattern {array} A sequence of strokes
			 * @param diffString {string} A diff string as returned by `getDiffString()`
			 * @param patternLength {number} The length of the encoded pattern. Necessary to know the number of bytes that stroke positions are encoded with.
			 * @returns {array} The modified pattern, a sequence of strokes
			 */
			applyDiffString : function(pattern, diffString, patternLength) {
				return this._applyDiffSegments(pattern, this._getDiffSegmentsFromString(diffString, patternLength == null ? pattern.length : patternLength)).split('');
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
			 *                      data: {string} A string of strokes that are differing, maximum length 255
			 *                  }
			 *                  Examples: _getDiffSegments('AAA', 'BAC') == [{start: 0, data: 'B'}, {start: 2, data: 'C'}]
			 *                            _getDiffSegments('AAA', 'AAAAA') == [{start: 3, data: 'AA'}]
			 *                            _getDiffSegments('AAAAA', 'AAA') == []
			 */
			_getDiffSegments : function(pattern1, pattern2) {
				var segments = [ ];
				var currentSegment = null;
				var numberChars = bbUtils.numberToString(pattern2.length).length;
				for(var i=0; i<pattern2.length; i++) {
					if(pattern1.charAt(i) != pattern2.charAt(i)) {
						// If the characters since the last segment are few, it will produce less data to connect the segments
						if(currentSegment == null && segments.length > 0 && i - (segments[segments.length-1].start + segments[segments.length-1].data.length) <= numberChars) {
							currentSegment = segments[segments.length-1];
							currentSegment.data += pattern2.substring(currentSegment.start + currentSegment.data.length, i);
						}

						if(currentSegment != null && currentSegment.data.length <= 255) {
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
					var segmentLength = bbUtils.stringToNumber(diffString.substr(i+1, 1));
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
				for(var i=0; i<segments.length; i++) {
					pattern = pattern.substr(0, segments[i].start) + segments[i].data + pattern.substr(segments[i].start + segments[i].data.length);
				}
				return pattern;
			}
		},

		/**
		 * Compresses a pattern object. For each instrument, whichever of the following is the smallest will be taken:
		 * - A diff between the instrument line and any other instrument lines
		 * - (If there is an original version of the pattern) a diff to the original
		 * - The instrument line as is
		 * @param pattern {object} A pattern object with an array of strokes for each instrument and a length and time property
		 * @param originalPattern {object} Optional, a pattern object of the original pattern
		 * @returns {object} A pattern object where some of the instruments have been replaced by diffs and the time and length
		 *                   properties have been removed if they don't differ from the original. The format is as follows:
		 *                   - If the instrument line starts with a '@', it is followed by a two-char instrument key and
		 *                     a diff to the line of that instrument (as returned by _PatternDiff.getDiffString()
		 *                   - If the instrument line starts with a '+', it is followed by a diff to the original instrument line
		 *                   - Otherwise, the string is the actual instrument line
		 */
		getEncodedPatternObject : function(pattern, originalPattern) {
			var instrumentKeys = Object.keys(bbConfig.instruments);
			var ret = { };
			for(var i=0; i<instrumentKeys.length; i++) {
				if(originalPattern != null && ng.equals(pattern[instrumentKeys[i]], originalPattern[instrumentKeys[i]]))
					continue;

				if(!pattern[instrumentKeys[i]]) {
					if(originalPattern && originalPattern[instrumentKeys[i]])
						ret[instrumentKeys[i]] = "";
					continue;
				}

				var encoded = pattern[instrumentKeys[i]].join("");

				if(originalPattern == null && encoded.match(/^ *$/))
					continue;

				// Try out which is the shortest encoded version
				for(var i2=0; i2<i; i2++) {
					if(!pattern[instrumentKeys[i2]])
						continue;

					var thisEncoded = this._PatternDiff.getDiffString(pattern[instrumentKeys[i2]], pattern[instrumentKeys[i]]);
					if(thisEncoded.length+3 < encoded.length) {
						encoded = "@"+instrumentKeys[i2]+thisEncoded;
					}
				}

				if(originalPattern != null) {
					var thisEncoded = this._PatternDiff.getDiffString(originalPattern[instrumentKeys[i]], pattern[instrumentKeys[i]]);
					if(thisEncoded.length+1 < encoded.length) {
						encoded = "+"+thisEncoded;
					}
				}

				ret[instrumentKeys[i]] = encoded;
			}

			if(originalPattern == null || pattern.time != originalPattern.time) {
				ret.time = pattern.time;
			}
			if(originalPattern == null || pattern.length != originalPattern.length) {
				ret.length = pattern.length;
			}

			return ret;
		},

		/**
		 * Uncompresses a pattern object created by `getEncodedPatternObject()`.
		 * @param encodedPatternObject {object} A compressed pattern object as returned by `getEncodedPatternObject`
		 * @param originalPattern {object} The original pattern object, if it exists
		 * @returns {object} A pattern object with an array of strokes for each instrument and a length and time property
		 */
		applyEncodedPatternObject : function(encodedPatternObject, originalPattern) {
			var ret = (originalPattern != null ? ng.copy(originalPattern) : { });

			if(encodedPatternObject.length != null)
				ret.length = encodedPatternObject.length;
			if(encodedPatternObject.time != null)
				ret.time = encodedPatternObject.time;

			if(ret.length == null)
				throw new Error("No pattern length provided.");

			for(var instr in bbConfig.instruments) {
				if(!encodedPatternObject[instr])
					continue;

				switch(encodedPatternObject[instr].charAt(0)) {
					case "+":
						if(originalPattern == null)
							throw new Error("Could not apply diff as original pattern does not exist.");

						ret[instr] = this._PatternDiff.applyDiffString(originalPattern[instr], encodedPatternObject[instr].substr(1), ret.length);
						break;

					case '@':
						var toInstr = encodedPatternObject[instr].substr(1, 2);
						if(!ret[toInstr])
							throw new Error("Cannot diff `" + instr + "` to `" + toInstr + "` as the latter does not exist.");

						ret[instr] = this._PatternDiff.applyDiffString(ret[toInstr], encodedPatternObject[instr].substr(3), ret.length);
						break;

					default:
						ret[instr] = encodedPatternObject[instr].split("");
						break;
				}
			}

			return ret;
		}
	};

	return bbPatternEncoder;
});