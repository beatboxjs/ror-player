import config, { Instrument, Stroke } from "../config";
import isEqual from "lodash.isequal";
import { clone, vueSetMultiple } from "../utils";
import { applyDiffString, getDiffString } from "./patternDiff";
import Vue from "vue";

export type Beats = { [instr in Instrument]: Array<Stroke> };

type BeatsOptional = { [instr in Instrument]?: Array<Stroke> };

type BeatsStringOptional = { [instr in Instrument]?: string }

export type VolumeHack = { [idx: number]: number };

type PatternProperties = {
	length: number,
	time: number,
	speed: number,
	upbeat: number,
	loop: boolean,
	displayName?: string,
	volumeHack?: VolumeHack
}

type PatternPropertiesOptional = {
	[i in keyof PatternProperties]?: PatternProperties[i]
};

export type Pattern = PatternProperties & Beats;

export type PatternOptional = PatternPropertiesOptional & BeatsOptional;

export type CompressedPattern = PatternPropertiesOptional & BeatsStringOptional;


export function normalizePattern(data?: PatternOptional): Pattern {
	const ret: PatternOptional = {
		length: data && data.length || 4,
		time: data && data.time || 4,
		speed: data && data.speed || config.defaultSpeed,
		upbeat: data && data.upbeat || 0,
		loop: data && data.loop || false,
		displayName: data && data.displayName
	};

	if(data && data.volumeHack)
		ret.volumeHack = data.volumeHack;

	for(const instr of config.instrumentKeys) {
		ret[instr] = data && data[instr] ? clone(data[instr]) : [ ];
	}

	return Vue.observable(<Pattern> ret);
}


/**
 * Compresses a pattern object. For each instrument, whichever of the following is the smallest will be taken:
 * - A diff between the instrument line and any other instrument lines
 * - (If there is an original version of the pattern) a diff to the original
 * - The instrument line as is
 * @param pattern The pattern to compress
 * @param originalPattern Optional, a pattern object of the original pattern
 * @param encode Make is smaller by encoding the pattern
 * @returns A pattern object where some of the instruments have been replaced by diffs and the time and length
 *          properties have been removed if they don't differ from the original. The format is as follows:
 *          - If the instrument line starts with a '@', it is followed by a two-char instrument key and
 *            a diff to the line of that instrument (as returned by getDiffString()
 *          - If the instrument line starts with a '+', it is followed by a diff to the original instrument line
 *          - Otherwise, the string is the actual instrument line
 */
export function compressPattern(pattern: Pattern, originalPattern?: Pattern, encode?: boolean): CompressedPattern {
	const instrumentKeys = config.instrumentKeys;
	const le = pattern.length * pattern.time + pattern.upbeat;
	const ret: CompressedPattern = { };
	for(let i=0; i<instrumentKeys.length; i++) {
		if(originalPattern != null && isEqual(pattern[instrumentKeys[i]], originalPattern[instrumentKeys[i]]))
			continue;

		if(!pattern[instrumentKeys[i]]) {
			if(originalPattern && originalPattern[instrumentKeys[i]])
				ret[instrumentKeys[i]] = "";
			continue;
		}

		// Try out which is the shortest encoded version
		const original = pattern2str(pattern[instrumentKeys[i]], le);
		let encoded = original.replace(/ +$/, "");

		if(originalPattern == null && encoded.match(/^ *$/))
			continue;

		for(let i2=0; i2<i; i2++) {
			if(!pattern[instrumentKeys[i2]])
				continue;

			const thisEncoded = getDiffString(pattern2str(pattern[instrumentKeys[i2]], le), original);
			if(thisEncoded.length+3 < encoded.length && (encode || thisEncoded.length == 0)) {
				encoded = "@"+instrumentKeys[i2]+thisEncoded;
			}
		}

		if (encode) {
			const thisEncoded = getDiffString("", original);
			if(thisEncoded.length+1 < encoded.length)
				encoded = "!" + thisEncoded;

			if(originalPattern != null) {
				const thisEncoded = getDiffString(pattern2str(originalPattern[instrumentKeys[i]], originalPattern.length*originalPattern.time), original);
				if(thisEncoded.length+1 < encoded.length) {
					encoded = "+"+thisEncoded;
				}
			}
		}

		ret[instrumentKeys[i]] = encoded;
	}

	if(originalPattern == null ? (pattern.time != 4) : (pattern.time != originalPattern.time)) {
		ret.time = pattern.time;
	}
	if(originalPattern == null || pattern.length != originalPattern.length) {
		ret.length = pattern.length;
	}
	if(originalPattern == null ? (pattern.upbeat != 0) : (pattern.upbeat != originalPattern.upbeat)) {
		ret.upbeat = pattern.upbeat;
	}

	return ret;
}

