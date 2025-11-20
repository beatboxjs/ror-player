<script lang="ts">
	/**
	 * Renders the notes of a pattern as a table, with a toolbar that allows to play the notes and various other actions,
	 * and the notes being editable (unless opened in read-only mode).
	 */
	export default {};
</script>

<script setup lang="ts">
	import config, { Instrument } from "../../config";
	import { BeatboxReference, createBeatbox, patternToBeatbox } from "../../services/player";
	import { patternEquals, updateStroke } from "../../state/pattern";
	import { normalizePlaybackSettings, PlaybackSettings, updatePlaybackSettings } from "../../state/playbackSettings";
	import { createPattern, getPatternFromState } from "../../state/state";
	import { clone } from "../../utils";
	import defaultTunes from "../../defaultTunes";
	import { isEqual } from "lodash-es";
	import StrokeDropdown from "./stroke-dropdown.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, nextTick, ref, watch } from "vue";
	import { showConfirm } from "../utils/alert";
	import vTooltip from "../utils/tooltip";
	import { CustomPopover } from "../utils/popover.vue";
	import PatternPlayerToolbar from "./pattern-player-toolbar.vue";
	import MuteButton from "../playback-settings/mute-button.vue";
	import HeadphonesButton from "../playback-settings/headphones-button.vue";
	import AbstractPlayer, { PositionData } from "../utils/abstract-player.vue";
	import { useI18n } from "../../services/i18n";

	type StrokeDropdownInfo = {
		instr: Instrument,
		i: number,
		sequence?: string
	};

	const state = injectStateRequired();

	const props = withDefaults(defineProps<{
		player?: BeatboxReference;
		tuneName: string;
		patternName: string;
		readonly?: boolean;
	}>(), {
		readonly: false
	});

	const i18n = useI18n();

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName)!);

	const playerRef = ref<BeatboxReference>(props.player || createBeatbox(true));
	const playbackSettings = ref<PlaybackSettings>({
		...normalizePlaybackSettings(state.value.playbackSettings),
		speed: pattern.value.speed,
		loop: pattern.value.loop
	});
	const currentStrokeDropdown = ref<StrokeDropdownInfo>();

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const upbeatBeats = computed(() => Math.ceil(pattern.value.upbeat / pattern.value.time));

	const containerRef = ref<HTMLElement>();
	const abstractPlayerRef = ref<InstanceType<typeof AbstractPlayer>>();

	watch([
		() => playbackSettings.value.volume,
		() => playbackSettings.value.volumes
	], () => {
		if(playbackSettings.value.volume != state.value.playbackSettings.volume || !isEqual(playbackSettings.value.volumes, state.value.playbackSettings.volumes)) {
			updatePlaybackSettings(state.value.playbackSettings, {
				volume: playbackSettings.value.volume,
				volumes: playbackSettings.value.volumes
			});
		}
	}, { deep: true });

	watch([
		() => state.value.playbackSettings.volume,
		() => state.value.playbackSettings.volumes
	], () => {
		if(playbackSettings.value.volume != state.value.playbackSettings.volume || !isEqual(playbackSettings.value.volumes, state.value.playbackSettings.volumes)) {
			playbackSettings.value.volume = state.value.playbackSettings.volume;
			playbackSettings.value.volumes = clone(state.value.playbackSettings.volumes);
		}
	}, { deep: true });

	const rawPattern = computed(() => patternToBeatbox(pattern.value, playbackSettings.value));

	const handlePosition = ({ beat }: PositionData) => {
		if(beat == null) {
			containerRef.value!.querySelector(".beat.active")?.classList.remove("active");
		} else {
			const activeBeat = containerRef.value!.querySelector(".beat.active");
			const beatEl = containerRef.value!.querySelector(`.beat-i-${Math.floor(beat)}`);
			if (activeBeat && activeBeat !== beatEl) {
				activeBeat.classList.remove("active");
			}
			if (beatEl && beatEl !== activeBeat) {
				beatEl.classList.add("active");
			}
		}
	};

	const getPositionMarkerLeft = ({ beat }: PositionData<false>) => {
		const stroke = beat * pattern.value.time;
		const strokeIdx = Math.floor(stroke);
		const strokeEl = containerRef.value!.querySelector<HTMLElement>(".stroke-i-"+strokeIdx);
		return strokeEl ? (strokeEl.offsetLeft + strokeEl.offsetWidth * (stroke - strokeIdx)) : 0;
	};

    const isTriplet = (ptrn, idx: number, time: number) => {
        if([3, "3", 6, "6", 9, "9"].includes(time)) return true;
        if(![12, "12", 24, "24"].includes(time)) return false;

        const hasNote = i => ptrn[i] !== undefined && ptrn[i] !== null && ptrn[i] !== " ";
        const areEmptyBetween = (s, e) => ptrn.slice(s+1, e).every(i => i === " ");

        if(hasNote(idx)) {
            for (let step of [2, 4, 8]) {
                // CASE 1: idx is on the right note of a triplet
                const left = idx - step;
                if (left >= 0 && hasNote(left) && areEmptyBetween(left, idx)) return true;

                // CASE 2: idx is on the left note of a triplet
                const right = idx + step;
                if (right < ptrn.length && hasNote(right) && areEmptyBetween(idx, right)) return true;
            }
            return false;
        }

        // CASE 3: idx is between two notes of a triplet
        const next = ptrn.findIndex((v, i) => i >= idx && hasNote(i));
        const prev = ptrn.findLastIndex((v, i) => i <= idx && hasNote(i));
        const nextTriplet = (next == -1 ? false : isTriplet(ptrn, next, time));
        const prevTriplet = (prev == -1 ? false : isTriplet(ptrn, prev, time));
        if (nextTriplet && prevTriplet && (next-prev <= 8)) return true;

        // CASE 4: a triplet starts or ends in the current beat
        const inNextBeat = (Math.floor(idx/time) == Math.floor(next/time));
        const inPrevBeat = (Math.floor(idx/time) == Math.floor(prev/time) && prev%time != 0);
        if ((inNextBeat && nextTriplet) || (inPrevBeat && prevTriplet)) return true;

        return false;
    };

	const getBeatClass = (i: number) => {
		let positiveI = i;
		while(positiveI < 0) // Support negative numbers properly
			positiveI += 4;

		const ret = [ "beat-"+(positiveI%4), "beat-i-"+i ];
		if(positiveI%4 == 3)
			ret.push("before-bar");
		if(positiveI%4 == 0)
			ret.push("after-bar");
		return ret;
	};

	const getStrokeClass = (realI: number, instrumentKey: Instrument) => {
		let i = realI - pattern.value.upbeat;

		const ret = [
			"stroke-"+(i%pattern.value.time),
			"stroke-i-"+i
		];
		if((i+1)%pattern.value.time == 0)
			ret.push("before-beat");
		if(i%pattern.value.time == 0)
			ret.push("after-beat");
		if((i+1)%(pattern.value.time*4) == 0)
			ret.push("before-bar");
		if(i%(pattern.value.time*4) == 0)
			ret.push("after-bar");

		if(originalPattern.value && (originalPattern.value[instrumentKey][realI] || "").trim() != (pattern.value[instrumentKey][realI] || "").trim())
			ret.push("has-changes");

        if(isTriplet(pattern.value[instrumentKey], realI, pattern.value.time))
            ret.push("is-triplet");

		return ret;
	};

	const setPosition = (event: MouseEvent) => {
		let tr = event.target instanceof HTMLElement ? event.target.closest("tr") : undefined;
		let firstBeat = tr?.querySelector("td.beat");

		if (tr && firstBeat) {
			let patternLength = pattern.value.length * config.playTime + pattern.value.upbeat * config.playTime / pattern.value.time;
			const trRect = tr.getBoundingClientRect();
			const beatRect = firstBeat.getBoundingClientRect();
			let pos = Math.floor(patternLength * (event.clientX - beatRect.left) / (tr.offsetWidth - beatRect.left + trRect.left));
			abstractPlayerRef.value!.setPosition(pos);
		}
	};

	const hasLocalChanges = computed(() => originalPattern.value && !patternEquals(originalPattern.value, pattern.value));

	const reset = async () => {
		if(await showConfirm({
			title: () => i18n.t("pattern-player.restore-title"),
			message: () => i18n.t("pattern-player.restore-message"),
			variant: "warning",
			okLabel: () => i18n.t("pattern-player.restore-ok")
		}))
			createPattern(state.value, props.tuneName, props.patternName, originalPattern.value || undefined);
	};

	const clickStroke = (instrumentKey: Instrument, i: number) => {
		if(isEqual(currentStrokeDropdown.value, { instr: instrumentKey, i }))
			closeStrokeDropdown();
		else {
			openStrokeDropdown({ instr: instrumentKey, i });
		}
	};

	const onStrokeChange = (newStroke: string, prev: boolean) => {
		if(currentStrokeDropdown.value && (!prev || currentStrokeDropdown.value.i > 0))
			updateStroke(pattern.value, currentStrokeDropdown.value.instr, currentStrokeDropdown.value.i - (prev ? 1 : 0), newStroke);
	};

	const onStrokePrevNext = (previous: boolean = false) => {
		if(!currentStrokeDropdown.value || previous && currentStrokeDropdown.value.i == 0 || !previous && currentStrokeDropdown.value.i >= pattern.value.length*pattern.value.time - 1)
			return currentStrokeDropdown.value = undefined;

		openStrokeDropdown({
			instr: currentStrokeDropdown.value.instr,
			i: currentStrokeDropdown.value.i + (previous ? -1 : 1)
		});
	};

	const strokeDropdownRef = ref<HTMLElement>();
	const strokeDropdownPopover = ref<CustomPopover>();

	const openStrokeDropdown = (info: StrokeDropdownInfo) => {
		currentStrokeDropdown.value = info;
	};

	const closeStrokeDropdown = () => {
		currentStrokeDropdown.value = undefined;
	};

	watch(currentStrokeDropdown, () => {
		if (strokeDropdownPopover.value) {
			strokeDropdownPopover.value.dispose();
			strokeDropdownPopover.value = undefined;
		}

		nextTick(() => {
			if (currentStrokeDropdown.value) {
				strokeDropdownPopover.value = new CustomPopover(`#bb-pattern-player-stroke-${currentStrokeDropdown.value.instr}-${currentStrokeDropdown.value.i}`, { content: strokeDropdownRef.value!, placement: 'bottom' });
				strokeDropdownPopover.value.show();
			}
		});
	}, { immediate: true });
