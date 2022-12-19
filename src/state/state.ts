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
import Vue from "vue";

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
    let ret: State = Vue.observable({
		songs: [ ],
		tunes: { },
		songIdx: 0,
		playbackSettings: normalizePlaybackSettings({})
    });

    extendState(ret, data || { tunes: defaultTunes }, undefined, undefined, true, true);

    return ret;
}

export function extendState(
    state: State,
    data: StateOptional,
    selectSong?: (songIdx: number) => boolean,
    selectPattern?: (tuneName: string, patternName: string) => boolean,
    keepEmptyTunes?: boolean,
    importOptions?: boolean
): void {
    if(importOptions) {
        if(data.songIdx != null)
            Vue.set(state, "songIdx", data.songIdx);
        if(data.playbackSettings != null)
            Vue.set(state, "playbackSettings", normalizePlaybackSettings(data.playbackSettings));
    }

    if(data.tunes) {
        for(const tuneName in data.tunes) {
            const e = !!state.tunes[tuneName];
            if(!e) {
                Vue.set(state.tunes, tuneName, normalizeTune({
                    categories: data.tunes[tuneName].categories,
                    displayName: data.tunes[tuneName].displayName,
                    description: data.tunes[tuneName].description,
                    sheet: data.tunes[tuneName].sheet,
                    video: data.tunes[tuneName].video,
                    speed: data.tunes[tuneName].speed,
                    exampleSong: data.tunes[tuneName].exampleSong
                }));
            }

            extendTune(state.tunes[tuneName], data.tunes[tuneName], (patternName) => (!selectPattern || selectPattern(tuneName, patternName)));

            if(!e && Object.keys(state.tunes[tuneName].patterns).length == 0 && !keepEmptyTunes)
                Vue.delete(state.tunes, tuneName);
        }
    }

    if(data.songs) {
        for(let i=0; i<data.songs.length; i++) {
            if(!selectSong || selectSong(i))
                state.songs.push(normalizeSong(data.songs[i]));
        }
    }
}

export function extendStateFromCompressed(
    state: State,
    object: CompressedState,
    selectSong?: ((songIdx: number) => boolean) | null,
    selectPattern?: ((tuneName: string, patternName: string) => boolean) | null,
    keepEmptyTunes?: boolean,
    importOptions?: boolean,
    ignoreMissingDefaultPatterns?: boolean
): Array<string> {
    if(importOptions) {
        if(object.songIdx != null)
            Vue.set(state, "songIdx", object.songIdx);
        if(object.playbackSettings != null)
            Vue.set(state, "playbackSettings", normalizePlaybackSettings(object.playbackSettings));
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
                } catch(e: any) {
                    errors.push("Error importing " + patternName + " (" + tuneName + "): " + e.message);
                    console.error("Error importing " + patternName + " (" + tuneName + "): ", e);
                }
            }
        }

        extendState(state, { tunes: tunes }, undefined, undefined, keepEmptyTunes);
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

        extendState(state, { songs: songs });
    }

    return errors;
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

export function createSong(state: State, data?: SongOptional, idx?: number, select: boolean = false): void {
    if(idx == null)
        idx = state.songs.length;
    state.songs.splice(idx, 0, normalizeSong(data));

    if(select)
        Vue.set(state, "songIdx", idx);
}

export function removeSong(state: State, idx: number): void {
    state.songs.splice(idx, 1);

    if(state.songIdx >= state.songs.length)
        Vue.set(state, "songIdx", Math.max(0, state.songs.length-1));
}

export function songExists(state: State, song: Song): boolean {
    for(let i=0; i<state.songs.length; i++) {
        if(songEquals(state.songs[i], song))
            return true;
    }
    return false
}

function replacePattern(state: State, fromTuneAndName: PatternOrTuneReference, toTuneAndName: PatternOrTuneReference | null): void {
    for(let i=0; i<state.songs.length; i++) {
        replacePatternInSong(state.songs[i], fromTuneAndName, toTuneAndName);
    }
}

export function createTune(state: State, tuneName: string, data?: TuneOptional): void {
    Vue.set(state.tunes, tuneName, normalizeTune(data));
}

export function renameTune(state: State, tuneName: string, newTuneName: string): void {
    if (newTuneName != tuneName) {
        replacePattern(state, [ tuneName, null ], [ newTuneName, null ]);
        Vue.set(state.tunes, newTuneName, state.tunes[tuneName]);
        Vue.delete(state.tunes, tuneName);
    }
}

export function copyTune(state: State, tuneName: string, newTuneName: string): void {
    createTune(state, newTuneName, {
        ...clone(state.tunes[tuneName]),
        categories: undefined
    });
}

export function removeTune(state: State, tuneName: string): void {
    replacePattern(state, [ tuneName, null ], null);
    Vue.delete(state.tunes, tuneName);
}

export function createPattern(state: State, tuneName: string, patternName: string, data?: PatternOptional): void {
    if(!state.tunes[tuneName])
        createTune(state, tuneName);

    createPatternInTune(state.tunes[tuneName], patternName, data);
}

export function renamePattern(state: State, tuneName: string, patternName: string, newPatternName: string): void {
    replacePattern(state, [ tuneName, patternName ], [ tuneName, newPatternName ]);
    renamePatternInTune(state.tunes[tuneName], patternName, newPatternName);
}

export function removePattern(state: State, tuneName: string, patternName: string): void {
    replacePattern(state, [ tuneName, patternName ], null);
    removePatternFromTune(state.tunes[tuneName], patternName);
}

export function movePattern(state: State, fromTuneAndName: PatternReference, toTuneAndName: PatternReference): void {
    if (fromTuneAndName[0] == toTuneAndName[0] && fromTuneAndName[1] == toTuneAndName[1])
        return;

    if(!state.tunes[toTuneAndName[0]])
        createTune(state, toTuneAndName[0]);

    replacePattern(state, fromTuneAndName, toTuneAndName);
    createPatternInTune(state.tunes[toTuneAndName[0]], toTuneAndName[1], getPatternFromState(state, fromTuneAndName) || undefined);
    removePatternFromTune(state.tunes[fromTuneAndName[0]], fromTuneAndName[1]);
}

export function copyPattern(state: State, fromTuneAndName: PatternReference, toTuneAndName: PatternReference): void {
    if(!state.tunes[toTuneAndName[0]])
        createTune(state, toTuneAndName[0]);

    createPatternInTune(state.tunes[toTuneAndName[0]], toTuneAndName[1], getPatternFromState(state, fromTuneAndName) || undefined);
}

export function getSongName(state: State, songIdx?: number): string | null {
    if(songIdx == null)
        songIdx = state.songIdx;

    if(!state.songs[songIdx])
        return null;

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

export function selectSong(state: State, songIdx: number): void {
    Vue.set(state, "songIdx", songIdx);
}