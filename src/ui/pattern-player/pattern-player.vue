<script setup lang="ts">
	import config, { Instrument } from "../../config";
	import { BeatboxReference, createBeatbox, getPlayerById, patternToBeatbox, stopAllPlayers } from "../../services/player";
	import { patternEquals, updateStroke, updatePattern } from "../../state/pattern";
	import { normalizePlaybackSettings, PlaybackSettings, updatePlaybackSettings } from "../../state/playbackSettings";
	import { scrollToElement } from "../../services/utils";
	import { createPattern, getPatternFromState } from "../../state/state";
	import { clone } from "../../utils";
	import defaultTunes from "../../defaultTunes";
	import { isEqual } from "lodash-es";
	import PlaybackSettingsComponent from "../playback-settings.vue";
	import StrokeDropdown from "./stroke-dropdown.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import { showConfirm } from "../utils/alert";
	import vTooltip from "../utils/tooltip";
	import { CustomPopover } from "../utils/popover.vue";

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

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName)!);

	const playerRef = ref<BeatboxReference>(props.player || createBeatbox(true));
	const playbackSettings = ref<PlaybackSettings>({
		...normalizePlaybackSettings(state.value.playbackSettings),
		speed: pattern.value.speed,
		loop: pattern.value.loop
	});
	const currentStrokeDropdown = ref<StrokeDropdownInfo>();

	const player = computed(() => getPlayerById(playerRef.value.id));

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const upbeatBeats = computed(() => Math.ceil(pattern.value.upbeat / pattern.value.time));

	const containerRef = ref<HTMLElement>();
	const positionMarkerRef = ref<HTMLElement>();

	const handleBeat = () => {
		updateMarkerPosition(true);
	};

	const handleStop = () => {
		updateMarkerPosition(false);
	};

	onMounted(() => {
		player.value.on("beat", handleBeat);
		player.value.on("stop", handleStop);
		updateMarkerPosition(false);
	});

	onBeforeUnmount(() => {
		player.value.off("beat", handleBeat);
		player.value.off("stop", handleStop);
	});

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

	watch([pattern, playbackSettings], () => {
		let beatboxPattern = patternToBeatbox(pattern.value, playbackSettings.value);
		player.value.setPattern(beatboxPattern);
		player.value.setUpbeat(beatboxPattern.upbeat);
		player.value.setBeatLength(60000/playbackSettings.value.speed/config.playTime);
		player.value.setRepeat(playbackSettings.value.loop);
	}, { deep: true, immediate: true });

	const updateMarkerPosition = (scrollFurther: boolean = false, force: boolean = false) => {
		const position = player.value.getPosition();

		if(!player.value.playing && position == 0) {
			containerRef.value!.querySelector(".beat.active")?.classList.remove("active");
			positionMarkerRef.value!.style.display = 'none';
		} else {
			const i = (position * pattern.value.time / config.playTime) - pattern.value.upbeat;

			const strokeIdx = Math.floor(i);

			const stroke = containerRef.value!.querySelector<HTMLElement>(".stroke-i-"+strokeIdx);
			if(stroke) {
				Object.assign(positionMarkerRef.value!.style, {
					display: '',
					left: `${stroke.offsetLeft + stroke.offsetWidth * (i - strokeIdx)}px`
				});
				scrollToElement(positionMarkerRef.value!, scrollFurther, force);
			}

			const activeBeat = containerRef.value!.querySelector(".beat.active");
			const beat = containerRef.value!.querySelector(".beat-i-" + Math.floor(i / pattern.value.time));
			if (activeBeat && activeBeat !== beat) {
				activeBeat.classList.remove("active");
			}
			if (beat && beat !== activeBeat) {
				beat.classList.add("active");
			}
		}
	};

	const playPause = () => {
		if(!player.value.playing) {
			stopAllPlayers();
			player.value.play();
			updateMarkerPosition(true, true);
		}
		else
			player.value.stop();
	};

	const stop = () => {
		if(player.value.playing)
			player.value.stop();
		player.value.setPosition(0);
		updateMarkerPosition(false);
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

		return ret;
	};

	const headphones = (instrumentKeys: Array<Instrument>, extend: boolean) => {
		if(!instrumentKeys.some((key) => !playbackSettings.value.headphones.includes(key))) {
			if (!extend && playbackSettings.value.headphones.some((key) => !instrumentKeys.includes(key)))
				playbackSettings.value.headphones = instrumentKeys;
			else
				playbackSettings.value.headphones = playbackSettings.value.headphones.filter((key) => !instrumentKeys.includes(key));
		} else if(extend)
			playbackSettings.value.headphones = [ ...new Set([ ...playbackSettings.value.headphones, ...instrumentKeys ]) ];
		else
			playbackSettings.value.headphones = instrumentKeys;
	};

	const isHiddenSurdoHeadphone = (instrumentKey: Instrument) => {
		let surdos = ["ls", "ms", "hs"] as Array<Instrument>;
		return surdos.includes(instrumentKey) && !surdos.some((it) => (playbackSettings.value.headphones.includes(it)));
	};

	const mute = (instrumentKey: Instrument) => {
		playbackSettings.value.mute[instrumentKey] = !playbackSettings.value.mute[instrumentKey];
	}

	const allMuted = computed(() => config.instrumentKeys.every((instr) => playbackSettings.value.mute[instr]));

	const muteAll = () => {
		let mute = !allMuted.value;
		for(let instrumentKey of config.instrumentKeys) {
			playbackSettings.value.mute[instrumentKey] = mute;
		}
	};

	const setPosition = (event: MouseEvent) => {
		let tr = event.target instanceof HTMLElement ? event.target.closest("tr") : undefined;
		let firstBeat = tr?.querySelector("td.beat");

		if (tr && firstBeat) {
			let patternLength = pattern.value.length * config.playTime + pattern.value.upbeat * config.playTime / pattern.value.time;
			const trRect = tr.getBoundingClientRect();
			const beatRect = firstBeat.getBoundingClientRect();
			let pos = Math.floor(patternLength * (event.clientX - beatRect.left) / (tr.offsetWidth - beatRect.left + trRect.left));

			player.value.setPosition(pos);
			updateMarkerPosition(false);
		}
	};

	const hasLocalChanges = computed(() => originalPattern.value && !patternEquals(originalPattern.value, pattern.value));

	const reset = async () => {
		if(await showConfirm({ title: "Restore original", message: "Are you sure that you want to revert your modifications and restore the original break?" }))
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

	const handleUpdatePattern = (update: Parameters<typeof updatePattern>[1]) => {
		updatePattern(pattern.value, update);
	};

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
				//const trigger = document.getElementById();
				strokeDropdownPopover.value = new CustomPopover(`#bb-pattern-editor-stroke-${currentStrokeDropdown.value.instr}-${currentStrokeDropdown.value.i}`, { content: strokeDropdownRef.value!, placement: 'bottom' });
				strokeDropdownPopover.value.show();
			}
		});
	}, { immediate: true });
