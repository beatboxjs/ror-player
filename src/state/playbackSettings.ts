import config, { Instrument } from "../config";
import { clone, vueSetMultiple } from "../utils";
import Vue from "vue";

export type Headphones = Array<Instrument>;

export type Mute = { [instr in Instrument]?: boolean };

export type Metronome = false | 1 | 2; // 1: l on one, 2: whistle on all beats

export type Volumes = { [instr in Instrument]: number };

export type PlaybackSettings = {
    speed: number,
    headphones: Headphones,
    mute: Mute,
    volume: number,
    volumes: Volumes,
    loop: boolean,
    length?: number, // Cut off after a certain amount of beats
    metronome: Metronome
};

export type PlaybackSettingsOptional = {
	[i in keyof PlaybackSettings]?: PlaybackSettings[i]
};

export function normalizePlaybackSettings(data?: PlaybackSettingsOptional): PlaybackSettings {
	return Vue.observable({
		speed: config.defaultSpeed,
		headphones: [ ],
		mute: { },
		volume: 1,
		volumes: clone(config.volumePresets[Object.keys(config.volumePresets)[0]]),
		loop: false,
		length: undefined, // Cut off after a certain amount of beats
		metronome: false, // 1: Whistle on one, 2: whistle on all beats
		...clone(data || { })
	});
}

export function updatePlaybackSettings(playbackSettings: PlaybackSettings, update: PlaybackSettingsOptional) {
	vueSetMultiple(playbackSettings, update);
}