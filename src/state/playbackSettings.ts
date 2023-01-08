import config, { instrumentValidator } from "../config";
import { clone, requiredRecordValidator } from "../utils";
import * as z from "zod";

export type Headphones = z.infer<typeof headphonesValidator>;
export const headphonesValidator = z.array(instrumentValidator);

export type Mute = z.infer<typeof muteValidator>;
export const muteValidator = z.record(instrumentValidator, z.boolean().optional());

export type Whistle = z.infer<typeof whistleValidator>; // 1: Whistle on one, 2: whistle on all beats
export const whistleValidator = z.union([z.literal(false), z.literal(1), z.literal(2)]);

export type Volumes = z.infer<typeof volumesValidator>;
export const volumesValidator = requiredRecordValidator(instrumentValidator.options, z.number());

export type PlaybackSettings = z.infer<typeof playbackSettingsValidator>;
export const playbackSettingsValidator = z.object({
	speed: z.number().default(config.defaultSpeed),
	headphones: headphonesValidator.default(() => []),
	mute: muteValidator.default(() => ({})),
	volume: z.number().default(1),
	volumes: volumesValidator.default(() => clone(config.volumePresets[Object.keys(config.volumePresets)[0]])),
	loop: z.boolean().default(false),
	length: z.number().optional(), // Cut off after a certain amount of beats
	whistle: whistleValidator.default(false)
}).default(() => ({}));

type PlaybackSettingsOptional = z.input<typeof playbackSettingsValidator>;

export function normalizePlaybackSettings(data?: PlaybackSettingsOptional): PlaybackSettings {
	return playbackSettingsValidator.parse(data);
}

export function updatePlaybackSettings(playbackSettings: PlaybackSettings, update: PlaybackSettingsOptional): void {
	Object.assign(playbackSettings, update);
}