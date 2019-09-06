import pako from "pako";
import Beatbox, { InstrumentReferenceObject, Pattern as RawPattern } from "beatbox.js";
import audioFiles from "../../build/audioFiles";
import config, { Instrument } from "../config";
import { Headphones, Mute, normalizePlaybackSettings, PlaybackSettings, Whistle } from "../state/playbackSettings";
import { normalizePattern, Pattern } from "../state/pattern";
import { getPatternFromState, State } from "../state/state";
import { getEffectiveSongLength } from "../state/song";

export interface BeatboxReference {
	id: number,
	playing: boolean
}

export interface RawPatternWithUpbeat extends RawPattern {
	upbeat: number
}

for(const i in audioFiles) {
	const decompressed = String.fromCharCode.apply(null, pako.inflateRaw(atob(audioFiles[i])) as any);
	Beatbox.registerInstrument(i.replace(/\.mp3$/i, ""), { src: [ "data:audio/mp3;base64," + btoa(decompressed) ] });
}

let currentNumber = 0;

const players: {
	[id: number]: Beatbox;
} = { };

export function createBeatbox(repeat: boolean): BeatboxReference {
	const reference: BeatboxReference = {
		id: currentNumber++,
		playing: false
	};

	const player = new Beatbox([ ], 1, repeat);
	player.on("play", () => {
		reference.playing = true;
	});
	player.on("stop", () => {
		reference.playing = false;
	});
	players[reference.id] = player;

	return reference;
}

function isEnabled(instr: Instrument, headphones: Headphones, mute: Mute) {
	if(mute[instr])
		return false;

	if(headphones && headphones.length > 0)
		return headphones.includes(instr);

	return true;
}

export function patternToBeatbox(pattern: Pattern, playbackSettings: PlaybackSettings): RawPatternWithUpbeat {
	const fac = config.playTime/pattern.time;
	const ret: RawPattern = new Array((pattern.length*pattern.time + pattern.upbeat) * fac);
	let vol = 1;
	for(let i=0; i<pattern.length*pattern.time+pattern.upbeat; i++) {
		if(pattern.volumeHack && pattern.volumeHack[i] != null)
			vol = pattern.volumeHack[i];

		const stroke = [ ];

		if(playbackSettings.whistle && i >= pattern.upbeat && (i-pattern.upbeat) % (4*pattern.time) == 0)
			stroke.push({ instrument: playbackSettings.whistle == 2 ? "ot_y" : "ot_w", volume: playbackSettings.volume});
		else if(playbackSettings.whistle == 2 && i >= pattern.upbeat && (i-pattern.upbeat) % pattern.time == 0)
			stroke.push({ instrument: "ot_w", volume: playbackSettings.volume});

		for(const instr of config.instrumentKeys) {
			if(isEnabled(instr, playbackSettings.headphones, playbackSettings.mute) && pattern[instr]) {
				let strokeType = pattern[instr][i];

				if(playbackSettings.loop) {
					// Put upbeat at the end of pattern

					let upbeatStart = pattern[instr].slice(0, pattern.upbeat).findIndex((stroke) => (stroke && stroke != " "));
					if(upbeatStart != -1 && i >= pattern.length * pattern.time + upbeatStart)
						strokeType = pattern[instr][i - pattern.length * pattern.time];
				}

				if(strokeType && strokeType != " ")
					stroke.push({ instrument: instr+"_"+strokeType, volume: vol * playbackSettings.volume * (playbackSettings.volumes[instr] == null ? 1 : playbackSettings.volumes[instr]) });
			}
		}

		ret[i*fac] = stroke;
	}

	return Object.assign(ret, {
		upbeat: pattern.upbeat * fac
	});
}

export function songToBeatbox(state: State): RawPatternWithUpbeat {
	const song = state.songs[state.songIdx];
	const length = getEffectiveSongLength(song, state);
	let maxUpbeat = config.playTime*4;
	let ret: RawPattern = new Array(maxUpbeat + length*config.playTime*4);
	let upbeat = 0;

	function insertPattern(idx: number, pattern: Pattern, instrumentKey: Instrument, patternLength: number, whistle: Whistle) {
		let patternBeatbox = patternToBeatbox(pattern, normalizePlaybackSettings({
			headphones: [ instrumentKey ],
			volume: state.playbackSettings.volume,
			volumes: state.playbackSettings.volumes,
			whistle
		}));

		let upbeatHasStarted = false;
		let idxOffset = pattern.upbeat * config.playTime / pattern.time;
		idx = idx*config.playTime*4;
		for(let i = 0; i<(patternLength*config.playTime*4 + idxOffset); i++) {
			if((patternBeatbox[i] || []).length > 0)
				upbeatHasStarted = true;

			upbeat = Math.max(upbeat, idxOffset - idx - i);

			let existingStrokes = (ret[maxUpbeat + idx + i - idxOffset] || [ ]);
			if(upbeatHasStarted && i - idxOffset < 0)
				existingStrokes = existingStrokes.filter((instr) => ((instr as InstrumentReferenceObject).instrument.split("_", 2)[0] != instrumentKey));
			ret[maxUpbeat + idx + i - idxOffset] = existingStrokes.concat(patternBeatbox[i] || [ ]);
		}
	}

	for(let i=0; i<length; i++) {
		for(const inst of config.instrumentKeys) {
			if(isEnabled(inst, state.playbackSettings.headphones, state.playbackSettings.mute) && song[i] && song[i][inst]) {
				const patternReference = song[i][inst];
				const pattern = patternReference && getPatternFromState(state, patternReference);
				if(pattern) {
					let patternLength = 1;
					for(let j=i+1; j<i+pattern.length/4 && (!song[j] || !song[j][inst]); j++) // Check if pattern is cut off
						patternLength++;

					insertPattern(i, pattern, inst, patternLength, false);
				}
			}
		}

		if(state.playbackSettings.whistle) {
			insertPattern(i, normalizePattern({
				length: 4,
				time: 1,
				upbeat: 0,
				ot: [ ' ', ' ', ' ', ' ' ]
			}), "ot", 1, state.playbackSettings.whistle);
		}
	}

	return Object.assign(ret.slice(maxUpbeat - upbeat), {
		upbeat
	});
}

export function stopAllPlayers(): void {
	for(const id of Object.keys(players) as unknown as number[]) {
		players[id].stop();
	}
}

export function getPlayerById(id: number): Beatbox {
	return players[id] || null;
}