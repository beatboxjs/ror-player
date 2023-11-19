import { expect, test } from "vitest";
import { normalizePattern } from "../pattern";

test('normalizePattern', () => {
	expect(normalizePattern()).toEqual({
		length: 4,
		time: 4,
		speed: 100,
		upbeat: 0,
		loop: false,
		ls: [],
		ms: [],
		hs: [],
		re: [],
		sn: [],
		ta: [],
		ag: [],
		sh: [],
		ot: []
	});

	// Test legacy volume hack
	expect(normalizePattern({
		volumeHack: { 1: 0.1, 2: 0.2 }
	})).toMatchObject({
		volumeHack: {
			ls: { 1: 0.1, 2: 0.2 },
			ms: { 1: 0.1, 2: 0.2 },
			hs: { 1: 0.1, 2: 0.2 },
			re: { 1: 0.1, 2: 0.2 },
			sn: { 1: 0.1, 2: 0.2 },
			ta: { 1: 0.1, 2: 0.2 },
			ag: { 1: 0.1, 2: 0.2 },
			sh: { 1: 0.1, 2: 0.2 },
			ot: { 1: 0.1, 2: 0.2 }
		}
	});
});