</script>

<template>
	<div>
		<PatternPlayerToolbar
			:tuneName="tuneName"
			:patternName="patternName"
			:player="playerRef"
			v-model:playbackSettings="playbackSettings"
			:readonly="readonly"
		>
			<slot />

			<button v-if="hasLocalChanges" type="button" class="btn btn-warning" @click="reset()"><fa icon="eraser"/>{{" "}}{{i18n.t("pattern-player.restore")}}</button>
		</PatternPlayerToolbar>

		<div class="bb-pattern-player-container" ref="containerRef">
			<table class="bb-pattern-player" :class="`time-${pattern.time}`" translate="no">
				<thead>
					<tr>
						<td colspan="2" class="instrument-operations">
							<MuteButton instrument="all" v-model:playbackSettings="playbackSettings"/>
						</td>
						<td v-for="i in upbeatBeats" :key="i" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i-1 - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
						<td v-for="i in pattern.length" :key="i" :colspan="pattern.time" class="beat" :class="getBeatClass(i-1)" @click="setPosition($event)"><span>{{i}}</span></td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<th>{{config.instruments[instrumentKey].name()}}</th>
						<td class="instrument-operations">
							<HeadphonesButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" groupSurdos />
							<MuteButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" />
						</td>
						<td v-for="i in pattern.length*pattern.time + pattern.upbeat" :key="i" class="stroke" :class="getStrokeClass(i-1, instrumentKey)" v-tooltip="config.strokesDescription[pattern[instrumentKey][i-1]]?.() || ''">
							<span v-if="readonly" class="stroke-inner">{{config.strokes[pattern[instrumentKey][i-1]] || '\xa0'}}</span>
							<a v-if="!readonly"
								href="javascript:" class="stroke-inner"
								:id="`bb-pattern-player-stroke-${instrumentKey}-${i-1}`"
								@click="clickStroke(instrumentKey, i-1)"
								draggable="false"
							>
								{{config.strokes[pattern[instrumentKey][i-1]] || '\xa0'}}
							</a>
						</td>
					</tr>
				</tbody>
			</table>

			<AbstractPlayer
				:player="playerRef"
				:rawPattern="rawPattern"
				:playbackSettings="playbackSettings"
				:getLeft="getPositionMarkerLeft"
				@position="handlePosition"
				ref="abstractPlayerRef"
			/>

			<div v-if="currentStrokeDropdown" class="popover bs-popover-auto fade" ref="strokeDropdownRef">
				<div class="popover-arrow"></div>
				<div class="popover-body">
					<StrokeDropdown :instrument="currentStrokeDropdown.instr" :model-value="pattern[currentStrokeDropdown.instr][currentStrokeDropdown.i] || ' '" @change="onStrokeChange($event, false)" @change-prev="onStrokeChange($event, true)" @prev="onStrokePrevNext(true)" @next="onStrokePrevNext(false)" @close="closeStrokeDropdown()" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-pattern-player-container {
		width: 100%;
		overflow-x: auto;
		padding: 1em 0;
		position: relative;

		.bb-pattern-player {
			table-layout: fixed;

			.stroke {
				border-right: 1px solid #ddd;
				text-align: center;
				position: relative;
                overflow: visible;
                padding: 0;

				&.has-changes {
					background-color: #fbe8d0;
				}

                &.is-triplet {
                    color: #0000ff;
                }
			}

			.stroke-inner {
				display: inline-block;
				min-width: 2.7ex;
				min-height: 1em;
				text-decoration: none;
			}

			thead td {
				border-bottom: 1px solid #aaa;
				padding-bottom: .5ex;
			}

			.beat, .stroke.before-beat {
				border-right: 1px solid #aaa;
			}

			.instrument-operations, .stroke.before-bar, .beat.before-bar {
				border-right: 2px solid #888;
			}

			.instrument-operations {
				text-align: right;

				a + a {
					margin-left: 0.25rem;
				}
			}

			.beat {
				cursor: pointer;
			}

			.beat span {
				display: inline-block;
				padding: 0 .5ex;
				border-radius: 10px;
				transition: background-color 1s, color 1s;
			}

			.beat.active span {
				background-color: #3a94a5;
				color: #fff;
				transition: none;
			}

			tbody th {
				padding-right: 1ex;
			}

			tbody th, td.instrument-operations {
				white-space: nowrap;
			}

			&.time-2 { /* 64px/beat */
                .stroke { max-width: 32px; }
				.stroke-inner { min-width: 32px; }
			}

			&.time-3 { /* 63px/beat */
                .stroke { max-width: 21px; }
				.stroke-inner { min-width: 21px; }
			}

			&.time-4 { /* 64px/beat */
                .stroke { max-width: 16px; }
				.stroke-inner { min-width: 16px; }
			}

			&.time-5 { /* 65px/beat */
                .stroke { max-width: 13px; }
				.stroke-inner { min-width: 13px; }
			}

			&.time-6 { /* 66px/beat */
                .stroke { max-width: 11px; }
				.stroke-inner { min-width: 11px; }
				.stroke--2, .stroke--4,
				.stroke-0,  .stroke-2,  .stroke-4 {
					border-right: none;
				}
			}

			&.time-8 { /* 76px/beat */
                .stroke { max-width: 9.5px; }
				.stroke-inner { min-width: 9.5px; }
				.stroke--2, .stroke--4, .stroke--6,
				.stroke-0,  .stroke-2,  .stroke-4,  .stroke-6 {
					border-right: none;
				}
			}

			&.time-9 { /* 76.5px/beat */
                .stroke { max-width: 8.5px; }
				.stroke-inner { min-width: 8.5px; }
				.stroke--2, .stroke--3, .stroke--5, .stroke--6, .stroke--8,
				.stroke-0,  .stroke-1,  .stroke-3,  .stroke-4,  .stroke-6,  .stroke-7 {
					border-right: none;
				}
			}

			&.time-12 { /* 78px/beat */
				.stroke { max-width: 6.5px; }
				.stroke-inner { min-width: 6.5px; }
				.stroke--2, .stroke--3, .stroke--5,  .stroke--6,
				.stroke--8, .stroke--9, .stroke--11,
				.stroke-0,  .stroke-1,  .stroke-3,   .stroke-4,
                .stroke-6,  .stroke-7,  .stroke-9,   .stroke-10 {
					border-right: none;
				}
                .stroke.is-triplet {
                    &.stroke--4, &.stroke--7, &.stroke--10,
                    &.stroke-2,  &.stroke-5,  &.stroke-8 {
                        border-right: none;
                    }
				    &.stroke--5, &.stroke--9,
				    &.stroke-3,  &.stroke-7 {
					    border-right: 1px solid #ddd;
				    }
                }
			}

			&.time-16 { /* 80px/beat */
				.stroke { max-width: 5px; }
				.stroke-inner { min-width: 5px; }
				.stroke--2,  .stroke--3,  .stroke--4,
				.stroke--6,  .stroke--7,  .stroke--8,
				.stroke--10, .stroke--11, .stroke--12,
				.stroke--14, .stroke--15,
				.stroke-0,   .stroke-1,   .stroke-2,
				.stroke-4,   .stroke-5,   .stroke-6,
				.stroke-8,   .stroke-9,   .stroke-10,
				.stroke-12,  .stroke-13,  .stroke-14 {
					border-right: none;
				}
			}

			&.time-20 { /* 80px/beat */
				.stroke { max-width: 4px; }
				.stroke-inner { min-width: 4px; }
				.stroke--2,  .stroke--3,  .stroke--4,  .stroke--5,
				.stroke--7,  .stroke--8,  .stroke--9,  .stroke--10,
				.stroke--12, .stroke--13, .stroke--14, .stroke--15,
				.stroke--17, .stroke--18, .stroke--19,
				.stroke-0,   .stroke-1,   .stroke-2,   .stroke-3,
				.stroke-5,   .stroke-6,   .stroke-7,   .stroke-8,
				.stroke-10,  .stroke-11,  .stroke-12,  .stroke-13,
				.stroke-15,  .stroke-16,  .stroke-17,  .stroke-18 {
					border-right: none;
				}
			}

			&.time-24 { /* 84px/beat */
				.stroke { max-width: 3.5px; }
				.stroke-inner { min-width: 3.5px; }
				.stroke--2,  .stroke--3,  .stroke--4,  .stroke--5,  .stroke--6,
				.stroke--8,  .stroke--9,  .stroke--10, .stroke--11, .stroke--12,
				.stroke--14, .stroke--15, .stroke--16, .stroke--17, .stroke--18,
				.stroke--20, .stroke--21, .stroke--22, .stroke--23,
				.stroke-0,   .stroke-1,   .stroke-2,   .stroke-3,   .stroke-4,
				.stroke-6,   .stroke-7,   .stroke-8,   .stroke-9,   .stroke-10,
				.stroke-12,  .stroke-13,  .stroke-14,  .stroke-15,  .stroke-16,
				.stroke-18,  .stroke-19,  .stroke-20,  .stroke-21,  .stroke-22 {
					border-right: none;
				}
                .stroke.is-triplet {
                    &.stroke--7, &.stroke--13, &.stroke--19,
                    &.stroke-5,  &.stroke-11,  &.stroke-17 {
                        border-right: none;
                    }
				    &.stroke--9, &.stroke--17,
				    &.stroke-7,  &.stroke-15 {
					    border-right: 1px solid #ddd;
				    }
                }
			}
		}
	}
</style>
