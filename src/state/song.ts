import { getPatternFromState, PatternOrTuneReference, PatternReference, State } from "./state";
import config, {Instrument} from "../config";
import { clone, getMaxIndex, numberToString, TypedInstrumentObject, TypedNumberObject } from "../utils";
import isEqual from "lodash.isequal";

type SongProperties = {
    name: string
};

type SongPropertiesOptional = {
	[i in keyof SongProperties]?: SongProperties[i]
};

export type SongPart = {
	[instr in Instrument]?: PatternReference;
};

export type SongParts = {
    [idx: number]: SongPart;
}

export type Song = SongProperties & SongParts;

export type SongOptional = SongPropertiesOptional & SongParts;

type CompressedSongBeat = string | PatternReference | TypedInstrumentObject<string | PatternReference>;

export type CompressedSong = {
	name: string,
	beats: Array<CompressedSongBeat> | TypedNumberObject<CompressedSongBeat>
};

type PatternIndexKeys = {
	[key: string]: PatternReference | null
};

export type CompressedSongs = {
	keys?: PatternIndexKeys,
	songs: Array<CompressedSong>
};

export function normalizeSong(data?: SongOptional): Song {
	return {
		name: "",
		...clone(data || {})
	};
}

export function getSongLength(song: Song): number {
	const maxIndex = getMaxIndex(song);
	return maxIndex == null ? 0 : maxIndex+1;
}

export function clearSong(song: Song): Song {
	return {
		name: song.name
	};
}

export function songContainsPattern(song: Song, tuneName: string, patternName: string): boolean {
	for(let i=0,length=getSongLength(song); i<=length; i++) {
		if(!song[i])
			continue;

		for(const instr of config.instrumentKeys) {
			if(song[i][instr] && song[i][instr][0] == tuneName && song[i][instr][1] == patternName)
				return true;
		}
	}

	return false;
}

export function getEffectiveSongLength(song: Song, state: State): number {
	const maxIndex = getSongLength(song) - 1;
	if(maxIndex == -1)
		return 0;

	let length = 1;
	for(const instr of config.instrumentKeys) {
		const pattern = getPatternFromState(state, song[maxIndex][instr]);
		if(pattern)
			length = Math.max(length, pattern.length/4);
	}
	return maxIndex + length;
}

export function replacePatternInSong(song: Song, fromTuneAndName: PatternOrTuneReference, toTuneAndName: PatternOrTuneReference | null): Song {
	song = clone(song);

	for(let i=0, length = getSongLength(song); i<length; i++) {
		if(!song[i])
			continue;

		for(const instr of config.instrumentKeys) {
			if(song[i][instr] && song[i][instr][0] == fromTuneAndName[0] && (fromTuneAndName[1] == null || song[i][instr][1] == fromTuneAndName[1])) {
				if(toTuneAndName == null)
					delete song[i][instr];
				else {
					song[i][instr][0] = toTuneAndName[0];
					if(toTuneAndName[1] != null)
						song[i][instr][1] = toTuneAndName[1];
				}
			}
		}

		if(Object.keys(song[i]).length == 0)
			delete song[i];
	}

	return song;
}

export function songEquals(song: Song, song2: Song, checkName?: boolean) {
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
	const emptyExists = false;
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
		const beatsObj: TypedNumberObject<CompressedSongBeat> = { };
		for(let beatIdx=0; beatIdx<length; beatIdx++) {
			const patterns: TypedInstrumentObject<string | PatternReference> = { } as any;
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
