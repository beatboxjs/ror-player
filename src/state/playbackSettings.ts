import config, { Instrument } from "../config";
import { clone } from "../utils";

export type Headphones = Array<Instrument>;

export type Mute = { [instr in Instrument]?: boolean };

export type Whistle = false | 1 | 2; // 1: Whistle on one, 2: whistle on all beats

export type Volumes = { [instr in Instrument]: number };

export type PlaybackSettings = {
    speed: number,
    headphones: Headphones,
    mute: Mute,
    volume: number,
    volumes: Volumes,
    loop: boolean,
    length?: number, // Cut off after a certain amount of beats
    whistle: Whistle
};

export type PlaybackSettingsOptional = {
	[i in keyof PlaybackSettings]?: PlaybackSettings[i]
};

export function normalizePlaybackSettings(data?: PlaybackSettingsOptional): PlaybackSettings {
	return {
		speed: config.defaultSpeed,
		headphones: [ ],
		mute: { },
		volume: 1,
		volumes: clone(config.volumePresets[Object.keys(config.volumePresets)[0]]),
		loop: false,
		length: undefined, // Cut off after a certain amount of beats
		whistle: false, // 1: Whistle on one, 2: whistle on all beats
		...clone(data || { })
	};
}

export function updatePlaybackSettings(playbackSettings: PlaybackSettings, update: PlaybackSettingsOptional) {
	return Object.assign(clone(playbackSettings), update);
}