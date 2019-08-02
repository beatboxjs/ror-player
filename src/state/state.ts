import {
    normalizePlaybackSettings,
    PlaybackSettings,
    PlaybackSettingsOptional,
    updatePlaybackSettings,
    Volumes
} from "./playbackSettings";
import {
    CompressedSong,
    CompressedSongs,
    compressSongs, getSongLength,
    normalizeSong, replacePatternInSong,
    Song,
    songContainsPattern, songEquals,
    SongOptional,
    uncompressSongs
} from "./song";
import {
    createPatternInTune,
    extendTune,
    normalizeTune,
    removePatternFromTune,
    renamePatternInTune,
    Tune,
    TuneOptional
} from "./tune";
import { clone } from "../utils";
import defaultTunes from "../defaultTunes";
import {
    CompressedPattern,
    compressPattern,
    Pattern,
    patternFromCompressed,
    PatternOptional, updatePattern,
    updateStroke
} from "./pattern";
import config, { Instrument } from "../config";

export type State = {
	songs: Array<Song>,
	tunes: {
	    [tuneName: string]: Tune
    },
	songIdx: number,
	playbackSettings: PlaybackSettings
};

export type StateOptional = {
    [i in keyof State]?: State[i]
};

export type PatternReference = [string, string];

export type PatternOrTuneReference = [string, string | null];

export type CompressedState = {
    patterns?: {
        [tuneName: string]: {
            [patternName: string]: CompressedPattern
        }
    },
    songs?: CompressedSongs | Array<CompressedSong>,
    songIdx?: number,
    playbackSettings?: PlaybackSettings
}

export function normalizeState(data?: StateOptional): State {
    let ret: State = {
		songs: [ ],
		tunes: { },
		songIdx: 0,
		playbackSettings: normalizePlaybackSettings({})
    };

    ret = extendState(ret, data || { tunes: defaultTunes }, undefined, undefined, true, true);

    return ret;
}

export function extendState(
    state: State,
    data: StateOptional,
    selectSong?: (songIdx: number) => boolean,
    selectPattern?: (tuneName: string, patternName: string) => boolean,
    keepEmptyTunes?: boolean,
    importOptions?: boolean
): State {
    state = clone(state);

    if(importOptions) {
        if(data.songIdx != null)
            state.songIdx = data.songIdx;
        if(data.playbackSettings != null)
            state.playbackSettings = normalizePlaybackSettings(data.playbackSettings);
    }

    if(data.tunes) {
        for(const tuneName in data.tunes) {
            const e = !!state.tunes[tuneName];
            if(!e) {
                state.tunes[tuneName] = normalizeTune({
                    categories: data.tunes[tuneName].categories,
                    displayName: data.tunes[tuneName].displayName,
                    description: data.tunes[tuneName].description,
                    sheet: data.tunes[tuneName].sheet,
                    speed: data.tunes[tuneName].speed
                });
            }

            state.tunes[tuneName] = extendTune(state.tunes[tuneName], data.tunes[tuneName], (patternName) => (!selectPattern || selectPattern(tuneName, patternName)));

            if(!e && Object.keys(state.tunes[tuneName].patterns).length == 0 && !keepEmptyTunes)
                delete state.tunes[tuneName];
        }
    }

    if(data.songs) {
        for(let i=0; i<data.songs.length; i++) {
            if(!selectSong || selectSong(i))
                state.songs.push(normalizeSong(data.songs[i]));
        }
    }

    return state;
}

export function extendStateFromCompressed(
    state: State,
    object: CompressedState,
    selectSong?: ((songIdx: number) => boolean) | null,
    selectPattern?: ((tuneName: string, patternName: string) => boolean) | null,
    keepEmptyTunes?: boolean,
    importOptions?: boolean,
    ignoreMissingDefaultPatterns?: boolean
): {
    state: State,
    errors: Array<string>
}{
    state = clone(state);

    if(importOptions) {
        if(object.songIdx != null)
            state.songIdx = object.songIdx;
        if(object.playbackSettings != null)
            state.playbackSettings = normalizePlaybackSettings(object.playbackSettings);
    }

    const errors: Array<string> = [ ];
    if(object.patterns) {
        const tunes: { [tuneName: string]: Tune } = { };
        for(const tuneName in object.patterns) {
            tunes[tuneName] = normalizeTune({});
            for(const patternName in object.patterns[tuneName]) {
                if(selectPattern && !selectPattern(tuneName, patternName))
                    continue;

                try {
                    tunes[tuneName].patterns[patternName] = patternFromCompressed(object.patterns[tuneName][patternName], defaultTunes.getPattern(tuneName, patternName) || undefined);
                } catch(e) {
                    errors.push("Error importing " + patternName + " (" + tuneName + "): " + e.message);
                    console.error("Error importing " + patternName + " (" + tuneName + "): ", e);
                }
            }
        }

        state = extendState(state, { tunes: tunes }, undefined, undefined, keepEmptyTunes);
    }

    if(object.songs) {
        const songs = uncompressSongs(object.songs);

        for (const song of songs) {
            const missing: Array<string> = [ ];
            for(let beatIdx = 0, length = getSongLength(song); beatIdx < length; beatIdx++) {
                if(!song[beatIdx])
                    continue;

                for(const instr of config.instrumentKeys) {
                    const pattern = song[beatIdx][instr];
                    if(!pattern)
                        continue;

                    const thisMissing = (!getPatternFromState(state, pattern) && (!ignoreMissingDefaultPatterns || !defaultTunes.getPattern(pattern)));
                    if(thisMissing && missing.indexOf(pattern.join(" (") +")") == -1)
                        missing.push(pattern.join(" (") +")");
                }
            }

            if(missing.length > 0)
                errors.push("Warning: The following tunes/breaks are used in song “" + (song.name || "Untitled song") + "” but could not be imported: " + missing.join(", "));
        }

        state = extendState(state, { songs: songs });
    }

    return { state, errors };
}

