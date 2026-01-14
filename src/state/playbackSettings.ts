import config, { instrumentValidator } from "../config";
import { clone } from "../utils";
import * as v from "valibot";

export type Headphones = v.InferOutput<typeof headphonesValidator>;
export const headphonesValidator = v.array(instrumentValidator);

export type Mute = v.InferOutput<typeof muteValidator>;
export const muteValidator = v.record(instrumentValidator, v.optional(v.boolean()));

export type Whistle = v.InferOutput<typeof whistleValidator>; // 1: Whistle on one, 2: whistle on all beats
export const whistleValidator = v.union([v.literal(false), v.literal(1), v.literal(2)]);

export type Volumes = v.InferOutput<typeof volumesValidator>;
export const volumesValidator = v.object(v.entriesFromList(instrumentValidator.options, v.number()));

export type PlaybackSettings = v.InferOutput<typeof playbackSettingsValidator>;
export const playbackSettingsValidator = v.optional(v.object({
	speed: v.optional(v.number(), config.defaultSpeed),
	headphones: v.optional(headphonesValidator, () => []),
	mute: v.optional(muteValidator, () => ({})),
	volume: v.optional(v.number(), 1),
	volumes: v.optional(volumesValidator, () => clone(config.volumePresets[Object.keys(config.volumePresets)[0]].volumes)),
	loop: v.optional(v.boolean(), false),
	length: v.optional(v.number()), // Cut off after a certain amount of beats
	whistle: v.optional(whistleValidator, false)
}), () => ({}));

type PlaybackSettingsOptional = v.InferInput<typeof playbackSettingsValidator>;

export function normalizePlaybackSettings(data?: PlaybackSettingsOptional): PlaybackSettings {
	return v.parse(playbackSettingsValidator, data);
}

export function updatePlaybackSettings(playbackSettings: PlaybackSettings, update: PlaybackSettingsOptional): void {
	Object.assign(playbackSettings, update);
}