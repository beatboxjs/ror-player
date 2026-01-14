import { getPatternFromState, PatternOrTuneReference, State } from "./state";
import config, {Instrument, instrumentValidator} from "../config";
import { getMaxIndex, numberRecordValidator, numberToString } from "../utils";
import { isEqual } from "lodash-es";
import * as v from "valibot";

export type PatternReference = v.InferOutput<typeof patternReferenceValidator>;
export const patternReferenceValidator = v.tuple([v.string(), v.string()]);

export type SongPart = v.InferOutput<typeof songPartValidator>;
export const songPartValidator = v.record(instrumentValidator, v.optional(patternReferenceValidator));

export type SongParts = v.InferOutput<typeof songPartsValidator>;
export const songPartsValidator = numberRecordValidator(songPartValidator);

export type Song = v.InferOutput<typeof songValidator>;
export const songValidator = v.optional(v.intersect([songPartsValidator, v.object({
	name: v.optional(v.string(), "")
})]), () => ({}));

/**
 * A single beat in a compressed song. Can be a pattern index from the pattern key index (see PatternIndexKeys below) or a full pattern reference,
 * for all instruments at once or by instrument key.
 */
type CompressedSongBeat = v.InferOutput<typeof compressedSongBeatValidator>;
const compressedSongBeatValidator = v.union([v.string(), patternReferenceValidator, v.object(v.entriesFromList(instrumentValidator.options, v.union([v.string(), patternReferenceValidator])))]);

export type CompressedSong = v.InferOutput<typeof compressedSongValidator>;
export const compressedSongValidator = v.object({
	name: v.string(),
	beats: v.union([v.array(compressedSongBeatValidator), numberRecordValidator(compressedSongBeatValidator)])
});

/** Maps a key to a pattern reference. The (short) key can be used in the compressed song instead of the full pattern reference. */
type PatternIndexKeys = v.InferOutput<typeof patternIndexKeysValidator>;
const patternIndexKeysValidator = v.record(v.string(), v.union([patternReferenceValidator, v.null()]));

/** An array of compressed songs, using a common pattern key index. */
export type CompressedSongs = v.InferOutput<typeof compressedSongsValidator>;
export const compressedSongsValidator = v.object({
	keys: v.optional(patternIndexKeysValidator),
	songs: v.array(compressedSongValidator)
});

export function normalizeSong(data?: v.InferInput<typeof songValidator>): Song {
	return v.parse(songValidator, data);
}

export function getSongLength(song: SongParts): number {
	const maxIndex = getMaxIndex(song);
	return maxIndex == null ? 0 : maxIndex+1;
}

export function clearSong(song: Song): void {
	for(const i of Object.keys(song).filter((i) => !["name"].includes(i)))
		delete song[i as any];
}

export function songContainsPattern(song: Song, tuneName: string, patternName: string): boolean {
	for(let i=0,length=getSongLength(song); i<=length; i++) {
		if(!song[i])
			continue;

		for(const instr of config.instrumentKeys) {
			const ref = song[i][instr];
			if(ref && ref[0] == tuneName && ref[1] == patternName)
				return true;
		}
	}

	return false;
}

export function getEffectiveSongLength(song: SongParts, state: State): number {
	const maxIndex = getSongLength(song) - 1;
	if(maxIndex == -1)
		return 0;

	let length = 1;
	for(const instr of config.instrumentKeys) {
		const ref = song[maxIndex][instr];
		const pattern = ref && getPatternFromState(state, ref);
		if(pattern)
			length = Math.max(length, pattern.length/4);
	}
	return maxIndex + length;
}

export function replacePatternInSong(song: Song, fromTuneAndName: PatternOrTuneReference, toTuneAndName: PatternOrTuneReference | null): void {
	for(let i=0, length = getSongLength(song); i<length; i++) {
		if(!song[i])
			continue;

		for(const instr of config.instrumentKeys) {
			const ref = song[i][instr];
			if(ref && ref[0] == fromTuneAndName[0] && (fromTuneAndName[1] == null || ref[1] == fromTuneAndName[1])) {
				if(toTuneAndName == null)
					delete song[i][instr];
				else {
					ref[0] = toTuneAndName[0];
					if(toTuneAndName[1] != null)
						ref[1] = toTuneAndName[1];
				}
			}
		}

		if(Object.keys(song[i]).length == 0)
			delete song[i];
	}
}

export function songEquals(song: Song, song2: Song, checkName?: boolean): boolean {
	if(checkName && song.name != song2.name)
		return false;

	const length = getSongLength(song);

	if(length != getSongLength(song2))
		return false;

	for(let i=0; i<length; i++) {
		if(!isEqual(song[i], song2[i]) && (song[i] != null || song2[i] != null))
			return false;
	}

	return true;
}

type PatternIndexPatterns<T> = {
	[tuneName: string]: {
		[patternName: string]: T
	}
};

type PatternIndex = {
	patterns: PatternIndexPatterns<string>;
	keys: PatternIndexKeys
};

/**
 * Creates an index for the used patterns in the given songs.
 * @param songs {array} An array of songs
 * @returns {object} { patterns: {object} A pattern-to-key index, where patterns[songName][patternName] contains the key,
  *                    keys: {object} A key-to-pattern index, where keys[key] is [songName, patternName]. }
 */
