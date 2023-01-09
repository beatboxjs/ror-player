import { LegacyVolumeHack } from "./state/pattern";

export function stretch(from: number, to: number, pattern: string): string {
	return pattern.split("").concat([""]).join(repeat((to / from) - 1, " "));
}

export function repeat(n: number, pattern: string): string {
	let ret = "";
	for (let i = 0; i < n; i++)
		ret += pattern;
	return ret;
}

export function crescendo(length: number, start: number = 0): LegacyVolumeHack {
	const r: LegacyVolumeHack = {};
	const a = .05;
	const b = (1 - a) / (length - 1);
	for (let i = 0; i < length; i++)
		r[start + i] = a + b * i;
	return r;
}

export function decrescendo(length: number): LegacyVolumeHack {
	const r: LegacyVolumeHack = {};
	const b = 0.95 / (length - 1);
	for (let i = 0; i < length; i++)
		r[i] = 1 - b * i;
	return r;
}
