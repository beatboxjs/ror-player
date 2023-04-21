import pako from "pako";
import Beatbox, { InstrumentReferenceObject, Pattern as RawPattern } from "beatbox.js";
import audioFiles from "../../dist/audioFiles";
import config, { Instrument } from "../config";
import { Headphones, Mute, normalizePlaybackSettings, PlaybackSettings, Metronome } from "../state/playbackSettings";
import { normalizePattern, Pattern } from "../state/pattern";
import { getPatternFromState, State } from "../state/state";
import { getEffectiveSongLength, Song, SongParts } from "../state/song";
import { decode } from "base64-arraybuffer";

export interface BeatboxReference {
	id: number,
	playing: boolean,
	customPosition: boolean
}

export interface RawPatternWithUpbeat extends RawPattern {
	upbeat: number
}

for(const i in audioFiles) {
	const decompressed = pako.inflateRaw(new Uint8Array(decode(audioFiles[i])));
	Beatbox.registerInstrument(i.replace(/\.mp3$/i, ""), decompressed.buffer);
}

let currentNumber = 0;

const players: {
	[id: number]: Beatbox;
} = { };

class CustomBeatbox extends Beatbox {
	setPosition(position: number) {
		super.setPosition(position);
		this.emit("setPosition");
	}
}

export function createBeatbox(repeat: boolean): BeatboxReference {
	const reference: BeatboxReference = {
		id: currentNumber++,
		playing: false,
		customPosition: false
	};

	const player = new CustomBeatbox([ ], 1, repeat);
	player.on("play", () => {
		reference.playing = true;
		reference.customPosition = true;
	});
	player.on("stop", () => {
		reference.playing = false;
		reference.customPosition = player._position != 0;
	});
	player.on("setPosition", () => {
		reference.customPosition = reference.playing || player._position != 0
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

function toSoundName(instr: string, stroke: string){
	return `${instr}_${stroke.charCodeAt(0).toString(16)}`
}

export function patternToBeatbox(pattern: Pattern, playbackSettings: PlaybackSettings): RawPatternWithUpbeat {
	const fac = config.playTime/pattern.time;
	const ret: RawPattern = new Array((pattern.length*pattern.time + pattern.upbeat) * fac);

	let vol = { } as Record<Instrument, number>;
	for (const instr of config.instrumentKeys) {
		vol[instr] = 1;
	}

	for(let i=0; i<pattern.length*pattern.time+pattern.upbeat; i++) {
		if (pattern.volumeHack) {
			for (const instr of Object.keys(pattern.volumeHack) as Instrument[]) {
				if (pattern.volumeHack[instr] && pattern.volumeHack[instr]![i] != null)
					vol[instr] = pattern.volumeHack[instr]![i];
			}
		}

		const stroke = [ ];

		if(playbackSettings.metronome && i >= pattern.upbeat && (i-pattern.upbeat) % (4*pattern.time) == 0)
			stroke.push({ instrument: playbackSettings.metronome == 2 ? toSoundName("ot", "a") : toSoundName("ot", "b"), volume: playbackSettings.volume  * 0.25});
		else if(playbackSettings.metronome == 2 && i >= pattern.upbeat && (i-pattern.upbeat) % pattern.time == 0)
			stroke.push({ instrument: toSoundName("ot", "b"), volume: playbackSettings.volume * 0.25});

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
					stroke.push({ instrument: toSoundName(instr, strokeType), volume: vol[instr] * playbackSettings.volume * (playbackSettings.volumes[instr] == null ? 1 : playbackSettings.volumes[instr]) });
			}
		}

		ret[i*fac] = stroke;
	}

	return Object.assign(ret, {
		upbeat: pattern.upbeat * fac
	});
}

export function songToBeatbox(song: SongParts, state: State, playbackSettings: PlaybackSettings): RawPatternWithUpbeat {
	const length = getEffectiveSongLength(song, state);
	let maxUpbeat = config.playTime*4;
	let ret: RawPattern = new Array(maxUpbeat + length*config.playTime*4);
	let upbeat = 0;

	function insertPattern(idx: number, pattern: Pattern, instrumentKey: Instrument, patternLength: number, whistle: Metronome) {
		let patternBeatbox = patternToBeatbox(pattern, normalizePlaybackSettings({
			headphones: [ instrumentKey ],
			volume: playbackSettings.volume,
			volumes: playbackSettings.volumes,
			metronome: whistle
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
			if(isEnabled(inst, playbackSettings.headphones, playbackSettings.mute) && song[i] && song[i][inst]) {
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

		if(playbackSettings.metronome) {
			insertPattern(i, normalizePattern({
				length: 4,
				time: 1,
				upbeat: 0,
				ot: [ ' ', ' ', ' ', ' ' ]
			}), "ot", 1, playbackSettings.metronome);
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