export function stateContainsPattern(state: State, tuneName: string, patternName: string): boolean {
    return state.songs.some((song) => songContainsPattern(song, tuneName, patternName));
}

export function getPatternFromState(state: State, tuneName: string, patternName: string): Pattern | null;
export function getPatternFromState(state: State, patternReference: PatternReference): Pattern | null;
export function getPatternFromState(state: State, tuneName: string|PatternReference, patternName?: string) {
    if(Array.isArray(tuneName)) {
        patternName = tuneName[1];
        tuneName = tuneName[0];
    }

    // @ts-ignore: patternName can theoretically be undefined
    return state.tunes[tuneName] && state.tunes[tuneName].patterns[patternName];
}

export function compressState(
    state: State,
    selectSong?: ((idx: number) => boolean) | null,
    selectPattern?: ((tuneName: string, patternName: string) => boolean) | null,
    encode?: boolean,
    keepEmptyTunes?: boolean,
    saveOptions?: boolean
): CompressedState {
    const ret: CompressedState = { patterns: { } };

    const songs = selectSong ? state.songs.filter((song, songIdx) => selectSong(songIdx)) : state.songs;
    if(songs.length > 0)
        ret.songs = compressSongs(songs, !!encode);

    for(const tuneName in state.tunes) {
        const encodedPatterns: { [patternName: string]: CompressedPattern } = { };
        for(const patternName in state.tunes[tuneName].patterns) {
            if(selectPattern && !selectPattern(tuneName, patternName) && !songs.some((song) => songContainsPattern(song, tuneName, patternName)))
                continue;

            const originalPattern = defaultTunes.getPattern(tuneName, patternName);
            const encodedPattern = compressPattern(state.tunes[tuneName].patterns[patternName], originalPattern || undefined, encode);
            if(Object.keys(encodedPattern).length > 0)
                encodedPatterns[patternName] = encodedPattern;
        }
        if(keepEmptyTunes || Object.keys(encodedPatterns).length > 0) {
            // @ts-ignore ret.patterns cannot be null
            ret.patterns[tuneName] = encodedPatterns;
        }
    }

    // @ts-ignore ret.patterns cannot be null
    if(Object.keys(ret.patterns).length == 0)
        delete ret.patterns;

    if(saveOptions) {
        ret.songIdx = state.songIdx;
        ret.playbackSettings = state.playbackSettings;
    }

    return ret;
}

export function createSong(state: State, data?: SongOptional, idx?: number, select: boolean = false): State {
    state = clone(state);

    if(idx == null)
        idx = state.songs.length;
    state.songs.splice(idx, 0, normalizeSong(data));

    if(select)
        state.songIdx = idx;

    return state;
}

export function removeSong(state: State, idx: number): State {
    state = clone(state);

    state.songs.splice(idx, 1);

    if(state.songIdx >= state.songs.length)
        state.songIdx = Math.max(0, state.songs.length-1);

    return state;
}

export function songExists(state: State, song: Song): boolean {
    for(let i=0; i<state.songs.length; i++) {
        if(songEquals(state.songs[i], song))
            return true;
    }
    return false
}

function replacePattern(state: State, fromTuneAndName: PatternOrTuneReference, toTuneAndName: PatternOrTuneReference | null): State {
    state = clone(state);
    for(let i=0; i<state.songs.length; i++) {
        state.songs[i] = replacePatternInSong(state.songs[i], fromTuneAndName, toTuneAndName);
    }
    return state;
}

export function createTune(state: State, tuneName: string, data?: TuneOptional): State {
    state = clone(state);
    state.tunes[tuneName] = normalizeTune(data);
    return state;
}