</script>

<template>
	<div>
		<div class="bb-pattern-editor-toolbar">
			<button type="button" class="btn" :class="`btn-${playerRef && playerRef.playing ? 'info' : 'success'}`" @click="playPause()"><fa :icon="playerRef && playerRef.playing ? 'pause' : 'play'"></fa><span class="d-none d-sm-inline">{{' '}}{{playerRef && playerRef.playing ? 'Pause' : 'Play'}}</span></button>
			<button type="button" class="btn btn-danger" @click="stop()"><fa icon="stop"/><span class="d-none d-sm-inline"> Stop</span></button>
			<PlaybackSettingsComponent v-model:playback-settings="playbackSettings" :default-speed="pattern.speed" />

			<div class="divider"></div>

			<template v-if="!readonly">
				<div class="btn-group">
					<div class="dropdown">
						<button class="btn btn-secondary" :class="{'has-changes': originalPattern && originalPattern.length != pattern.length}" data-bs-toggle="dropdown">Length: {{pattern.length}}</button>
						<ul class="dropdown-menu">
							<li v-for="le in [ 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64 ]" :key="le"><a class="dropdown-item" :class="{ active: pattern.length === le }" href="javascript:" @click="handleUpdatePattern({ length: le })" draggable="false">Length: {{le}}</a></li>
						</ul>
					</div>
				</div>

				<div class="btn-group">
					<div class="dropdown">
						<button class="btn btn-secondary" :class="{'has-changes': originalPattern && originalPattern.time != pattern.time}" data-bs-toggle="dropdown">{{config.times[pattern.time] || `${pattern.time}⁄4`}}</button>
						<ul class="dropdown-menu">
							<li v-for="(desc, ti) in config.times" :key="ti"><a class="dropdown-item" :class="{ active: pattern.time == ti }" href="javascript:" @click="handleUpdatePattern({ time: ti })" draggable="false">Time signature: {{desc}}</a></li>
						</ul>
					</div>
				</div>

				<div class="btn-group">
					<div class="dropdown">
						<button class="btn btn-secondary" :class="{'has-changes': originalPattern && originalPattern.upbeat != pattern.upbeat}" data-bs-toggle="dropdown">Upbeat: {{pattern.upbeat}}</button>
						<ul class="dropdown-menu">
							<li v-for="i in pattern.time * 4 + 1" :key="i"><a class="dropdown-item" :class="{ active: pattern.upbeat == i - 1 }" href="javascript:" @click="handleUpdatePattern({ upbeat: i - 1 })" draggable="false">Upbeat: {{i - 1}}</a></li>
						</ul>
					</div>
				</div>
			</template>

			<slot/>

			<button v-if="hasLocalChanges" type="button" class="btn btn-warning" @click="reset()"><fa icon="eraser"/> Restore original</button>
		</div>
		<div class="bb-pattern-editor-container" ref="containerRef">
			<table class="pattern-editor" :class="'time-'+pattern.time">
				<thead>
					<tr>
						<td colspan="2" class="instrument-operations">
							<a href="javascript:" @click="muteAll()" :class="allMuted ? 'active' : 'inactive'" v-tooltip="`${allMuted ? 'Unmute' : 'Mute'} all instruments`" draggable="false"><fa icon="volume-mute"/></a>
						</td>
						<td v-for="i in upbeatBeats" :key="i" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
						<td v-for="i in pattern.length" :key="i" :colspan="pattern.time" class="beat" :class="getBeatClass(i-1)" @click="setPosition($event)"><span>{{i}}</span></td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<th>{{config.instruments[instrumentKey].name}}</th>
						<td class="instrument-operations">
							<a v-if="!isHiddenSurdoHeadphone(instrumentKey)" href="javascript:" @click="headphones([ instrumentKey ], $event.ctrlKey || $event.shiftKey)" :class="playbackSettings.headphones.includes(instrumentKey) ? 'active' : 'inactive'" draggable="false"><fa icon="headphones"/></a>
							<a v-if="isHiddenSurdoHeadphone(instrumentKey) && instrumentKey == 'ms'" href="javascript:" @click="headphones([ 'ls', 'ms', 'hs' ], $event.ctrlKey || $event.shiftKey)" class="inactive" draggable="false"><fa icon="headphones"/></a>
							<a href="javascript:" @click="mute(instrumentKey)" :class="playbackSettings.mute[instrumentKey] ? 'active' : 'inactive'" draggable="false"><fa icon="volume-mute"/></a>
						</td>
						<td v-for="i in pattern.length*pattern.time + pattern.upbeat" :key="i" class="stroke" :class="getStrokeClass(i-1, instrumentKey)" v-tooltip="config.strokesDescription[pattern[instrumentKey][i-1]] || ''">
							<span v-if="readonly" class="stroke-inner">{{config.strokes[pattern[instrumentKey][i-1]] || '\xa0'}}</span>
							<a v-if="!readonly"
								href="javascript:" class="stroke-inner"
								:id="`bb-pattern-editor-stroke-${instrumentKey}-${i-1}`"
								@click="clickStroke(instrumentKey, i-1)"
								draggable="false"
							>
								{{config.strokes[pattern[instrumentKey][i-1]] || '\xa0'}}
							</a>
							<!--<Popover v-if="currentStrokeDropdown && currentStrokeDropdown.instr == instrumentKey && currentStrokeDropdown.i == i-1" :target="`bb-pattern-editor-stroke-${instrumentKey}-${i-1}`" placement="bottom" show triggers="manual">
								<StrokeDropdown :instrument="instrumentKey" :value="pattern[instrumentKey][i-1] || ' '" @change="onStrokeChange($event, false)" @change-prev="onStrokeChange($event, true)" @prev="onStrokePrevNext(true)" @next="onStrokePrevNext(false)" @close="onStrokeClose()" />
							</Popover>-->
						</td>
					</tr>
				</tbody>
			</table>
			<div class="position-marker" ref="positionMarkerRef"></div>
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
	.bb-pattern-editor-toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: -0.5rem;

		> * {
			flex-shrink: 0;
			margin-top: 0.5rem;
			margin-right: 0.25rem;
		}

		.divider {
			margin-left: 0.75rem;
			margin-right: 0.5rem;
			height: 34px;
			border-left: 1px solid #dee2e6;
		}

		button.has-changes {
			background: linear-gradient(to bottom, #fdf4e8 0%, #f7d3a1 100%);
			border-color: #f7d3a1;
		}
	}

	.bb-pattern-editor-container {
		width: 100%;
		overflow-x: auto;
		padding: 1em 0;
		position: relative;

		.pattern-editor {
			table-layout: fixed;

			.stroke {
				border-right: 1px solid #ddd;
				text-align: center;
				position: relative;

				&.has-changes {
					background-color: #fbe8d0;
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

			.instrument-operations .inactive {
				color: #bbb;
			}

			&.time-2 {
				.stroke-inner {
					min-width: 5.4ex;
				}
			}

			&.time-12 {
				.stroke-inner {
					min-width: 1ex;
				}

				.stroke-0, .stroke-1, .stroke-3, .stroke-4, .stroke-6, .stroke-7, .stroke-9, .stroke-10 {
					border-right: none;
				}
			}

			&.time-20 {
				.stroke-inner {
					min-width: 1ex;
				}

				.stroke-0, .stroke-1, .stroke-2, .stroke-3,
				.stroke-5, .stroke-6, .stroke-7, .stroke-8,
				.stroke-10,.stroke-11,.stroke-12,.stroke-13,
				.stroke-15,.stroke-16,.stroke-17,.stroke-18 {
					border-right: none;
				}
			}
		}

		.position-marker {
			position: absolute;
			top: 0;
			height: 100%;
			border-left: 1px solid #000;
			transition: left 0.1s linear;
			pointer-events: none;
		}
	}
</style>