function makePatternIndex(songs: Song[]): PatternIndex {
	let number = 0;
	const numberIndex: PatternIndexPatterns<number> = { };
	for(let songIdx=0; songIdx<songs.length; songIdx++) {
		for(let beatIdx=0,length=getSongLength(songs[songIdx]); beatIdx<length; beatIdx++) {
			for(const inst of config.instrumentKeys) {
				let pattern = songs[songIdx][beatIdx] && songs[songIdx][beatIdx][inst];
				if(!pattern)
					pattern = [ "", "" ];
				if(!numberIndex[pattern[0]])
					numberIndex[pattern[0]] = { };
				if(!numberIndex[pattern[0]][pattern[1]]) {
					numberIndex[pattern[0]][pattern[1]] = number++;
				}
			}
		}
	}

	const bytes = numberToString(number).length;
	const stringIndex: PatternIndexPatterns<string> = { };
	const keys: PatternIndexKeys = { };
	for(const i in numberIndex) {
		stringIndex[i] = { };
		for(const j in numberIndex[i]) {
			stringIndex[i][j] = numberToString(numberIndex[i][j], bytes);
			keys[stringIndex[i][j]] = (i == "" && j == "" ? null : [ i, j ]);
		}
	}

	return { patterns: stringIndex, keys: keys };
}

export function compressSongs<T extends boolean>(songs: Array<Song>, encode: T): T extends true ? CompressedSongs : Array<CompressedSong>;
export function compressSongs(songs: Array<Song>, encode: boolean): CompressedSongs | Array<CompressedSong> {
	const index: PatternIndex | null = encode ? makePatternIndex(songs) : null;

	const encodedSongs: Array<CompressedSong> = new Array(songs.length);
	for(let songIdx=0; songIdx<songs.length; songIdx++) {
		const length = getSongLength(songs[songIdx]);
		const beatsArr: Array<CompressedSongBeat> = new Array(length);
		const beatsObj: Record<number, CompressedSongBeat> = { };
		for(let beatIdx=0; beatIdx<length; beatIdx++) {
			const patterns: Record<Instrument, string | PatternReference> = { } as any;
			let allSame: any = null;
			for(const instr of config.instrumentKeys) {
				const p = songs[songIdx][beatIdx] && songs[songIdx][beatIdx][instr] || [ "", "" ];
				const key = index ? index.patterns[p[0]][p[1]] : p;

				if(allSame == null)
					allSame = key;
				else if(!isEqual(allSame, key))
					allSame = false;

				if(p[0] != "")
					patterns[instr] = key;
			}

			beatsArr[beatIdx] = allSame ? allSame : patterns;
			if(!allSame || (index ? index.keys[allSame] != null : !isEqual(allSame, [ "", "" ])))
				beatsObj[beatIdx] = allSame ? allSame : patterns;
		}

		encodedSongs[songIdx] = {
			name: songs[songIdx].name,
			beats: JSON.stringify(beatsObj).length < JSON.stringify(beatsArr).length ? beatsObj : beatsArr
		};
	}

	if(index)
		return { keys: index.keys, songs: encodedSongs };
	else
		return encodedSongs;
}

export function uncompressSongs(encodedSongs: CompressedSongs | Array<CompressedSong>): Array<Song> {
	const encoded: CompressedSongs = "songs" in encodedSongs ? encodedSongs : { songs: encodedSongs };

	const songs = new Array(encoded.songs.length);
	encoded.songs.forEach(function(song, songIdx) {
		songs[songIdx] = normalizeSong();
		songs[songIdx].name = song.name;

		const maxIdx = Array.isArray(song.beats) ? song.beats.length-1 : (getMaxIndex(song.beats) || -1);

		for(let beatIdx = 0; beatIdx <= maxIdx; beatIdx++) {
			const beat = song.beats[beatIdx];
			if(!beat)
				continue;

			songs[songIdx][beatIdx] = { };
			if(typeof beat == "string" || Array.isArray(beat)) {
				const decodedBeat = Array.isArray(beat) ? beat : (encoded.keys && encoded.keys[beat]);
				if(decodedBeat != null) {
					for(const instr of config.instrumentKeys)
						songs[songIdx][beatIdx][instr] = decodedBeat;
				}
			} else {
				for(const instr of Object.keys(beat) as Instrument[]) {
					const thisBeat = beat[instr];
					const decodedBeat = Array.isArray(thisBeat) ? thisBeat : (encoded.keys && encoded.keys[thisBeat]);
					if(decodedBeat != null)
						songs[songIdx][beatIdx][instr] = decodedBeat;
				}
			}
		}
	});
	return songs;
}

export function appendSongPart(song: Song, songPart: SongPart, state: State): void {
	const newIdx = getEffectiveSongLength(song, state);
	song[newIdx] = songPart;
}

export function deleteSongPart(song: Song, idx: number, instr: Instrument): void {
	delete song[idx][instr];
	if(Object.keys(song[idx]).length == 0)
		delete song[idx];
}

export function setSongPart(song: Song, idx: number, instr: Instrument, pattern: PatternReference): void {
	if(!song[idx])
		song[idx] = {};
	song[idx][instr] = pattern;
}

export function updateSong(song: Song, update: Partial<Song>): void {
	Object.assign(song, update);
}

export function allInstruments(patternReference: PatternReference, instruments = config.instrumentKeys): SongPart {
	const result = { } as SongPart;
	for(const instr of instruments) {
		result[instr] = patternReference;
	}
	return result;
}