import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp, defineComponent, h, nextTick, ref } from "vue";
import type { State } from "../../../state/state";
import type { ExampleSong } from "../../../state/tune";
import config, { Instrument } from "../../../config";
import { provideState } from "../../../services/state";
import ExampleSongPlayer from "../example-song-player.vue";
import { normalizePattern } from "../../../state/pattern";

vi.mock("../../../services/i18n", () => ({
	useI18n: () => ({ t: (key: string) => key }),
	getLocalizedDisplayName: (value: string) => value
}));

vi.mock("beatbox.js", () => {
	class MockBeatbox {
		static registerInstrument = vi.fn();

		playing = false;
		_position = 0;
		_events: Record<string, Array<(...args: unknown[]) => void>> = {};

		constructor() {}

		on(event: string, handler: (...args: unknown[]) => void) {
			(this._events[event] ||= []).push(handler);
		}

		emit(event: string, ...args: unknown[]) {
			for (const handler of this._events[event] || [])
				handler(...args);
		}

		play() {
			this.playing = true;
			this.emit("play");
		}

		stop() {
			this.playing = false;
			this.emit("stop");
		}

		setPosition(position: number) {
			this._position = position;
			this.emit("setPosition");
		}
	}

	return { default: MockBeatbox };
});

const createVolumes = (): Record<Instrument, number> => Object.fromEntries(
	config.instrumentKeys.map((instrument) => [instrument, 1])
) as Record<Instrument, number>;

function createMockState(): State {
	const introPattern = normalizePattern();
	introPattern.displayName = "Intro DisplayName";
	introPattern.ls = ["X", " ", " ", " "];

	return {
		tunes: {
			"My Tune": {
				displayName: "My Tune DisplayName",
				categories: [],
				patterns: {
					"Intro": introPattern
				}
			}
		},
		songs: [],
		songIdx: 0,
		playbackSettings: {
			speed: 100,
			headphones: [],
			mute: {},
			volume: 1,
			volumes: createVolumes(),
			loop: false,
			whistle: false
		}
	};
}

async function mountExampleSongPlayer(state: State, props: { tuneName: string; song: ExampleSong }) {
	const container = document.createElement("div");
	document.body.appendChild(container);

	const wrapper = defineComponent({
		setup() {
			provideState(ref(state));
			return () => h(ExampleSongPlayer, props);
		}
	});

	const app = createApp(wrapper);
	app.mount(container);
	await nextTick();

	return {
		container,
		unmount() {
			app.unmount();
			document.body.removeChild(container);
		}
	};
}

describe("example-song-player", () => {
	const originalStartSongWithWhistleIn = config.startSongWithWhistleIn;

	beforeEach(() => {
		config.startSongWithWhistleIn = false;
	});

	afterEach(() => {
		config.startSongWithWhistleIn = originalStartSongWithWhistleIn;
	});

	it("renders tune and pattern names from props", async () => {
		const mockState = createMockState();
		const props = {
			tuneName: "My Tune",
			song: ["Intro"] as ExampleSong
		};

		const { container, unmount } = await mountExampleSongPlayer(mockState, props);

		const tuneName = container.querySelector(".tune-name")?.textContent?.trim();
		const patternName = container.querySelector(".pattern-name")?.textContent?.trim();

		expect(tuneName).toBe("My Tune DisplayName");
		expect(patternName).toBe("Intro DisplayName");

		unmount();
	});
});

