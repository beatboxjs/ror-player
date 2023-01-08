import { NUMBER_TO_STRING_CHARS, numberToString, stringToNumber } from "../utils";

type DiffSegment = {
    start: number,
    data: string
};

/**
 * Returns the difference from pattern1 to pattern2 encoded as a string.
 *
 * @param pattern1 A sequence of strokes
 * @param pattern2 A sequence of strokes
 * @returns An encoded pattern diff. A concatenated list of strings of the following format:
 *          Bytes 0 to a: The start position of the segment encoded by numberToString(). a is the number of bytes returned by _getNumberChars().
 *          Bytes a to a+1: The length of the segment, encoded by numberToString()
 *          Bytes a+1 to a+1+b: The pattern (a string of strokes). b is the length of the segment as defined in bytes a to a+1.
 *
 */
export function getDiffString(pattern1: string, pattern2: string): string {
    const segments = getDiffSegments(pattern1, pattern2);
    const numberChars = getNumberChars(pattern2.length);
    let ret = "";
    for(let i=0; i<segments.length; i++) {
        ret += numberToString(segments[i].start, numberChars) + numberToString(segments[i].data.length, 1) + segments[i].data;
    }
    return ret;
}

/**
 * Applies a diff string as returned by `getDiffString()` to a pattern.
 *
 * @param pattern A sequence of strokes
 * @param diffString A diff string as returned by `getDiffString()`
 * @param patternLength The length of the encoded pattern. Necessary to know the number of bytes that stroke positions are encoded with.
 * @returns The modified pattern, a sequence of strokes
 */
export function applyDiffString(pattern: string, diffString: string, patternLength: number): string {
    return applyDiffSegments(pattern, getDiffSegmentsFromString(diffString, patternLength == null ? pattern.length : patternLength));
}

/**
 * Returns how many bytes are necessary to represent the number given as `length`. In a pattern diff string,
 * stroke positions will be encoded using `_getNumberChars(length)` bytes, where `length` is the length
 * of the new pattern.
 * @param length The length of the new pattern
 * @returns The number of bytes necessary to encode stroke positions
 */
function getNumberChars(length: number): number {
    return numberToString(Math.max(0, length-1)).length;
}

/**
 * Returns segments of strokes that are different in pattern2 compared to pattern1. Note that if the length
 * of pattern2 is shorter than patten1, the part of pattern1 exceeding pattern2 will be ignored.
 * @param pattern1 A sequence of strokes
 * @param pattern2 A sequence of strokes
 * @returns An array of segments. The format of a segment is as follows: {
 *              start: {number} The position in the pattern where the differing segment starts
 *              data: {string} A string of strokes that are differing, maximum length NUMBER_TO_STRING_CHARS.length-1
 *          }
 *          Examples: _getDiffSegments('AAA', 'BAC') == [{start: 0, data: 'B'}, {start: 2, data: 'C'}]
 *                    _getDiffSegments('AAA', 'AAAAA') == [{start: 3, data: 'AA'}]
 *                    _getDiffSegments('AAAAA', 'AAA') == []
 */
function getDiffSegments(pattern1: string, pattern2: string): Array<DiffSegment> {
    const maxSegmentLength = NUMBER_TO_STRING_CHARS.length-1;
    const segments: Array<DiffSegment> = [ ];
    let currentSegment: DiffSegment | null = null;
    const numberChars = numberToString(pattern2.length).length;
    for(let i=0; i<pattern2.length; i++) {
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
}

/**
 * Decodes a pattern diff string as returned by getDiffString() to an array of diff segments as returned
 * by _getDiffSegments().
 * @param diffString A diff string as returned by getDiffString()
 * @param patternLength The length of the new pattern (in order to know the number of bytes that stroke positions are encoded as)
 * @returns An array of stroke segments as returned by _getDiffSegments()
 */
function getDiffSegmentsFromString(diffString: string, patternLength: number): Array<DiffSegment> {
    const numberChars = getNumberChars(patternLength);
    const segments: Array<DiffSegment> = [ ];
    let i = 0;
    while(i<diffString.length) {
        const segmentLength = stringToNumber(diffString.substr(i+numberChars, 1));
        segments.push({
            start: stringToNumber(diffString.substr(i, numberChars)),
            data: diffString.substr(i+numberChars+1, segmentLength)
        });
        i += numberChars + segmentLength + 1;
    }
    return segments;
}

/**
 * Applies an array of diff segments to a pattern and returned the modified pattern.
 * @param pattern A sequence of strokes
 * @param segments An array of diff segments as returned by _getDiffSegments
 * @returns The modified pattern
 */
function applyDiffSegments(pattern: string, segments: Array<DiffSegment>) {
    const substr = function(str: string, start: number, length: number): string {
        let ret = str.substr(start, length);
        while(ret.length < length)
            ret += " ";
        return ret;
    };

    for(let i=0; i<segments.length; i++) {
        pattern = substr(pattern, 0, segments[i].start) + segments[i].data + pattern.substr(segments[i].start + segments[i].data.length);
    }
    return pattern;
}