export type PatternSlice = Array<string> & {
	time: number,
	upbeat: number
};

export function splitPattern(pattern: Pattern, instrument: Instrument): Array<PatternSlice> {
	const ret: Array<PatternSlice> = [ ];
	let remaining = clone(pattern[instrument]);

	if(remaining.length > 0) {
		ret.push(Object.assign(remaining.slice(0, 4*pattern.time + pattern.upbeat), {
			time: pattern.time,
			upbeat: pattern.upbeat
		}));
		remaining = remaining.slice(4*pattern.time + pattern.upbeat);
	}

	while(remaining.length > 0) {
		ret.push(Object.assign(remaining.slice(0, 4*pattern.time), {
		    time: pattern.time,
		    upbeat: 0
        }));
		remaining = remaining.slice(4*pattern.time);
	}

	return ret;
}

export function patternEquals(pattern: Pattern, pattern2: Pattern): boolean {
	if(pattern.length != pattern2.length)
		return false;
	if(pattern.time != pattern2.time)
		return false;
	if(pattern.upbeat != pattern2.upbeat)
		return false;
	if(!isEqual(pattern.volumeHack, pattern2.volumeHack))
		return false;

	const length = pattern.length * pattern.time + pattern.upbeat;
	for(const instr of config.instrumentKeys) {
		if(pattern2str(pattern[instr] || [ ], length) != pattern2str(pattern2[instr] || [ ], length))
			return false;
	}
	return true;
}

/**
 * Uncompresses a pattern object created by `bbPattern.compress()`.
 * @param encodedPatternObject A compressed pattern object as returned by `bbPattern.compress()`
 * @param originalPattern The original pattern object, if it exists
 * @returns A pattern object with an array of strokes for each instrument and a length and time property
 */
export function patternFromCompressed(encodedPatternObject: CompressedPattern, originalPattern?: Pattern): Pattern {
	const ret: PatternOptional = (originalPattern != null ? clone(originalPattern) : { });

	if(encodedPatternObject.length != null)
		ret.length = encodedPatternObject.length;
	if(encodedPatternObject.time != null)
		ret.time = encodedPatternObject.time;
	else if(!originalPattern || !ret.time)
		ret.time = 4;
	if(encodedPatternObject.upbeat != null)
		ret.upbeat = encodedPatternObject.upbeat;
	else if(!originalPattern || !ret.upbeat)
		ret.upbeat = 0;
	if(encodedPatternObject.volumeHack != null)
		ret.volumeHack = encodedPatternObject.volumeHack;

	if(ret.length == null)
		throw new Error("No pattern length provided.");

	for(const instr of config.instrumentKeys) {
		const encoded = encodedPatternObject[instr];

		if(encodedPatternObject[instr]) {
			let encoded: string = encodedPatternObject[instr] as string;

			switch(encoded.charAt(0)) {
				case "!":
					encoded = applyDiffString("", encoded.substr(1), ret.length*ret.time + ret.upbeat);
					break;

				case "+":
					if(originalPattern == null)
						throw new Error("Could not apply diff as original pattern does not exist.");

					encoded = applyDiffString(pattern2str(originalPattern[instr], originalPattern.length*originalPattern.time), encoded.substr(1), ret.length*ret.time + ret.upbeat);
					break;

				case '@':
					const toInstr = encoded.substr(1, 2) as Instrument;
					encoded = applyDiffString(pattern2str(ret[toInstr] || [ ], ret.length*ret.time), encoded.substr(3), ret.length*ret.time + ret.upbeat);
					break;
			}

			ret[instr] = str2pattern(encoded);
		} else if(encoded == "")
			ret[instr] = [ ];
	}

	return normalizePattern(ret);
}

function pattern2str(pattern: Array<string>, length: number) {
	// Note: Cannot use pattern.map or pattern.forEach, as it skips undefined values

	let ret = "";
	for(let i=0; i<length; i++) {
		ret += pattern[i] || " ";
	}
	return ret;
}

function str2pattern(string: string): Array<string> {
	return string.split("");
}

export function updateStroke(pattern: Pattern, instrument: Instrument, i: number, stroke: string) {
	if(!pattern[instrument])
		Vue.set(pattern, instrument, []);
	Vue.set(pattern[instrument], i, stroke);
}

export function updatePattern(pattern: Pattern, update: PatternOptional) {
	vueSetMultiple(pattern, update);
}