export function renameTune(state: State, tuneName: string, newTuneName: string): State {
    if (newTuneName != tuneName) {
        state = replacePattern(state, [ tuneName, null ], [ newTuneName, null ]);
        state.tunes[newTuneName] = state.tunes[tuneName];
        delete state.tunes[tuneName];
    }
    return state;
}

export function copyTune(state: State, tuneName: string, newTuneName: string): State {
    return createTune(state, newTuneName, {
        ...clone(state.tunes[tuneName]),
        categories: undefined
    });
}

export function removeTune(state: State, tuneName: string): State {
    state = replacePattern(state, [ tuneName, null ], null);
    delete state.tunes[tuneName];
    return state;
}

export function createPattern(state: State, tuneName: string, patternName: string, data?: PatternOptional): State {
    if(!state.tunes[tuneName])
        state = createTune(state, tuneName);
    else
        state = clone(state);

    state.tunes[tuneName] = createPatternInTune(state.tunes[tuneName], patternName, data);
    return state;
}

export function renamePattern(state: State, tuneName: string, patternName: string, newPatternName: string): State {
    state = replacePattern(state, [ tuneName, patternName ], [ tuneName, newPatternName ]);
    state.tunes[tuneName] = renamePatternInTune(state.tunes[tuneName], patternName, newPatternName);
    return state;
}

export function removePattern(state: State, tuneName: string, patternName: string): State {
    state = replacePattern(state, [ tuneName, patternName ], null);
    removePatternFromTune(state.tunes[tuneName], patternName);
    return state;
}

export function movePattern(state: State, fromTuneAndName: PatternReference, toTuneAndName: PatternReference): State {
    if (fromTuneAndName[0] == toTuneAndName[0] && fromTuneAndName[1] == toTuneAndName[1])
        return state;

    if(!state.tunes[toTuneAndName[0]])
        state = createTune(state, toTuneAndName[0]);

    state = replacePattern(state, fromTuneAndName, toTuneAndName);
    state.tunes[toTuneAndName[0]] = createPatternInTune(state.tunes[toTuneAndName[0]], toTuneAndName[1], getPatternFromState(state, fromTuneAndName) || undefined);
    state.tunes[toTuneAndName[0]] = removePatternFromTune(state.tunes[fromTuneAndName[0]], fromTuneAndName[1]);

    return state;
}

export function copyPattern(state: State, fromTuneAndName: PatternReference, toTuneAndName: PatternReference): State {
    if(!state.tunes[toTuneAndName[0]])
        state = createTune(state, toTuneAndName[0]);
    else
        state = clone(state);

    state.tunes[toTuneAndName[0]] = createPatternInTune(state.tunes[toTuneAndName[0]], toTuneAndName[1], getPatternFromState(state, fromTuneAndName) || undefined);

    return state;
}

export function getSongName(state: State, songIdx?: number): string {
    if(songIdx == null)
        songIdx = state.songIdx;

    if(state.songs[songIdx].name && state.songs[songIdx].name.trim())
        return state.songs[songIdx].name;

    let no = 1;
    for(let i=0; i<songIdx; i++) {
        if(!state.songs[i].name || !state.songs[i].name.trim())
            no++;
    }

    return "Untitled song "+no;
}

export function getSortedTuneList(state: State): Array<string> {
    return Object.keys(state.tunes).sort(function(a, b) {
        const idx1 = defaultTunes.firstInSorting.indexOf(a);
        const idx2 = defaultTunes.firstInSorting.indexOf(b);

        if(idx1 != -1 && idx2 != -1)
            return idx1-idx2;
        else if(idx1 != -1)
            return -1;
        else if(idx2 != -1)
            return 1;
        else
            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    });
}

export function updatePlaybackSettingsInState(state: State, update: PlaybackSettingsOptional): State {
    state = clone(state);
    state.playbackSettings = updatePlaybackSettings(state.playbackSettings, update);
    return state;
}

export function updateStrokeInState(state: State, tuneName: string, patternName: string, instrument: Instrument, idx: number, stroke: string) {
    const oldPattern = getPatternFromState(state, tuneName, patternName);
    if(oldPattern == null)
        throw new Error("Could not find pattern.");
    return createPattern(state, tuneName, patternName, updateStroke(oldPattern, instrument, idx, stroke));
}

export function updatePatternInState(state: State, tuneName: string, patternName: string, update: PatternOptional) {
    const oldPattern = getPatternFromState(state, tuneName, patternName);
    if(oldPattern == null)
        throw new Error("Could not find pattern.");
    return createPattern(state, tuneName, patternName, updatePattern(oldPattern, update));
}

export function replaceSong(state: State, songIdx: number, song: Song): State {
    state = clone(state);
    state.songs[songIdx] = song;
    return state;
}

export function selectSong(state: State, songIdx: number): State {
    state = clone(state);
    state.songIdx = songIdx;
    return state;
}