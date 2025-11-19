import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import type { State } from "../../../state/state";
import type { ExampleSong } from "../../../state/tune";
import config, { Instrument } from "../../../config";
import { provideState } from "../../../services/state";
import ExampleSongPlayer from "../example-song-player.vue";
import * as playerModule from "../../../services/player";
import { normalizePattern } from "../../../state/pattern";

vi.mock("../../../services/i18n", () => ({
	useI18n: () => ({ t: (key: string) => key }),
	getLocalizedDisplayName: (value: string) => value
}));

// Necessary to mock beatbox.js to avoid AudioContext errors
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

    const whistlePattern = normalizePattern();
    whistlePattern.displayName = "Whistle-in DisplayName";
    whistlePattern.ls = ["X", "X", " ", " "];

	return {
		tunes: {
			"My Tune": {
				displayName: "My Tune DisplayName",
				categories: [],
				patterns: {
					"Intro": introPattern
				}
			},
            "General Breaks": {
                displayName: "General Breaks DisplayName",
                categories: [],
                patterns: {
                    "Whistle in": whistlePattern
                }
            },
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
	const wrapper = defineComponent({
		setup() {
			provideState(ref(state));
			return () => h(ExampleSongPlayer, props);
		}
	});

	const mountedWrapper = mount(wrapper);
	await nextTick();

	return {
		container: mountedWrapper.element as HTMLElement,
		unmount() {
			mountedWrapper.unmount();
		}
	};
}

describe("example-song-player", () => {
    const originalStartSongWithWhistleIn = config.startSongWithWhistleIn;
    const songToBeatboxSpy = vi.spyOn(playerModule, "songToBeatbox");

    beforeEach(() => {
        songToBeatboxSpy.mockClear();
        songToBeatboxSpy.mockReturnValue({} as any);
    });

    const expectCardContents = (card: Element, tuneName: string, patternName: string) => {
        const tuneNameElement = card.querySelector(".tune-name");
        const patternNameElement = card.querySelector(".pattern-name");
        expect(tuneNameElement?.textContent?.trim()).toBe(tuneName);
        expect(patternNameElement?.textContent?.trim()).toBe(patternName);
    };

    // We don't really test the AbstractPlayer here, but we test the construction of its rawPattern argument.
    const expectRawPatternBuiltWithArguments = (pieces: string[][]) => {
        expect(songToBeatboxSpy).toHaveBeenCalledTimes(1);
        const songPartsArg = songToBeatboxSpy.mock.calls[0][0] as Record<number, Record<string, string[]>>;
        expect(Object.keys(songPartsArg)).toHaveLength(pieces.length);
        for (let index = 0; index < pieces.length; index++) {
            expect(songPartsArg[index].ls).toEqual(pieces[index]);
        }
    };

    describe("when the song has no whistle-in", () => {
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

            const cards = container.querySelectorAll(".song .card");
            expect(cards.length).toBe(1);
            expectCardContents(cards[0], "My Tune DisplayName", "Intro DisplayName");
            expectRawPatternBuiltWithArguments([["My Tune", "Intro"]]);

            unmount();
        });
    });

    describe("when the song has a whistle-in", () => {
        beforeEach(() => {
            config.startSongWithWhistleIn = true;
        });
    
        afterEach(() => {
            config.startSongWithWhistleIn = originalStartSongWithWhistleIn;
        });

        it("renders the whistle-in and the song", async () => {
            const mockState = createMockState();
            const props = {
                tuneName: "My Tune",
                song: ["Intro"] as ExampleSong
            };
            const { container, unmount } = await mountExampleSongPlayer(mockState, props);

            const cards = container.querySelectorAll(".song .card");
            expect(cards.length).toBe(2);
            const whistleInCard = cards[0];
            expectCardContents(whistleInCard, "General Breaks DisplayName", "Whistle-in DisplayName");
            expectCardContents(cards[1], "My Tune DisplayName", "Intro DisplayName");
            expectRawPatternBuiltWithArguments([["General Breaks", "Whistle in"], ["My Tune", "Intro"]]);

            unmount();
        });
    });
});

